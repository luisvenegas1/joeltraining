#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
//  Script admin (fuera del navegador) para crear/invitar usuarios Auth
//  y vincularlos a una organización. Alternativa a la Edge Function.
//
//  Uso (el service_role va por variable de entorno, NUNCA hardcodeado):
//    SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//      node scripts/create-user.mjs \
//        --email nuevo@trainer.com --org <ORG_UUID> --role trainer \
//        [--name "Bruno"] [--invite] [--password '...'] [--link-client <CLIENT_ID>]
//
//  NO commitear el service_role. NO ejecutar contra prod sin autorización.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

function arg(name, def = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

const email = arg("email");
const org = arg("org");
const role = arg("role", "trainer");
const name = arg("name", null);
const invite = !!arg("invite", false);
const password = arg("password", null);
const linkClient = arg("link-client", null);

if (!email || !org) {
  console.error("Requeridos: --email y --org. Ver cabecera del script.");
  process.exit(1);
}
if (!["owner", "trainer", "demo_viewer"].includes(role)) {
  console.error(`Rol inválido: ${role}`);
  process.exit(1);
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

const main = async () => {
  let userId;
  if (invite) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email);
    if (error) throw error;
    userId = data.user.id;
    console.log(`Invitación enviada a ${email}`);
  } else {
    if (!password) {
      console.error("Para crear sin invitación pasá --password (temporal).");
      process.exit(1);
    }
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Usuario creado: ${email}`);
  }

  await admin.from("profiles").upsert({ id: userId, full_name: name });
  await admin.from("organization_members").upsert(
    { organization_id: org, user_id: userId, role },
    { onConflict: "organization_id,user_id" },
  );
  if (linkClient) {
    await admin.from("users").update({ auth_user_id: userId }).eq("id", linkClient);
    console.log(`Vinculado al cliente legacy ${linkClient}`);
  }
  console.log(`Listo: user_id=${userId} rol=${role} org=${org}`);
};

main().catch((e) => {
  console.error("Error:", e.message || e);
  process.exit(1);
});
