# Resumen consolidado — conversión a SaaS multi-tenant

Rama: `feature/multitenant-saas` · Base: `d0fe279` (`main`).

> **Estado: PREPRODUCCIÓN.** En Supabase ya están aplicadas las migraciones
> `0001–0015`, el bootstrap de Johel (datos vinculados + suscripción `active`) y el
> **seed de la demo ya ejecutado** (`titotrainer`: 8 clientes + 4 rutinas ficticias).
> **RLS sigue APAGADO** y aún no hay usuarios Auth vinculados. Pendiente local:
> aplicar `0016` y provisionar las 3 cuentas. **Runbook canónico:
> `docs/preproduction-launch.md`.** Este documento es el histórico de la conversión.

## Qué quedó completamente implementado (local)

- **Modelo multi-tenant**: `organizations`, `organization_settings`, `profiles`,
  `organization_members` + `organization_id` en las 11 tablas de datos (0001–0002).
- **Backfill de Johel**: org `joheltraining` + vinculación de todos los datos +
  branding migrado (bootstrap). Triggers que autocompletan `organization_id` (0004).
- **Biblioteca de ejercicios** global vs privada (0005, opt-in reversible).
- **Pagos corregidos**: tabla `payments` como fuente de verdad, con rollback
  (App + `PaymentModule`); mapeo `months↔period`.
- **Rutinas transaccionales**: RPC `save_routine` (0006) + fallback legacy no-breaking.
- **RLS completo**: helpers no recursivos (0007), policies de todas las tablas (0008),
  activación separada con GUARD (cutover/enable_rls.sql), Storage (cutover/storage.sql). Test de aislamiento
  (`tests/rls/isolation_test.sql`).
- **Auth (CONECTADO por flag)**: `VITE_AUTH_MODE=legacy|supabase` en
  `src/johel-training-app.jsx`. En `supabase`: login real, `onAuthStateChange`,
  membresía + rol + tenant (`resolveAccess`), logout real, pantallas de error,
  `demo_viewer` no destructivo (UI + RLS). Legacy intacto por defecto. Edge Function
  `admin-users` + script para crear/invitar (ejecución = externa).
- **Storage + branding**: `src/storage/*`, `src/branding/*`, columna `avatar_url`
  (0013), fallback a fotos legacy. Johel idéntico.
- **Routing/tenant**: `src/tenant/*`, React Router, `vercel.json`, pantalla
  "Organización no encontrada" (sin fallback a Johel).
- **Tito Trainer Demo**: seed idempotente ficticio, `demo_viewer` real (RLS + UI),
  función de reset guardada (demo/reset_demo_function.sql) + Edge Function `reset-demo` + guard.
- **Suscripción por organización** (sin Stripe): `organization_subscriptions` +
  `platform_admins` + gate RLS `org_operational_allowed` (0014/0015). Org bloqueada
  no lee/escribe datos operativos; owner ve `BillingScreen`, resto `SuspendedScreen`;
  superadmin conserva soporte. Admin manual (`admin_set_subscription` + `scripts/set-subscription.mjs`).
  Webhook Stripe futuro documentado. Ver `docs/subscriptions.md`.
- **Empaquetado de migraciones**: `migrations/` solo tiene aditivas (`db push`);
  RLS/validaciones/Storage/demo movidas a `cutover/`, `validation/`, `demo/`. Baseline
  en `docs/migration-baseline.md`.
- **Tests**: 51 unitarios (vitest) verdes; lint limpio; build real de Vite OK.

## Qué permanece en modo compatible/legacy

- Login legacy (usuario/contraseña con `verifyPassword`) sigue activo por defecto
  (`VITE_AUTH_MODE=legacy`). El modo `supabase` está conectado y listo para el flip.
- `VITE_MULTITENANT` apagado → sin gating por tenant (un solo tenant Johel).
- `userToDb` persiste `avatar_url` solo con `VITE_AVATAR_URL_ENABLED=on` (tras `0013`);
  por defecto off para no romper el guardado si la columna no existe.
- RLS **desactivado** hasta correr `cutover/enable_rls.sql` (por eso hoy la clave anon funciona).
- Fotos: se siguen leyendo de `localStorage` como fallback.

## Migraciones y orden exacto

Ver `supabase/migrations/README.md`. Corte SIN ventana de bloqueo (las variables
`VITE_*` se hornean en build → el frontend con Supabase Auth debe estar desplegado y
verificado ANTES de activar RLS):

```
1. db push aditivo: 0001,0002,0004,0005,0006,0007,0008,0013,0014,0015 (SIN backfill, SIN RLS).
2. Bootstrap Johel: preflight (cutover/bootstrap_johel_preflight.sql, revisar) → apply (bootstrap_johel_apply.sql).
3. Manual: cutover/storage.sql.
4. Crear/vincular usuarios Auth (owner de Johel + clientes).
5. Bootstrap del primer superadmin (insert en platform_admins vía SQL/service role; verificar is_superadmin()).
6. Producción: VITE_AUTH_MODE=supabase, VITE_MULTITENANT=on, VITE_AVATAR_URL_ENABLED=on → desplegar y verificar con RLS OFF.
7. Confirmar login owner/trainer + cliente, resolución de Johel + validation/pre_rls.sql + checklist go/no-go.
8. Activar RLS a mano (cutover/enable_rls.sql) → de inmediato pruebas de aislamiento + smoke tests.
9. Poblar demo aparte (seeds/tito_trainer_demo.sql) — nunca antes del corte de Johel.
```

Todas las migraciones son aditivas e idempotentes; sin `DROP/TRUNCATE`; conservan IDs.
Checklist go/no-go del paso 7 en `docs/auth-and-legacy-migration.md`.

## Pruebas y resultados

- `npm run lint` → limpio.
- `npm run test` (vitest) → **51/51**: resolución de tenant (incl. no-fallback a
  Johel), `resolveAccess` (owner/trainer/cliente/demo_viewer, wrong_org, suspended,
  no_membership), suscripción (`subscriptionState`/`orgAccessFor`), payload de rutinas
  + fallback, branding, storage/fallback de fotos, permisos `demo_viewer`,
  `tenantStatus`, guard de reset (rechaza producción).
- **Build real de Vite → OK** (`vite build` a `/tmp`, 90 módulos, exit 0; único
  warning: tamaño de chunk por el logo base64). El bundle esbuild también resuelve
  todos los imports.
- SQL: `$$`/`DO` balanceados. **Ejecución del SQL pendiente** contra Supabase real
  (no hay Postgres en el entorno; ver "verificar esquema").

## Riesgos detectados

- **Esquema real no inspeccionado** (sin acceso remoto): las migraciones asumen los
  nombres/tipos de `src/db.js`. Verificar antes de correr (abajo).
- `auth.users` en el test de aislamiento puede requerir columnas según versión de
  Supabase; ajustar si falla.
- Activar RLS sin haber vinculado usuarios Auth dejaría sin acceso a la clave anon:
  por eso el orden y el GUARD de `cutover/enable_rls.sql`.
- `save_routine` asume tipos de columnas (series int, etc.); validar con datos reales.
- Buckets públicos: solo logos/trainer-photos; avatars privados (verificado en policy).

## Pasos externos que debés hacer vos (bloqueos reales)

1. Revisar el diff y **commitear** la rama (git está bloqueado en este entorno;
   quizá `rm -f .git/index.lock`). Borrar `vite.config.js.timestamp-*.mjs` (ya ignorados).
2. `db push` aditivo: `0001,0002,0004,0005,0006,0007,0008,0013,0014,0015` (SIN backfill, SIN RLS). **No** lo corrí.
3. **Bootstrap Johel**: revisar `cutover/bootstrap_johel_preflight.sql` (solo lectura) → correr `cutover/bootstrap_johel_apply.sql` (mutación + verificación atómica) + `cutover/storage.sql`.
4. Crear el **owner de Johel** y vincular usuarios (Edge Function/script). Desplegar
   Edge Functions (`admin-users`, `reset-demo`) + secretos (`SERVICE_ROLE_KEY`,
   `PROJECT_URL`, `ANON_KEY`). **No** desplegados.
5. **Bootstrap del primer superadmin**: insertar tu UUID en `platform_admins` vía SQL/service role; verificar `is_superadmin()`.
6. Probar Auth en **preview** con RLS OFF.
7. Producción: `VITE_AUTH_MODE=supabase`, `VITE_MULTITENANT=on`, `VITE_AVATAR_URL_ENABLED=on`
   → **desplegar y verificar** con RLS todavía OFF (el flip no es inmediato).
8. `validation/pre_rls.sql` + login owner/cliente + checklist go/no-go.
9. Activar RLS (`cutover/enable_rls.sql`) → de inmediato `tests/rls/isolation_test*.sql` + smoke tests.
10. Vercel/DNS: dominio + wildcard `*.titoapps.com`. Poblar demo (`seeds/tito_trainer_demo.sql`) — nunca antes del corte de Johel.
11. Sacar del índice git (bloqueado en este entorno): `rm -f .git/index.lock && git rm --cached vite.config.js.timestamp-*.mjs`.

## Dónde verificar el esquema real (pendientes)

- Tipos/nombres de columnas de: `users, exercises, routines, routine_days,
  routine_groups, routine_exercises, measurements, payments, workout_sessions,
  workout_logs, catalogs` (usados en 0002/0004/0006/0008).
- Que `payments.period` sea numérico (guardamos meses ahí).
- Que `routine_exercises.weight_amount` acepte texto/numérico como hoy.
- Que RLS de `storage.objects` no choque con policies previas.

## Procedimiento: ACTIVAR Johel (producción) — sin ventana de bloqueo

1. `db push` aditivo (`0001,0002,0004–0008,0013,0014,0015`) → bootstrap manual de Johel
   (preflight → `cutover/bootstrap_johel_apply.sql`) + `cutover/storage.sql` (RLS aún OFF).
2. Crear owner de Johel (Auth) + vincular a `organization_members` (role `owner`,
   org `joheltraining`). Vincular clientes con acceso (`users.auth_user_id`). Crear el
   primer superadmin (`platform_admins`).
3. Probar Auth en PREVIEW con RLS OFF.
4. Producción: `VITE_AUTH_MODE=supabase`, `VITE_MULTITENANT=on`, `VITE_AVATAR_URL_ENABLED=on`.
5. **Desplegar y verificar** que producción con login Supabase está activa y funcionando,
   **con RLS todavía OFF** (deploy terminado y comprobado; el flip de variables NO es inmediato).
6. Confirmar login owner/trainer + un cliente, resolución de Johel, consultas OK.
7. [checklist go/no-go] Activar RLS a mano (`cutover/enable_rls.sql`).
8. De inmediato: `tests/rls/isolation_test*.sql` + smoke tests autenticados.
9. DNS: `joheltraining.titoapps.com`.

El login legacy se retira recién como etapa posterior, ya con Auth estable.

## Procedimiento: ACTIVAR Tito Trainer Demo

1. (Migraciones ya aplicadas.) Crear owner/`demo_viewer` demo:
   `node scripts/create-user.mjs --email demo@titoapps.local --org <titotrainer> --role demo_viewer --invite`.
2. Correr `seeds/tito_trainer_demo.sql`.
3. DNS: `titotrainer.titoapps.com`.
4. Reset cuando haga falta: `select reset_demo_data('<titotrainer>')` + re-seed.

## Procedimiento futuro: agregar a Bruno (sin tocar código)

```sql
insert into organizations (name,slug,tenant_type,status)
  values ('Bruno Training','brunotraining','production','active');
insert into organization_settings (organization_id, display_name, tagline, ...)
  values ((select id from organizations where slug='brunotraining'), 'Bruno', '...', ...);
```
Luego: crear/invitar a Bruno como `owner` (Edge Function/script), configurar su
branding, y DNS `brunotraining.titoapps.com`. Los ejercicios globales ya se
comparten; no se duplica nada.

## Variables de entorno (frontend)

| Variable | Efecto | Default |
|----------|--------|---------|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | conexión Supabase | fallback actual |
| `VITE_AUTH_MODE` | `legacy` o `supabase` (login) | `legacy` |
| `VITE_MULTITENANT` | `on` resuelve tenant por hostname/slug | off |
| `VITE_DEFAULT_TENANT_SLUG` | tenant por defecto en dev | vacío |
| `VITE_AVATAR_URL_ENABLED` | `on` persiste `users.avatar_url` (tras 0013) | off |

## Rollback (base de datos + variables + deployment)

Un rollback completo del corte no es solo desactivar RLS; hay que revertir las tres
capas **en este orden** (base → variables → deploy):

```
1. Desactivar RLS en la base de datos:
     alter table <t> disable row level security;   -- policies quedan inertes
2. Restaurar variables:  VITE_AUTH_MODE=legacy  y  VITE_MULTITENANT=off
   (y VITE_AVATAR_URL_ENABLED=off).
3. Redeploy del último frontend legacy comprobado.
```

RLS se desactiva primero para que, apenas termine el redeploy legacy (paso 3), la
clave anon pueda leer `users` sin ventana de bloqueo. **Sin pérdida de datos** (todo
fue aditivo; no se hace `DROP`).

Rollbacks puntuales:

- **Rutinas**: si `save_routine` falla, la rutina anterior queda intacta (transacción);
  el fallback legacy sigue disponible si la función no existe.
- **Columnas/tablas nuevas**: aditivas; se pueden ignorar sin romper legacy.
- **Demo**: `reset_demo_data` solo afecta la org demo; nunca producción.
- **Recuperación de login Auth**: ver `auth-and-legacy-migration.md` → "Recuperación".

## Estado por componente

- **Realmente conectado en la app**: pagos (tabla real), rutinas transaccionales
  (con fallback), catálogos, entrenamientos, branding dinámico, resolución de tenant,
  modo `VITE_AUTH_MODE` (legacy/supabase) con pantallas de error y `demo_viewer`.
- **Preparado (no ejecutado / requiere remoto)**: migraciones, activación de RLS,
  Edge Functions (`admin-users`, `reset-demo`), Storage (buckets), seed de la demo,
  creación de usuarios Auth.
- **Probado localmente**: lint, 43 tests, build real de Vite, bundle, `$$` SQL.
- **Requiere Supabase remoto / tu autorización**: correr migraciones, crear usuarios,
  desplegar funciones, activar RLS, Vercel/DNS.
