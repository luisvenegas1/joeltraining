-- ═══════════════════════════════════════════════════════════════
--  CUTOVER — ACTIVACIÓN de RLS (el "corte"). OPERACIÓN MANUAL (no es migración).
--  ⚠️ Correr SOLO después de migraciones 0001–0008,0013, de que
--     validation/pre_rls.sql pase limpio,
--     y de tener Supabase Auth con usuarios vinculados. Si no, la app legacy
--     (clave anon) perdería acceso. NO ejecutar en prod sin autorización.
--
--  Incluye GUARD: aborta la activación si hay registros sin organización.
--  Idempotente: enable row level security no falla si ya está activo.
-- ═══════════════════════════════════════════════════════════════

do $$
declare
  n bigint;
  johel uuid;
begin
  -- Johel debe existir
  select id into johel from public.organizations where slug = 'joheltraining';
  if johel is null then
    raise exception 'GUARD: no existe la organización joheltraining. Corré el bootstrap (cutover/bootstrap_johel_apply.sql) primero.';
  end if;

  -- Ningún registro sin organización
  select
    (select count(*) from public.users             where organization_id is null) +
    (select count(*) from public.exercises         where organization_id is null) +
    (select count(*) from public.routines          where organization_id is null) +
    (select count(*) from public.routine_days      where organization_id is null) +
    (select count(*) from public.routine_groups    where organization_id is null) +
    (select count(*) from public.routine_exercises where organization_id is null) +
    (select count(*) from public.measurements      where organization_id is null) +
    (select count(*) from public.payments          where organization_id is null) +
    (select count(*) from public.workout_sessions  where organization_id is null) +
    (select count(*) from public.workout_logs      where organization_id is null) +
    (select count(*) from public.catalogs          where organization_id is null)
  into n;

  if n > 0 then
    raise exception 'GUARD: hay % registros sin organization_id. Corré el bootstrap y revisá validation/pre_rls.sql antes de activar RLS.', n;
  end if;
end $$;

-- Activación (solo tras pasar el guard). service_role tiene BYPASSRLS.
alter table public.organizations        enable row level security;
alter table public.organization_settings enable row level security;
alter table public.profiles             enable row level security;
alter table public.organization_members enable row level security;
alter table public.users                enable row level security;
alter table public.exercises            enable row level security;
alter table public.routines             enable row level security;
alter table public.routine_days         enable row level security;
alter table public.routine_groups       enable row level security;
alter table public.routine_exercises    enable row level security;
alter table public.measurements         enable row level security;
alter table public.payments             enable row level security;
alter table public.workout_sessions     enable row level security;
alter table public.workout_logs         enable row level security;
alter table public.catalogs             enable row level security;
alter table public.organization_subscriptions enable row level security;
alter table public.platform_admins      enable row level security;

-- ROLLBACK (si algo sale mal tras activar): desactivar RLS puntualmente.
--   alter table public.<tabla> disable row level security;
-- Las policies quedan definidas; desactivar RLS las vuelve inertes sin borrarlas.
