// ═══════════════════════════════════════════════════════════════
//  Edge Function: send-payment-reminders  (proceso de CRON, no del navegador)
//  Envía recordatorios de pago por email a clientes cuya mensualidad vence pronto.
//  Reglas:
//   1) La organización debe tener plan PREMIUM (y suscripción usable).
//   2) reminders_enabled = true a nivel de organización.
//   3) reminder_enabled = true a nivel del cliente + tener email.
//   4) plan_end_date == hoy + reminders_days_before.
//   5) Anti-duplicados: se inserta una fila en payment_reminder_logs con UNIQUE
//      (org, cliente, due_date, tipo); si ya existe, NO se reenvía.
//   6) Se registra el resultado (sent/failed) con error si aplica.
//
//  Seguridad: requiere header x-cron-secret == CRON_SECRET (no es pública).
//  El service_role vive SOLO acá. Envía por Resend (RESEND_API_KEY).
//
//  Desplegar (manual): supabase functions deploy send-payment-reminders --no-verify-jwt
//  Secretos: PROJECT_URL, SERVICE_ROLE_KEY, RESEND_API_KEY, CRON_SECRET,
//            REMINDER_FROM (ej. "TrainSync <no-reply@tito-apps.com>")
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("PROJECT_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") || "";
const REMINDER_FROM = Deno.env.get("REMINDER_FROM") || "TrainSync <no-reply@tito-apps.com>";

// deno-lint-ignore no-explicit-any
type SB = any;

function isoPlus(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
const todayIso = () => new Date().toISOString().slice(0, 10);

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  // Protección: solo el cron con el secreto puede ejecutarlo.
  if (!CRON_SECRET || req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return json({ error: "forbidden" }, 403);
  }

  const admin: SB = createClient(PROJECT_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const dryRun = new URL(req.url).searchParams.get("dry_run") === "1";
  const summary = { orgs: 0, candidates: 0, sent: 0, skipped: 0, failed: 0 as number };

  // 1) Organizaciones PREMIUM con recordatorios activados.
  const { data: subs } = await admin
    .from("organization_subscriptions")
    .select("organization_id, plan, status, grace_period_ends_at")
    .eq("plan", "premium");
  const usable = (s: SB) => s.status === "trial" || s.status === "active" ||
    (s.grace_period_ends_at && new Date() < new Date(s.grace_period_ends_at));
  const premiumOrgIds = (subs || []).filter(usable).map((s: SB) => s.organization_id);
  if (premiumOrgIds.length === 0) return json({ ok: true, ...summary });

  const { data: settings } = await admin
    .from("organization_settings")
    .select("organization_id, reminders_enabled, reminders_days_before")
    .in("organization_id", premiumOrgIds)
    .eq("reminders_enabled", true);

  for (const st of settings || []) {
    summary.orgs++;
    const daysBefore = Number(st.reminders_days_before) || 3;
    const target = isoPlus(daysBefore);

    // 3-4) Clientes de la org con recordatorio activo, email y vencimiento == target.
    const { data: clients } = await admin
      .from("users")
      .select("id, name, email, plan_end_date, reminder_enabled")
      .eq("organization_id", st.organization_id)
      .eq("reminder_enabled", true);

    for (const c of (clients || [])) {
      if (!c.email || !c.plan_end_date) continue;
      const due = String(c.plan_end_date).slice(0, 10);
      if (due !== target) continue;
      summary.candidates++;

      // 5) Anti-duplicados: insertar log; si ya existe (conflict), saltar.
      const ins = await admin.from("payment_reminder_logs").insert({
        organization_id: st.organization_id, client_id: c.id, due_date: due,
        reminder_type: "pre_due", scheduled_for: todayIso(), status: "pending",
      }).select("id").maybeSingle();

      if (ins.error) { summary.skipped++; continue; } // conflict → ya enviado
      const logId = ins.data?.id;
      if (!logId) { summary.skipped++; continue; }

      if (dryRun) { summary.sent++; continue; }

      // 6) Enviar y registrar resultado.
      try {
        await sendEmail(c.email, c.name || "", due, daysBefore);
        await admin.from("payment_reminder_logs").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", logId);
        summary.sent++;
      } catch (e) {
        await admin.from("payment_reminder_logs").update({ status: "failed", error_message: String(e).slice(0, 500) }).eq("id", logId);
        summary.failed++;
      }
    }
  }

  return json({ ok: true, ...summary });
});

async function sendEmail(to: string, name: string, dueDate: string, daysBefore: number) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY no configurada");
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#F1F5F9;padding:24px">
    <div style="max-width:440px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden">
      <div style="background:#0B1F4B;padding:24px;text-align:center;color:#fff;font-weight:800;letter-spacing:1px">TrainSync</div>
      <div style="padding:28px">
        <div style="font-size:20px;font-weight:800;color:#0B1F4B;margin-bottom:8px">Recordatorio de pago</div>
        <p style="font-size:14px;color:#475569;line-height:1.6">Hola ${escapeHtml(name)}, te recordamos que tu mensualidad vence el <strong>${escapeHtml(dueDate)}</strong> (en ${daysBefore} día${daysBefore === 1 ? "" : "s"}). Coordiná el pago con tu entrenador para no perder el acceso.</p>
        <p style="font-size:12px;color:#94A3B8;margin-top:16px">Este es un recordatorio automático.</p>
      </div>
    </div>
  </div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: REMINDER_FROM, to, subject: "Recordatorio: tu mensualidad vence pronto", html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}
