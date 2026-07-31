-- ═══════════════════════════════════════════════════════════════
--  AUDITORÍA DE PREPARACIÓN PARA ENCENDER RLS — SOLO LECTURA. No muta nada.
--  Correr TODO en el SQL Editor. Si CUALQUIER fila da ok=false, NO prendas RLS:
--  corregí primero. Si TODAS dan ok=true, podés correr cutover/enable_rls.sql.
-- ═══════════════════════════════════════════════════════════════

-- ── BLOQUE A: gates duros (todas deben dar ok = true) ──────────
with checks as (
  -- A1) Ningún registro operativo sin organization_id (si no, se vuelve invisible)
  select 'A1 registros sin organization_id' as chequeo,
    (select count(*) from public.users where organization_id is null) +
    (select count(*) from public.exercises where organization_id is null and coalesce(visibility,'') <> 'global') +
    (select count(*) from public.routines where organization_id is null) +
    (select count(*) from public.routine_days where organization_id is null) +
    (select count(*) from public.routine_groups where organization_id is null) +
    (select count(*) from public.routine_exercises where organization_id is null) +
    (select count(*) from public.measurements where organization_id is null) +
    (select count(*) from public.payments where organization_id is null) +
    (select count(*) from public.workout_sessions where organization_id is null) +
    (select count(*) from public.workout_logs where organization_id is null) +
    (select count(*) from public.catalogs where organization_id is null) as observado,
    0 as esperado

  -- A2) Ejercicios "privados" mal marcados que quedarían invisibles
  union all select 'A2 ejercicios sin org y no global',
    (select count(*) from public.exercises where organization_id is null and coalesce(visibility,'') <> 'global'), 0

  -- A3) Toda organización tiene suscripción (gating consistente)
  union all select 'A3 orgs sin suscripción',
    (select count(*) from public.organizations o
     left join public.organization_subscriptions s on s.organization_id = o.id
     where s.organization_id is null), 0

  -- A4) joheltraining existe y tiene al menos un owner
  union all select 'A4 owners de joheltraining (>=1)',
    (select count(*) from public.organization_members m
     join public.organizations o on o.id = m.organization_id
     where o.slug = 'joheltraining' and m.role = 'owner'), 1

  -- A5) Huérfanos referenciales
  union all select 'A5 rutinas sin cliente',
    (select count(*) from public.routines r left join public.users u on u.id = r.user_id
     where r.user_id is not null and u.id is null), 0
  union all select 'A5 measurements sin cliente',
    (select count(*) from public.measurements m left join public.users u on u.id = m.client_id where u.id is null), 0
  union all select 'A5 payments sin cliente',
    (select count(*) from public.payments p left join public.users u on u.id = p.client_id where u.id is null), 0
  union all select 'A5 workout_sessions sin cliente',
    (select count(*) from public.workout_sessions s left join public.users u on u.id = s.user_id where u.id is null), 0
  union all select 'A5 workout_logs sin sesión',
    (select count(*) from public.workout_logs l left join public.workout_sessions s on s.id = l.session_id where s.id is null), 0

  -- A6) Sin cruces entre organizaciones
  union all select 'A6 staff en 2+ orgs',
    (select count(*) from (
       select m.user_id from public.organization_members m group by m.user_id having count(distinct m.organization_id) > 1
     ) x), 0
  union all select 'A6 rutinas con cliente de otra org',
    (select count(*) from public.routines r join public.users u on u.id = r.user_id
     where r.user_id is not null and r.organization_id <> u.organization_id), 0
  union all select 'A6 logs con sesión de otra org',
    (select count(*) from public.workout_logs l join public.workout_sessions s on s.id = l.session_id
     where l.organization_id <> s.organization_id), 0

  -- A7) Slugs únicos
  union all select 'A7 slugs duplicados',
    (select count(*) from (select slug from public.organizations group by slug having count(*) > 1) y), 0

  -- A8) Usernames de clientes únicos
  union all select 'A8 usernames duplicados',
    (select count(*) from (select username from public.users where username is not null group by username having count(*) > 1) z), 0
)
select chequeo, observado, esperado, (observado = esperado) as ok
from checks
order by ok, chequeo;

-- ── BLOQUE B: verificar que las policies clave existen (informativo) ──
-- Debe listar las policies de aislamiento. En especial, `routines_select` debe
-- contener client_owns_routine (soporte de rutinas asignadas de 0018/0021).
select tablename, policyname,
       (qual ilike '%client_owns_routine%') as usa_asignaciones
from pg_policies
where schemaname = 'public' and tablename = 'routines' and policyname = 'routines_select';

-- Conteo de policies por tabla (deben existir varias en cada tabla operativa).
select tablename, count(*) as policies
from pg_policies where schemaname = 'public'
  and tablename in ('users','exercises','routines','routine_assignments','measurements',
                    'payments','workout_sessions','catalogs','organization_subscriptions',
                    'platform_payments','platform_audit_log','platform_admins')
group by tablename order by tablename;

-- ── BLOQUE C: estado actual de RLS (informativo, antes de encender) ──
select relname as tabla, relrowsecurity as rls_encendido
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('users','exercises','routines','routine_days','routine_groups',
                  'routine_exercises','routine_assignments','measurements','payments',
                  'workout_sessions','workout_logs','catalogs','organizations',
                  'organization_settings','organization_members','profiles',
                  'organization_subscriptions','platform_admins','platform_payments','platform_audit_log')
order by relrowsecurity, relname;

-- ── BLOQUE D: resumen por organización (informativo) ──
select o.slug, o.tenant_type, s.status as suscripcion,
       (select count(*) from public.users u where u.organization_id = o.id) as clientes,
       (select count(*) from public.routines r where r.organization_id = o.id) as rutinas
from public.organizations o
left join public.organization_subscriptions s on s.organization_id = o.id
order by o.slug;
