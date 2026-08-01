#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
//  Setea/resetea la contraseña de un usuario Auth por correo (admin).
//  Útil si te olvidaste la contraseña y no tenés SMTP configurado todavía.
//  El service_role va por variable de entorno, NUNCA hardcodeado ni commiteado.
//
//  Uso:
//    SUPABASE_URL=https://<ref>.supabase.co \
//    SUPABASE_SERVICE_ROLE_KEY=<service_role o sb_secret_...> \
//      node scripts/set-password.mjs --email tu@correo.com --password 'NuevaClave123'
// ═══════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? null : process.argv[i + 1];
}

const email = arg("email");
const password = arg("password");
if (!email || !password) {
  console.error("Requeridos: --email y --password.");
  process.exit(1);
}
if (password.length < 6) {
  console.error("La contraseña debe tener al menos 6 caracteres.");
  process.exit(1);
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

// Busca el usuario por correo paginando (la admin API no tiene getByEmail).
async function findByEmail(target) {
  const t = target.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = (data?.users || []).find((u) => (u.email || "").toLowerCase() === t);
    if (hit) return hit;
    if (!data?.users?.length || data.users.length < 200) break;
  }
  return null;
}

const user = await findByEmail(email);
if (!user) {
  console.error(`No existe un usuario Auth con el correo ${email}.`);
  process.exit(1);
}
const { error } = await admin.auth.admin.updateUserById(user.id, { password });
if (error) {
  console.error("Error actualizando la contraseña:", error.message);
  process.exit(1);
}
console.log(`✅ Contraseña actualizada para ${email} (uid=${user.id}).`);
