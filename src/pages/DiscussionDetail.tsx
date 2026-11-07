import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Flag, Send, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
    Alert, Badge, Button, Card, Field, Input, Modal, Spinner, Textarea,
} from "../components/ui";
import type { Comment, Discussion } from "../types";

export default function DiscussionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile, isModerator } = useAuth();
    const [discussion, setDiscussion] = useState<Discussion | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newComment, setNewComment] = useState("");
    const [sending, setSending] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        const [d, cs] = await Promise.all([
            supabase.from("discussions").select("*, profiles(full_name)").eq("id", id).single(),
            supabase.from("comments").select("*, profiles(full_name)").eq("discussion_id", id).eq("is_hidden", false).order("created_at", { ascending: true }),
        ]);
        if (d.error) setError("No se encontró la publicación.");
        else setDiscussion(d.data as Discussion);
        if (!cs.error) setComments((cs.data as Comment[]) ?? []);
        setLoading(false);
    }, [id]);

    useEffect(() => { load(); }, [load]);

    async function addComment(e: React.FormEvent) {
        e.preventDefault();
        if (!profile || !id || !newComment.trim()) return;
        setSending(true);
        const { error } = await supabase.from("comments").insert({
            discussion_id: id, author_id: profile.id, content: newComment.trim(),
        });
        setSending(false);
        if (error) { setError(error.message); return; }
        setNewComment("");
        await load();
    }

    async function deleteDiscussion() {
        if (!id || !window.confirm("¿Eliminar esta publicación y sus comentarios?")) return;
        const { error } = await supabase.from("discussions").delete().eq("id", id);
        if (error) { setError(error.message); return; }
        navigate("/consultas", { replace: true });
    }

    async function reportContent() {
        if (!id || !profile || !reportReason.trim()) return;
        const { error } = await supabase.from("moderation_reports").insert({
            reporter_id: profile.id, target_type: "discussion", target_id: id, reason: reportReason.trim(),
        });
        if (error) { setError(error.message); return; }
        setReportOpen(false); setReportReason("");
        alert("Gracias. Tu reporte fue enviado a moderación.");
    }

    async function changeStatus(status: string) {
        if (!id) return;
        const { error } = await supabase.from("discussions").update({ status }).eq("id", id);
        if (error) { setError(error.message); return; }
        await load();
    }

    if (loading) return <Spinner label="Cargando publicación..." />;
    if (!discussion) return <Alert kind="error">{error || "Publicación no encontrada"}</Alert>;

    const canEdit = isModerator || discussion.author_id === profile?.id;

    return (
        <div>
            <Link to="/consultas" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal">
                <ArrowLeft className="h-4 w-4" /> Volver a consultas
            </Link>

            <Card className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-navy">{discussion.title}</h1>
                        <p className="mt-1 text-xs text-slate-500">
                            {discussion.profiles?.full_name ?? "Residente"} · {new Date(discussion.created_at).toLocaleString("es-CL")}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge color="gray">{discussion.category}</Badge>
                        <Badge color={discussion.status === "resuelto" ? "green" : discussion.status === "en_seguimiento" ? "yellow" : "blue"}>
                            {discussion.status.replace("_", " ")}
                        </Badge>
                    </div>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm text-slate-700">{discussion.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {isModerator && (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => changeStatus("en_seguimiento")}>En seguimiento</Button>
                            <Button size="sm" variant="secondary" onClick={() => changeStatus("resuelto")}>Marcar resuelto</Button>
                        </>
                    )}
                    <Button size="sm" variant="ghost" icon={<Flag className="h-4 w-4" />} onClick={() => setReportOpen(true)}>Reportar</Button>
                    {canEdit && (
                        <Button size="sm" variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={deleteDiscussion}>Eliminar</Button>
                    )}
                </div>
            </Card>

            <Card className="mt-4 p-6">
                <h2 className="mb-3 font-semibold text-navy">Comentarios ({comments.length})</h2>
                {comments.length === 0 ? (
                    <p className="text-sm text-slate-500">Aún no hay comentarios.</p>
                ) : (
                    <ul className="space-y-3">
                        {comments.map((c) => (
                            <li key={c.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <p className="text-xs font-medium text-navy">{c.profiles?.full_name ?? "Residente"}</p>
                                <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{c.content}</p>
                                <p className="mt-1 text-xs text-slate-400">{new Date(c.created_at).toLocaleString("es-CL")}</p>
                            </li>
                        ))}
                    </ul>
                )}

                <form className="mt-4 space-y-2" onSubmit={addComment}>
                    {error && <Alert kind="error">{error}</Alert>}
                    <Field label="Nuevo comentario" htmlFor="nc">
                        <Textarea id="nc" rows={3} required value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                    </Field>
                    <div className="flex justify-end">
                        <Button type="submit" loading={sending} icon={<Send className="h-4 w-4" />}>Comentar</Button>
                    </div>
                </form>
            </Card>

            <Modal
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                title="Reportar publicación"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setReportOpen(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={reportContent}>Enviar reporte</Button>
                    </>
                }
            >
                <Field label="Motivo del reporte" htmlFor="r">
                    <Input id="r" value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Describe el problema" />
                </Field>
            </Modal>
        </div>
    );
}