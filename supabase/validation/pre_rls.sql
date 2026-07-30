-- ═══════════════════════════════════════════════════════════════
--  VALIDACIÓN — PREVIA a activar RLS (SOLO LECTURA). OPERACIÓN MANUAL.
--  Correr después de las migraciones 0001–0008,0013. Ninguna fila debe salir con
--  problemas. Si algo crítico falla, NO continuar con cutover/enable_rls.sql.
-- ═══════════════════════════════════════════════════════════════

-- 1) Registros sin organización (deben ser 0)
select 'users sin org'            as check, count(*) as n from public.users             where organization_id is null
union all select 'exercises sin org',        count(*) from public.exercises         where organization_id is null
union all select 'routines sin org',         count(*) from public.routines          where organization_id is null
union all select 'routine_days sin org',     count(*) from public.routine_days      where organization_id is null
union all select 'routine_groups sin org',   count(*) from public.routine_groups    where organization_id is null
union all select 'routine_exercises sin org',count(*) from public.routine_exercises where organization_id is null
union all select 'measurements sin org',     count(*) from public.measurements      where organization_id is null
union all select 'payments sin org',         count(*) from public.payments          where organization_id is null
union all select 'workout_sessions sin org', count(*) from public.workout_sessions  where organization_id is null
union all select 'workout_logs sin org',     count(*) from public.workout_logs      where organization_id is null
union all select 'catalogs sin org',         count(*) from public.catalogs          where organization_id is null;

-- 2) Slugs y organizaciones (Johel debe existir, slug único)
select 'orgs' as check, count(*) n from public.organizations;
select slug, count(*) from public.organizations group by slug having count(*) > 1; -- 0 filas

-- 2b) Toda organización debe tener fila de suscripción (para gating consistente).
--     Debe devolver 0.
select 'orgs sin suscripción' as check, count(*) as n
  from public.organizations o
  left join public.organization_subscriptions s on s.organization_id = o.id
  where s.organization_id is null;

-- 3) Huérfanos referenciales (deben ser 0)
select 'routines sin cliente'         as check, count(*) n
  from public.routines r left join public.users u on u.id = r.user_id
  where r.user_id is not null and u.id is null
union all
select 'measurements sin cliente', count(*)
  from public.measurements m left join public.users u on u.id = m.client_id where u.id is null
union all
select 'payments sin cliente', count(*)
  from public.payments p left join public.users u on u.id = p.client_id where u.id is null
union all
select 'workout_sessions sin cliente', count(*)
  from public.workout_sessions s left join public.users u on u.id = s.user_id where u.id is null
union all
select 'workout_logs sin sesion', count(*)
  from public.workout_logs l left join public.workout_sessions s on s.id = l.session_id where s.id is null
union all
select 'routine_days sin rutina', count(*)
  from public.routine_days d left join public.routines r on r.id = d.routine_id where r.id is null
union all
select 'routine_groups sin dia', count(*)
  from public.routine_groups g left join public.routine_days d on d.id = g.day_id where d.id is null
union all
select 'routine_exercises sin grupo', count(*)
  from public.routine_exercises re left join public.routine_groups g on g.id = re.group_id where g.id is null
union all
select 'routine_exercises con ejercicio inexistente', count(*)
  from public.routine_exercises re left join public.exercises e on e.id = re.exercise_id where e.id is null;

-- 4) Usernames duplicados (deben ser 0 filas)
select username, count(*) from public.users group by username having count(*) > 1;

-- 5) Datos cruzados entre tenants (tras crear demo): 0 filas
-- select 'johel en demo' as check, count(*) from public.users
--   where organization_id = (select id from organizations where slug='titotrainer')
--     and id in (select id from users where organization_id=(select id from organizations where slug='joheltraining'));
