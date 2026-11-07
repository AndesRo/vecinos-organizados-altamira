import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, CalendarDays, BarChart3, Megaphone, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Card, PageHeader, Spinner } from "../components/ui";
import type { Announcement, Discussion, Meeting, Poll } from "../types";

type Stats = {
    residents: number;
    openDiscussions: number;
    resolvedDiscussions: number;
    meetings: Meeting[];
    polls: Poll[];
    announcements: Announcement[];
    discussions: Discussion[];
};

export default function Dashboard() {
    const { profile } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            setLoading(true);
            const [
                residents, openD, resolvedD, meetings, polls, announcements, discussions,
            ] = await Promise.all([
                supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "aprobado"),
                supabase.from("discussions").select("id", { count: "exact", head: true }).eq("status", "abierto"),
                supabase.from("discussions").select("id", { count: "exact", head: true }).eq("status", "resuelto"),
                supabase.from("meetings").select("*").gte("meeting_date", new Date().toISOString().slice(0, 10)).order("meeting_date", { ascending: true }).limit(3),
                supabase.from("polls").select("*").eq("status", "activa").order("created_at", { ascending: false }).limit(3),
                supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3),
                supabase.from("discussions").select("*").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
            ]);

            if (residents.error || openD.error) {
                setError("No fue posible cargar los datos del panel.");
                setLoading(false);
                return;
            }

            setStats({
                residents: residents.count ?? 0,
                openDiscussions: openD.count ?? 0,
                resolvedDiscussions: resolvedD.count ?? 0,
                meetings: (meetings.data as Meeting[]) ?? [],
                polls: (polls.data as Poll[]) ?? [],
                announcements: (announcements.data as Announcement[]) ?? [],
                discussions: (discussions.data as Discussion[]) ?? [],
            });
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <Spinner label="Cargando panel..." />;
    if (error) return <Card className="p-6 text-red-600">{error}</Card>;

    const cards = [
        { icon: Users, label: "Residentes verificados", value: stats?.residents ?? 0, color: "bg-teal-50 text-teal-700" },
        { icon: MessageSquare, label: "Consultas abiertas", value: stats?.openDiscussions ?? 0, color: "bg-blue-50 text-blue-700" },
        { icon: MessageSquare, label: "Consultas resueltas", value: stats?.resolvedDiscussions ?? 0, color: "bg-emerald-50 text-emerald-700" },
        { icon: CalendarDays, label: "Próximas reuniones", value: stats?.meetings.length ?? 0, color: "bg-amber-50 text-amber-700" },
    ];

    return (
        <div>
            <PageHeader
                title={`Bienvenido${profile ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
                description="Información, participación y organización para una comunidad más transparente."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((c) => (
                    <Card key={c.label} className="p-5">
                        <div className={`mb-3 inline-flex rounded-lg p-2 ${c.color}`}><c.icon className="h-5 w-5" /></div>
                        <p className="text-2xl font-bold text-navy">{c.value}</p>
                        <p className="text-sm text-slate-500">{c.label}</p>
                    </Card>
                ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Card className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-semibold text-navy">Últimas publicaciones</h2>
                        <Link to="/consultas" className="text-sm text-teal hover:underline">Ver todas</Link>
                    </div>
                    {stats && stats.discussions.length === 0 ? (
                        <p className="text-sm text-slate-500">Aún no hay publicaciones.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {stats?.discussions.map((d) => (
                                <li key={d.id} className="py-2">
                                    <Link to={`/consultas/${d.id}`} className="text-sm font-medium text-navy hover:text-teal">{d.title}</Link>
                                    <p className="text-xs text-slate-500">{new Date(d.created_at).toLocaleDateString("es-CL")} · {d.category}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-semibold text-navy">Comunicados recientes</h2>
                        <Link to="/comunicados" className="text-sm text-teal hover:underline">Ver todos</Link>
                    </div>
                    {stats && stats.announcements.length === 0 ? (
                        <p className="text-sm text-slate-500">Sin comunicados.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {stats?.announcements.map((a) => (
                                <li key={a.id} className="py-2">
                                    <p className="text-sm font-medium text-navy">{a.title}</p>
                                    <p className="text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString("es-CL")}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Card className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-semibold text-navy">Próximas reuniones</h2>
                        <Link to="/reuniones" className="text-sm text-teal hover:underline">Ver todas</Link>
                    </div>
                    {stats && stats.meetings.length === 0 ? (
                        <p className="text-sm text-slate-500">No hay reuniones próximas.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {stats?.meetings.map((m) => (
                                <li key={m.id} className="py-2">
                                    <p className="text-sm font-medium text-navy">{m.title}</p>
                                    <p className="text-xs text-slate-500">{m.meeting_date} · {m.meeting_time.slice(0, 5)}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-semibold text-navy">Encuestas activas</h2>
                        <Link to="/encuestas" className="text-sm text-teal hover:underline">Ver todas</Link>
                    </div>
                    {stats && stats.polls.length === 0 ? (
                        <p className="text-sm text-slate-500">No hay encuestas activas.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {stats?.polls.map((p) => (
                                <li key={p.id} className="py-2">
                                    <Link to={`/encuestas/${p.id}`} className="text-sm font-medium text-navy hover:text-teal">{p.question}</Link>
                                    <p className="text-xs text-slate-500">Creada {new Date(p.created_at).toLocaleDateString("es-CL")}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
}