# Supabase Auth y migración de cuentas legacy

## Flujo objetivo

```
auth.user  →  profiles  →  organization_members  →  organizations
```

- Login por `signInWithPassword` (o magic link). Sin hashes en el navegador.
- Sesión restaurada por Supabase (`getSession` + `onAuthStateChange`).
- Rol y membresía se leen de `organization_members` **con RLS** (no de localStorage).
- Clientes: fila en `users` con `auth_user_id` → su cuenta Auth. Pueden existir
  **sin** cuenta hasta ser invitados.

## Modo controlado por variable (CONECTADO)

`VITE_AUTH_MODE` selecciona el login **realmente conectado** en `src/johel-training-app.jsx`:

- `legacy` (default) → login actual (usuario/contraseña). La app funciona **igual que hoy**.
- `supabase` → login por Supabase Auth. `App` renderiza `SupabaseApp`, que:
  1. restaura la sesión (`getSession`) y escucha `onAuthStateChange`;
  2. carga membresías y perfil de cliente **bajo RLS** (solo lo propio);
  3. resuelve el acceso contra el tenant (hostname/slug) con `resolveAccess`
     (`src/auth/resolveAccess.js`, puro y testeado);
  4. determina rol: `owner` / `trainer` / `demo_viewer` / `client`;
  5. hace **logout real** (`sb.auth.signOut`);
  6. **no** descarga hashes ni todos los usuarios antes del login.

No se elimina el modo legacy ni se activa Supabase automáticamente.

Pantallas de error (`src/auth/AuthScreens.jsx`): sesión inválida, sin membresía,
organización incorrecta (ej. usuario de Johel en el hostname de Tito), organización
suspendida, organización inexistente. `demo_viewer` ve un banner de solo lectura y
las acciones destructivas quedan deshabilitadas (además de bloqueadas por RLS).

Módulos: `src/auth/authClient.js` (sesión/login/logout/membresías),
`src/auth/useSupabaseAuth.js` (orquestación), `src/auth/resolveAccess.js` (decisión pura),
`src/auth/permissions.js` + `PermissionsContext.jsx` (UX; la seguridad real es RLS).

## Creación/invitación de usuarios (NUNCA con service_role en el frontend)

Dos caminos equivalentes, ambos server-side:

1. **Edge Function** `supabase/functions/admin-users/` — verifica que el que llama
   sea `owner` de la org y recién ahí usa `service_role` para crear/invitar.
2. **Script admin** `scripts/create-user.mjs` — para correr localmente con
   `SUPABASE_SERVICE_ROLE_KEY` en el entorno.

Ambos: crean/invitan el usuario Auth, upsert de `profiles`, alta en
`organization_members`, y (opcional) `users.auth_user_id = <nuevo>` para vincular
un cliente legacy existente.

## Migración de los usuarios actuales de Johel

No se borra nada del legacy (usernames, hashes, datos). Estrategia:

1. **Conservar** las filas `users` actuales (ya vinculadas a Johel por el backfill).
2. Para cada persona que deba autenticarse (entrenador y clientes con acceso):
   - Invitar por email con la Edge Function/script → crea `auth.users` + `profiles`.
   - Vincular: `users.auth_user_id = <auth uid>` (o `organization_members` para staff).
3. **Compatibilidad temporal**: mientras no todos migren, la app legacy sigue
   funcionando con la clave anon y RLS **desactivado**. El corte a Auth + RLS
   (`cutover/enable_rls.sql`) se hace cuando los usuarios necesarios estén vinculados.
4. La compatibilidad legacy **nunca** debe permitir saltarse el aislamiento: por
   eso RLS se activa recién al final, y a partir de ahí todo pasa por Auth.

## Orden seguro SIN ventana de bloqueo

Punto crítico: las variables `VITE_*` se hornean en el **build**, así que cambiarlas
requiere un **deployment nuevo, terminado y verificado**. Por eso el frontend en
producción debe estar **ya usando Supabase Auth (con RLS todavía apagado)** ANTES de
activar RLS. Si se activara RLS primero, el frontend legacy publicado dejaría de poder
leer `users` y Johel quedaría bloqueado hasta que termine el deploy. El flip de
variables **no es una acción inmediata**: exige deploy completado y verificado antes de
habilitar RLS.

```
1. Backup verificado (ya existe) → `db push` de esquema REALMENTE aditivo
   (`0001,0002,0004–0008,0013,0014,0015`; SIN backfill, SIN RLS).
2. **Bootstrap manual y verificado de Johel** + suscripción activa, en DOS pasos:
   `supabase/cutover/bootstrap_johel_preflight.sql` (SOLO LECTURA: revisar/aprobar) →
   `supabase/cutover/bootstrap_johel_apply.sql` (backfill + verificación de 0 huérfanos
   DENTRO de la transacción, antes del COMMIT). Luego `supabase/cutover/storage.sql`.
3. Crear/vincular TODOS los usuarios Auth necesarios (owner de Johel + clientes).
4. **Bootstrap del primer superadmin**: tras crear/vincular tu usuario Auth, insertar
   tu UUID en `platform_admins` vía SQL Editor / service role (NUNCA desde el navegador):
   `insert into public.platform_admins(user_id) values ('<TU_AUTH_UUID>') on conflict do nothing;`
   Verificación en el SQL Editor (directa; `is_superadmin()` NO sirve acá porque
   `auth.uid()` es NULL sin JWT):
   `select exists (select 1 from public.platform_admins where user_id = '<TU_AUTH_UUID>') as registrado;` → `true`.
   Verificación REAL de `public.is_superadmin()`: desde la app o una prueba autenticada
   con el JWT de ese usuario → `true`.
5. Probar Auth en PREVIEW con RLS APAGADO
   (VITE_AUTH_MODE=supabase, VITE_MULTITENANT=on, VITE_DEFAULT_TENANT_SLUG=joheltraining).
6. Configurar PRODUCCIÓN: `VITE_AUTH_MODE=supabase`, `VITE_MULTITENANT=on`, `VITE_AVATAR_URL_ENABLED=on`.
7. Desplegar y verificar que producción con login Supabase está ACTIVA y funcionando
   MIENTRAS RLS SIGUE APAGADO. Confirmar login owner/trainer + un cliente, resolución
   de Johel. Correr `supabase/validation/pre_rls.sql`.
8. [checklist go/no-go] Activar RLS a mano: `supabase/cutover/enable_rls.sql`.
9. Ejecutar INMEDIATAMENTE las pruebas de aislamiento y smoke tests autenticados.
```

Cuando RLS se active (paso 7), el frontend publicado ya usa Supabase Auth y no
depende del login legacy → no existe el momento "RLS on + solo login legacy".

## Checklist go/no-go ANTES del paso 7 (activar RLS)

Todos deben cumplirse; si alguno falla → **no-go** (no activar RLS):

- [ ] deployment con Auth **ya activo** en producción (paso 5 verificado);
- [ ] el **owner de Johel** puede iniciar sesión;
- [ ] al menos **un cliente de Johel** puede iniciar sesión;
- [ ] existen `profiles`, `organization_members` y el vínculo `users.auth_user_id`;
- [ ] el **primer superadmin** existe en `platform_admins` (verificado en SQL Editor con
      `select exists(select 1 from platform_admins where user_id='<UUID>')` = `true`);
- [ ] `public.is_superadmin()` da `true` **desde la app/prueba autenticada** con el JWT de ese usuario;
- [ ] la **suscripción de Johel** existe y está `active`;
- [ ] **Johel resuelve** correctamente (branding y datos propios);
- [ ] **`validation/pre_rls.sql` sin registros huérfanos** ni relaciones inválidas;
- [ ] el **seed demo NO** se ejecutó todavía en producción;
- [ ] **backup** disponible;
- [ ] **operador preparado para rollback** (procedimiento a mano).

## Rollback si el login Auth falla después del corte

Orden canónico (primero la base, luego variables, luego deploy):

```
1. Desactivar RLS en la base de datos:
     alter table <t> disable row level security;   -- por cada tabla; policies quedan inertes
2. Restaurar variables:  VITE_AUTH_MODE=legacy  y  VITE_MULTITENANT=off
   (y VITE_AVATAR_URL_ENABLED=off).
3. Redeploy del último frontend legacy comprobado.
```

El paso 1 va primero para que, apenas termine el redeploy legacy (paso 3), la clave
anon pueda volver a leer `users` sin bloqueo. Ningún dato se pierde (todo fue aditivo).

Alternativa sin rollback completo: mantener `supabase` + RLS y corregir el vínculo del
usuario (`users.auth_user_id`, `organization_members`) con el script admin en caliente.

## Bloqueos externos (requieren tu autorización / credenciales)

- Desplegar la Edge Function (`supabase functions deploy admin-users`).
- Configurar `SERVICE_ROLE_KEY` como secreto del proyecto (nunca en el repo).
- Crear/invitar usuarios reales (necesita service_role).
- Activar RLS y hacer el cutover del login.
