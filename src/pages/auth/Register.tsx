import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Alert, Button, Card, Field, Input } from "../../components/ui";

export default function Register() {
    const [fullName, setFullName] = useState("");
    const [apartment, setApartment] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [accept, setAccept] = useState(false);
    const [error, setError] = useState("");
    const [ok, setOk] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!accept) { setError("Debes aceptar la política de privacidad y reglas de uso."); return; }
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, apartment },
                emailRedirectTo: `${window.location.origin}/login`,
            },
        });
        setLoading(false);
        if (error) { setError(error.message); return; }
        setOk(true);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <Card className="w-full max-w-md p-8">
                <h1 className="text-xl font-bold text-navy">Crear cuenta de residente</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Tu solicitud será revisada por un moderador antes de habilitar el acceso.
                </p>

                {ok ? (
                    <div className="mt-6 space-y-3">
                        <Alert kind="success">
                            Cuenta creada. Revisa tu correo para verificar el email. Luego un moderador revisará tu residencia.
                        </Alert>
                        <Link to="/login" className="block text-center text-sm text-teal hover:underline">Volver al inicio de sesión</Link>
                    </div>
                ) : (
                    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                        {error && <Alert kind="error">{error}</Alert>}
                        <Field label="Nombre completo" htmlFor="full_name">
                            <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </Field>
                        <Field label="Número de departamento" htmlFor="apartment">
                            <Input id="apartment" required value={apartment} onChange={(e) => setApartment(e.target.value)} />
                        </Field>
                        <Field label="Correo electrónico" htmlFor="email">
                            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Field>
                        <Field label="Contraseña" htmlFor="password" hint="Mínimo 8 caracteres.">
                            <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                        </Field>
                        <label className="flex items-start gap-2 text-sm text-slate-600">
                            <input type="checkbox" className="mt-1" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
                            <span>Acepto la política de privacidad y las reglas de convivencia y uso de la plataforma.</span>
                        </label>
                        <Button type="submit" className="w-full" loading={loading}>Registrarme</Button>
                        <p className="text-center text-sm text-slate-500">
                            ¿Ya tienes cuenta? <Link to="/login" className="text-teal hover:underline">Inicia sesión</Link>
                        </p>
                    </form>
                )}
            </Card>
        </div>
    );
}