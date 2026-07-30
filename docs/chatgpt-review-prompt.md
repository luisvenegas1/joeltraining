# Prompt para revisión externa (ChatGPT)

> Pegá todo lo de abajo en ChatGPT. Si podés, adjuntá también los archivos SQL de
> `supabase/migrations/`, `supabase/cutover/`, `supabase/validation/` y los módulos
> `src/auth/*`, `src/tenant/*`, `src/subscription/*`.

---

Actúa como un ingeniero senior de plataformas + seguridad revisando una migración de
producción. Sé crítico y concreto: buscá bugs, huecos de seguridad, condiciones de
carrera, y pasos que puedan bloquear producción. No asumas que algo está bien porque
"parece" correcto.

## Contexto del proyecto

App de entrenamiento personal ("Johel Training"): React 19 + Vite 8 + JavaScript/JSX,
Supabase (Postgres) con `@supabase/supabase-js`, PWA. Navegación por estado local (se
agregó React Router para resolución de tenant). La estoy convirtiendo en una
plataforma **SaaS multi-tenant** (un solo repo, deployment y base Supabase), sin
romper los datos ni el funcionamiento actual de Johel.

Estado actual: la base **remota ya tiene el esquema legacy con datos reales**, pero
**sin historial de migraciones** de Supabase. Hay un backup verificado. **Nada** se ha
ejecutado en remoto todavía; todo está en la rama `feature/multitenant-saas`.

## Qué se implementó (todo local, nada remoto)

1. **Modelo multi-tenant**: tablas nuevas `organizations`, `organization_settings`,
   `profiles`, `organization_members`; columna `organization_id` agregada (nullable) a
   las 11 tablas legacy (`users`=clientes, `exercises`, `routines`, `routine_days`,
   `routine_groups`, `routine_exercises`, `measurements`, `payments`,
   `workout_sessions`, `workout_logs`, `catalogs`).
2. **Resolución de tenant** por hostname/slug (`*.titoapps.com` → subdominio; en dev
   por ruta). Host desconocido nunca cae a Johel (devuelve "Organización no
   encontrada"). Módulo puro `src/tenant/resolveTenant.js`.
3. **Supabase Auth conectado por flag** `VITE_AUTH_MODE=legacy|supabase`. En
   `supabase`: `getSession` + `onAuthStateChange`, carga de membresías/rol/cliente,
   `resolveAccess` decide owner/trainer/cliente/demo_viewer/wrong_org/suspended/etc.,
   logout real. En `legacy`: login actual sin cambios. No se descargan hashes ni todos
   los usuarios antes del login.
4. **RLS**: funciones auxiliares `SECURITY DEFINER` no recursivas (`is_org_member`,
   `has_org_role`, `can_write_org`, `current_client_id`, `client_owns_*`); policies
   para todas las tablas; ejercicios globales legibles por todos, privados aislados por
   org; el cliente solo ve lo suyo; `demo_viewer` solo lectura.
5. **Suscripción por organización** (sin Stripe): tabla `organization_subscriptions`
   (status trial/active/past_due/suspended/canceled, grace_period, provider manual),
   tabla `platform_admins` (superadmin de soporte), helper `org_operational_allowed()`
   = superadmin OR suscripción usable. Las policies **operativas** llevan ese gate: una
   org bloqueada no lee ni escribe datos operativos. Datos de **cuenta** (orgs,
   settings, members, subscriptions) sin gate → el owner ve su facturación. Front:
   `BillingScreen` (owner bloqueado) y `SuspendedScreen` (resto). Admin manual
   `admin_set_subscription` (solo superadmin) + `scripts/set-subscription.mjs`.
6. **Guardado transaccional de rutinas** vía función `save_routine(jsonb)` con fallback
   legacy no-breaking. **Pagos** ahora persisten en la tabla `payments` (antes se
   perdían). **Storage** (buckets logos/trainer-photos públicos, avatars privado) +
   branding dinámico con fallback a fotos legacy en `localStorage`.
7. **Tito Trainer Demo**: seed idempotente ficticio + reset guardado que **rechaza**
   producción (verifica `tenant_type='demo'`).

## Empaquetado de migraciones (importante)

`supabase db push` solo debe aplicar migraciones **aditivas** (no recrean tablas
legacy, no activan RLS, no hacen backfill). Por eso:

- `migrations/` (lo que aplica `db push`): **0001, 0002, 0004, 0005, 0006, 0007,
  0008, 0013, 0014, 0015**.
- Movidos a **operaciones manuales**:
  - `cutover/bootstrap_johel_apply.sql` (crea Johel + backfill de
    `organization_id` en datos legacy + visibilidad de ejercicios + suscripción activa;
    con **preflight** de conteos y **verificación** final que hace `raise exception` si
    queda algún registro sin `organization_id`).
  - `cutover/storage.sql`, `cutover/enable_rls.sql` (activa RLS con GUARD),
    `validation/pre_rls.sql`, `demo/reset_demo_function.sql`.

## Orden de corte SIN ventana de bloqueo

Las variables `VITE_*` se hornean en build, así que cambiarlas requiere un deploy
nuevo y verificado. El orden es:

```
backup verificado
→ db push aditivo (0001,0002,0004–0008,0013,0014,0015; SIN backfill, SIN RLS)
→ bootstrap manual y verificado de Johel + suscripción activa
→ crear/vincular usuarios Auth (owner de Johel + clientes)
→ bootstrap manual del primer superadmin (insert en platform_admins vía SQL/service role)
→ deploy y prueba con Supabase Auth, RLS APAGADO
→ validación pre-RLS + checklist go/no-go
→ activar RLS manualmente (cutover/enable_rls.sql)
→ pruebas de aislamiento + smoke tests
```

Rollback: (1) desactivar RLS en la base; (2) `VITE_AUTH_MODE=legacy` + `VITE_MULTITENANT=off`;
(3) redeploy del último frontend legacy comprobado.

## Verificaciones locales que ya pasan

`npm run lint` limpio; `npm run test` (vitest) 51/51 (incluye resolución de tenant,
`resolveAccess`, estado de suscripción, guard de reset); `vite build` real OK (90
módulos); `supabase db push --dry-run` entra en modo DRY RUN (pide access token, no
toca remoto).

## Qué quiero que revises y me digas

1. ¿El orden de corte realmente **evita** cualquier ventana en la que RLS esté activo
   mientras producción todavía dependa del login legacy (clave anon)? ¿Algún hueco?
2. ¿Las **policies RLS** tienen algún error que permita acceso cruzado entre tenants,
   o que bloquee accidentalmente a un usuario legítimo (owner/cliente/demo_viewer)?
   Prestá atención a recursión, `USING` vs `WITH CHECK`, y al gate de suscripción.
3. ¿El **gate de suscripción** (fail-open cuando no hay fila; superadmin bypass; owner
   ve billing pero no opera) es coherente entre SQL (`subscription_usable`,
   `org_operational_allowed`) y frontend (`subscriptionState`, `orgAccessFor`)?
4. ¿El **bootstrap** (backfill + verificación) es seguro e idempotente? ¿La estrategia
   de **baseline** para una base legacy sin historial de migraciones es correcta, o
   `supabase db push` podría fallar/duplicar algo?
5. ¿Las migraciones en `migrations/` son realmente **aditivas e idempotentes** y NO
   recrean tablas legacy ni activan RLS ni hacen backfill?
6. ¿`save_routine` (transaccional) y el arreglo de `payments` tienen algún riesgo con
   tipos de columnas o concurrencia?
7. Riesgos que deba verificar contra el **esquema real** antes de correr nada
   (nombres/tipos de columnas, `payments.period` numérico, `routine_exercises.weight_amount`,
   inserción en `auth.users` en los tests de aislamiento).
8. Cualquier problema de seguridad, PWA/SPA, o de la resolución de tenant/branding.

Dame una lista priorizada de hallazgos (bloqueantes / importantes / menores) con la
corrección concreta para cada uno.
