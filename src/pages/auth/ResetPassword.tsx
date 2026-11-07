import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Alert, Button, Card, Field, Input } from "../../components/ui";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (error) { setError(error.message); return; }
        navigate("/login", { replace: true });
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md p-8">
                <h1 className="text-xl font-bold text-navy">Nueva contraseña</h1>
                {!ready ? (
                    <Alert kind="info">El enlace de recuperación no es válido o expiró.</Alert>
                ) : (
                    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                        {error && <Alert kind="error">{error}</Alert>}
                        <Field label="Nueva contraseña" htmlFor="p"><Input id="p" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
                        <Field label="Confirmar contraseña" htmlFor="c"><Input id="c" type="password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
                        <Button type="submit" className="w-full" loading={loading}>Guardar</Button>
                    </form>
                )}
            </Card>
        </div>
    );
}