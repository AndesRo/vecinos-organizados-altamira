import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute, ModeratorRoute, ProtectedRoute } from "../components/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import PendingAccount from "../pages/auth/PendingAccount";

import Dashboard from "../pages/Dashboard";
import Discussions from "../pages/Discussions";
import DiscussionDetail from "../pages/DiscussionDetail";
import Meetings from "../pages/Meetings";
import Polls from "../pages/Polls";
import PollDetail from "../pages/PollDetail";
import Documents from "../pages/Documents";
import Announcements from "../pages/Announcements";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";

import ModerationPanel from "../pages/admin/ModerationPanel";
import UsersManagement from "../pages/admin/UsersManagement";
import AuditLog from "../pages/admin/AuditLog";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/recuperar" element={<ForgotPassword />} />
            <Route path="/restablecer" element={<ResetPassword />} />
            <Route path="/cuenta-pendiente" element={<PendingAccount />} />

            {/* Privadas */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="consultas" element={<Discussions />} />
                    <Route path="consultas/:id" element={<DiscussionDetail />} />
                    <Route path="reuniones" element={<Meetings />} />
                    <Route path="encuestas" element={<Polls />} />
                    <Route path="encuestas/:id" element={<PollDetail />} />
                    <Route path="documentos" element={<Documents />} />
                    <Route path="comunicados" element={<Announcements />} />
                    <Route path="perfil" element={<Profile />} />

                    <Route element={<ModeratorRoute />}>
                        <Route path="admin/moderacion" element={<ModerationPanel />} />
                    </Route>
                    <Route element={<AdminRoute />}>
                        <Route path="admin/usuarios" element={<UsersManagement />} />
                        <Route path="admin/auditoria" element={<AuditLog />} />
                    </Route>
                </Route>
            </Route>

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}