# TrainSync — by Tito Apps

Plataforma SaaS multi-tenant de entrenamiento para entrenadores personales y sus clientes. Cada entrenador opera con su propia marca (logo, colores, dominio); sus clientes ven rutinas, mediciones y progreso desde el celular (PWA instalable).

- **Producto / SaaS:** TrainSync
- **Empresa / ecosistema:** Tito Apps
- **Tenants:** cada organización es un tenant aislado por RLS. _Johel Training_ (`joheltraining`) es el tenant de producción; _Tito Trainer Demo_ (`titotrainer`) es la cuenta de demostración con datos ficticios.

## Stack

React 19 + Vite · Supabase (Postgres, Auth, Storage, Edge Functions) · RLS multi-tenant · PWA · Vitest · ESLint. Deploy en Vercel, DNS en Cloudflare.

## Planes

| Feature | Base | Pro | Premium |
|---|:---:|:---:|:---:|
| Rutinas / clientes / branding propio | ✅ | ✅ | ✅ |
| Mediciones + gráficas | — | ✅ | ✅ |
| Analítica / historial | — | ✅ | ✅ |
| Recordatorios de pago automáticos | — | — | ✅ |

Las features por plan viven en `src/plans/entitlements.js` y se aplican con `<PlanGate>`.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run lint     # eslint
npx vitest run   # tests (unitarios)
npm run build    # build de producción
```

## Estructura

- `src/` — app React. Archivos núcleo: `trainsync-app.jsx`, `trainsync.ui.jsx`, `trainsync.features.jsx`, `trainsync.utils.js`.
- `src/plans/` — planes y entitlements. `src/reminders/` — recordatorios de pago. `src/onboarding/` — About/Guía/Tour. `src/platform/` — Panel de Plataforma (superadmin).
- `src/tenant/`, `src/branding/`, `src/auth/` — multi-tenancy, branding por org y control de acceso.
- `supabase/migrations/` — migraciones aditivas e idempotentes. `supabase/functions/` — Edge Functions. `supabase/seeds/` — datos de demo. `supabase/cutover/`, `supabase/demo/` — scripts operativos.
- `docs/` — documentación (arquitectura, dominios, seguridad, contrato, marketing, etc.).

## Documentación clave

- `docs/trainsync-phase-report.md` — reporte de la fase SaaS + pasos manuales de despliegue.
- `docs/security-audit.md` — auditoría de seguridad por severidad.
- `docs/architecture-multitenant.md`, `docs/routing-and-tenants.md` — multi-tenancy y resolución de tenant.
- `docs/resend-setup.md`, `docs/vercel-and-dns.md` — email y dominios.

> Johel Training se mantiene únicamente como un tenant. TrainSync (by Tito Apps) es el nombre del producto en todo lo demás.
