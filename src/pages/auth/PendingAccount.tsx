import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Alert, Button, Card, Spinner } from "../../components/ui";

export default function PendingAccount() {
    const { user, profile, loading, signOut, refreshProfile } = useAuth();
    const [sending, setSending] = useState(false);
    const [resent, setResent] = useState(false);
    const [error, setError] = useState("");

    if (loading) return <Spinner label="Verificando cuenta..." />;

    const status = profile?.status;

    const message =
        !user
            ? "Debes iniciar sesión."
            : !profile
                ? "Estamos preparando tu perfil de residente. Vuelve a intentarlo en unos segundos."
                : status === "pendiente_verificacion"
                    ? "Debes verificar tu correo electrónico para continuar."
                    : status === "pendiente_aprobacion"
                        ? "Tu correo está verificado. Tu solicitud está pendiente de aprobación por un moderador."
                        : status === "rechazado"
                            ? "Tu solicitud fue rechazada. Contacta a un moderador para más información."
                            : status === "suspendido"
                                ? "Tu cuenta está suspendida. Contacta a un moderador."
                                : "Tu cuenta aún no está habilitada.";

    async function resendVerification() {
        if (!user?.email) return;
        setSending(true);
        setError("");
        const { error } = await supabase.auth.resend({
            type: "signup",
            email: user.email,
        });
        setSending(false);
        if (error) setError(error.message);
        else setResent(true);
    }

    async function reload() {
        await refreshProfile();
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md p-8 text-center">
                <h1 className="text-xl font-bold text-navy">Cuenta no habilitada</h1>
                <div className="mt-4">
                    <Alert kind="info">{message}</Alert>
                </div>

                {error && <div className="mt-3"><Alert kind="error">{error}</Alert></div>}
                {resent && <div className="mt-3"><Alert kind="success">Correo de verificación reenviado.</Alert></div>}

                <div className="mt-6 flex flex-col gap-2">
                    {status === "pendiente_verificacion" && user?.email && (
                        <Button variant="secondary" loading={sending} onClick={resendVerification}>
                            Reenviar correo de verificación
                        </Button>
                    )}
                    {status === "pendiente_aprobacion" && (
                        <Button variant="secondary" onClick={reload}>
                            Ya me aprobaron, actualizar estado
                        </Button>
                    )}
                    <Button variant="ghost" onClick={signOut}>Cerrar sesión</Button>
                </div>

                {user?.email && (
                    <p className="mt-4 text-xs text-slate-400">
                        Sesión iniciada como {user.email}
                    </p>
                )}
            </Card>
        </div>
    );
}