# Migraciones — Joel Training → Plataforma SaaS multi-tenant

Solo contienen migraciones **aditivas e idempotentes**: no borran tablas, columnas
ni datos, no recrean tablas legacy, y se pueden correr más de una vez sin daño. Son
las únicas que aplica `supabase db push`.

> ⚠️ **NO ejecutar contra producción sin autorización explícita del dueño.**
> No usan `DROP`, `TRUNCATE`, ni borrados masivos. No usan `service_role` en el frontend.
> RLS, validaciones pre-RLS, Storage y demo se sacaron a carpetas manuales (abajo).

## Migraciones (las aplica `supabase db push`)

| # | Archivo | Qué hace | Rompe algo | Requiere paso previo |
|---|---------|----------|-----------|----------------------|
| 01 | `0001_multitenant_core.sql` | Crea `organizations`, `organization_settings`, `profiles`, `organization_members` (tablas NUEVAS, `if not exists`) | No | — |
| 02 | `0002_add_org_columns.sql` | `add column if not exists organization_id` en tablas legacy + columnas de biblioteca en `exercises` | No | 01 |
| 04 | `0004_org_autofill_triggers.sql` | Triggers que autocompletan `organization_id` desde el padre (afecta inserts futuros) | No | 01 |
| 05 | `0005_exercise_library.sql` | Índice de biblioteca + promoción a global **opt-in** (comentada). La consistencia de visibilidad va en el bootstrap | No | 02 |
| 06 | `0006_save_routine_rpc.sql` | Función transaccional `save_routine(jsonb)` | No | 01 |
| 07 | `0007_rls_helpers.sql` | Funciones auxiliares RLS (SECURITY DEFINER, no recursivas) | No | 01 |
| 08 | `0008_rls_policies.sql` | **Crea** policies (INERTES: RLS sigue apagado; no cambian acceso) | No | 07 |
| 13 | `0013_avatar_url.sql` | `add column if not exists users.avatar_url` (convive con legacy) | No | 02 |
| 14 | `0014_organization_subscriptions.sql` | Tabla de suscripción + `platform_admins` + helpers + admin manual (SIN seed de Johel) | No | 01 |
| 15 | `0015_subscription_policies.sql` | Recrea policies operativas con gate de suscripción (INERTES hasta RLS) + policies de suscripción/superadmin | No | 08, 14 |
| 16 | `0016_public_org_read.sql` | Lectura PÚBLICA de `organizations` + `organization_settings` (para login/branding pre-auth con RLS). INERTE hasta RLS | No | 01, 08 |
| 17 | `0017_routine_assignments.sql` | Tabla `routine_assignments` (asignar una rutina a **varios** clientes) + trigger de org | No | 01, 04 |
| 18 | `0018_routine_assignment_rls.sql` | Redefine helpers `client_owns_*` (contemplan asignaciones) + policies de `routines`/`routine_assignments`. INERTE hasta RLS | No | 08, 15, 17 |

Lista real que aplica `db push` en el repo:
**0001, 0002, 0004, 0005, 0006, 0007, 0008, 0013, 0014, 0015, 0016, 0017, 0018.**

Estado preproducción: en Supabase ya están aplicadas 0001–0015 y **ya se ejecutaron**
el bootstrap de Johel y el seed de la demo (Tito Trainer). **Pendiente de aplicar: 0016**
(antes de activar RLS). Runbook completo: `docs/preproduction-launch.md`.

Nota: `0008`/`0015` crean policies pero **no** activan RLS → mientras RLS esté
apagado, no cambian el acceso. La creación de Johel, el backfill y la suscripción de
Johel se hacen **a mano** en el bootstrap (abajo), no con `db push`.

## Operaciones MANUALES (fuera de `migrations/`, NO las aplica `db push`)

| Ubicación | Qué es | Cuándo |
|-----------|--------|--------|
| `../cutover/bootstrap_johel_preflight.sql` | Preflight de Johel (SOLO LECTURA) | Tras `db push`, revisar/aprobar |
| `../cutover/bootstrap_johel_apply.sql` | Johel + backfill + suscripción con verificación atómica | Solo tras aprobar el preflight |
| `../cutover/backfill_routine_assignments.sql` | Backfill de `routine_assignments` desde `routines.user_id` (legacy) | Una vez, tras aplicar 0017 |
| `../validation/pre_rls.sql` | Validaciones pre-RLS (solo lectura) | Antes de activar RLS |
| `../cutover/storage.sql` | Buckets + policies de Storage | En el cutover (tras 07) |
| `../cutover/enable_rls.sql` | **Activa RLS** (el "corte") con GUARD | Solo tras go/no-go |
| `../demo/reset_demo_function.sql` | Función `reset_demo_data` (rechaza prod) | Al preparar la demo |
| `../seeds/tito_trainer_demo.sql` | Datos ficticios de la demo | Tras el corte de Johel |

Bootstrap del **primer superadmin** (SQL Editor / service role, nunca desde el navegador):
tras crear y vincular tu usuario Auth, insertá tu UUID en `platform_admins`:
```sql
insert into public.platform_admins (user_id) values ('<TU_AUTH_UUID>')
  on conflict (user_id) do nothing;

-- Verificación EN EL SQL EDITOR (directa; NO usar is_superadmin() acá porque
-- auth.uid() es NULL sin sesión JWT y daría false siempre):
select exists (
  select 1 from public.platform_admins where user_id = '<TU_AUTH_UUID>'
) as registrado;   -- debe ser true

-- Verificación REAL de is_superadmin(): desde la APP o una prueba autenticada con
-- el JWT de ese usuario (no en el SQL Editor). Debe devolver true.
```

Pruebas de aislamiento: `../../tests/rls/isolation_test.sql` (auto-contenida) y
`isolation_test_prepared.sql` (con usuarios Auth externos).

## Baseline de la base legacy

La base remota ya tiene el esquema legacy con datos, pero sin historial de migraciones.
Como estas migraciones **solo agregan** (no recrean tablas legacy), se aplican encima
sin conflicto. Cómo revisar y registrar el baseline: `docs/migration-baseline.md`.

## Flujo ÚNICO permitido (sin ventana de bloqueo)

```
backup verificado
→ db push de esquema REALMENTE aditivo (0001,0002,0004–0008,0013,0014,0015; SIN backfill, SIN RLS)
→ bootstrap Johel: preflight (solo lectura) → apply (mutación + verificación atómica)
→ operaciones manuales base: cutover/storage.sql
→ crear/vincular usuarios Auth (owner de Johel + clientes)
→ bootstrap manual del PRIMER superadmin (insert en platform_admins vía SQL/service role)
→ deploy y prueba con Supabase Auth, RLS APAGADO
→ validation/pre_rls.sql + checklist go/no-go (docs/auth-and-legacy-migration.md)
→ activación MANUAL de RLS (cutover/enable_rls.sql)
→ pruebas de aislamiento (tests/rls/isolation_test*.sql) + smoke tests
→ (aparte) demo: reset_demo_function.sql + seeds/tito_trainer_demo.sql
```

Rollback: (1) desactivar RLS en la base; (2) restaurar `VITE_AUTH_MODE=legacy` +
`VITE_MULTITENANT=off`; (3) redeploy del último frontend legacy comprobado.
