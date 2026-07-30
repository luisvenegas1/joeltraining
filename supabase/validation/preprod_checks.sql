-- ═══════════════════════════════════════════════════════════════
--  VALIDACIÓN DE PREPRODUCCIÓN — SOLO LECTURA. No muta nada.
--  Correr en el SQL Editor DESPUÉS de provisionar las 3 cuentas Auth.
--  Reemplazá los 3 emails placeholder por los reales antes de correr.
--
--  Cada bloque devuelve una fila con `check`, el valor observado y lo esperado.
-- ═══════════════════════════════════════════════════════════════
--   <OWNER_EMAIL>   <DEMO_EMAIL>   <CLIENT_EMAIL>

-- 1) Johel y Tito Trainer existen y tienen suscripción activa
select 'orgs+suscripción activa' as check,
       count(*) as observado, 2 as esperado
from public.organizations o
join public.organization_subscriptions s on s.organization_id = o.id
where o.slug in ('joheltraining','titotrainer') and s.status = 'active';

-- 2) Cero registros sin organization_id (debe ser 0)
select 'registros sin organization_id' as check,
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
  (select count(*) from public.catalogs where organization_id is null) as observado,
  0 as esperado;

-- 3) OWNER: existe en Auth, es owner de joheltraining y es platform_admin
select 'owner = owner de joheltraining' as check, count(*) as observado, 1 as esperado
from auth.users u
join public.organization_members m on m.user_id = u.id and m.role = 'owner'
join public.organizations o on o.id = m.organization_id and o.slug = 'joheltraining'
where u.email = '<OWNER_EMAIL>';

select 'owner registrado en platform_admins' as check, count(*) as observado, 1 as esperado
from auth.users u
join public.platform_admins pa on pa.user_id = u.id
where u.email = '<OWNER_EMAIL>';

-- 4) DEMO VIEWER: es demo_viewer de titotrainer (y de ninguna otra org staff)
select 'demo_viewer = demo_viewer de titotrainer' as check, count(*) as observado, 1 as esperado
from auth.users u
join public.organization_members m on m.user_id = u.id and m.role = 'demo_viewer'
join public.organizations o on o.id = m.organization_id and o.slug = 'titotrainer'
where u.email = '<DEMO_EMAIL>';

select 'demo_viewer NO es platform_admin' as check, count(*) as observado, 0 as esperado
from auth.users u join public.platform_admins pa on pa.user_id = u.id
where u.email = '<DEMO_EMAIL>';

-- 5) CLIENTE DEMO: vinculado SOLO a demo_c1, sin membresía staff
select 'cliente demo vinculado a demo_c1' as check, count(*) as observado, 1 as esperado
from auth.users u
join public.users c on c.auth_user_id = u.id and c.id = 'demo_c1'
where u.email = '<CLIENT_EMAIL>';

select 'cliente demo vinculado a EXACTAMENTE 1 users row' as check, count(*) as observado, 1 as esperado
from public.users c
join auth.users u on u.id = c.auth_user_id
where u.email = '<CLIENT_EMAIL>';

select 'cliente demo SIN membresía staff' as check, count(*) as observado, 0 as esperado
from auth.users u join public.organization_members m on m.user_id = u.id
where u.email = '<CLIENT_EMAIL>';

-- 6) Sin referencias cruzadas Johel <-> Tito Trainer
--    a) Ningún miembro pertenece a ambas organizaciones
select 'usuarios en Johel Y Tito (staff)' as check, count(*) as observado, 0 as esperado
from (
  select m.user_id
  from public.organization_members m
  join public.organizations o on o.id = m.organization_id
  where o.slug in ('joheltraining','titotrainer')
  group by m.user_id
  having count(distinct o.slug) > 1
) x;

--    b) Ninguna rutina referencia un cliente de otra organización
select 'rutinas con cliente de otra org' as check, count(*) as observado, 0 as esperado
from public.routines r
join public.users u on u.id = r.user_id
where r.user_id is not null and r.organization_id <> u.organization_id;

--    c) Ningún log referencia una sesión de otra organización
select 'workout_logs con sesión de otra org' as check, count(*) as observado, 0 as esperado
from public.workout_logs l
join public.workout_sessions s on s.id = l.session_id
where l.organization_id <> s.organization_id;

-- 7) Resumen por organización (informativo)
select o.slug, o.tenant_type, s.status as suscripcion,
       (select count(*) from public.users u where u.organization_id = o.id) as clientes,
       (select count(*) from public.routines r where r.organization_id = o.id) as rutinas
from public.organizations o
left join public.organization_subscriptions s on s.organization_id = o.id
where o.slug in ('joheltraining','titotrainer')
order by o.slug;
