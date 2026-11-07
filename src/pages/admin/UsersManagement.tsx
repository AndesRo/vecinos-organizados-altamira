import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Alert, Button, Card, PageHeader, Select, Spinner } from "../../components/ui";
import type { Profile, UserRole } from "../../types";

export default function UsersManagement() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (error) setError(error.message);
        else setUsers((data as Profile[]) ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function changeRole(id: string, role: UserRole) {
        const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
        if (error) { setError(error.message); return; }
        await load();
    }

    async function changeStatus(id: string, status: Profile["status"]) {
        const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
        if (error) { setError(error.message); return; }
        await load();
    }

    if (loading) return <Spinner />;

    return (
        <div>
            <PageHeader title="Gestión de usuarios" description="Administra roles y estados de las cuentas." />
            {error && <Alert kind="error">{error}</Alert>}
            <Card className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Depto</th>
                            <th className="px-4 py-3">Rol</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3">Registro</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td className="px-4 py-3 font-medium text-navy">{u.full_name}</td>
                                <td className="px-4 py-3 text-slate-500">{u.apartment}</td>
                                <td className="px-4 py-3">
                                    <Select value={u.role} onChange={(e) => changeRole(u.id, e.target.value as UserRole)}>
                                        <option value="residente">residente</option>
                                        <option value="moderador">moderador</option>
                                        <option value="administrador">administrador</option>
                                    </Select>
                                </td>
                                <td className="px-4 py-3">
                                    <Select value={u.status} onChange={(e) => changeStatus(u.id, e.target.value as Profile["status"])}>
                                        <option value="pendiente_verificacion">pendiente verificación</option>
                                        <option value="pendiente_aprobacion">pendiente aprobación</option>
                                        <option value="aprobado">aprobado</option>
                                        <option value="rechazado">rechazado</option>
                                        <option value="suspendido">suspendido</option>
                                    </Select>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString("es-CL")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
            <div className="mt-3">
                <Button variant="secondary" onClick={load}>Refrescar</Button>
            </div>
        </div>
    );
}