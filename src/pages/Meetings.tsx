import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
    Alert, Badge, Button, Card, EmptyState, Field, Input, Modal,
    PageHeader, Spinner, Textarea,
} from "../components/ui";
import type { Meeting } from "../types";

export default function Meetings() {
    const { profile, isModerator } = useAuth();
    const [items, setItems] = useState<Meeting[]>([]);
    const [attendance, setAttendance] = useState<Record<string, boolean>>({});
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        title: "", description: "", meeting_date: "", meeting_time: "", location: "",
    });

    const load = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("meetings")
            .select("*, profiles(full_name)")
            .order("meeting_date", { ascending: true });
        if (error) setError(error.message);
        else setItems((data as Meeting[]) ?? []);

        const { data: att } = await supabase.from("attendance").select("meeting_id, user_id");
        if (att) {
            const counts: Record<string, number> = {};
            const mine: Record<string, boolean> = {};
            att.forEach((row) => {
                counts[row.meeting_id] = (counts[row.meeting_id] ?? 0) + 1;
                if (row.user_id === profile?.id) mine[row.meeting_id] = true;
            });
            setCounts(counts);
            setAttendance(mine);
        }
        setLoading(false);
    }, [profile?.id]);

    useEffect(() => { load(); }, [load]);

    async function createMeeting(e: React.FormEvent) {
        e.preventDefault();
        if (!profile) return;
        setCreating(true);
        const { error } = await supabase.from("meetings").insert({
            proposer_id: profile.id, ...form,
        });
        setCreating(false);
        if (error) { setError(error.message); return; }
        setOpen(false);
        setForm({ title: "", description: "", meeting_date: "", meeting_time: "", location: "" });
        await load();
    }

    async function toggleAttendance(meetingId: string) {
        if (!profile) return;
        if (attendance[meetingId]) {
            await supabase.from("attendance").delete().eq("meeting_id", meetingId).eq("user_id", profile.id);
        } else {
            await supabase.from("attendance").insert({ meeting_id: meetingId, user_id: profile.id });
        }
        await load();
    }

    async function changeStatus(id: string, status: string) {
        const { error } = await supabase.from("meetings").update({ status }).eq("id", id);
        if (error) { setError(error.message); return; }
        await load();
    }

    return (
        <div>
            <PageHeader
                title="Reuniones y asambleas"
                description="Propón, organiza y participa en reuniones comunitarias."
                action={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Proponer reunión</Button>}
            />

            {error && <Alert kind="error">{error}</Alert>}

            {loading ? <Spinner /> : items.length === 0 ? (
                <EmptyState icon={<CalendarDays className="h-10 w-10" />} title="Sin reuniones" description="Aún no hay reuniones propuestas." />
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    {items.map((m) => (
                        <Card key={m.id} className="p-5">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-navy">{m.title}</h3>
                                <Badge color={m.status === "realizada" ? "green" : m.status === "cancelada" ? "red" : m.status === "confirmada" ? "teal" : "yellow"}>
                                    {m.status}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-slate-600">{m.description}</p>
                            <p className="mt-2 text-xs text-slate-500">
                                📅 {m.meeting_date} · {m.meeting_time.slice(0, 5)} · {m.location || "Por confirmar"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Propuesta por {m.profiles?.full_name ?? "Residente"} · {counts[m.id] ?? 0} asistentes
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant={attendance[m.id] ? "secondary" : "primary"}
                                    onClick={() => toggleAttendance(m.id)}
                                >
                                    {attendance[m.id] ? "Cancelar asistencia" : "Confirmar asistencia"}
                                </Button>
                                {isModerator && m.status === "propuesta" && (
                                    <Button size="sm" variant="secondary" onClick={() => changeStatus(m.id, "confirmada")}>Confirmar</Button>
                                )}
                                {isModerator && m.status !== "realizada" && m.status !== "cancelada" && (
                                    <Button size="sm" variant="ghost" onClick={() => changeStatus(m.id, "realizada")}>Marcar realizada</Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                open={open} onClose={() => setOpen(false)} title="Proponer reunión"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button loading={creating} onClick={createMeeting as any}>Proponer</Button>
                    </>
                }
            >
                <form className="space-y-3" onSubmit={createMeeting}>
                    <Field label="Nombre" htmlFor="n"><Input id="n" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
                    <Field label="Descripción" htmlFor="d"><Textarea id="d" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Fecha" htmlFor="f"><Input id="f" type="date" required value={form.meeting_date} onChange={(e) => setForm({ ...form, meeting_date: e.target.value })} /></Field>
                        <Field label="Hora" htmlFor="h"><Input id="h" type="time" required value={form.meeting_time} onChange={(e) => setForm({ ...form, meeting_time: e.target.value })} /></Field>
                    </div>
                    <Field label="Lugar o modalidad" htmlFor="l"><Input id="l" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
                </form>
            </Modal>
        </div>
    );
}