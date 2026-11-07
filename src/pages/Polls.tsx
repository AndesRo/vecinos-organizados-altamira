import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Plus, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
    Alert, Badge, Button, Card, EmptyState, Field, Input, Modal,
    PageHeader, Spinner,
} from "../components/ui";
import type { Poll } from "../types";

export default function Polls() {
    const { profile, isModerator } = useAuth();
    const [items, setItems] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]);
    const [endsAt, setEndsAt] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("polls")
            .select("*, poll_options(*), profiles(full_name)")
            .order("created_at", { ascending: false });
        if (error) setError(error.message);
        else setItems((data as Poll[]) ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function createPoll(e: React.FormEvent) {
        e.preventDefault();
        if (!profile) return;
        const clean = options.map((o) => o.trim()).filter(Boolean);
        if (clean.length < 2) { setError("Agrega al menos 2 opciones."); return; }
        setCreating(true);
        const { data, error } = await supabase.from("polls").insert({
            creator_id: profile.id, question, status: "activa",
            ends_at: endsAt || null,
        }).select("id").single();
        if (error || !data) { setError(error?.message ?? ""); setCreating(false); return; }
        await supabase.from("poll_options").insert(clean.map((o) => ({ poll_id: data.id, option_text: o })));
        setCreating(false); setOpen(false);
        setQuestion(""); setOptions(["", ""]); setEndsAt("");
        await load();
    }

    return (
        <div>
            <PageHeader
                title="Encuestas"
                description="Instrumentos de opinión comunitaria. No constituyen votaciones legales vinculantes."
                action={isModerator ? <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Nueva encuesta</Button> : undefined}
            />

            {error && <Alert kind="error">{error}</Alert>}

            {loading ? <Spinner /> : items.length === 0 ? (
                <EmptyState icon={<BarChart3 className="h-10 w-10" />} title="Sin encuestas" />
            ) : (
                <div className="space-y-3">
                    {items.map((p) => (
                        <Card key={p.id} className="p-4">
                            <div className="flex items-center justify-between gap-2">
                                <Link to={`/encuestas/${p.id}`} className="font-semibold text-navy hover:text-teal">{p.question}</Link>
                                <Badge color={p.status === "activa" ? "teal" : p.status === "cerrada" ? "gray" : "yellow"}>{p.status}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                {p.poll_options?.length ?? 0} opciones · creada por {p.profiles?.full_name ?? "Residente"}
                            </p>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                open={open} onClose={() => setOpen(false)} title="Nueva encuesta"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button loading={creating} onClick={createPoll as any}>Crear</Button>
                    </>
                }
            >
                <form className="space-y-3" onSubmit={createPoll}>
                    <Field label="Pregunta" htmlFor="q"><Input id="q" required value={question} onChange={(e) => setQuestion(e.target.value)} /></Field>
                    <Field label="Fecha de cierre (opcional)" htmlFor="e"><Input id="e" type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></Field>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-navy">Opciones</p>
                        {options.map((o, i) => (
                            <div key={i} className="flex gap-2">
                                <Input value={o} onChange={(e) => setOptions(options.map((v, j) => j === i ? e.target.value : v))} placeholder={`Opción ${i + 1}`} />
                                {options.length > 2 && (
                                    <Button type="button" variant="ghost" onClick={() => setOptions(options.filter((_, j) => j !== i))} icon={<X className="h-4 w-4" />} />
                                )}
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="secondary" onClick={() => setOptions([...options, ""])}>+ Agregar opción</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}