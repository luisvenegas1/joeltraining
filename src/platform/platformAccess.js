// ═══════════════════════════════════════════════════════════════
//  Acceso al Panel de Plataforma (PURO).
//  El acceso se basa en `platform_admins` (verificado en BD por
//  loadIsSuperadmin() y, del lado servidor, por la Edge Function). Nunca en un
//  email hardcodeado ni en ocultar enlaces del frontend.
//
//  Estados:
//    anonymous     → no hay sesión: mostrar login
//    authorized    → hay sesión y el usuario está en platform_admins
//    unauthorized  → hay sesión pero NO es platform_admin: “Acceso no autorizado”
// ═══════════════════════════════════════════════════════════════
export function resolvePlatformAccess({ hasSession, isSuperadmin }) {
  if (!hasSession) return "anonymous";
  return isSuperadmin ? "authorized" : "unauthorized";
}
