import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Alert, Card, PageHeader, Spinner } from "../../components/ui";

type Log = {
    id: string; action: string; target_type: string | null; target_id: string | null;
    details: Record<string, unknown> | null; created_at: string;
    profiles?: { full_name: string } | null;
};

export default function AuditLog() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            const { data, error } = await supabase
                .from("moderation_logs")
                .select("*, profiles(full_name)")
                .order("created_at", { ascending: false })
                .limit(100);
            if (error) setError(error.message);
            else setLogs((data as Log[]) ?? []);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <Spinner />;

    return (
        <div>
            <PageHeader title="Auditoría" description="Historial de acciones administrativas (últimas 100)." />
            {error && <Alert kind="error">{error}</Alert>}
            <Card className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Actor</th>
                            <th className="px-4 py-3">Acción</th>
                            <th className="px-4 py-3">Objetivo</th>
                            <th className="px-4 py-3">Detalles</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map((l) => (
                            <tr key={l.id}>
                                <td className="px-4 py-2 text-slate-500">{new Date(l.created_at).toLocaleString("es-CL")}</td>
                                <td className="px-4 py-2">{l.profiles?.full_name ?? "—"}</td>
                                <td className="px-4 py-2 font-medium text-navy">{l.action}</td>
                                <td className="px-4 py-2 text-slate-500">{l.target_type}</td>
                                <td className="px-4 py-2 text-slate-500">{l.details ? JSON.stringify(l.details) : "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}