import { useAuth } from "../../context/AuthContext";
import { Alert, Button, Card } from "../../components/ui";

export default function PendingAccount() {
    const { profile, user, signOut } = useAuth();

    const message =
        !user ? "Debes iniciar sesión."
            : !profile ? "Aún no se ha creado tu perfil de residente."
                : profile.status === "pendiente_verificacion" ? "Debes verificar tu correo electrónico."
                    : profile.status === "pendiente_aprobacion" ? "Tu cuenta está pendiente de aprobación por un moderador."
                        : profile.status === "rechazado" ? "Tu solicitud fue rechazada. Contacta a un moderador."
                            : profile.status === "suspendido" ? "Tu cuenta está suspendida."
                                : "";

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md p-8 text-center">
                <h1 className="text-xl font-bold text-navy">Cuenta no habilitada</h1>
                <div className="mt-4"><Alert kind="info">{message}</Alert></div>
                <div className="mt-6 flex flex-col gap-2">
                    <Button variant="secondary" onClick={signOut}>Cerrar sesión</Button>
                </div>
            </Card>
        </div>
    );
}