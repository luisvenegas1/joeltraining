// Rutas legales públicas (no dependen de un tenant). PURO.
export const LEGAL_PATHS = { terms: "/terminos", privacy: "/privacidad" };

export function isLegalPath(pathname) {
  const p = String(pathname || "").replace(/\/+$/, "") || "/";
  return p === LEGAL_PATHS.terms || p === LEGAL_PATHS.privacy;
}
