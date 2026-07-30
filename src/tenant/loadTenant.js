// Carga de la organización (tenant) por slug + su branding. Usa la clave anon:
// con RLS activo, organizations/organization_settings deben permitir lectura de
// la org solicitada (policy de branding pública o de miembro). Ver docs/rls-rollout.
import { sb } from "../supabase";
import { resolveBranding, JOHEL_BRANDING, NEUTRAL_BRANDING } from "../branding/branding";

// Estado PURO a partir de la org (testeable sin red).
export function tenantStatus(org) {
  if (!org) return "not_found";
  if (org.status && org.status !== "active") return "suspended";
  return "ok";
}

export function brandingBaseFor(slug) {
  return slug === "joheltraining" ? JOHEL_BRANDING : NEUTRAL_BRANDING;
}

export async function loadTenantBySlug(slug) {
  if (!slug) return { status: "not_found", slug, org: null, settings: null, branding: NEUTRAL_BRANDING };
  const { data: org, error } = await sb
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;

  const status = tenantStatus(org);
  const base = brandingBaseFor(slug);
  if (status !== "ok") {
    return { status, slug, org: org || null, settings: null, branding: base };
  }

  const { data: settings } = await sb
    .from("organization_settings")
    .select("*")
    .eq("organization_id", org.id)
    .maybeSingle();

  return { status: "ok", slug, org, settings: settings || null, branding: resolveBranding(settings, base) };
}

// ¿Ya hay organizaciones? (para decidir legacy vs multi-tenant si se quisiera auto).
export async function multitenantReady() {
  try {
    const { count, error } = await sb
      .from("organizations")
      .select("id", { count: "exact", head: true });
    if (error) return false;
    return (count || 0) > 0;
  } catch {
    return false;
  }
}
