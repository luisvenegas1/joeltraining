// Resolución de tenant (organización) por hostname o ruta.
// Módulo PURO y sin efectos: no toca el DOM ni la red. Se prueba en aislamiento.
//
// Orden de resolución:
//  1) <slug>.titoapps.com  -> el SUBDOMINIO tiene prioridad (producción final).
//  2) titoapps.com | www.titoapps.com | localhost | *.local | *.vercel.app
//     -> resolver el slug por el PRIMER segmento de ruta (/joheltraining, /titotrainer).
//     Así se puede probar el SaaS en previews de Vercel y en el apex ANTES de
//     configurar el wildcard DNS.
//  3) Host desconocido / dominio personalizado no registrado -> null.
//
// Reglas críticas:
//  - NUNCA usar Johel como fallback para un host desconocido.
//  - Si no se puede determinar el slug, devolver null (la UI muestra
//    "Organización no encontrada"); jamás asumir un tenant.

const APEX_HOSTS = new Set(["titoapps.com", "www.titoapps.com"]);
// Hosts que no representan un subdominio-tenant (se resuelve por ruta):
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

/** ¿Este host resuelve el tenant por RUTA? (apex, www, localhost, *.local, *.vercel.app) */
export function usesPathResolution(hostname) {
  const host = String(hostname || "").toLowerCase().split(":")[0];
  return (
    LOCAL_HOSTS.has(host) ||
    host.endsWith(".local") ||
    APEX_HOSTS.has(host) ||
    host.endsWith(".vercel.app")
  );
}

/** Extrae el slug del subdominio de un hostname de la plataforma. */
export function slugFromHostname(hostname) {
  if (!hostname) return null;
  const host = String(hostname).toLowerCase().split(":")[0];

  if (LOCAL_HOSTS.has(host)) return null;         // dev -> resolver por ruta
  if (APEX_HOSTS.has(host)) return null;          // apex -> landing, no tenant

  // sub.titoapps.com -> "sub"
  if (host.endsWith(".titoapps.com")) {
    const sub = host.slice(0, -".titoapps.com".length);
    if (!sub || sub === "www") return null;
    // solo el primer segmento cuenta como slug
    return sub.split(".")[0] || null;
  }

  // Dominio personalizado (app.brunofitness.com): no es *.titoapps.com.
  // Se resolverá vía tabla custom_domains (fase futura). Aquí: null => que
  // el resolver de dominios personalizados lo maneje, no adivinar.
  return null;
}

/** Extrae el slug del primer segmento de la ruta (dev o rutas /slug). */
export function slugFromPath(pathname) {
  if (!pathname) return null;
  const seg = String(pathname).split("/").filter(Boolean)[0];
  if (!seg) return null;
  // Rutas reservadas que no son slugs de tenant
  const reserved = new Set(["assets", "api", "auth", "icons", "favicon.svg"]);
  if (reserved.has(seg)) return null;
  return seg.toLowerCase();
}

/**
 * Resuelve el slug efectivo a partir de la ubicación del navegador.
 * @param {{hostname?:string, pathname?:string}} loc
 * @param {{defaultSlug?:string}} [opts] slug por defecto SOLO para dev.
 * @returns {string|null}
 */
export function resolveTenantSlug(loc, opts = {}) {
  // 1) Subdominio de plataforma <slug>.titoapps.com tiene prioridad.
  const bySub = slugFromHostname(loc?.hostname);
  if (bySub) return bySub;

  // 2) apex/www/localhost/*.local/*.vercel.app -> resolver por ruta.
  if (usesPathResolution(loc?.hostname)) {
    const byPath = slugFromPath(loc?.pathname);
    if (byPath) return byPath;
    return opts.defaultSlug || null;   // sin ruta: default explícito, nunca Johel implícito
  }

  // 3) Host desconocido / dominio personalizado no registrado -> null (nunca Johel).
  return null;
}
