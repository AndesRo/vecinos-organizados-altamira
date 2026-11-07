import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Alert, Button, Card, Spinner } from "../components/ui";
import type { Poll, PollOption } from "../types";

type VoteCount = { option_id: string; count: number };

export default function PollDetail() {
    const { id } = useParams<{ id: string }>();
    const { profile } = useAuth();
    const [poll, setPoll] = useState<Poll | null>(null);
    const [counts, setCounts] = useState<VoteCount[]>([]);
    const [userVote, setUserVote] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [voting, setVoting] = useState(false);

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        const { data: p, error } = await supabase
            .from("polls").select("*, poll_options(*)").eq("id", id).single();
        if (error) { setError("Encuesta no encontrada."); setLoading(false); return; }
        setPoll(p as Poll);

        const { data: votes } = await supabase.from("votes").select("option_id, user_id").eq("poll_id", id);
        if (votes) {
            const map: Record<string, number> = {};
            let mine: string | null = null;
            votes.forEach((v) => {
                map[v.option_id] = (map[v.option_id] ?? 0) + 1;
                if (v.user_id === profile?.id) mine = v.option_id;
            });
            setCounts(Object.entries(map).map(([option_id, count]) => ({ option_id, count })));
            setUserVote(mine);
        }
        setLoading(false);
    }, [id, profile?.id]);

    useEffect(() => { load(); }, [load]);

    async function vote(optionId: string) {
        if (!id || !profile) return;
        setVoting(true);
        const { error } = await supabase.from("votes").insert({
            poll_id: id, option_id: optionId, user_id: profile.id,
        });
        setVoting(false);
        if (error) { setError(error.message); return; }
        await load();
    }

    if (loading) return <Spinner label="Cargando encuesta..." />;
    if (!poll) return <Alert kind="error">{error}</Alert>;

    const totalVotes = counts.reduce((a, b) => a + b.count, 0);

    return (
        <div>
            <Link to="/encuestas" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal">
                <ArrowLeft className="h-4 w-4" /> Volver a encuestas
            </Link>

            <Card className="p-6">
                <h1 className="text-xl font-bold text-navy">{poll.question}</h1>
                <p className="mt-1 text-xs text-slate-500">
                    {totalVotes} {totalVotes === 1 ? "respuesta" : "respuestas"}
                    {poll.ends_at ? ` · cierra el ${new Date(poll.ends_at).toLocaleDateString("es-CL")}` : ""}
                </p>

                <div className="mt-4 space-y-3">
                    {(poll.poll_options as PollOption[] | undefined)?.map((opt) => {
                        const count = counts.find((c) => c.option_id === opt.id)?.count ?? 0;
                        const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
                        const voted = userVote === opt.id;
                        return (
                            <div key={opt.id}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className={voted ? "font-semibold text-teal-700" : "text-navy"}>
                                        {opt.option_text} {voted && "(tu voto)"}
                                    </span>
                                    <span className="text-slate-500">{pct}% · {count}</span>
                                </div>
                                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full bg-teal" style={{ width: `${pct}%` }} />
                                </div>
                                {!userVote && poll.status === "activa" && (
                                    <div className="mt-2">
                                        <Button size="sm" variant="secondary" loading={voting} onClick={() => vote(opt.id)}>Votar</Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}