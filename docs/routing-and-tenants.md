# Routing y resolución de tenant

## Cómo se resuelve el tenant

`src/tenant/resolveTenant.js` (puro, testeado) + `src/tenant/TenantProvider.jsx`,
en este orden:

Familias de dominio de plataforma: **`tito-apps.com`** (producción real, con guion) y
**`titoapps.com`** (soporte futuro, sin guion).

1. **Subdominio de plataforma** (`<slug>.tito-apps.com` o `<slug>.titoapps.com`) →
   tiene **prioridad**. El subdominio de producción es **`joeltraining`** (nombre de la
   app) y mapea al slug **`joheltraining`** (alias de subdominio):
   - `joeltraining.tito-apps.com` → `joheltraining` (**producción actual de Johel**)
   - `titotrainer.tito-apps.com` → `titotrainer`
   - `joeltraining.titoapps.com` → `joheltraining` (familia futura)
2. **Por RUTA** (primer segmento) en: apex/www de ambas familias (`tito-apps.com`,
   `www.tito-apps.com`, `titoapps.com`, `www.titoapps.com`), `localhost`, `*.local` y
   **`*.vercel.app`** (previews y dominios de Vercel).
   `…/joheltraining` → `joheltraining`; `…/titotrainer` → `titotrainer`.
   `VITE_DEFAULT_TENANT_SLUG` puede forzar uno por defecto si no hay ruta.
   → Permite **probar el SaaS en previews de Vercel y en el apex** sin wildcard DNS.
3. **Host desconocido** o **dominio personalizado no registrado**
   (`app.brunofitness.com`) → `null` → pantalla **"Organización no encontrada"**.
   **Nunca** se usa Johel como fallback. Los dominios personalizados se resolverán
   vía tabla `custom_domains` (fase futura).

Rutas reservadas que no son slugs: `assets`, `api`, `auth`, `icons`, `favicon.svg`.

Luego `loadTenantBySlug(slug)` busca la org, valida `status='active'` y carga su
branding. Cambiar el slug/hostname **no** da acceso a otra organización: los datos
están protegidos por Auth + RLS (membresía validada en la base).

## Estrategia de dominios

- **Producción de Johel:** `joeltraining.tito-apps.com` (subdominio actual) → resuelve
  al slug `joheltraining` por alias de subdominio. Ya funciona sin wildcard.
- **Demo y pruebas:** por **ruta** (`/titotrainer`, `/joheltraining`) sobre previews de
  Vercel (`*.vercel.app`) y sobre el apex (`tito-apps.com`).
- **Más subdominios** (`titotrainer.tito-apps.com`, `brunotraining.tito-apps.com`) son
  una **mejora posterior**: se habilitan al configurar el **wildcard DNS**
  (`*.tito-apps.com`, ver `docs/vercel-and-dns.md`). El código ya los soporta: cuando
  exista el subdominio, tiene prioridad automáticamente.
- La familia sin guion **`titoapps.com`** también está soportada para el futuro.

## Modo legacy vs multi-tenant (flag)

`VITE_MULTITENANT` (default apagado):

- **apagado** → modo legacy: un solo tenant (Johel), sin gating. La app se comporta
  **exactamente como hoy**. Es el estado actual hasta completar Auth + RLS.
- **`on`** → resuelve el tenant por hostname/slug y aplica todo lo anterior.

Se enciende recién tras aplicar migraciones, tener Auth con usuarios vinculados y
validar el aislamiento.

## SPA / Vercel / PWA

`vercel.json` reescribe todas las rutas sin extensión a `/index.html` (SPA), pero
deja pasar archivos estáticos (`/sw.js`, `/manifest.json`, `/icons/...`, `/assets/...`)
para **no romper la PWA**. El service worker y el manifest se sirven tal cual.

```json
{ "rewrites": [
  { "source": "/((?!assets/|icons/|.*\\.[a-zA-Z0-9]+$).*)", "destination": "/index.html" }
]}
```

## Probar tenants en desarrollo

- Por ruta: `http://localhost:5173/joheltraining`, `/titotrainer`, `/brunotraining`.
- O `VITE_DEFAULT_TENANT_SLUG=titotrainer` en `.env.local` + `VITE_MULTITENANT=on`.
- Simular subdominios: agregar a `/etc/hosts`
  `127.0.0.1 joheltraining.localhost titotrainer.localhost` (algunos navegadores
  resuelven `*.localhost` sin hosts) y adaptar el resolver si se desea probar por
  hostname en local.

## Wildcard DNS y dominios (pasos manuales — NO hechos)

Ver `docs/vercel-and-dns.md`.
