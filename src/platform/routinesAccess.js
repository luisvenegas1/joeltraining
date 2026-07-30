// Modelo PURO de la condición de la policy `routines_select` (RLS) tal como queda
// tras 0018 + 0021. Sirve para testear la LÓGICA de acceso sin una base de datos:
// refleja exactamente la expresión SQL de la migración.
//
//   public.is_superadmin()
//   or (
//     (public.is_org_member(organization_id) or public.client_owns_routine(id))
//     and public.org_operational_allowed(organization_id)
//   )
//
// donde client_owns_routine(id) = dueño legacy (routines.user_id) O asignado
// vía routine_assignments (definido en 0018).
export function clientOwnsRoutine({ isLegacyOwner = false, isAssigned = false } = {}) {
  return !!isLegacyOwner || !!isAssigned;
}

export function routinesSelectAllowed({
  isSuperadmin = false,
  isOrgMember = false,
  isLegacyOwner = false,
  isAssigned = false,
  operationalAllowed = true,
} = {}) {
  if (isSuperadmin) return true;
  const canSee = isOrgMember || clientOwnsRoutine({ isLegacyOwner, isAssigned });
  return canSee && !!operationalAllowed;
}
