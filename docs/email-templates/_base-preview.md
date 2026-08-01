# Plantillas de correo (Supabase Auth + Resend)

Estas plantillas se pegan en **Supabase → Authentication → Email Templates**.
Usan las variables de Supabase (`{{ .ConfirmationURL }}`, `{{ .Email }}`, etc.).

Archivos:
- `reset-password.html` → template **Reset Password** (¿olvidaste tu contraseña?)
- `invite.html` → template **Invite user** (alta de owner/entrenador desde el panel)
- `confirm-signup.html` → template **Confirm signup** (confirmar cuenta nueva)
- `magic-link.html` → template **Magic Link** (acceso por enlace, si se usa)

> Nota multi-tenant: los templates de Supabase Auth son **globales del proyecto**
> (no por tenant). Por eso el branding es neutro "Tito Apps". Si en el futuro
> querés correos con el logo de cada entrenador, hay que enviarlos con una Edge
> Function + la API de Resend (no el envío integrado de Supabase Auth).

Paleta: navy `#0B1F4B`, azul `#1A5DC8`, texto `#334155`, gris `#64748B`.
