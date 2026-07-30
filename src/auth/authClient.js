// Módulo de autenticación (Supabase Auth). Se conecta a la app en modo
// VITE_AUTH_MODE=supabase (el legacy sigue disponible). Nunca descarga hashes ni
// todos los usuarios antes del login.
import { sb } from "../supabase";
import { dbToUser } from "../db";

export async function getSession() {
  const { data } = await sb.auth.getSession();
  return data?.session || null;
}

export function onAuthChange(cb) {
  const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data?.subscription?.unsubscribe();
}

export async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

// Carga membresías (org + rol) del usuario autenticado. Con RLS activo, solo
// devuelve las del propio usuario. La membresía se valida en la BASE, no en el
// navegador.
export async function loadMemberships() {
  const { data, error } = await sb
    .from("organization_members")
    .select("organization_id, role, organizations(slug, name, status, tenant_type)");
  if (error) throw error;
  return (data || []).map((m) => ({
    organizationId: m.organization_id,
    role: m.role,
    slug: m.organizations?.slug,
    name: m.organizations?.name,
    status: m.organizations?.status,
    tenantType: m.organizations?.tenant_type,
  }));
}

// Suscripción de una organización (o null si no hay fila). Bajo RLS, los miembros
// pueden leer la de su org aunque esté suspendida (pantalla de cuenta/facturación).
export async function loadSubscription(orgId) {
  if (!orgId) return null;
  const { data, error } = await sb
    .from("organization_subscriptions")
    .select("*")
    .eq("organization_id", orgId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

// ¿El usuario Auth actual es superadmin de la plataforma (soporte)?
export async function loadIsSuperadmin() {
  const { data: u } = await sb.auth.getUser();
  if (!u?.user) return false;
  const { data } = await sb
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", u.user.id)
    .maybeSingle();
  return !!data;
}

// Cliente (users) vinculado al usuario Auth actual (o null), en formato app.
// Bajo RLS, esta consulta devuelve SOLO la fila propia del cliente.
export async function loadClientProfile() {
  const { data: u } = await sb.auth.getUser();
  if (!u?.user) return null;
  const { data, error } = await sb
    .from("users")
    .select("*")
    .eq("auth_user_id", u.user.id)
    .maybeSingle();
  if (error) throw error;
  return data ? dbToUser(data) : null;
}
