// Estado de suscripción (PURO). Debe coincidir con la función SQL
// subscription_usable(): trial/active = usable; past_due/suspended/canceled solo
// usable dentro del grace period; sin fila = usable (fail-open).
export function subscriptionState(sub, nowMs = Date.now()) {
  if (!sub) return "active"; // sin suscripción → no bloquear (fail-open)
  if (sub.status === "trial" || sub.status === "active") return "active";
  const grace = sub.grace_period_ends_at ? new Date(sub.grace_period_ends_at).getTime() : null;
  if (grace && nowMs < grace) return "grace";
  return "blocked";
}

export function isUsable(sub, nowMs = Date.now()) {
  const s = subscriptionState(sub, nowMs);
  return s === "active" || s === "grace";
}

// Decide qué acceso operativo tiene el usuario dado el estado de la org:
//   ok        → puede operar
//   billing   → bloqueado, pero es OWNER → ve pantalla de cuenta/facturación
//   suspended → bloqueado (trainer/cliente/demo) → pantalla de suspensión
export function orgAccessFor({ role, subscription, isSuperadmin = false, nowMs = Date.now() }) {
  if (isSuperadmin) return "ok"; // soporte de Tito Apps
  if (isUsable(subscription, nowMs)) return "ok";
  return role === "owner" ? "billing" : "suspended";
}
