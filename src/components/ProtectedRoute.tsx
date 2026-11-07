import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./ui";

export function ProtectedRoute() {
    const { user, profile, loading } = useAuth();

    if (loading) return <Spinner label="Verificando sesión..." />;
    if (!user) return <Navigate to="/login" replace />;
    if (!profile || profile.status !== "aprobado") {
        return <Navigate to="/cuenta-pendiente" replace />;
    }
    return <Outlet />;
}

export function ModeratorRoute() {
    const { isModerator, loading, profile } = useAuth();
    if (loading) return <Spinner label="Verificando permisos..." />;
    if (!profile || !isModerator) return <Navigate to="/" replace />;
    return <Outlet />;
}

export function AdminRoute() {
    const { isAdmin, loading, profile } = useAuth();
    if (loading) return <Spinner label="Verificando permisos..." />;
    if (!profile || !isAdmin) return <Navigate to="/" replace />;
    return <Outlet />;
}