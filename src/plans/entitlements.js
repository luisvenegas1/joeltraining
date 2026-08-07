// ═══════════════════════════════════════════════════════════════
//  Entitlements por plan (PURO). Define qué FEATURES tiene cada plan.
//  Modelo: PLAN → FEATURES → ORGANIZATION.
//  La UI usa esto para mostrar/gatear, pero la seguridad REAL de las features
//  sensibles (p.ej. envío de recordatorios) la impone también el backend/RLS.
//
//  Agregar una feature nueva es solo añadir la clave acá; no rehace la app.
// ═══════════════════════════════════════════════════════════════
export const PLANS = ["base", "pro", "premium"];

export const PLAN_LABELS = { base: "Base", pro: "Pro", premium: "Premium" };

// Feature flags por plan. Premium ⊇ Pro ⊇ Base.
export const PLAN_FEATURES = {
  base: {
    workouts: true,          // clientes, rutinas, ejercicios, asignación
    measurements: false,     // registro de mediciones
    analytics: false,        // gráficas/estadísticas de progreso
    payment_reminders: false,// recordatorios automáticos por email
    custom_branding: true,   // logo/colores por org
    // futuras: advanced_reports, client_notifications, automations, ...
  },
  pro: {
    workouts: true,
    measurements: true,
    analytics: true,
    payment_reminders: false,
    custom_branding: true,
  },
  premium: {
    workouts: true,
    measurements: true,
    analytics: true,
    payment_reminders: true,
    custom_branding: true,
  },
};

// Normaliza un plan desconocido a 'base'.
export function normalizePlan(plan) {
  const p = String(plan || "").toLowerCase();
  return PLANS.includes(p) ? p : "base";
}

// Objeto de features del plan (siempre devuelve algo válido).
export function planFeatures(plan) {
  return PLAN_FEATURES[normalizePlan(plan)] || PLAN_FEATURES.base;
}

// ¿El plan incluye esta feature?
export function hasFeature(plan, feature) {
  return !!planFeatures(plan)[feature];
}

// Plan mínimo requerido para una feature (para mensajes de upsell).
export function minPlanFor(feature) {
  for (const p of PLANS) {
    if (PLAN_FEATURES[p][feature]) return p;
  }
  return null;
}

// Texto corto de upsell para una feature bloqueada.
export function upsellFor(feature) {
  const min = minPlanFor(feature);
  const label = min ? PLAN_LABELS[min] : "un plan superior";
  const msgs = {
    measurements: `Las mediciones son parte del plan ${label}.`,
    analytics: `Las gráficas de progreso son parte del plan ${label}.`,
    payment_reminders: `Los recordatorios automáticos de pago son parte del plan ${label}.`,
  };
  return msgs[feature] || `Esta función requiere el plan ${label}.`;
}
