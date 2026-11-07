import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileText, Upload } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
    Alert, Button, Card, EmptyState, Field, Input, Modal, PageHeader,
    Select, Spinner, Textarea,
} from "../components/ui";
import { DOC_CATEGORIES, type DocumentRow } from "../types";

export default function Documents() {
    const { profile } = useAuth();
    const [items, setItems] = useState<DocumentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", category: DOC_CATEGORIES[0] });
    const fileInput = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        setLoading(true);
        let q = supabase
            .from("documents")
            .select("*, profiles(full_name)")
            .order("created_at", { ascending: false });
        if (category) q = q.eq("category", category);
        if (search) q = q.ilike("title", `%${search}%`);
        const { data, error } = await q;
        if (error) setError(error.message);
        else setItems((data as DocumentRow[]) ?? []);
        setLoading(false);
    }, [search, category]);

    useEffect(() => { load(); }, [load]);

    async function uploadDocument(e: React.FormEvent) {
        e.preventDefault();
        if (!profile) return;
        const file = fileInput.current?.files?.[0];
        if (!file) { setError("Selecciona un archivo."); return; }
        setUploading(true);
        const path = `${profile.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
        if (upErr) { setError(upErr.message); setUploading(false); return; }
        const { error } = await supabase.from("documents").insert({
            uploader_id: profile.id, title: form.title, description: form.description,
            category: form.category, file_path: path, file_type: file.type,
        });
        setUploading(false);
        if (error) { setError(error.message); return; }
        setOpen(false);
        setForm({ title: "", description: "", category: DOC_CATEGORIES[0] });
        if (fileInput.current) fileInput.current.value = "";
        await load();
    }

    async function download(doc: DocumentRow) {
        const { data, error } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 60);
        if (error || !data) { setError("No se pudo generar el enlace."); return; }
        window.open(data.signedUrl, "_blank");
    }

    return (
        <div>
            <PageHeader
                title="Biblioteca documental"
                description="Repositorio privado de documentos de la comunidad."
                action={<Button icon={<Upload className="h-4 w-4" />} onClick={() => setOpen(true)}>Subir documento</Button>}
            />

            <Card className="mb-4 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <Input placeholder="Buscar por título..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">Todas las categorías</option>
                        {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                </div>
            </Card>

            {error && <Alert kind="error">{error}</Alert>}

            {loading ? <Spinner /> : items.length === 0 ? (
                <EmptyState icon={<FileText className="h-10 w-10" />} title="Sin documentos" />
            ) : (
                <div className="space-y-3">
                    {items.map((d) => (
                        <Card key={d.id} className="flex items-center justify-between gap-3 p-4">
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-navy">{d.title}</p>
                                <p className="text-xs text-slate-500">{d.category} · {d.profiles?.full_name ?? "Residente"} · {new Date(d.created_at).toLocaleDateString("es-CL")}</p>
                                {d.description && <p className="mt-1 line-clamp-1 text-sm text-slate-600">{d.description}</p>}
                            </div>
                            <Button size="sm" variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => download(d)}>Descargar</Button>
                        </Card>
                    ))}
                </div>
            )}

            <Modal open={open} onClose={() => setOpen(false)} title="Subir documento"
                footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button loading={uploading} onClick={uploadDocument as any}>Subir</Button></>}
            >
                <form className="space-y-3" onSubmit={uploadDocument}>
                    <Field label="Título" htmlFor="t"><Input id="t" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
                    <Field label="Categoría" htmlFor="c">
                        <Select id="c" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}>
                            {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </Select>
                    </Field>
                    <Field label="Descripción" htmlFor="d"><Textarea id="d" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
                    <Field label="Archivo (PDF, DOCX o imagen)" htmlFor="f">
                        <input id="f" ref={fileInput} type="file" accept=".pdf,.doc,.docx,image/*" required className="block w-full text-sm" />
                    </Field>
                </form>
            </Modal>
        </div>
    );
}