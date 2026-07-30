# Arquitectura multi-tenant — Joel Training / Tito Apps

> Estado: **conversión en curso** en la rama `feature/multitenant-saas`.
> Base: commit `d0fe279` (`main`). Nada se ejecuta contra producción sin autorización.

## 1. Objetivo

Una sola app, un repo, un deployment y una base Supabase que sirve a múltiples
entrenadores como organizaciones aisladas, resueltas por hostname/slug:

```
joeltraining.tito-apps.com  → Johel Training (production)   [subdominio joeltraining → slug joheltraining]
titotrainer.tito-apps.com   → Tito Trainer Demo (demo)
brunotraining.tito-apps.com → futuros entrenadores (production)
```
Familia de dominio: `tito-apps.com` (con guion, producción) y `titoapps.com` (futuro).
Mientras no haya wildcard DNS, la demo/pruebas van por ruta (`/joheltraining`, `/titotrainer`).

Prioridad absoluta: **no perder ninguna función ni dato de Johel**.

## 2. Modelo de datos (nuevo núcleo)

```
auth.users (Supabase Auth)
   └── profiles (1:1, sin contraseñas)
         └── organization_members (user_id ↔ organization_id, role)
               └── organizations (id, name, slug ÚNICO, tenant_type, status)
                     └── organization_settings (branding por tenant)
```

Tablas de datos existentes (conservadas, con IDs intactos) ganan `organization_id`:

```
users(=clientes), exercises, routines, routine_days, routine_groups,
routine_exercises, measurements, payments, workout_sessions, workout_logs, catalogs
```

Roles iniciales: `owner`, `trainer`, `demo_viewer` (extensible: `admin`, `client`).

## 3. Flujo de autenticación (objetivo)

```
auth.user  →  profile  →  organization_members  →  organization
```

- Sin descargar hashes al navegador; sin bcrypt en el frontend.
- Sesión restaurada por Supabase (`onAuthStateChange`), no por `jh_session`.
- El rol y la membresía se validan **en la base** vía RLS, no desde `localStorage`.
- Clientes pueden existir **sin** cuenta Auth (se invitan/vinculan después).

## 4. Resolución de tenant

`src/tenant/resolveTenant.js` (puro, testeado):

1. `*.tito-apps.com` / `*.titoapps.com` → slug del subdominio (joeltraining → joheltraining).
2. dev/local → slug del primer segmento de la ruta (`/joheltraining`).
3. dominios personalizados (`app.brunofitness.com`) → tabla `custom_domains` (fase futura).
4. **Host desconocido → `null`** (UI "Organización no encontrada"). Nunca Johel por defecto.

Luego: buscar org por slug → validar `status='active'` → cargar branding →
validar que el usuario autenticado pertenezca a ese tenant.

## 5. Aislamiento (RLS)

RLS es obligatorio en todas las tablas de datos + storage. Un usuario de una
organización no puede leer/escribir otra **aunque** manipule hostname, slug, IDs,
payloads o la consola. Helpers seguros (no recursivos): `is_org_member()`,
`has_org_role()`, `current_client_id()`. Detalle y rollout en `docs/rls-rollout.md`.
La activación de RLS es una operación **manual** (`supabase/cutover/enable_rls.sql`),
fuera de `supabase/migrations/`.

**RLS no se activa** hasta que las validaciones (`supabase/validation/pre_rls.sql`)
pasen sin huérfanos.

## 6. Biblioteca de ejercicios

Una sola tabla `exercises`:

- Global: `organization_id = NULL`, `visibility = 'global'` (no editable por trainers).
- Privada: `organization_id = <org>`, `visibility = 'organization'`.

`routine_exercises` mantiene una sola FK a `exercises` y guarda los datos
específicos (series, reps, peso, unidad, equipo, superficie, notas, orden).
El historial de entrenamientos usa **snapshots** (ya implementado en `workout_logs`).

## 7. Fases de la conversión

| Fase | Contenido | Estado |
|------|-----------|--------|
| 1 | Núcleo multi-tenant, columnas aditivas, backfill Johel, validaciones, env, resolver de tenant + tests | **hecha (esta rama)** |
| 2 | Biblioteca global/privada + corrección de pagos | pendiente |
| 3 | RPC transaccional de rutinas | pendiente |
| 4 | Helpers RLS + policies + activación | pendiente (requiere validar backfill) |
| 5 | Supabase Auth + migración/invitación de legacy | pendiente (requiere autorización para crear usuarios) |
| 6 | Storage (buckets/policies) + branding dinámico en la UI | pendiente |
| 7 | React Router + resolución de tenant en runtime | pendiente |
| 8 | Tito Trainer Demo (seed) + rol demo_viewer + reset | pendiente |
| 9 | Suite de tests (auth, tenant, aislamiento, funcional) + docs restantes | en progreso |

## 8. Puertas de autorización (me detengo y te consulto)

- Ejecutar cualquier migración en Supabase remoto.
- Crear usuarios Auth reales (requiere `service_role`/Edge Function).
- Cambiar Vercel, DNS o `*.tito-apps.com`.
- Desplegar a producción.
- Cualquier acción que pueda perder datos.

## 9. Variables de entorno

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (ver `.env.example`).
La `service_role` **jamás** va al frontend ni a commits; solo en Edge Functions/scripts.
