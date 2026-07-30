-- ═══════════════════════════════════════════════════════════════
--  BACKFILL MANUAL — routine_assignments desde routines.user_id (legacy)
--  Idempotente. Crea una asignación por cada rutina que ya tenga user_id, para
--  que las rutinas existentes sigan asignadas tras 0017. NO borra nada.
--  Correr una vez, tras aplicar 0017.
-- ═══════════════════════════════════════════════════════════════

-- GUARD: la tabla debe existir (la crea la migración 0017). Si no, mensaje claro.
do $$ begin
  if to_regclass('public.routine_assignments') is null then
    raise exception 'Falta la tabla public.routine_assignments. Aplicá primero la migración 0017 con: supabase db push';
  end if;
end $$;

-- Preflight (solo lectura): cuántas rutinas con cliente aún no tienen asignación.
select 'rutinas con user_id sin asignación' as check, count(*) as n
from public.routines r
where r.user_id is not null
  and not exists (
    select 1 from public.routine_assignments a
    where a.routine_id = r.id and a.user_id = r.user_id
  );

-- Backfill idempotente (el organization_id lo pone el trigger).
insert into public.routine_assignments (id, routine_id, user_id)
select 'rasg_' || substr(md5(r.id || '|' || r.user_id), 1, 12), r.id, r.user_id
from public.routines r
where r.user_id is not null
  and not exists (
    select 1 from public.routine_assignments a
    where a.routine_id = r.id and a.user_id = r.user_id
  );

-- Verificación: debe quedar 0 rutinas con user_id sin asignación.
select 'rutinas con user_id sin asignación (post)' as check, count(*) as n
from public.routines r
where r.user_id is not null
  and not exists (
    select 1 from public.routine_assignments a
    where a.routine_id = r.id and a.user_id = r.user_id
  );
