# Estado de suscripción por organización

Permite **suspender una organización completa** (coach que cancela, no paga o
termina su prueba) sin borrar datos. Sin Stripe todavía: proveedor `manual`, modelo
y autorización preparados para conectar Stripe después.

## Modelo (`0014_organization_subscriptions.sql`)

`organization_subscriptions` (una por org):

| Campo | Notas |
|-------|-------|
| `organization_id` | único, FK a organizations |
| `plan` | texto (base, …) |
| `status` | `trial` \| `active` \| `past_due` \| `suspended` \| `canceled` |
| `current_period_end` | fin del período actual |
| `grace_period_ends_at` | fin del período de gracia (nullable) |
| `provider` | `manual` (hoy) \| `stripe` (futuro) |
| `provider_customer_id` / `provider_subscription_id` | nullable (Stripe futuro) |
| `created_at` / `updated_at` | timestamps |

`platform_admins(user_id)`: superadmins de Tito Apps (acceso de soporte transversal).

## Reglas de acceso

- **Usable** (puede operar): `status` ∈ {trial, active}, o dentro del `grace_period`.
- **Bloqueada**: suspended/canceled, o past_due fuera de gracia.
- La lógica vive en **dos lugares equivalentes**:
  - SQL: `subscription_usable(org)` y `org_operational_allowed(org)` (`0014`).
  - Front: `src/subscription/subscription.js` (`isUsable`, `orgAccessFor`) — para
    decidir qué pantalla mostrar; **no** es la protección real.

### Qué se bloquea (gate operacional, `0015`)

Las policies de datos **operativos** llevan `and org_operational_allowed(org)`:
`users` (clientes), `exercises` privados, `routines` + árbol, `measurements`,
`payments`, `workout_sessions`, `workout_logs`, `catalogs`. Una org bloqueada **no
puede leer ni escribir** nada de esto — ni el owner, ni trainers, ni clientes.

- Ejercicios **globales** siguen legibles (contenido de plataforma).
- **Superadmin** (`is_superadmin()`) conserva acceso (soporte).
- **Datos de cuenta** (organizations, organization_settings, organization_members,
  `organization_subscriptions`) **no** llevan gate → el owner puede ver su estado.

### Qué ve el usuario (frontend, modo supabase)

Tras autenticar y resolver la membresía, se evalúa la suscripción (`orgAccessFor`):

- `ok` → app normal.
- `billing` (owner de org bloqueada) → **pantalla de cuenta/facturación**
  (`BillingScreen`): estado, plan, vencimiento, gracia + CTA a Tito Apps. Sin acceso
  operativo.
- `suspended` (trainer/cliente/demo de org bloqueada) → **pantalla de suspensión**
  (`SuspendedScreen`).

Nunca "falla en silencio": siempre muestra una pantalla clara. El modo **legacy** no
aplica este gate (se mantiene igual hasta el cutover).

## Administración manual (superadmin)

1. **Bootstrapping** de un superadmin (una vez, con service_role/SQL):
   `insert into platform_admins(user_id) values ('<auth uid>');`
2. **Cambiar estado** — dos vías equivalentes:
   - En la app (superadmin autenticado): función guardada
     `admin_set_subscription(p_org, p_status, p_period_end, p_grace, p_plan)`
     (verifica `is_superadmin()`; rechaza a cualquier otro).
   - Fuera del navegador: `scripts/set-subscription.mjs` (service_role).
     ```
     node scripts/set-subscription.mjs --org <UUID> --status suspended
     node scripts/set-subscription.mjs --org <UUID> --status active --period-end 2026-12-31
     ```
3. Suspender: `--status suspended`. Reactivar: `--status active`. Prueba vencida:
   `--status past_due --grace <fecha>` (usable hasta esa fecha).

## Futuro: webhook de Stripe (no implementado)

Cuando se conecte Stripe, un webhook (Edge Function) mapearía eventos a `status`:

| Evento Stripe | Acción |
|---------------|--------|
| `checkout.session.completed` / `customer.subscription.created` | `status=active`, guardar `provider_customer_id`/`provider_subscription_id`, `provider='stripe'` |
| `customer.subscription.updated` (trialing) | `status=trial` |
| `invoice.payment_failed` | `status=past_due` + `grace_period_ends_at` |
| `customer.subscription.deleted` / impago tras gracia | `status=canceled` o `suspended` |
| pago recuperado | `status=active`, limpiar gracia |

El webhook usaría `service_role` en la Edge Function (nunca en el frontend) y
actualizaría `organization_subscriptions`. La lógica de gate (RLS) **no cambia**:
sigue leyendo `status`/`grace`. No implementar Stripe todavía.

## Rollout

- `0014` (tabla + helpers + admin) y `0015` (policies con gate) son **aditivas** y
  van con las migraciones. El gate solo surte efecto cuando se **activa RLS**
  (`cutover/enable_rls.sql`, manual). Antes del cutover, nada cambia.
- `validation/pre_rls.sql` verifica que **toda org tenga fila de suscripción**.
