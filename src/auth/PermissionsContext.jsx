import { createContext, useContext } from "react";

// Permisos efectivos del usuario en sesión (capa de UX). La seguridad REAL la
// impone RLS en la base; esto solo deshabilita acciones que igual serían
// rechazadas por el servidor (p. ej. demo_viewer no destructivo).
export const PermissionsContext = createContext({ role: "owner", readOnly: false });

export function usePermissions() {
  return useContext(PermissionsContext);
}
