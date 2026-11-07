import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Alert, Button, Card, Spinner } from "../../components/ui";

export default function PendingAccount() {
    const { user, profile, loading, signOut, refreshProfile } = useAuth();
    const [sending, setSending] = useState(false);
    const [resent, setResent] = useState(false);
    const [error, setError] = useState("");

    // Si ya está aprobado, mandarlo al dashboard automáticamente.
    useEffect(() => {
        if (profile?.status === "aprobado") {
            // No hacemos nada aquí; el render lo resuelve con <Navigate>.
        }
    }, [profile?.status]);

    if (loading) return <Spinner label="Verificando cuenta..." />;

    // Sin sesión → al login (no mostrar "Cuenta no habilitada").
    if (!user) return <Navigate to="/login" replace />;

    // Aprobado → al dashboard.
    if (profile?.status === "aprobado") return <Navigate to="/" replace />;

    const status = profile?.status;

    const message =
        !profile
            ? "Estamos preparando tu perfil de residente. Espera unos segundos y recarga."
            : status === "pendiente_verificacion"
                ? "Debes verificar tu correo electrónico para continuar."
                : status === "pendiente_aprobacion"
                    ? "Tu correo está verificado. Tu solicitud está pendiente de aprobación por un moderador."
                    : status === "rechazado"
                        ? "Tu solicitud fue rechazada. Contacta a un moderador para más información."
                        : status === "suspendido"
                            ? "Tu cuenta está suspendida. Contacta a un moderador."
                            : "Tu cuenta aún no está habilitada. Actualiza el estado o contacta a moderación.";

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

    async function handleSignOut() {
        await signOut();
        // El cambio de `user` dispara el <Navigate to="/login"> de arriba.
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
                    {status === "pendiente_verificacion" && user.email && (
                        <Button variant="secondary" loading={sending} onClick={resendVerification}>
                            Reenviar correo de verificación
                        </Button>
                    )}
                    {(status === "pendiente_aprobacion" || !profile) && (
                        <Button variant="secondary" onClick={refreshProfile}>
                            Actualizar estado
                        </Button>
                    )}
                    <Button variant="ghost" onClick={handleSignOut}>Cerrar sesión</Button>
                </div>

                {user.email && (
                    <p className="mt-4 text-xs text-slate-400">
                        Sesión iniciada como {user.email}
                    </p>
                )}
            </Card>
        </div>
    );
}