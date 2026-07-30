# Documentación — Joel Training → SaaS multi-tenant

👉 **Para lanzar preproducción, seguí `preproduction-launch.md` (runbook canónico).**

Índice:

0. `preproduction-launch.md` — **runbook único de preproducción** (pasos manuales, cuentas, Vercel, RLS, rollback).

1. `architecture-multitenant.md` — visión general, modelo de datos, fases.
2. `payments-and-exercise-library.md` — corrección de pagos y biblioteca global/privada.
3. `rls-rollout.md` — funciones auxiliares, policies, orden de activación de RLS.
4. `auth-and-legacy-migration.md` — Supabase Auth y migración de usuarios legacy.
5. `storage-and-branding.md` — Storage, buckets, branding dinámico y fallback de fotos.
6. `routing-and-tenants.md` — resolución de tenant por hostname/slug, SPA/PWA.
7. `tito-trainer-demo.md` — demo comercial, `demo_viewer`, reset seguro.
8. `vercel-and-dns.md` — pasos manuales de dominios/DNS/wildcard (no ejecutados).
9. `subscriptions.md` — estado de suscripción por organización (suspensión, gating, Stripe futuro).
10. `migration-baseline.md` — baseline de la base legacy + qué aplica `db push`.
11. `conversion-summary.md` — **resumen consolidado + procedimientos + rollback**.

Migraciones (solo aditivas, las aplica `db push`): `../supabase/migrations/README.md`.
Operaciones manuales: `../supabase/cutover/`, `../supabase/validation/`, `../supabase/demo/`.
Seeds: `../supabase/seeds/`. Pruebas SQL: `../tests/rls/`.
