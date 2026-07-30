// Ruta del Panel de Plataforma. Separada por completo de los tenants: se sirve
// bajo /platform (independiente del subdominio/slug del entrenador). PURO.
export const PLATFORM_PATH = "/platform";

export function isPlatformPath(pathname) {
  const p = String(pathname || "").replace(/\/+$/, "") || "/";
  return p === PLATFORM_PATH || p.startsWith(PLATFORM_PATH + "/");
}
