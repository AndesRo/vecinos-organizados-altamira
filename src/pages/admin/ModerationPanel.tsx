import { useCallback, useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
    Alert, Badge, Button, Card, EmptyState, PageHeader, Spinner,
} from "../../components/ui";
import type { Profile } from "../../types";

type Report = {
    id: string; reporter_id: string; target_type: string; target_id: string; reason: string; status: string; created_at: string;
};

export default function ModerationPanel() {
    const [pending, setPending] = useState<Profile[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const [p, r] = await Promise.all([
            supabase.from("profiles").select("*").eq("status", "pendiente_aprobacion").order("created_at", { ascending: true }),
            supabase.from("moderation_reports").select("*").eq("status", "pendiente").order("created_at", { ascending: true }),
        ]);
        if (p.error || r.error) setError("No fue posible cargar la bandeja.");
        else {
            setPending((p.data as Profile[]) ?? []);
            setReports((r.data as Report[]) ?? []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function approve(id: string) {
        const { error } = await supabase.from("profiles").update({ status: "aprobado" }).eq("id", id);
        if (error) { setError(error.message); return; }
        await logAction("aprobar_residente", "profile", id);
        await load();
    }

    async function reject(id: string) {
        const reason = prompt("Motivo del rechazo:");
        if (!reason) return;
        const { error } = await supabase.from("profiles").update({ status: "rechazado" }).eq("id", id);
        if (error) { setError(error.message); return; }
        await logAction("rechazar_residente", "profile", id, { reason });
        await load();
    }

    async function hideDiscussion(id: string, targetId: string) {
        await supabase.from("discussions").update({ is_hidden: true }).eq("id", targetId);
        await supabase.from("moderation_reports").update({ status: "resuelto" }).eq("id", id);
        await logAction("ocultar_publicacion", "discussion", targetId);
        await load();
    }

    async function dismissReport(id: string) {
        await supabase.from("moderation_reports").update({ status: "descartado" }).eq("id", id);
        await load();
    }

    async function logAction(action: string, targetType: string, targetId: string, details?: object) {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;
        await supabase.from("moderation_logs").insert({
            actor_id: data.user.id, action, target_type: targetType, target_id: targetId, details: details ?? {},
        });
    }

    if (loading) return <Spinner label="Cargando panel..." />;

    return (
        <div>
            <PageHeader title="Panel de moderación" description="Revisa solicitudes y reportes." />
            {error && <Alert kind="error">{error}</Alert>}

            <Card className="mb-6 p-5">
                <h2 className="mb-3 font-semibold text-navy">Solicitudes pendientes ({pending.length})</h2>
                {pending.length === 0 ? (
                    <EmptyState icon={<Shield className="h-8 w-8" />} title="Sin solicitudes" />
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {pending.map((p) => (
                            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                                <div>
                                    <p className="font-medium text-navy">{p.full_name}</p>
                                    <p className="text-xs text-slate-500">Depto {p.apartment} · registrado el {new Date(p.created_at).toLocaleDateString("es-CL")}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => approve(p.id)}>Aprobar</Button>
                                    <Button size="sm" variant="danger" onClick={() => reject(p.id)}>Rechazar</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            <Card className="p-5">
                <h2 className="mb-3 font-semibold text-navy">Reportes pendientes ({reports.length})</h2>
                {reports.length === 0 ? (
                    <EmptyState title="Sin reportes" />
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {reports.map((r) => (
                            <li key={r.id} className="py-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-medium text-navy">{r.target_type} · motivo: {r.reason}</p>
                                        <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString("es-CL")}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {r.target_type === "discussion" && (
                                            <Button size="sm" variant="danger" onClick={() => hideDiscussion(r.id, r.target_id)}>Ocultar contenido</Button>
                                        )}
                                        <Button size="sm" variant="secondary" onClick={() => dismissReport(r.id)}>Descartar</Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}