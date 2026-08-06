// ═══════════════════════════════════════════════════════════════
//  Lógica PURA del Panel de Plataforma (Tito Apps).
//  Sin red ni React: validaciones, transiciones de estado y agregados
//  testeables de forma aislada. La seguridad REAL vive en la Edge Function
//  (verifica platform_admins) y, cuando se active, en RLS.
// ═══════════════════════════════════════════════════════════════

// Slugs reservados por la plataforma (no pueden usarse como tenant).
export const RESERVED_SLUGS = new Set([
  "platform", "admin", "api", "app", "www", "auth", "login", "static", "assets",
]);

// Estados de suscripción soportados.
export const SUB_STATUSES = ["trial", "active", "past_due", "suspended", "canceled"];

// Métodos de pago admitidos (Stripe queda para el futuro).
export const PAYMENT_METHODS = ["manual", "sinpe", "transfer", "cash", "card", "stripe", "other"];

// Planes de suscripción de la PLATAFORMA (lo que paga el entrenador). Editá esta
// lista para que coincida con tu pricing real.
export const PLATFORM_PLANS = ["base", "pro", "premium"];

// Pasos del alta de una organización (para idempotencia y reintentos).
export const CREATION_STEPS = ["organization", "owner_user", "membership", "subscription", "branding"];

// ── Slug ───────────────────────────────────────────────────────
export function normalizeSlug(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos combinados
    .replace(/[^a-z0-9]+/g, "-") // no alfanumérico → guion
    .replace(/^-+|-+$/g, "") // sin guiones al borde
    .slice(0, 40);
}

export function validateSlug(rawSlug, existingSlugs = []) {
  const slug = normalizeSlug(rawSlug);
  if (!slug) return { ok: false, error: "El slug es obligatorio." };
  if (slug.length < 3) return { ok: false, error: "El slug debe tener al menos 3 caracteres." };
  if (RESERVED_SLUGS.has(slug)) return { ok: false, error: `El slug “${slug}” está reservado.` };
  const set = new Set((existingSlugs || []).map((s) => String(s).toLowerCase()));
  if (set.has(slug)) return { ok: false, error: `El slug “${slug}” ya está en uso.` };
  return { ok: true, slug };
}

// ── Email ──────────────────────────────────────────────────────
export function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

// ── Alta de organización ───────────────────────────────────────
// Valida el formulario de "Nueva organización". No toca red.
export function validateNewOrg(input = {}, existingSlugs = []) {
  const errors = {};
  const name = String(input.name || "").trim();
  const displayName = String(input.displayName || "").trim() || name;
  if (!name) errors.name = "El nombre interno es obligatorio.";

  const slugCheck = validateSlug(input.slug || input.name, existingSlugs);
  if (!slugCheck.ok) errors.slug = slugCheck.error;

  const ownerName = String(input.ownerName || "").trim();
  if (!ownerName) errors.ownerName = "El nombre del owner es obligatorio.";

  const ownerEmail = String(input.ownerEmail || "").trim().toLowerCase();
  if (!isEmail(ownerEmail)) errors.ownerEmail = "El correo del owner no es válido.";

  const initialStatus = input.initialStatus || "trial";
  if (!["trial", "active"].includes(initialStatus)) {
    errors.initialStatus = "El estado inicial debe ser trial o active.";
  }

  const plan = String(input.plan || "base").trim() || "base";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: {
      name,
      displayName,
      slug: slugCheck.ok ? slugCheck.slug : normalizeSlug(input.slug || input.name),
      ownerName,
      ownerEmail,
      initialStatus,
      plan,
      tenantType: input.tenantType || "production",
      branding: {
        logoUrl: String(input.logoUrl || "").trim() || null,
        primaryColor: String(input.primaryColor || "").trim() || null,
        secondaryColor: String(input.secondaryColor || "").trim() || null,
      },
    },
  };
}

// Plan de creación idempotente: dado lo que YA existe, indica qué pasos faltan.
// `existing` es un mapa por paso: { organization:true, owner_user:true, ... }.
// Reintentar con todo existente ⇒ ningún paso pendiente (no duplica datos).
export function planOrgCreation(existing = {}) {
  return CREATION_STEPS.map((step) => ({
    step,
    status: existing[step] ? "done" : "todo",
  }));
}

export function pendingSteps(plan) {
  return plan.filter((s) => s.status === "todo").map((s) => s.step);
}

export function isCreationComplete(plan) {
  return plan.every((s) => s.status === "done");
}

// ── Suscripción: transiciones ──────────────────────────────────
const ACTION_TO_STATUS = {
  suspend: "suspended",
  reactivate: "active",
  activate: "active",
  cancel: "canceled",
  mark_past_due: "past_due",
  start_trial: "trial",
};

export function applySubscriptionAction(action) {
  const status = ACTION_TO_STATUS[action];
  if (!status) return { ok: false, error: `Acción de suscripción inválida: ${action}` };
  return { ok: true, status };
}

// Estado tras registrar un pago. Por defecto pasa a "active", salvo cancelada
// (una cuenta cancelada no se reactiva sola por un pago histórico).
export function subscriptionAfterPayment(currentStatus, { activate = true } = {}) {
  if (!activate) return currentStatus || "active";
  if (currentStatus === "canceled") return "canceled";
  return "active";
}

// Demo: nunca se bloquea por reglas comerciales.
export function isDemoOrg(org) {
  return !!org && org.tenant_type === "demo";
}

// ¿Se puede suspender esta organización desde el panel? La demo no.
export function canSuspendOrg(org) {
  return !isDemoOrg(org);
}

// ── Pagos de plataforma: validación ────────────────────────────
export function validatePayment(input = {}) {
  const errors = {};
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) errors.amount = "El monto debe ser mayor a 0.";
  const currency = String(input.currency || "").trim().toUpperCase();
  if (!currency) errors.currency = "La moneda es obligatoria.";
  if (!input.paidAt) errors.paidAt = "La fecha de pago es obligatoria.";
  const method = input.method || "manual";
  if (!PAYMENT_METHODS.includes(method)) errors.method = "Método de pago inválido.";
  if (!input.organizationId) errors.organizationId = "La organización es obligatoria.";
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { ...input, amount, currency, method },
  };
}

// ── Dashboard: agregados ───────────────────────────────────────
// Clasifica organizaciones por estado de suscripción. `orgs` es una lista de
// objetos con al menos { subStatus }. Sin suscripción ⇒ "none".
export function bucketOrganizations(orgs = []) {
  const b = { active: 0, trial: 0, past_due: 0, suspended: 0, canceled: 0, none: 0, total: 0 };
  for (const o of orgs) {
    b.total += 1;
    const s = o.subStatus;
    if (!s) b.none += 1;
    else if (b[s] !== undefined) b[s] += 1;
  }
  return b;
}

// Suscripciones que vencen dentro de `withinDays` (o ya vencidas).
export function expiringSubscriptions(orgs = [], nowMs = Date.now(), withinDays = 7) {
  const horizon = nowMs + withinDays * 24 * 60 * 60 * 1000;
  return orgs
    .filter((o) => {
      if (!o.currentPeriodEnd) return false;
      const end = new Date(o.currentPeriodEnd).getTime();
      return Number.isFinite(end) && end <= horizon;
    })
    .sort((a, b) => new Date(a.currentPeriodEnd) - new Date(b.currentPeriodEnd));
}

// Etiqueta legible del estado (es-CR).
export function statusLabel(status) {
  return (
    { trial: "Prueba", active: "Activa", past_due: "Pago pendiente", suspended: "Suspendida", canceled: "Cancelada" }[status] ||
    status ||
    "—"
  );
}
