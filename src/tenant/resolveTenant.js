// Resolución de tenant (organización) por hostname o ruta.
// Módulo PURO y sin efectos: no toca el DOM ni la red. Se prueba en aislamiento.
//
// Familias de dominio de plataforma: `tito-apps.com` (producción real, con guion)
// y `titoapps.com` (soporte futuro, sin guion).
//
// Orden de resolución:
//  1) <slug>.tito-apps.com / <slug>.titoapps.com -> el SUBDOMINIO tiene prioridad.
//     El subdominio "joeltraining" (nombre de la app) mapea al slug "joheltraining".
//        joeltraining.tito-apps.com -> joheltraining
//        titotrainer.tito-apps.com  -> titotrainer
//  2) Apex/www de cualquier familia + localhost + *.local + *.vercel.app
//     -> resolver el slug por el PRIMER segmento de ruta (/joheltraining, /titotrainer).
//  3) Host desconocido / dominio personalizado no registrado -> null.
//
// Reglas críticas:
//  - NUNCA usar Johel como fallback para un host desconocido.
//  - Si no se puede determinar el slug, devolver null (la UI muestra
//    "Organización no encontrada"); jamás asumir un tenant.

const PLATFORM_DOMAINS = ["tito-apps.com", "titoapps.com"];
const APEX_HOSTS = new Set(PLATFORM_DOMAINS.flatMap((d) => [d, `www.${d}`]));
// Hosts que no representan un subdominio-tenant (se resuelve por ruta):
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);
// El subdominio de producción es "joeltraining" (nombre de la app), pero el slug
// del tenant en la BD es "joheltraining". Alias de subdominio → slug.
const SUBDOMAIN_SLUG_ALIASES = { joeltraining: "joheltraining" };

/** ¿Este host resuelve el tenant por RUTA? (apex/www de plataforma, localhost, *.local, *.vercel.app) */
export function usesPathResolution(hostname) {
  const host = String(hostname || "").toLowerCase().split(":")[0];
  return (
    LOCAL_HOSTS.has(host) ||
    host.endsWith(".local") ||
    APEX_HOSTS.has(host) ||
    host.endsWith(".vercel.app")
  );
}

/** Extrae el slug del subdominio de un hostname de plataforma (con alias). */
export function slugFromHostname(hostname) {
  if (!hostname) return null;
  const host = String(hostname).toLowerCase().split(":")[0];

  if (LOCAL_HOSTS.has(host)) return null;   // dev -> resolver por ruta
  if (APEX_HOSTS.has(host)) return null;    // apex/www -> resolver por ruta

  for (const domain of PLATFORM_DOMAINS) {
    const suffix = `.${domain}`;
    if (host.endsWith(suffix)) {
      // primer segmento del subdominio
      const sub = host.slice(0, -suffix.length).split(".")[0];
      if (!sub || sub === "www") return null;
      return SUBDOMAIN_SLUG_ALIASES[sub] || sub;
    }
  }

  // Dominio personalizado (app.brunofitness.com) o desconocido: null (nunca adivinar).
  // Los dominios personalizados se resolverán vía tabla custom_domains (fase futura).
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
