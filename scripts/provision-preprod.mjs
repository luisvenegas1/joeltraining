#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
//  provision-preprod.mjs — Crea/reutiliza las 3 cuentas Auth de preproducción,
//  de forma IDEMPOTENTE. Corre FUERA del navegador (usa service_role del entorno).
//
//  Cuentas:
//   1) Owner/preprod  -> miembro `owner` de joheltraining + agregado a platform_admins.
//   2) Demo viewer    -> miembro `demo_viewer` de titotrainer (solo lectura).
//   3) Cliente demo   -> vinculado a public.users.id='demo_c1' (sin membresía staff).
//
//  Uso (contraseñas/emails por argumentos; NUNCA en el repo):
//    SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//      node scripts/provision-preprod.mjs \
//        --owner-email you@example.com   --owner-password '...' \
//        --demo-email demo@example.com   --demo-password '...' \
//        --client-email cliente@example.com --client-password '...' \
//        [--owner-name "Tito"] [--demo-name "Demo"] [--client-name "Ana Demo"]
//
//  NUNCA imprime ni guarda la service_role ni las contraseñas.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}
function arg(n, d = null) {
  const i = process.argv.indexOf(`--${n}`);
  if (i === -1) return d;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

const cfg = {
  owner: { email: arg("owner-email"), password: arg("owner-password"), name: arg("owner-name", "Owner Preprod") },
  demo: { email: arg("demo-email"), password: arg("demo-password"), name: arg("demo-name", "Demo Viewer") },
  client: { email: arg("client-email"), password: arg("client-password"), name: arg("client-name", "Cliente Demo") },
};
for (const [k, v] of Object.entries(cfg)) {
  if (!v.email || !v.password) {
    console.error(`Faltan --${k}-email y/o --${k}-password.`);
    process.exit(1);
  }
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

// Busca un usuario Auth por email paginando (no hay getByEmail en la admin API).
async function findAuthUserByEmail(email) {
  const target = email.toLowerCase();
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users || [];
    const hit = users.find((u) => (u.email || "").toLowerCase() === target);
    if (hit) return hit;
    if (users.length < 200) break; // última página
  }
  return null;
}

// Crea o reutiliza un usuario Auth (idempotente). Si existe, actualiza su password.
async function ensureAuthUser(email, password) {
  const existing = await findAuthUserByEmail(email);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
    return { id: existing.id, reused: true };
  }
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  return { id: data.user.id, reused: false };
}

async function upsertProfile(id, fullName) {
  const { error } = await admin.from("profiles").upsert({ id, full_name: fullName }, { onConflict: "id" });
  if (error) throw error;
}
async function upsertMember(orgId, userId, role) {
  const { error } = await admin
    .from("organization_members")
    .upsert({ organization_id: orgId, user_id: userId, role }, { onConflict: "organization_id,user_id" });
  if (error) throw error;
}

const main = async () => {
  // ── Validar que existan las organizaciones y el cliente demo ANTES de tocar nada ──
  const { data: orgs, error: orgErr } = await admin
    .from("organizations")
    .select("id, slug")
    .in("slug", ["joheltraining", "titotrainer"]);
  if (orgErr) throw orgErr;
  const johel = orgs.find((o) => o.slug === "joheltraining");
  const tito = orgs.find((o) => o.slug === "titotrainer");
  if (!johel) { console.error("No existe la organización 'joheltraining'. Abortando."); process.exit(1); }
  if (!tito) { console.error("No existe la organización 'titotrainer'. Abortando."); process.exit(1); }

  const { data: cli, error: cliErr } = await admin.from("users").select("id, organization_id").eq("id", "demo_c1").maybeSingle();
  if (cliErr) throw cliErr;
  if (!cli) { console.error("No existe el cliente demo 'demo_c1'. Corré el seed de la demo primero. Abortando."); process.exit(1); }
  if (cli.organization_id !== tito.id) { console.error("'demo_c1' no pertenece a titotrainer. Abortando."); process.exit(1); }

  // ── 1) Owner/preprod ──
  const owner = await ensureAuthUser(cfg.owner.email, cfg.owner.password);
  await upsertProfile(owner.id, cfg.owner.name);
  await upsertMember(johel.id, owner.id, "owner");
  { const { error } = await admin.from("platform_admins").upsert({ user_id: owner.id }, { onConflict: "user_id" }); if (error) throw error; }
  console.log(`owner:        ${cfg.owner.email}  uid=${owner.id}  (${owner.reused ? "reusado" : "creado"})  → owner de joheltraining + platform_admin`);

  // ── 2) Demo viewer ──
  const demo = await ensureAuthUser(cfg.demo.email, cfg.demo.password);
  await upsertProfile(demo.id, cfg.demo.name);
  await upsertMember(tito.id, demo.id, "demo_viewer");
  console.log(`demo_viewer:  ${cfg.demo.email}  uid=${demo.id}  (${demo.reused ? "reusado" : "creado"})  → demo_viewer de titotrainer`);

  // ── 3) Cliente demo (sin membresía staff) ──
  const client = await ensureAuthUser(cfg.client.email, cfg.client.password);
  await upsertProfile(client.id, cfg.client.name);
  { const { error } = await admin.from("users").update({ auth_user_id: client.id }).eq("id", "demo_c1"); if (error) throw error; }
  console.log(`cliente demo: ${cfg.client.email}  uid=${client.id}  (${client.reused ? "reusado" : "creado"})  → vinculado a users.id='demo_c1' (sin staff)`);

  console.log("\n✅ Provisión de preproducción completa (idempotente). No se imprimieron contraseñas ni la service_role.");
};

main().catch((e) => { console.error("Error:", e.message || e); process.exit(1); });
