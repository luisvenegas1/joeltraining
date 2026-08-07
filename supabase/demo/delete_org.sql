-- ═══════════════════════════════════════════════════════════════
--  Borrar por completo una organización de PRUEBA y toda su data.
--  OPERACIÓN MANUAL y DESTRUCTIVA. Cambiá v_slug por el slug a borrar.
--  Guard: NUNCA borra joheltraining ni titotrainer.
--  NO borra las cuentas Auth (auth.users) del owner/clientes: eso se hace
--  aparte desde Authentication → Users (o se ignoran usando alias '+').
-- ═══════════════════════════════════════════════════════════════
do $$
declare
  v_slug text := 'REEMPLAZAR_SLUG';  -- <<< p. ej. 'trainerapp'
  v_org uuid;
begin
  if v_slug in ('joheltraining','titotrainer') then
    raise exception 'Organización protegida: no se borra %', v_slug;
  end if;
  select id into v_org from public.organizations where slug = v_slug;
  if v_org is null then raise notice 'No existe la org %', v_slug; return; end if;

  delete from public.workout_logs            where organization_id = v_org;
  delete from public.workout_sessions        where organization_id = v_org;
  delete from public.measurements            where organization_id = v_org;
  delete from public.payments                where organization_id = v_org;
  delete from public.routine_exercises       where organization_id = v_org;
  delete from public.routine_groups          where organization_id = v_org;
  delete from public.routine_days            where organization_id = v_org;
  delete from public.routine_assignments     where organization_id = v_org;
  delete from public.routines                where organization_id = v_org;
  delete from public.exercises               where organization_id = v_org;
  delete from public.catalogs                where organization_id = v_org;
  delete from public.users                   where organization_id = v_org;
  delete from public.platform_payments       where organization_id = v_org;
  delete from public.platform_audit_log      where organization_id = v_org;
  delete from public.organization_members    where organization_id = v_org;
  delete from public.organization_settings   where organization_id = v_org;
  delete from public.organization_subscriptions where organization_id = v_org;
  delete from public.organizations           where id = v_org;

  raise notice 'Org % (%) borrada por completo.', v_slug, v_org;
end $$;
