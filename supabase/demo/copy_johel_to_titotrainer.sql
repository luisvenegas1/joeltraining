-- ═══════════════════════════════════════════════════════════════
--  DEMO — Copiar la biblioteca de ejercicios de Johel + la(s) rutina(s) de sofi
--  a la organización titotrainer (para mostrar la demo con datos reales).
--  OPERACIÓN MANUAL de datos de demo. Idempotente y re-ejecutable.
--  Solo toca titotrainer. NO modifica joheltraining.
--
--  Técnica: los registros copiados usan ids con prefijo 'demo_' (determinístico),
--  así todas las referencias (grupos→días→rutina, exercise_id, estiramientos) se
--  remapean solas y ON CONFLICT DO NOTHING permite correrlo varias veces.
-- ═══════════════════════════════════════════════════════════════

-- Guard: ambas organizaciones deben existir.
do $$
begin
  if (select id from public.organizations where slug = 'joheltraining') is null
     or (select id from public.organizations where slug = 'titotrainer') is null then
    raise exception 'Faltan organizaciones joheltraining y/o titotrainer.';
  end if;
end $$;

-- 1) Ejercicios: toda la biblioteca privada de Johel -> titotrainer.
insert into public.exercises
  (id, name, video_url, muscle_group, type, equipment, organization_id, visibility,
   description, image_url, instructions, created_at, updated_at)
select 'demo_' || e.id, e.name, e.video_url, e.muscle_group, e.type, e.equipment,
       (select id from public.organizations where slug = 'titotrainer'),
       'organization', e.description, e.image_url, e.instructions, now(), now()
from public.exercises e
where e.organization_id = (select id from public.organizations where slug = 'joheltraining')
on conflict (id) do nothing;

-- 2) Rutina(s) de sofi (users.id = 'u1') -> titotrainer, asignada al cliente demo
--    demo_c1. Los ids de estiramientos (jsonb) se remapean con el prefijo 'demo_'.
insert into public.routines
  (id, user_id, title, days_per_week, note, warmup_stretch_ids, cooldown_stretch_ids,
   organization_id, created_at, updated_at)
select 'demo_' || r.id, 'demo_c1', r.title, r.days_per_week, r.note,
       coalesce((select array_agg('demo_' || x) from unnest(r.warmup_stretch_ids) x), '{}'::text[]),
       coalesce((select array_agg('demo_' || x) from unnest(r.cooldown_stretch_ids) x), '{}'::text[]),
       (select id from public.organizations where slug = 'titotrainer'), now(), now()
from public.routines r
where r.user_id = 'u1'
on conflict (id) do nothing;

-- 3) Días de esas rutinas.
insert into public.routine_days (id, routine_id, label, sort_order, organization_id)
select 'demo_' || d.id, 'demo_' || d.routine_id, d.label, d.sort_order,
       (select id from public.organizations where slug = 'titotrainer')
from public.routine_days d
join public.routines r on r.id = d.routine_id
where r.user_id = 'u1'
on conflict (id) do nothing;

-- 4) Grupos.
insert into public.routine_groups (id, day_id, label, rest_seconds, sort_order, organization_id)
select 'demo_' || g.id, 'demo_' || g.day_id, g.label, g.rest_seconds, g.sort_order,
       (select id from public.organizations where slug = 'titotrainer')
from public.routine_groups g
join public.routine_days d on d.id = g.day_id
join public.routines r on r.id = d.routine_id
where r.user_id = 'u1'
on conflict (id) do nothing;

-- 5) Ejercicios de la rutina (remapea group_id y exercise_id al prefijo 'demo_').
insert into public.routine_exercises
  (id, group_id, exercise_id, series, reps, notes, weight_amount, weight_unit,
   equipment, surface, sort_order, organization_id)
select 'demo_' || re.id, 'demo_' || re.group_id, 'demo_' || re.exercise_id,
       re.series, re.reps, re.notes, re.weight_amount, re.weight_unit,
       re.equipment, re.surface, re.sort_order,
       (select id from public.organizations where slug = 'titotrainer')
from public.routine_exercises re
join public.routine_groups g on g.id = re.group_id
join public.routine_days d on d.id = g.day_id
join public.routines r on r.id = d.routine_id
where r.user_id = 'u1'
on conflict (id) do nothing;

-- 6) Marcar como activa la rutina copiada para el cliente demo demo_c1.
update public.users
set active_routine_id = (
  select 'demo_' || r.id from public.routines r
  where r.user_id = 'u1' order by r.created_at nulls last limit 1
)
where id = 'demo_c1'
  and exists (select 1 from public.routines r where r.user_id = 'u1');

-- ── Verificación (informativa) ──
select 'ejercicios copiados' as q, count(*) as n from public.exercises where id like 'demo\_%'
union all select 'rutinas copiadas', count(*) from public.routines where id like 'demo\_%'
union all select 'ejercicios en rutinas demo', count(*) from public.routine_exercises where id like 'demo\_%';
