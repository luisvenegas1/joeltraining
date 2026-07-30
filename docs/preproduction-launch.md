# Lanzamiento de PREPRODUCCIÓN (probar y vender)

Datos: Johel = pruebas, Tito Trainer Demo = ficticios. No hay clientes reales.
El tenant funciona **por rutas**: `/joheltraining` y `/titotrainer` (subdominios = futuro).

## Estado ya hecho en Supabase (remoto)
- Migraciones `0001, 0002, 0004–0008, 0013, 0014, 0015` aplicadas.
- `joheltraining` con datos vinculados y suscripción `active`.
- `titotrainer` (tenant `demo`) con suscripción `demo/active/manual`, 8 clientes y 4 rutinas ficticias (seed **ya ejecutado**).
- **RLS APAGADO.** Aún no hay usuarios de Supabase Auth vinculados.

## Pasos manuales (en orden)

### 1) Higiene de Git y commit
```bash
rm -f .git/index.lock                          # quita el lock stale (no resetea trabajo)
git rm --cached vite.config.js.timestamp-*.mjs 2>/dev/null || true   # saca temporales del índice
git add -A
git commit -m "feat: preproducción multi-tenant (Auth+RLS listos, provisión, validación, docs)"
git push origin feature/multitenant-saas
```
`.gitignore` ya ignora `supabase/.temp/` y `vite.config.js.timestamp-*`. No commitees backups ni secretos.

### 2) Aplicar la migración pendiente `0016` (lectura pública de organización)
Necesaria para que el login resuelva el tenant/branding con RLS activo. Es aditiva e
**inerte mientras RLS esté apagado**, así que es seguro aplicarla ya:
```bash
supabase db push          # aplica 0016 (revisá antes con: supabase db push --dry-run)
```

### 3) Variables en Vercel (Production **y** Preview)
```
VITE_SUPABASE_URL=https://<TU-PROYECTO>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon/publishable key>
VITE_AUTH_MODE=supabase
VITE_MULTITENANT=on
VITE_AVATAR_URL_ENABLED=on
```
NO configurés `SUPABASE_SERVICE_ROLE_KEY` en Vercel (frontend). No hay secretos en el repo.

### 4) Deploy
Deploy normal de la rama en Vercel. Las rutas `/joheltraining` y `/titotrainer`
funcionan en el dominio `*.vercel.app` y en `titoapps.com` (SPA rewrite en `vercel.json`).

### 5) Provisionar las 3 cuentas Auth (idempotente, fuera del navegador)
```bash
SUPABASE_URL=https://<TU-PROYECTO>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service_role> \
node scripts/provision-preprod.mjs \
  --owner-email  tito@example.com     --owner-password  '<pass1>' \
  --demo-email   demo@example.com     --demo-password   '<pass2>' \
  --client-email cliente@example.com  --client-password '<pass3>'
```
Crea/reutiliza: **owner** (owner de `joheltraining` + `platform_admins`), **demo_viewer**
(de `titotrainer`) y **cliente demo** (vinculado a `users.id='demo_c1'`, sin staff).
El script valida que las orgs y `demo_c1` existan antes de tocar nada, y nunca imprime
contraseñas ni la service_role.

### 6) Probar los 3 logins (con RLS aún APAGADO)
- `https://<deploy>/joheltraining` → login con **owner** → dashboard de entrenador de Johel.
- `https://<deploy>/titotrainer` → login con **demo_viewer** → demo en solo lectura
  (los botones de crear/borrar no aparecen; el banner "modo demostración" sí).
- `https://<deploy>/titotrainer` → login con **cliente demo** → experiencia de cliente
  (rutina/mediciones de `demo_c1`).
- `https://<deploy>/noexiste` → "Organización no encontrada" (no cae a Johel).

> ⚠️ Con **RLS apagado**, las consultas NO filtran por organización (el aislamiento lo
> impone RLS, no el frontend). En este paso podés ver datos de ambas orgs; es esperado.
> El aislamiento real se verifica en el paso 8, al activar RLS.

### 7) Validar
Reemplazá los 3 emails en `supabase/validation/preprod_checks.sql` y corré el archivo
en el SQL Editor. Todas las filas deben cumplir `observado = esperado` (0 huérfanos,
cuentas bien vinculadas, sin referencias cruzadas Johel↔Tito).

### 8) Activar RLS (SOLO cuando los 3 logins funcionen)
```sql
-- (opcional) Storage si vas a usar subida de fotos:  supabase/cutover/storage.sql
\i supabase/cutover/enable_rls.sql        -- activa RLS con GUARD anti-huérfanos
```
Inmediatamente después, verificá aislamiento: `tests/rls/isolation_test.sql`
(o `tests/rls/isolation_test_prepared.sql`) y repetí los 3 logins + un smoke test.

## Rollback (si algo falla tras activar RLS)
```sql
-- 1) desactivar RLS por tabla (las policies quedan inertes, no se borran):
alter table public.<tabla> disable row level security;   -- repetir por cada tabla
```
Con RLS apagado, el login por Auth sigue funcionando (organizations/settings ya son
públicos por 0016). Ningún dato se pierde (todo fue aditivo). Si querés volver a legacy:
`VITE_AUTH_MODE=legacy`, `VITE_MULTITENANT=off` en Vercel + redeploy.

## Qué NO ejecutar todavía
- No borres datos ni corras el reset de la demo salvo que quieras repoblarla.
- No conectes subdominios/wildcard DNS todavía (rutas primero).
- No conectes Stripe (el modelo de suscripción está listo, el cobro es futuro).
