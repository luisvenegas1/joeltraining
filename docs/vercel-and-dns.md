# Vercel, DNS y dominios (pasos manuales — NO ejecutados)

> Nada de esto se hace automáticamente. Requiere tu acceso a Vercel/DNS.
> No cambiar DNS ni dominios sin decisión explícita.

## 1. Dominio principal y wildcard

En el proyecto de Vercel (el **mismo** deployment sirve a todos los tenants):

1. Agregar dominio `titoapps.com` (o el que uses).
2. Agregar **wildcard** `*.titoapps.com` para que cualquier subdominio resuelva al
   mismo deployment.
3. DNS (en tu proveedor):
   - `titoapps.com` → registros de Vercel (A/ALIAS según indique Vercel).
   - `*.titoapps.com` → `CNAME` a `cname.vercel-dns.com` (Vercel indica el valor).
4. Verificar SSL: Vercel emite certificados automáticamente (incluye wildcard).
5. Probar:
   - `joheltraining.titoapps.com` → Johel.
   - `titotrainer.titoapps.com` → demo.
   - `noexiste.titoapps.com` → "Organización no encontrada" (no Johel).

## 2. SPA fallback

`vercel.json` ya reescribe rutas a `/index.html` sin romper archivos estáticos ni
la PWA. No requiere cambios adicionales.

## 3. Transición desde el dominio actual de Johel

Mientras no migres DNS, la app sigue en modo **legacy** (flag `VITE_MULTITENANT`
apagado) y Johel funciona en su URL actual sin cambios. Al encender el multi-tenant,
mapear el hostname actual de Johel a su slug (vía subdominio `*.titoapps.com` o, a
futuro, la tabla `custom_domains`).

## 4. Dominios personalizados futuros (`app.brunofitness.com`)

1. Agregar el dominio del cliente en Vercel apuntando al mismo proyecto.
2. Crear una tabla `custom_domains(hostname → organization_id/slug)` (fase futura)
   y extender `resolveTenant.js` para consultarla cuando el host no sea `*.titoapps.com`.
3. El cliente configura su DNS (CNAME) hacia Vercel.

## Variables de entorno en Vercel

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Production/Preview).
- `VITE_MULTITENANT=on` cuando se haga el corte.
- **Nunca** `service_role` en el frontend/Vercel del cliente; solo en Edge Functions
  (secretos del proyecto Supabase).
