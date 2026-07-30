# Routing y resolución de tenant

## Cómo se resuelve el tenant

`src/tenant/resolveTenant.js` (puro, testeado) + `src/tenant/TenantProvider.jsx`,
en este orden:

1. **Subdominio de plataforma** (`<slug>.titoapps.com`) → tiene **prioridad**.
   `joheltraining.titoapps.com` → `joheltraining`; `titotrainer...` → `titotrainer`.
   (Objetivo final, requiere `titoapps.com` + wildcard DNS.)
2. **Por RUTA** (primer segmento) en estos hosts: `titoapps.com`, `www.titoapps.com`,
   `localhost`, `*.local` y **`*.vercel.app`** (previews y dominios de Vercel).
   `…/joheltraining` → `joheltraining`; `…/titotrainer` → `titotrainer`.
   `VITE_DEFAULT_TENANT_SLUG` puede forzar uno por defecto si no hay ruta.
   → Esto permite **probar el SaaS en previews de Vercel y en el apex ANTES** de
   configurar el wildcard DNS.
3. **Host desconocido** o **dominio personalizado no registrado**
   (`app.brunofitness.com`) → `null` → pantalla **"Organización no encontrada"**.
   **Nunca** se usa Johel como fallback. Los dominios personalizados se resolverán
   vía tabla `custom_domains` (fase futura).

Rutas reservadas que no son slugs: `assets`, `api`, `auth`, `icons`, `favicon.svg`.

Luego `loadTenantBySlug(slug)` busca la org, valida `status='active'` y carga su
branding. Cambiar el slug/hostname **no** da acceso a otra organización: los datos
están protegidos por Auth + RLS (membresía validada en la base).

## Estrategia de dominios: rutas primero, subdominios después

**Inicialmente usaremos rutas** (`/joheltraining`, `/titotrainer`) sobre el dominio
de Vercel (`*.vercel.app`) y/o el apex `titoapps.com`. Los **subdominios**
(`joheltraining.titoapps.com`) son una **mejora posterior**: se habilitan cuando
conectemos `titoapps.com` a Vercel y configuremos el **wildcard DNS** (`*.titoapps.com`,
ver `docs/vercel-and-dns.md`). El código ya soporta ambos: cuando exista el
subdominio, tiene prioridad automáticamente; mientras tanto, la ruta funciona igual.

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
