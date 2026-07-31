-- ═══════════════════════════════════════════════════════════════
--  CUTOVER — Vincular cuentas LEGACY (users) con cuentas de Auth por correo.
--  OPERACIÓN MANUAL. Aditiva e idempotente. No borra datos.
--
--  Objetivo: que las cuentas viejas (username/clave en public.users) puedan
--  entrar por Supabase Auth con un correo, SIN perder su info (rutinas,
--  mediciones, historial). Se logra poniendo users.auth_user_id = el uid de Auth.
--  Bajo RLS, current_client_id() resuelve por users.auth_user_id = auth.uid().
--
--  PASO 1 (antes de correr esto): crear las 3 cuentas en el Dashboard
--    Authentication → Users → Add user → Create new user
--    con el correo + una contraseña + "Auto Confirm User":
--       johel  → johel@tito-apps.com
--       sofi   → sofi192@hotmail.com
--       tito   → luis_diego_venegas@hotmail.com
--
--  PASO 2: correr este script. El JOIN contra auth.users hace que, si una
--  cuenta todavía no existe, esa fila NO se actualice (no deja auth_user_id nulo).
-- ═══════════════════════════════════════════════════════════════

-- ── Clientes: vincular su fila de users con su cuenta Auth (por correo) ──
-- Sofía (users.id = u1)
update public.users u
set auth_user_id = a.id, email = a.email
from auth.users a
where u.id = 'u1' and lower(a.email) = lower('sofi192@hotmail.com');

-- Tito (users.id = u2)
update public.users u
set auth_user_id = a.id, email = a.email
from auth.users a
where u.id = 'u2' and lower(a.email) = lower('luis_diego_venegas@hotmail.com');

-- ── Johel (entrenador): vincular su fila Y darle membresía en joheltraining ──
-- Johel (users.id = t1)
update public.users u
set auth_user_id = a.id, email = a.email
from auth.users a
where u.id = 't1' and lower(a.email) = lower('johel@tito-apps.com');

-- Membresía de entrenador/owner en joheltraining (para que administre su org
-- bajo RLS). role='owner' le da control total de su organización; cambialo a
-- 'trainer' si preferís que no gestione branding/miembros.
insert into public.organization_members (organization_id, user_id, role)
select o.id, a.id, 'owner'
from public.organizations o
join auth.users a on lower(a.email) = lower('johel@tito-apps.com')
where o.slug = 'joheltraining'
on conflict (organization_id, user_id) do update set role = excluded.role;

-- ── Verificación (deben aparecer los 3 con su auth_user_id no nulo) ──
select u.id, u.username, u.name, u.role, u.email, u.auth_user_id
from public.users u
where u.id in ('t1','u1','u2')
order by u.id;

-- Membresías de johel (debe listar joheltraining como owner)
select o.slug, m.role
from public.organization_members m
join public.organizations o on o.id = m.organization_id
join auth.users a on a.id = m.user_id
where lower(a.email) = lower('johel@tito-apps.com');
