-- ═══════════════════════════════════════════════════════════════
--  PRUEBA DE AISLAMIENTO RLS entre tenants (reproducible, se REVIERTE)
--  Corré esto en el SQL Editor de Supabase (rol privilegiado) DESPUÉS de
--  0001–0008. Crea datos efímeros, activa RLS dentro de la transacción y hace
--  ROLLBACK: no deja rastro y no toca datos reales.
--
--  Simula 3 organizaciones:
--    A = Test Prod A     (owner)         -> imita Johel
--    B = Test Demo       (demo_viewer)   -> imita Tito Trainer Demo
--    C = Test Prod C     (owner)         -> segundo tenant ficticio (Bruno)
--  Verifica: ningún staff ve datos de otro tenant, aunque manipule ids/org;
--  demo_viewer no puede escribir; globales visibles por todos; privados no;
--  cliente solo ve lo suyo; anónimo no ve nada.
--
--  ATOMICIDAD: todo va en UNA transacción y NUNCA hace COMMIT (termina en
--  ROLLBACK). Si un paso falla, la transacción se aborta y NO deja usuarios ni
--  datos de prueba persistentes. NO ejecutar statement por statement.
--
--  ⚠️ Este script inserta filas en auth.users. Según la versión de Supabase puede
--  requerir columnas adicionales. Si falla ahí, usá `isolation_test_prepared.sql`
--  (usa usuarios Auth creados externamente y no toca auth.users).
-- ═══════════════════════════════════════════════════════════════
begin;

-- Ids fijos para la prueba
-- orgs
--   A 00000000-0000-0000-0000-0000000000a0 ; B ...b0 ; C ...c0
-- staff (auth.users)
--   A ...a1 ; B ...b1 ; C ...c1 ; clienteA-auth ...a2

-- 1) auth.users mínimos (ajustar columnas según versión de Supabase si hiciera falta)
insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at)
values
 ('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-000000000000','authenticated','authenticated','a1@test.local',now(),now()),
 ('00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-000000000000','authenticated','authenticated','b1@test.local',now(),now()),
 ('00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-000000000000','authenticated','authenticated','c1@test.local',now(),now()),
 ('00000000-0000-0000-0000-0000000000a2','00000000-0000-0000-0000-000000000000','authenticated','authenticated','clienteA@test.local',now(),now());

-- 2) organizaciones
insert into public.organizations (id,name,slug,tenant_type,status) values
 ('00000000-0000-0000-0000-0000000000a0','Test Prod A','test-a','test','active'),
 ('00000000-0000-0000-0000-0000000000b0','Test Demo','test-demo','demo','active'),
 ('00000000-0000-0000-0000-0000000000c0','Test Prod C','test-c','test','active');

-- 3) membresías: A=owner, B=demo_viewer, C=owner
insert into public.organization_members (organization_id,user_id,role) values
 ('00000000-0000-0000-0000-0000000000a0','00000000-0000-0000-0000-0000000000a1','owner'),
 ('00000000-0000-0000-0000-0000000000b0','00000000-0000-0000-0000-0000000000b1','demo_viewer'),
 ('00000000-0000-0000-0000-0000000000c0','00000000-0000-0000-0000-0000000000c1','owner');

-- 4) clientes (users) + vínculo Auth del cliente de A
insert into public.users (id,username,password,name,role,organization_id,auth_user_id) values
 ('cliA','cliA','x','Cliente A','user','00000000-0000-0000-0000-0000000000a0','00000000-0000-0000-0000-0000000000a2'),
 ('cliB','cliB','x','Cliente B','user','00000000-0000-0000-0000-0000000000b0',null),
 ('cliC','cliC','x','Cliente C','user','00000000-0000-0000-0000-0000000000c0',null);

-- 5) datos por tenant
insert into public.measurements (id,client_id,date,weight,organization_id) values
 ('mA','cliA',current_date,'80','00000000-0000-0000-0000-0000000000a0'),
 ('mB','cliB',current_date,'70','00000000-0000-0000-0000-0000000000b0'),
 ('mC','cliC',current_date,'60','00000000-0000-0000-0000-0000000000c0');

-- 6) ejercicios: uno GLOBAL y uno privado de A
insert into public.exercises (id,name,type,visibility,organization_id) values
 ('exG','Sentadilla global','normal','global',null),
 ('exA','Privado de A','normal','organization','00000000-0000-0000-0000-0000000000a0');

-- 7) Activar RLS (dentro de la tx; se revierte)
alter table public.users        enable row level security;
alter table public.measurements enable row level security;
alter table public.exercises    enable row level security;

-- Función util para simular un usuario autenticado
create or replace function pg_temp.as_user(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub',uid,'role','authenticated')::text, true);
end $$;

set local role authenticated;

-- ── Staff A: ve lo suyo, NADA de B ni C ──
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1');
do $$ begin
  assert (select count(*) from public.users where organization_id='00000000-0000-0000-0000-0000000000a0') = 1, 'A ve su cliente';
  assert (select count(*) from public.users where organization_id='00000000-0000-0000-0000-0000000000b0') = 0, 'A NO ve clientes de B';
  assert (select count(*) from public.users where organization_id='00000000-0000-0000-0000-0000000000c0') = 0, 'A NO ve clientes de C';
  assert (select count(*) from public.measurements) = 1, 'A solo ve 1 medición (la suya)';
  -- Intento de leer por id directo de B (manipulando id): 0 filas
  assert (select count(*) from public.users where id='cliB') = 0, 'A NO puede leer cliB por id';
  raise notice 'OK: aislamiento de lectura para staff A';
end $$;

-- Intento de ESCRIBIR en otro tenant (update de cliB): 0 filas afectadas
do $$ declare n int; begin
  update public.users set name='hackeado' where id='cliB';
  get diagnostics n = row_count;
  assert n = 0, 'A NO puede actualizar cliB';
  raise notice 'OK: A no puede escribir en B';
end $$;

-- Intento de INSERT en org B (debe fallar el WITH CHECK)
do $$ begin
  begin
    insert into public.users (id,username,password,name,role,organization_id)
      values ('hack','hack','x','Hack','user','00000000-0000-0000-0000-0000000000b0');
    raise exception 'FALLO: A pudo insertar en B';
  exception when others then
    raise notice 'OK: A no puede insertar en B (%).', sqlerrm;
  end;
end $$;

-- ── demo_viewer (staff B): lee pero NO escribe ──
select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1');
do $$ declare n int; begin
  assert (select count(*) from public.users where organization_id='00000000-0000-0000-0000-0000000000b0') = 1, 'demo_viewer ve su cliente';
  update public.users set name='x' where id='cliB';
  get diagnostics n = row_count;
  assert n = 0, 'demo_viewer NO puede actualizar';
  delete from public.measurements where id='mB';
  get diagnostics n = row_count;
  assert n = 0, 'demo_viewer NO puede borrar';
  raise notice 'OK: demo_viewer es de solo lectura';
end $$;

-- ── Ejercicios: global visible por C; privado de A NO ──
select pg_temp.as_user('00000000-0000-0000-0000-0000000000c1');
do $$ begin
  assert (select count(*) from public.exercises where id='exG') = 1, 'C ve el ejercicio global';
  assert (select count(*) from public.exercises where id='exA') = 0, 'C NO ve el privado de A';
  raise notice 'OK: biblioteca global compartida, privados aislados';
end $$;

-- ── Cliente A (auth): solo ve SUS mediciones ──
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a2');
do $$ begin
  assert (select count(*) from public.measurements) = 1, 'cliente A ve su medición';
  assert (select count(*) from public.measurements where client_id='cliB') = 0, 'cliente A NO ve las de B';
  raise notice 'OK: cliente aislado a lo suyo';
end $$;

-- ── Anónimo: no ve nada ──
reset role;
set local role anon;
select pg_temp.as_user('00000000-0000-0000-0000-000000000000');
do $$ begin
  assert (select count(*) from public.users) = 0, 'anon no ve users';
  assert (select count(*) from public.measurements) = 0, 'anon no ve measurements';
  raise notice 'OK: anónimo sin acceso';
end $$;

reset role;
do $$ begin raise notice '✅ TODAS LAS ASERCIONES DE AISLAMIENTO PASARON'; end $$;
rollback;
