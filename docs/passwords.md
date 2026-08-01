# Contraseñas con Supabase Auth

Con el login por Supabase Auth, la contraseña vive en `auth.users` (gestionada por
Supabase), **no** en la columna `public.users.password` (legacy). Estos tres flujos
lo reflejan:

## 1. Cambio propio desde el perfil
Cada usuario (cliente o entrenador) cambia SU propia contraseña desde su perfil.
Usa `sb.auth.updateUser({ password })` (helper `updateOwnPassword`). En modo legacy
(sin sesión Auth) mantiene el comportamiento viejo. No requiere despliegue.

## 2. Reset de un cliente por el entrenador
El entrenador genera una contraseña nueva para un cliente desde "Editar datos →
Generar contraseña". Ahora pasa por la Edge Function segura
`reset-client-password`, que:

- verifica el JWT del entrenador,
- confirma que sea `owner`/`trainer` de la organización del cliente,
- exige que el cliente tenga `auth_user_id` (cuenta de correo vinculada),
- cambia la contraseña Auth con `service_role`.

Si el cliente todavía no tiene cuenta de correo, la UI avisa que primero hay que
asignarle un correo y crear su acceso.

**Desplegar (manual):** con `--no-verify-jwt` (la función verifica el JWT por
dentro; sin el flag, el gateway rompe la preflight CORS del navegador).
```bash
supabase functions deploy reset-client-password --no-verify-jwt
# usa los mismos secretos ya configurados:
# supabase secrets set PROJECT_URL=... SERVICE_ROLE_KEY=... ANON_KEY=...
```

## 3. "¿Olvidaste tu contraseña?" en el login
Enlace en la pantalla de login que envía el correo de restablecimiento
(`sb.auth.resetPasswordForEmail`). Al hacer clic en el enlace del correo, el
usuario vuelve a la app con una sesión de recuperación (evento `PASSWORD_RECOVERY`)
y ve la pantalla para fijar la nueva contraseña.

**Configuración necesaria (una vez, en Supabase):**
- **Authentication → URL Configuration → Redirect URLs:** agregá las URLs de la app
  para que el enlace del correo pueda volver:
  - `https://joheltraining.tito-apps.com/`
  - `https://trainingapp.tito-apps.com/`  (si usás el panel)
  - `http://localhost:5173/`  (desarrollo)
- **Authentication → Email Templates:** opcionalmente personalizá el correo de
  "Reset Password".
- Con el plan gratis, el envío de correos de Supabase tiene límites; para producción
  conviene configurar un SMTP propio (Auth → SMTP Settings).

## Nota sobre cuentas sin correo
Un cliente solo puede usar estos flujos si tiene una cuenta de correo en Auth
(vinculada por `auth_user_id`). Las cuentas que solo tenían username legacy deben
vincularse primero (ver `supabase/cutover/link_legacy_accounts.sql`).
