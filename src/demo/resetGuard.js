// Guard PURO para el reset de la demo (defensa en profundidad, además de la
// verificación en la base). Rechaza cualquier organización que no sea demo.
export const ALLOWED_DEMO_SLUGS = ["titotrainer"];

export function isResettableTenant(org) {
  if (!org) return false;
  if (org.tenant_type !== "demo") return false;
  if (org.slug && !ALLOWED_DEMO_SLUGS.includes(org.slug)) return false;
  return true;
}

// Lanza si NO es un tenant demo reseteable (para usar antes de llamar al reset).
export function assertResettableTenant(org) {
  if (!org) throw new Error("reset: organización inexistente");
  if (org.tenant_type !== "demo") {
    throw new Error(`reset RECHAZADO: "${org.slug || org.id}" no es demo (tenant_type=${org.tenant_type})`);
  }
  if (org.slug && !ALLOWED_DEMO_SLUGS.includes(org.slug)) {
    throw new Error(`reset RECHAZADO: slug "${org.slug}" no está en la lista de demos`);
  }
  return true;
}
