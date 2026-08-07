# TrainSync — Reporte final de la Fase (evolución a SaaS comercial)

_Fecha: 2026-08-07 · Producto: **TrainSync** · Empresa: **Tito Apps** · Estado del build: lint limpio, 115 tests en verde, build OK._

Este reporte resume todo lo entregado en esta fase y —lo más importante— **los pasos manuales** que tenés que ejecutar vos en tu Mac (migraciones, seeds, despliegue de funciones, secretos y cron), porque este entorno no puede tocar tu Supabase/Vercel ni hacer commits.

---

## 1. Identidad de marca (resuelta)

Se separó claramente la marca en tres niveles, como pediste:

- **TrainSync** = nombre del producto/SaaS. Aparece en el título de la página, el manifest/PWA, la página "Acerca de" y los correos del sistema.
- **Tito Apps** = empresa/ecosistema. Aparece en el Panel de Plataforma y como "by Tito Apps".
- **Johel Training** = **un solo tenant** (slug `joheltraining`, producción). **Tito Trainer Demo** = tenant demo (slug `titotrainer`).

No se hizo reemplazo ciego de "Johel Training": su marca sigue solo donde de verdad se refiere a ese tenant (branding por organización en `organization_settings`). El fallback para otros tenants es neutro ("Mi Entrenador"), nunca la marca de Johel.

Cambios: `package.json` (`name: "trainsync"`), `index.html` (título, apple-title, theme-color navy), `public/manifest.json` (nombre/descr/colores TrainSync).

## 2. Planes y entitlements (Base / Pro / Premium)

Se formalizaron los planes con diferencias **funcionales reales** (antes eran solo etiquetas):

| Feature | Base | Pro | Premium |
|---|:---:|:---:|:---:|
| Rutinas / clientes | ✅ | ✅ | ✅ |
| Branding propio | ✅ | ✅ | ✅ |
| Mediciones + gráficas | — | ✅ | ✅ |
| Analítica / historial | — | ✅ | ✅ |
| Recordatorios de pago | — | — | ✅ |

Arquitectura: `src/plans/entitlements.js` (mapa plan→features, monotónico) + `PlanGate.jsx` (muestra el contenido o una tarjeta de upsell) + `PermissionsContext` que expone `plan` y `features`. El plan real viene de `organization_subscriptions.plan`. Las secciones de mediciones/analítica/recordatorios están _gated_ por feature.

## 3. Recordatorios de pago automáticos (Premium)

- **Config por organización** (activar/desactivar + días de anticipación) en una nueva página "Recordatorios" (`src/reminders/RemindersPage.jsx`), gated a Premium.
- **Opt-out por cliente** (toggle en la ficha del cliente, solo visible si la org tiene la feature).
- **Envío real desde el backend** (no `setTimeout` en el navegador): Edge Function `send-payment-reminders` que corre por cron, con:
  - Anti-duplicados vía `UNIQUE(org, cliente, vencimiento, tipo)` en `payment_reminder_logs`.
  - Auditoría de cada envío (pending/sent/failed).
  - Envío por Resend; escapado de HTML anti-inyección.
  - Protección por `x-cron-secret`.

## 4. Onboarding y ayuda

Página "Acerca de TrainSync" con ilustración del entrenador (SVG), tarjetas de features y de planes; "Guía para el Trainer" (acordeón de pasos + tabla de planes + botón "Reabrir tour"); y un **tour re-abrible** (checklist, no de una sola vez).

## 5. Datos de la demo (Tito Trainer Demo)

El seed base ya trae 4 rutinas y clientes ficticios. Se agregó `tito_trainer_demo_measurements.sql` con **~5 mediciones por cliente y comportamientos distintos**: Ana (éxito), Beto (meseta), Caro (recaída), Dani (volumen/bulk), Eva (progreso lento). Solo toca `titotrainer`; no afecta a Johel ni a otros tenants.

## 6. Seguridad

Auditoría completa por severidad en `docs/security-audit.md`. Sin hallazgos críticos abiertos. Fixes seguros aplicados: cabeceras de seguridad en `vercel.json` y `CHECK` defensivo de `reminders_days_before` (migración 0027). Se documentó explícitamente por qué **no** se agregó un CHECK sobre el plan (rompería el plan `demo`).

## 7. Documentos comerciales

- `docs/contrato-entrenador-borrador.md` — contrato SaaS borrador (Costa Rica, Ley 8968), claramente marcado **NO es asesoría legal**.
- `docs/marketing-instagram.md` — estrategia de Instagram + primeros 10 posts.

## 8. Lo que NO se tocó (a propósito)

Arquitectura multi-tenant, IDs existentes, datos de Johel/Demo, estructura del Panel de Plataforma, y la suite E2E. Todas las migraciones nuevas son **aditivas e idempotentes**, sin `DROP` destructivos.

---

## ✅ PASOS MANUALES (ejecutá vos en tu Mac)

> Nada de esto se corrió en tu Supabase/Vercel. Hacelo en este orden.

### A. Commit (este entorno no puede commitear)
```bash
cd /Users/Tito/joeltraining
git add -A
git commit -m "TrainSync: planes/entitlements, recordatorios de pago (cron), About/Guía/Tour, demo data, auditoría de seguridad, docs comerciales"
git push
```

### B. Migraciones (aplicá en orden, son aditivas e idempotentes)
En el SQL Editor de Supabase (o `supabase db push`), corré si aún no lo hiciste:
1. `supabase/migrations/0024_*.sql` (autofill de org en users)
2. `supabase/migrations/0025_*.sql` (autofill de org en exercises/catalogs)
3. `supabase/migrations/0026_payment_reminders.sql` (columnas de recordatorios + tabla de logs + RLS)
4. `supabase/migrations/0027_reminder_constraints.sql` (CHECK defensivo 0–30)

### C. Seeds de la demo (solo si querés refrescar la demo)
1. `supabase/seeds/tito_trainer_demo.sql`
2. `supabase/seeds/tito_trainer_demo_measurements.sql`  ← nuevo
3. `supabase/demo/fill_demo_measurements.sql` (completa campos derivados de las gráficas)

### D. Edge Functions (desplegá con `--no-verify-jwt`)
```bash
supabase functions deploy send-payment-reminders --no-verify-jwt
```
Secretos necesarios para esa función:
```bash
supabase secrets set RESEND_API_KEY=...           # tu key de Resend
supabase secrets set CRON_SECRET=<32+ bytes aleatorios>
supabase secrets set REMINDER_FROM="TrainSync <no-reply@tito-apps.com>"
# PROJECT_URL, SERVICE_ROLE_KEY, ANON_KEY ya deberían estar configurados
```

### E. Programar el cron (una vez al día)
Con `pg_cron` (o un cron externo tipo GitHub Actions / cron-job.org) llamá:
```
POST https://<tu-proyecto>.supabase.co/functions/v1/send-payment-reminders
Header: x-cron-secret: <el mismo CRON_SECRET>
```
Probalo primero sin enviar con `?dry_run=1`.

### F. Activar recordatorios (en la app)
En una org **Premium**, entrá a "Recordatorios", activá el toggle y elegí los días de anticipación. Los clientes con correo y con su toggle activo recibirán el aviso cuando falten esos días para su `plan_end_date`.

### G. Vercel
El deploy tomará el nuevo `vercel.json` (cabeceras de seguridad) automáticamente en el próximo push. Verificá que las cabeceras aparezcan en las respuestas.

---

## Checklist rápido

- [ ] Commit + push
- [ ] Migraciones 0024–0027 aplicadas
- [ ] Seeds de demo (opcional)
- [ ] `send-payment-reminders` desplegada + secretos
- [ ] Cron diario configurado (probar con `dry_run=1`)
- [ ] Recordatorios activados en una org Premium
- [ ] Cabeceras de seguridad visibles en Vercel

## Verificación técnica de esta entrega

`npm run lint` → sin errores · `vitest run` → **115/115** en verde · `vite build` → OK.
