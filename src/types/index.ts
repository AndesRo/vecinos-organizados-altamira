export type UserRole = "residente" | "moderador" | "administrador";

export type AccountStatus =
    | "pendiente_verificacion"
    | "pendiente_aprobacion"
    | "aprobado"
    | "rechazado"
    | "suspendido";

export interface Profile {
    id: string;
    full_name: string;
    apartment: string;
    email: string;
    role: UserRole;
    status: AccountStatus;
    avatar_url: string | null;
    created_at: string;
}

export type DiscussionStatus = "abierto" | "en_seguimiento" | "resuelto";

export interface Discussion {
    id: string;
    author_id: string;
    title: string;
    description: string;
    category: string;
    status: DiscussionStatus;
    is_hidden: boolean;
    created_at: string;
    updated_at: string;
    profiles?: Pick<Profile, "full_name"> | null;
}

export interface Comment {
    id: string;
    discussion_id: string;
    author_id: string;
    content: string;
    is_hidden: boolean;
    created_at: string;
    profiles?: Pick<Profile, "full_name"> | null;
}

export type MeetingStatus = "propuesta" | "confirmada" | "realizada" | "cancelada";

export interface Meeting {
    id: string;
    proposer_id: string;
    title: string;
    description: string | null;
    meeting_date: string;
    meeting_time: string;
    location: string | null;
    status: MeetingStatus;
    created_at: string;
    profiles?: Pick<Profile, "full_name"> | null;
}

export type PollStatus = "borrador" | "activa" | "cerrada";

export interface PollOption {
    id: string;
    poll_id: string;
    option_text: string;
    created_at: string;
}

export interface Poll {
    id: string;
    creator_id: string;
    question: string;
    status: PollStatus;
    starts_at: string;
    ends_at: string | null;
    created_at: string;
    poll_options?: PollOption[];
    profiles?: Pick<Profile, "full_name"> | null;
}

export interface DocumentRow {
    id: string;
    uploader_id: string;
    title: string;
    description: string | null;
    category: string;
    file_path: string;
    file_type: string | null;
    created_at: string;
    profiles?: Pick<Profile, "full_name"> | null;
}

export type ImportanceLevel = "baja" | "media" | "alta";

export interface Announcement {
    id: string;
    author_id: string;
    title: string;
    content: string;
    image_url: string | null;
    importance: ImportanceLevel;
    created_at: string;
    profiles?: Pick<Profile, "full_name"> | null;
}

export const CATEGORIES = [
    "Administración",
    "Mantención",
    "Seguridad",
    "Gastos comunes",
    "Convivencia",
    "Áreas comunes",
    "Otros",
] as const;

export const DOC_CATEGORIES = [
    "Actas de reuniones",
    "Comunicados",
    "Solicitudes",
    "Respuestas",
    "Documentos de respaldo",
    "Reglamentos",
    "Otros documentos",
] as const;