import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Alert, Button, Card, Field, Input } from "../../components/ui";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/restablecer`,
        });
        setLoading(false);
        setSent(true);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md p-8">
                <h1 className="text-xl font-bold text-navy">Recuperar contraseña</h1>
                <p className="mt-1 text-sm text-slate-500">Te enviaremos un enlace para restablecer tu contraseña.</p>
                {sent ? (
                    <div className="mt-6 space-y-3">
                        <Alert kind="success">Si el correo está registrado, recibirás un enlace en tu bandeja.</Alert>
                        <Link to="/login" className="block text-center text-sm text-teal hover:underline">Volver</Link>
                    </div>
                ) : (
                    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                        <Field label="Correo electrónico" htmlFor="email">
                            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Field>
                        <Button type="submit" className="w-full" loading={loading}>Enviar enlace</Button>
                        <p className="text-center text-sm"><Link to="/login" className="text-teal hover:underline">Volver al inicio</Link></p>
                    </form>
                )}
            </Card>
        </div>
    );
}