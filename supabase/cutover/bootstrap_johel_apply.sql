-- ═══════════════════════════════════════════════════════════════
--  BOOTSTRAP JOHEL — PASO 2: APPLY (MUTACIONES, con verificación atómica)
--  OPERACIÓN MANUAL. NO la aplica `supabase db push`.
--
--  ⚠️ Ejecutar SOLO después de revisar y aprobar bootstrap_johel_preflight.sql,
--     con backup verificado y autorización explícita.
--
--  Todo el trabajo va en UNA transacción. La VERIFICACIÓN de "cero registros sin
--  organization_id" ocurre DENTRO de la misma transacción, ANTES del COMMIT: si
--  falla, lanza excepción y la transacción se revierte por completo (nada queda
--  aplicado). Al final, tras el commit, hay una consulta de solo lectura de estado.
--
--  Requiere migraciones 0001, 0002 y 0014 ya aplicadas.
-- ═══════════════════════════════════════════════════════════════

begin;

do $$
declare
  johel uuid := '11111111-1111-1111-1111-111111111111';
  n bigint;
begin
  -- Organización Johel (idempotente por slug)
  insert into public.organizations (id, name, slug, tenant_type, status)
  values (johel, 'Johel Training', 'joheltraining', 'production', 'active')
  on conflict (slug) do nothing;
  select id into johel from public.organizations where slug = 'joheltraining';

  -- Branding actual de Johel
  insert into public.organization_settings
    (organization_id, display_name, tagline, primary_color, secondary_color, call_to_action)
  values (johel, 'Johel Herrera', 'Strength · Discipline · Evolution', '#1A5DC8', '#0B1F4B', null)
  on conflict (organization_id) do nothing;

  -- Backfill: vincular TODOS los datos legacy a Johel (solo donde está NULL)
  update public.users             set organization_id = johel where organization_id is null;
  update public.exercises         set organization_id = johel where organization_id is null;
  update public.routines          set organization_id = johel where organization_id is null;
  update public.routine_days      set organization_id = johel where organization_id is null;
  update public.routine_groups    set organization_id = johel where organization_id is null;
  update public.routine_exercises set organization_id = johel where organization_id is null;
  update public.measurements      set organization_id = johel where organization_id is null;
  update public.payments          set organization_id = johel where organization_id is null;
  update public.workout_sessions  set organization_id = johel where organization_id is null;
  update public.workout_logs      set organization_id = johel where organization_id is null;
  update public.catalogs          set organization_id = johel where organization_id is null;

  -- Visibilidad de ejercicios (depende del backfill anterior)
  update public.exercises set visibility = 'organization'
    where visibility is null and organization_id is not null;
  update public.exercises set visibility = 'global'
    where organization_id is null and (visibility is null or visibility <> 'global');
  -- (Promoción opt-in de ejercicios a globales: ver 0005_exercise_library.sql)

  -- Suscripción activa (manual) de Johel
  insert into public.organization_subscriptions (organization_id, plan, status, provider)
  values (johel, 'base', 'active', 'manual')
  on conflict (organization_id) do nothing;

  -- ── VERIFICACIÓN ATÓMICA (antes del COMMIT) ──
  -- Cero registros legacy sin organización. Si queda alguno → excepción → ROLLBACK.
  select
    (select count(*) from public.users where organization_id is null) +
    (select count(*) from public.exercises where organization_id is null) +
    (select count(*) from public.routines where organization_id is null) +
    (select count(*) from public.routine_days where organization_id is null) +
    (select count(*) from public.routine_groups where organization_id is null) +
    (select count(*) from public.routine_exercises where organization_id is null) +
    (select count(*) from public.measurements where organization_id is null) +
    (select count(*) from public.payments where organization_id is null) +
    (select count(*) from public.workout_sessions where organization_id is null) +
    (select count(*) from public.workout_logs where organization_id is null) +
    (select count(*) from public.catalogs where organization_id is null)
  into n;

  if n > 0 then
    raise exception 'BOOTSTRAP ABORTADO: quedan % registros sin organization_id. Se revierte todo.', n;
  end if;

  raise notice '✅ Verificación OK dentro de la transacción: 0 registros sin organización. Procede COMMIT.';
end $$;

commit;

-- ── Estado final (SOLO LECTURA, después del commit) ──────────
select 'users' as tabla, count(*) total, count(*) filter (where organization_id is null) sin_org from public.users
union all select 'exercises', count(*), count(*) filter (where organization_id is null) from public.exercises
union all select 'routines', count(*), count(*) filter (where organization_id is null) from public.routines
union all select 'measurements', count(*), count(*) filter (where organization_id is null) from public.measurements
union all select 'payments', count(*), count(*) filter (where organization_id is null) from public.payments
union all select 'workout_sessions', count(*), count(*) filter (where organization_id is null) from public.workout_sessions
union all select 'catalogs', count(*), count(*) filter (where organization_id is null) from public.catalogs
order by tabla;

select o.slug, s.status, s.plan, s.provider
from public.organizations o
join public.organization_subscriptions s on s.organization_id = o.id
where o.slug = 'joheltraining';
