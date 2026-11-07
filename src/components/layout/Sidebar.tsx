import { NavLink } from "react-router-dom";
import {
    Home, MessageSquare, CalendarDays, BarChart3, FileText, Megaphone,
    User, Shield, Users, ScrollText, LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import clsx from "./clsx";

const nav = [
    { to: "/", label: "Inicio", icon: Home, end: true },
    { to: "/consultas", label: "Consultas y reclamos", icon: MessageSquare },
    { to: "/reuniones", label: "Reuniones", icon: CalendarDays },
    { to: "/encuestas", label: "Encuestas", icon: BarChart3 },
    { to: "/documentos", label: "Documentos", icon: FileText },
    { to: "/comunicados", label: "Comunicados", icon: Megaphone },
    { to: "/perfil", label: "Mi perfil", icon: User },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
    const { profile, isModerator, isAdmin, signOut } = useAuth();

    return (
        <div className="flex h-full w-64 flex-col bg-navy text-white">
            <div className="flex items-center gap-2 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal font-bold">VA</div>
                <div>
                    <p className="text-sm font-semibold leading-tight">Vecinos Organizados</p>
                    <p className="text-xs text-teal">Altamira</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
                {nav.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            clsx(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                                isActive ? "bg-teal text-white" : "text-slate-200 hover:bg-white/10"
                            )
                        }
                    >
                        <Icon className="h-4 w-4" /> {label}
                    </NavLink>
                ))}

                {isModerator && (
                    <div className="mt-4 space-y-1 border-t border-white/10 pt-3">
                        <p className="px-3 text-xs uppercase tracking-wider text-slate-400">Moderación</p>
                        <NavLink
                            to="/admin/moderacion"
                            onClick={onNavigate}
                            className={({ isActive }) =>
                                clsx(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                                    isActive ? "bg-teal text-white" : "text-slate-200 hover:bg-white/10"
                                )
                            }
                        >
                            <Shield className="h-4 w-4" /> Panel de moderación
                        </NavLink>
                        {isAdmin && (
                            <>
                                <NavLink
                                    to="/admin/usuarios"
                                    onClick={onNavigate}
                                    className={({ isActive }) =>
                                        clsx(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                                            isActive ? "bg-teal text-white" : "text-slate-200 hover:bg-white/10"
                                        )
                                    }
                                >
                                    <Users className="h-4 w-4" /> Usuarios
                                </NavLink>
                                <NavLink
                                    to="/admin/auditoria"
                                    onClick={onNavigate}
                                    className={({ isActive }) =>
                                        clsx(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                                            isActive ? "bg-teal text-white" : "text-slate-200 hover:bg-white/10"
                                        )
                                    }
                                >
                                    <ScrollText className="h-4 w-4" /> Auditoría
                                </NavLink>
                            </>
                        )}
                    </div>
                )}
            </nav>

            <div className="border-t border-white/10 px-3 py-3">
                <div className="mb-2 px-2">
                    <p className="truncate text-sm font-medium">{profile?.full_name ?? "Residente"}</p>
                    <p className="text-xs capitalize text-slate-400">{profile?.role}</p>
                </div>
                <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                >
                    <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
            </div>
        </div>
    );
}