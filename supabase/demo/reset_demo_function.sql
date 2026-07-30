-- ═══════════════════════════════════════════════════════════════
--  DEMO — Función guardada para RESETEAR datos de la demo. OPERACIÓN MANUAL.
--  Verifica tenant_type='demo' y RECHAZA cualquier org de producción.
--  Borra SOLO datos scoped a esa org demo (no borra la org, settings ni members).
--  Aditiva e idempotente. NO ejecutar en prod sin autorización.
--
--  Reset completo = reset_demo_data(<demo>)  +  re-correr seeds/tito_trainer_demo.sql
-- ═══════════════════════════════════════════════════════════════

create or replace function public.reset_demo_data(p_org uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text;
  v_slug text;
begin
  select tenant_type, slug into v_type, v_slug from public.organizations where id = p_org;
  if v_type is null then
    raise exception 'reset_demo_data: organización inexistente %', p_org;
  end if;

  -- GUARD DURO: nunca tocar producción.
  if v_type <> 'demo' then
    raise exception 'reset_demo_data: RECHAZADO. % (%) no es demo (tenant_type=%).', v_slug, p_org, v_type;
  end if;

  -- Autorización: solo un OWNER de esa org demo puede resetear.
  if not exists (
    select 1 from public.organization_members
    where organization_id = p_org and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'reset_demo_data: no autorizado (se requiere owner de la org demo).';
  end if;

  -- Borrado scoped a la org demo (orden respetando dependencias).
  delete from public.workout_logs      where organization_id = p_org;
  delete from public.workout_sessions  where organization_id = p_org;
  delete from public.measurements      where organization_id = p_org;
  delete from public.payments          where organization_id = p_org;
  delete from public.routine_exercises where organization_id = p_org;
  delete from public.routine_groups    where organization_id = p_org;
  delete from public.routine_days      where organization_id = p_org;
  update public.users set active_routine_id = null where organization_id = p_org;
  delete from public.routines          where organization_id = p_org;
  delete from public.catalogs          where organization_id = p_org;
  delete from public.users             where organization_id = p_org; -- clientes ficticios
  delete from public.exercises         where organization_id = p_org and visibility = 'organization';
  -- NO se borran: organizations, organization_settings, organization_members.
end $$;

revoke all on function public.reset_demo_data(uuid) from public;
grant execute on function public.reset_demo_data(uuid) to authenticated;
