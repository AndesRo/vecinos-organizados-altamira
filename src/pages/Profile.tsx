import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Alert, Badge, Button, Card, Field, Input, PageHeader } from "../components/ui";

export default function Profile() {
    const { profile, refreshProfile } = useAuth();
    const [fullName, setFullName] = useState(profile?.full_name ?? "");
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true); setMsg(""); setErr("");
        const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile?.id);
        setSaving(false);
        if (error) { setErr(error.message); return; }
        setMsg("Perfil actualizado.");
        await refreshProfile();
    }

    if (!profile) return null;

    return (
        <div>
            <PageHeader title="Mi perfil" description="Información personal privada." />

            <Card className="max-w-xl p-6">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal text-xl font-bold text-white">
                        {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-navy">{profile.full_name}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <Badge color="teal">{profile.role}</Badge>
                            <Badge color={profile.status === "aprobado" ? "green" : "yellow"}>{profile.status.replace("_", " ")}</Badge>
                        </div>
                    </div>
                </div>

                <form className="space-y-3" onSubmit={save}>
                    {msg && <Alert kind="success">{msg}</Alert>}
                    {err && <Alert kind="error">{err}</Alert>}
                    <Field label="Nombre completo" htmlFor="n"><Input id="n" value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
                    <Field label="Correo electrónico" htmlFor="e" hint="No editable. Solo visible para ti y moderación."><Input id="e" value={profile.email} disabled /></Field>
                    <Field label="Departamento" htmlFor="a" hint="No editable. Solo visible para ti y moderación."><Input id="a" value={profile.apartment} disabled /></Field>
                    <Field label="Fecha de registro" htmlFor="r"><Input id="r" value={new Date(profile.created_at).toLocaleDateString("es-CL")} disabled /></Field>
                    <Button type="submit" loading={saving}>Guardar cambios</Button>
                </form>
            </Card>
        </div>
    );
}