import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Alert, Button, Card, Field, Input } from "../../components/ui";

export default function Login() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) navigate("/", { replace: true });
    }, [user, navigate]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) setError("Correo o contraseña incorrectos.");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md p-8">
                <div className="mb-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal text-lg font-bold text-white">VA</div>
                    <h1 className="mt-3 text-xl font-bold text-navy">Vecinos Organizados Altamira</h1>
                    <p className="mt-1 text-sm text-slate-500">Acceso exclusivo para residentes verificados</p>
                </div>

                <form className="space-y-4" onSubmit={onSubmit}>
                    {error && <Alert kind="error">{error}</Alert>}
                    <Field label="Correo electrónico" htmlFor="email">
                        <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Field>
                    <Field label="Contraseña" htmlFor="password">
                        <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </Field>
                    <Button type="submit" className="w-full" loading={loading}>Iniciar sesión</Button>
                </form>

                <div className="mt-4 flex flex-col gap-2 text-center text-sm">
                    <Link to="/registro" className="text-teal hover:underline">Crear cuenta de residente</Link>
                    <Link to="/recuperar" className="text-slate-500 hover:underline">¿Olvidaste tu contraseña?</Link>
                </div>
            </Card>
        </div>
    );
}