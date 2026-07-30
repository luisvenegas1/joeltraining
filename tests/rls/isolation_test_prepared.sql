-- ═══════════════════════════════════════════════════════════════
--  PRUEBA DE AISLAMIENTO RLS — variante con usuarios Auth PREPARADOS
--  Úsala si insertar en auth.users directamente no es compatible con tu Supabase.
--
--  Requisitos previos (creados EXTERNAMENTE con la Edge Function/script):
--   - Un usuario Auth "A" (owner) y un usuario Auth "B" (owner) YA existentes.
--   - Reemplazá los uuids de abajo (:uidA, :uidB) por los reales.
--
--  Ejecutar en el SQL Editor (rol privilegiado). Todo va en UNA transacción y
--  termina en ROLLBACK: NUNCA hace COMMIT, así que si falla a mitad, la
--  transacción se aborta y NO deja usuarios ni datos de prueba persistentes.
-- ═══════════════════════════════════════════════════════════════
begin;

-- >>> EDITAR: uuids de dos usuarios Auth reales ya creados <<<
--   (no se insertan en auth.users: se asume que existen)
create temporary table _p(uidA uuid, uidB uuid) on commit drop;
insert into _p values (
  '00000000-0000-0000-0000-0000000000a1',  -- uidA  (reemplazar)
  '00000000-0000-0000-0000-0000000000b1'   -- uidB  (reemplazar)
);

do $$
declare
  uidA uuid; uidB uuid;
  orgA uuid := '00000000-0000-0000-0000-0000000000a0';
  orgB uuid := '00000000-0000-0000-0000-0000000000b0';
begin
  select uidA, uidB into uidA, uidB from _p;

  -- Verificar que los Auth users existen (si no, abortar sin dejar nada).
  if not exists (select 1 from auth.users where id = uidA)
     or not exists (select 1 from auth.users where id = uidB) then
    raise exception 'Faltan usuarios Auth preparados (uidA/uidB). Creálos con la Edge Function/script y editá este archivo.';
  end if;

  insert into public.organizations (id,name,slug,tenant_type,status) values
    (orgA,'Test Prod A','test-a','test','active'),
    (orgB,'Test Prod B','test-b','test','active');

  insert into public.organization_members (organization_id,user_id,role) values
    (orgA, uidA, 'owner'),
    (orgB, uidB, 'owner');

  insert into public.users (id,username,password,name,role,organization_id) values
    ('cliA','cliA','x','Cliente A','user',orgA),
    ('cliB','cliB','x','Cliente B','user',orgB);

  insert into public.measurements (id,client_id,date,weight,organization_id) values
    ('mA','cliA',current_date,'80',orgA),
    ('mB','cliB',current_date,'70',orgB);
end $$;

alter table public.users        enable row level security;
alter table public.measurements enable row level security;

create or replace function pg_temp.as_user(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub',uid::text,'role','authenticated')::text, true);
end $$;

set local role authenticated;

-- Staff A no ve datos de B (probando id directo y organización)
do $$
declare uidA uuid; begin
  select uidA into uidA from _p;
  perform pg_temp.as_user(uidA);
  assert (select count(*) from public.users where organization_id='00000000-0000-0000-0000-0000000000a0') = 1, 'A ve su cliente';
  assert (select count(*) from public.users where organization_id='00000000-0000-0000-0000-0000000000b0') = 0, 'A NO ve clientes de B';
  assert (select count(*) from public.users where id='cliB') = 0, 'A NO puede leer cliB por id';
  assert (select count(*) from public.measurements) = 1, 'A solo ve su medición';
  raise notice 'OK: staff A aislado de B';
end $$;

-- B no ve datos de A
do $$
declare uidB uuid; begin
  select uidB into uidB from _p;
  perform pg_temp.as_user(uidB);
  assert (select count(*) from public.users where organization_id='00000000-0000-0000-0000-0000000000a0') = 0, 'B NO ve clientes de A';
  assert (select count(*) from public.measurements where id='mA') = 0, 'B NO ve mediciones de A';
  raise notice 'OK: staff B aislado de A';
end $$;

reset role;
do $$ begin raise notice '✅ AISLAMIENTO (variante prepared) OK'; end $$;
rollback;
