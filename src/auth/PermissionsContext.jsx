import { createContext, useContext } from "react";

// Permisos efectivos del usuario en sesión (capa de UX). La seguridad REAL la
// impone RLS en la base; esto solo deshabilita acciones que igual serían
// rechazadas por el servidor (p. ej. demo_viewer no destructivo).
// Incluye el PLAN del tenant y sus FEATURES (entitlements) para gatear la UI.
export const PermissionsContext = createContext({
  role: "owner",
  readOnly: false,
  plan: "premium",
  features: { workouts: true, measurements: true, analytics: true, payment_reminders: true, custom_branding: true },
});

export function usePermissions() {
  return useContext(PermissionsContext);
}
