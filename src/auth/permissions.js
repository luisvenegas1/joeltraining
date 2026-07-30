// Permisos por rol (capa de UX). La seguridad REAL la impone RLS en la base;
// esto solo decide qué mostrar/deshabilitar para evitar acciones que igual
// serían rechazadas por el servidor (p. ej. demo_viewer no destructivo).
//
// Roles: owner | trainer | demo_viewer | client
export const ROLE = {
  OWNER: "owner",
  TRAINER: "trainer",
  DEMO: "demo_viewer",
  CLIENT: "client",
};

// Capacidades por rol. demo_viewer = solo lectura/navegación.
const CAP = {
  owner: new Set(["read", "write", "delete", "branding", "members", "invite", "catalogs"]),
  trainer: new Set(["read", "write", "delete", "catalogs"]),
  demo_viewer: new Set(["read"]),
  client: new Set(["read_own", "log_workout", "edit_own_profile"]),
};

export function can(role, action) {
  return !!CAP[role]?.has(action);
}

// Regla CENTRAL de "puede mutar" (crear/editar/eliminar/asignar/cambiar estado).
// Solo owner y trainer. demo_viewer y client NO mutan datos operativos del panel.
export function canMutate(role) {
  return role === ROLE.OWNER || role === ROLE.TRAINER;
}

// Atajos usados por la UI del entrenador.
export const isReadOnly = (role) => role === ROLE.DEMO;
export const canDelete = (role) => can(role, "delete");
export const canManageMembers = (role) => can(role, "members");
export const canEditBranding = (role) => can(role, "branding");
