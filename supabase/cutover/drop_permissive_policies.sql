-- ═══════════════════════════════════════════════════════════════
--  CUTOVER — Borrar policies permisivas "allow all" (leftover de desarrollo).
--  OPERACIÓN MANUAL. Idempotente.
--
--  Contexto: al encender RLS, johel (miembro solo de joheltraining) igual veía
--  clientes de titotrainer. La causa era una policy antigua llamada "allow all"
--  con qual = true para el rol public, creada al inicio del proyecto. RLS combina
--  policies con OR, así que esa "true" anulaba todo el aislamiento.
--
--  Este script borra SOLO las policies llamadas exactamente 'allow all'. NO toca
--  las lecturas públicas legítimas (org_select / org_settings_select, que usan
--  true a propósito para el branding pre-login).
-- ═══════════════════════════════════════════════════════════════

-- Diagnóstico (opcional): ver qué policies "allow all" existen.
--   select tablename, policyname, cmd, roles, qual
--   from pg_policies where schemaname='public' and policyname='allow all';

do $$
declare r record;
begin
  for r in
    select tablename from pg_policies
    where schemaname = 'public' and policyname = 'allow all'
  loop
    execute format('drop policy "allow all" on public.%I', r.tablename);
    raise notice 'Borrada allow all en public.%', r.tablename;
  end loop;
end $$;

-- Verificación: no debe quedar ninguna 'allow all'.
select tablename, policyname from pg_policies
where schemaname = 'public' and policyname = 'allow all';
