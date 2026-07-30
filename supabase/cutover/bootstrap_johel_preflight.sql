-- ═══════════════════════════════════════════════════════════════
--  BOOTSTRAP JOHEL — PASO 1: PREFLIGHT (SOLO LECTURA)
--  OPERACIÓN MANUAL. NO la aplica `supabase db push`.
--
--  Este archivo NO muta nada: no tiene BEGIN, UPDATE, INSERT ni COMMIT.
--  Ejecutá esto PRIMERO, revisá los resultados y aprobá manualmente antes de
--  correr bootstrap_johel_apply.sql.
--
--  Requiere migraciones 0001, 0002 y 0014 ya aplicadas (tablas + columnas).
-- ═══════════════════════════════════════════════════════════════

-- Conteos por tabla + cuántos registros están SIN organización (a vincular).
select 'users'             as tabla, count(*) as total, count(*) filter (where organization_id is null) as sin_org from public.users
union all select 'exercises',         count(*), count(*) filter (where organization_id is null) from public.exercises
union all select 'routines',          count(*), count(*) filter (where organization_id is null) from public.routines
union all select 'routine_days',      count(*), count(*) filter (where organization_id is null) from public.routine_days
union all select 'routine_groups',    count(*), count(*) filter (where organization_id is null) from public.routine_groups
union all select 'routine_exercises', count(*), count(*) filter (where organization_id is null) from public.routine_exercises
union all select 'measurements',      count(*), count(*) filter (where organization_id is null) from public.measurements
union all select 'payments',          count(*), count(*) filter (where organization_id is null) from public.payments
union all select 'workout_sessions',  count(*), count(*) filter (where organization_id is null) from public.workout_sessions
union all select 'workout_logs',      count(*), count(*) filter (where organization_id is null) from public.workout_logs
union all select 'catalogs',          count(*), count(*) filter (where organization_id is null) from public.catalogs
order by tabla;

-- ¿Ya existe Johel? (idempotencia: si ya existe, el apply no la recrea)
select 'org joheltraining' as check, count(*) as n from public.organizations where slug = 'joheltraining';

-- ¿Johel ya tiene suscripción? (el apply la crea si falta)
select 'suscripción johel' as check, count(*) as n
  from public.organization_subscriptions s
  join public.organizations o on o.id = s.organization_id
  where o.slug = 'joheltraining';

-- ── APROBACIÓN MANUAL ─────────────────────────────────────────
-- Revisá que los conteos "sin_org" correspondan EXACTAMENTE a datos legacy de
-- Johel (no debería haber datos de otra organización todavía). Solo si estás
-- conforme, ejecutá bootstrap_johel_apply.sql.
