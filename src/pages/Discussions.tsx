import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Plus, Search } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
    Alert, Badge, Button, Card, EmptyState, Field, Input, Modal,
    PageHeader, Select, Spinner, Textarea,
} from "../components/ui";
import { CATEGORIES, type Discussion } from "../types";

const statusColor: Record<string, "blue" | "yellow" | "green"> = {
    abierto: "blue",
    en_seguimiento: "yellow",
    resuelto: "green",
};

export default function Discussions() {
    const { profile } = useAuth();
    const [items, setItems] = useState<Discussion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", category: CATEGORIES[0] });

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        let query = supabase
            .from("discussions")
            .select("*, profiles(full_name)")
            .eq("is_hidden", false)
            .order("created_at", { ascending: false });
        if (filterCat) query = query.eq("category", filterCat);
        if (filterStatus) query = query.eq("status", filterStatus);
        if (search) query = query.ilike("title", `%${search}%`);
        const { data, error } = await query;
        if (error) setError("No fue posible cargar las consultas.");
        else setItems((data as Discussion[]) ?? []);
        setLoading(false);
    }, [filterCat, filterStatus, search]);

    useEffect(() => { load(); }, [load]);

    async function createDiscussion(e: React.FormEvent) {
        e.preventDefault();
        if (!profile) return;
        setCreating(true);
        const { error } = await supabase.from("discussions").insert({
            author_id: profile.id,
            title: form.title,
            description: form.description,
            category: form.category,
        });
        setCreating(false);
        if (error) { setError(error.message); return; }
        setForm({ title: "", description: "", category: CATEGORIES[0] });
        setOpen(false);
        await load();
    }

    return (
        <div>
            <PageHeader
                title="Consultas y reclamos"
                description="Un foro comunitario para compartir situaciones, dudas y propuestas."
                action={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Nueva publicación</Button>}
            />

            <Card className="mb-4 p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input placeholder="Buscar por título..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
                        <option value="">Todas las categorías</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                    <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">Todos los estados</option>
                        <option value="abierto">Abierto</option>
                        <option value="en_seguimiento">En seguimiento</option>
                        <option value="resuelto">Resuelto</option>
                    </Select>
                </div>
            </Card>

            {error && <Alert kind="error">{error}</Alert>}

            {loading ? (
                <Spinner />
            ) : items.length === 0 ? (
                <EmptyState
                    icon={<MessageSquare className="h-10 w-10" />}
                    title="Aún no hay publicaciones"
                    description="Sé el primero en iniciar una consulta o reclamo."
                    action={<Button onClick={() => setOpen(true)}>Crear publicación</Button>}
                />
            ) : (
                <div className="space-y-3">
                    {items.map((d) => (
                        <Card key={d.id} className="p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <Link to={`/consultas/${d.id}`} className="text-base font-semibold text-navy hover:text-teal">
                                    {d.title}
                                </Link>
                                <div className="flex items-center gap-2">
                                    <Badge color="gray">{d.category}</Badge>
                                    <Badge color={statusColor[d.status] ?? "gray"}>
                                        {d.status.replace("_", " ")}
                                    </Badge>
                                </div>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{d.description}</p>
                            <p className="mt-2 text-xs text-slate-500">
                                {d.profiles?.full_name ?? "Residente"} · {new Date(d.created_at).toLocaleString("es-CL")}
                            </p>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Nueva publicación"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button loading={creating} onClick={createDiscussion as any}>Publicar</Button>
                    </>
                }
            >
                <form onSubmit={createDiscussion} className="space-y-3">
                    <Field label="Título" htmlFor="t"><Input id="t" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
                    <Field label="Categoría" htmlFor="c">
                        <Select id="c" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </Select>
                    </Field>
                    <Field label="Descripción" htmlFor="d"><Textarea id="d" rows={5} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
                </form>
            </Modal>
        </div>
    );
}