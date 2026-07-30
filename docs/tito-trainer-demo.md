# Tito Trainer Demo

Organización de demostración comercial **dentro de la misma plataforma** (mismo
repo, deployment y base). No es una copia ni otra app.

```
name: Tito Trainer Demo
slug: titotrainer
tenant_type: demo
status: active
url deseada: titotrainer.titoapps.com
```

## Datos

Solo **ficticios** (`supabase/seeds/tito_trainer_demo.sql`, idempotente):
8 clientes (activos, por vencer, vencidos), planes variados, pagos, mediciones,
4 rutinas completas, ejercicios privados de la demo, sesiones con progreso de peso.
Sin teléfonos, correos, cédulas, contraseñas ni fotos reales. No copia datos de Johel.

Branding y CTA vienen de `organization_settings` (no hardcodeados):
`tagline='Demo de Tito Apps'`, `call_to_action='¿Querés tu propia plataforma? Contactá a Tito Apps'`.

**Suscripción:** al sembrarse, la demo obtiene una suscripción **activa manual**
(`organization_subscriptions`: `plan='demo'`, `status='active'`, `provider='manual'`,
`on conflict (organization_id) do nothing`). Esto permite que la demo **pase la
validación pre-RLS** (que exige que toda organización tenga fila de suscripción) y que
no quede bloqueada por el gate de suscripción. Es idempotente y solo afecta a
`titotrainer`; **no toca ningún registro de `joheltraining`**.

## Cuenta demo (Auth)

Se crea aparte con la Edge Function `admin-users` o `scripts/create-user.mjs`
(**nunca** con contraseña en el repo):

```
node scripts/create-user.mjs --email demo@titoapps.local \
  --org <UUID de titotrainer> --role demo_viewer --invite
```

- Cambiar credenciales: desde el panel de Supabase Auth o reenviando invitación.
- Reiniciarla: resetear contraseña en Supabase Auth.
- Vincularla: `organization_members(org=titotrainer, user=<uid>, role=demo_viewer)`.

## Permisos `demo_viewer` (reales, no solo botones)

- **RLS**: `can_write_org()` = owner/trainer → `demo_viewer` **no** puede escribir/
  borrar nada (policies `0008`). Puede leer todo lo de la demo.
- **UI**: `src/auth/permissions.js` (`isReadOnly`, `can`) deshabilita acciones
  destructivas como complemento de UX. La seguridad real es RLS.

Puede: ver dashboard, clientes, rutinas, ejercicios, pagos, mediciones,
entrenamientos, filtros y navegación.
No puede: borrar, cambiar branding/miembros, invitar, operar administrativamente,
ni acceder a otra organización.

## Reset seguro

Doble protección:

1. **BD** — función `reset_demo_data(uuid)` (`demo/reset_demo_function.sql`): verifica `tenant_type='demo'`,
   **rechaza** cualquier producción, exige owner de la org, y borra **solo** datos
   scoped a la org demo (no borra la org, settings ni miembros).
2. **App/guard** — `src/demo/resetGuard.js` valida antes de llamar.
3. **Edge Function** `reset-demo` — verifica owner + demo y llama a la función.

Procedimiento de reset:

```sql
select public.reset_demo_data('<UUID de titotrainer>');   -- borra datos demo
-- luego repoblar:
\i supabase/seeds/tito_trainer_demo.sql
```

No se ejecuta automáticamente ni en producción. Un intento sobre Johel u otra org
de producción lanza excepción y no toca nada.
