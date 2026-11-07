import { useCallback, useEffect, useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
    Alert, Badge, Button, Card, EmptyState, Field, Input, Modal,
    PageHeader, Select, Spinner, Textarea,
} from "../components/ui";
import type { Announcement, ImportanceLevel } from "../types";

export default function Announcements() {
    const { profile, isModerator } = useAuth();
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<{ title: string; content: string; importance: ImportanceLevel }>({
        title: "", content: "", importance: "media",
    });

    const load = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("announcements").select("*, profiles(full_name)")
            .order("created_at", { ascending: false });
        if (error) setError(error.message);
        else setItems((data as Announcement[]) ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function create(e: React.FormEvent) {
        e.preventDefault();
        if (!profile) return;
        setCreating(true);
        const { error } = await supabase.from("announcements").insert({ author_id: profile.id, ...form });
        setCreating(false);
        if (error) { setError(error.message); return; }
        setOpen(false); setForm({ title: "", content: "", importance: "media" });
        await load();
    }

    return (
        <div>
            <PageHeader
                title="Muro de anuncios"
                description="Comunicados oficiales de la comunidad."
                action={isModerator ? <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Nuevo comunicado</Button> : undefined}
            />

            {error && <Alert kind="error">{error}</Alert>}

            {loading ? <Spinner /> : items.length === 0 ? (
                <EmptyState icon={<Megaphone className="h-10 w-10" />} title="Sin comunicados" />
            ) : (
                <div className="space-y-3">
                    {items.map((a) => (
                        <Card key={a.id} className="p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-semibold text-navy">{a.title}</h3>
                                <Badge color={a.importance === "alta" ? "red" : a.importance === "media" ? "yellow" : "gray"}>{a.importance}</Badge>
                            </div>
                            <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{a.content}</p>
                            <p className="mt-2 text-xs text-slate-500">{a.profiles?.full_name ?? "Moderación"} · {new Date(a.created_at).toLocaleString("es-CL")}</p>
                        </Card>
                    ))}
                </div>
            )}

            <Modal open={open} onClose={() => setOpen(false)} title="Nuevo comunicado"
                footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button loading={creating} onClick={create as any}>Publicar</Button></>}
            >
                <form className="space-y-3" onSubmit={create}>
                    <Field label="Título" htmlFor="t"><Input id="t" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
                    <Field label="Importancia" htmlFor="i">
                        <Select id="i" value={form.importance} onChange={(e) => setForm({ ...form, importance: e.target.value as ImportanceLevel })}>
                            <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>
                        </Select>
                    </Field>
                    <Field label="Contenido" htmlFor="c"><Textarea id="c" rows={5} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
                </form>
            </Modal>
        </div>
    );
}