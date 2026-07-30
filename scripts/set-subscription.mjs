#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
//  Admin manual (fuera del navegador): activar / suspender / reactivar la
//  suscripción de una organización. Usa service_role por variable de entorno.
//
//  Uso:
//    SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//      node scripts/set-subscription.mjs \
//        --org <ORG_UUID> --status active|trial|past_due|suspended|canceled \
//        [--plan base] [--period-end 2026-12-31] [--grace 2026-08-15]
//
//  NO commitear el service_role. NO ejecutar contra prod sin autorización.
//  (El superadmin dentro de la app usa la función guardada admin_set_subscription;
//   este script es la vía admin equivalente por fuera.)
// ═══════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
function arg(n, d) { const i = process.argv.indexOf(`--${n}`); if (i === -1) return d; const v = process.argv[i + 1]; return v && !v.startsWith("--") ? v : true; }

const org = arg("org");
const status = arg("status");
const plan = arg("plan", null);
const periodEnd = arg("period-end", null);
const grace = arg("grace", null);
const VALID = ["trial", "active", "past_due", "suspended", "canceled"];

if (!org || !status) { console.error("Requeridos: --org y --status."); process.exit(1); }
if (!VALID.includes(status)) { console.error(`status inválido: ${status}. Usá uno de: ${VALID.join(", ")}`); process.exit(1); }

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

const main = async () => {
  // Verificación de seguridad: no operar sobre algo que no sea una organización real.
  const { data: o, error: oErr } = await admin.from("organizations").select("id, slug, tenant_type").eq("id", org).maybeSingle();
  if (oErr) throw oErr;
  if (!o) { console.error(`No existe la organización ${org}.`); process.exit(1); }

  const row = {
    organization_id: org,
    status,
    ...(plan ? { plan } : {}),
    current_period_end: periodEnd ? new Date(periodEnd).toISOString() : null,
    grace_period_ends_at: grace ? new Date(grace).toISOString() : null,
    provider: "manual",
  };
  const { error } = await admin.from("organization_subscriptions").upsert(row, { onConflict: "organization_id" });
  if (error) throw error;
  console.log(`OK: ${o.slug} (${o.tenant_type}) → suscripción '${status}'.`);
};

main().catch((e) => { console.error("Error:", e.message || e); process.exit(1); });
