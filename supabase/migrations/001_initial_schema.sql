create extension if not exists "pgcrypto";

create type public.user_role as enum ('residente', 'moderador', 'administrador');
create type public.account_status as enum (
  'pendiente_verificacion',
  'pendiente_aprobacion',
  'aprobado',
  'rechazado',
  'suspendido'
);
create type public.discussion_status as enum ('abierto', 'en_seguimiento', 'resuelto');
create type public.meeting_status as enum ('propuesta', 'confirmada', 'realizada', 'cancelada');
create type public.poll_status as enum ('borrador', 'activa', 'cerrada');
create type public.importance_level as enum ('baja', 'media', 'alta');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  apartment text not null,
  email text not null unique,
  role public.user_role not null default 'residente',
  status public.account_status not null default 'pendiente_verificacion',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.discussions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  status public.discussion_status not null default 'abierto',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  proposer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  meeting_date date not null,
  meeting_time time not null,
  location text,
  status public.meeting_status not null default 'propuesta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (meeting_id, user_id)
);

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  question text not null,
  status public.poll_status not null default 'activa',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_text text not null,
  created_at timestamptz not null default now()
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  file_path text not null,
  file_type text,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  image_url text,
  importance public.importance_level not null default 'media',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  status text not null default 'pendiente',
  created_at timestamptz not null default now()
);

create table public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  target_type text,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- Trigger para crear perfil al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, apartment, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'apartment', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Helpers de permisos.
create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid(); $$;

create or replace function public.is_approved()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and status = 'aprobado'); $$;

create or replace function public.is_moderator()
returns boolean
language sql stable security definer set search_path = public
as $$ select public.current_role() in ('moderador', 'administrador'); $$;

-- RLS.
alter table public.profiles enable row level security;
alter table public.discussions enable row level security;
alter table public.comments enable row level security;
alter table public.meetings enable row level security;
alter table public.attendance enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.votes enable row level security;
alter table public.documents enable row level security;
alter table public.announcements enable row level security;
alter table public.moderation_reports enable row level security;
alter table public.moderation_logs enable row level security;

create policy "perfil propio o moderador"
on public.profiles for select
using (id = auth.uid() or public.is_moderator());

create policy "actualizar perfil propio"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "discusiones visibles para aprobados"
on public.discussions for select
using (public.is_approved() and is_hidden = false or public.is_moderator());

create policy "crear discusion propia"
on public.discussions for insert
with check (author_id = auth.uid() and public.is_approved());

create policy "editar discusion propia o moderar"
on public.discussions for update
using (author_id = auth.uid() or public.is_moderator());

create policy "comentarios visibles para aprobados"
on public.comments for select
using (public.is_approved() and is_hidden = false or public.is_moderator());

create policy "crear comentario propio"
on public.comments for insert
with check (author_id = auth.uid() and public.is_approved());

create policy "reuniones visibles para aprobados"
on public.meetings for select
using (public.is_approved());

create policy "crear reunion propia"
on public.meetings for insert
with check (proposer_id = auth.uid() and public.is_approved());

create policy "asistencia propia"
on public.attendance for all
using (user_id = auth.uid())
with check (user_id = auth.uid() and public.is_approved());

create policy "encuestas visibles para aprobados"
on public.polls for select
using (public.is_approved());

create policy "crear encuesta propia"
on public.polls for insert
with check (creator_id = auth.uid() and public.is_approved());

create policy "opciones visibles para aprobados"
on public.poll_options for select
using (public.is_approved());

create policy "votos propios"
on public.votes for all
using (user_id = auth.uid())
with check (user_id = auth.uid() and public.is_approved());

create policy "documentos visibles para aprobados"
on public.documents for select
using (public.is_approved());

create policy "subir documento aprobado"
on public.documents for insert
with check (uploader_id = auth.uid() and public.is_approved());

create policy "comunicados visibles para aprobados"
on public.announcements for select
using (public.is_approved());

create policy "publicar comunicado moderador"
on public.announcements for insert
with check (public.is_moderator());

create policy "reportar contenido aprobado"
on public.moderation_reports for insert
with check (reporter_id = auth.uid() and public.is_approved());

create policy "ver reportes moderador"
on public.moderation_reports for select
using (public.is_moderator());

create policy "ver auditoria administrador"
on public.moderation_logs for select
using (public.current_role() = 'administrador');