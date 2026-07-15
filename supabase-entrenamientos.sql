-- ═══════════════════════════════════════════════════════════════
--  JOEL TRAINING — Migración: Registro de entrenamientos y progreso
--  Correr UNA SOLA VEZ en Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- Sesiones de entrenamiento (un registro por día entrenado)
create table if not exists public.workout_sessions (
  id           text primary key,
  user_id      text not null,
  routine_id   text,
  day_id       text,
  day_label    text,
  started_at   timestamptz not null,
  finished_at  timestamptz,
  status       text not null default 'completed',
  created_at   timestamptz not null default now()
);

create index if not exists workout_sessions_user_idx
  on public.workout_sessions (user_id);
create index if not exists workout_sessions_started_idx
  on public.workout_sessions (started_at);

-- Pesos usados por ejercicio en cada sesión (snapshot: guarda nombre y
-- valores del ejercicio para que el historial no se rompa si la rutina cambia)
create table if not exists public.workout_logs (
  id             text primary key,
  session_id     text not null references public.workout_sessions(id) on delete cascade,
  exercise_id    text,
  exercise_name  text,
  series         text,
  reps           text,
  planned_weight text,   -- peso que puso el coach
  actual_weight  text,   -- peso que realmente usó el cliente
  weight_unit    text default 'lbs',
  sort_order     int default 0
);

create index if not exists workout_logs_session_idx
  on public.workout_logs (session_id);
create index if not exists workout_logs_exercise_idx
  on public.workout_logs (exercise_id);

-- RLS: mismo esquema abierto que usa el resto de la app (clave publishable).
-- Si el resto de tus tablas tienen RLS deshabilitado, dejá esto igual.
alter table public.workout_sessions disable row level security;
alter table public.workout_logs     disable row level security;
