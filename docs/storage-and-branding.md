# Storage y branding dinámico

## Branding

- `src/branding/branding.js`: `JOHEL_BRANDING` (valores actuales de Johel, fallback),
  `NEUTRAL_BRANDING` (para otros tenants, **no** filtra la marca de Johel) y
  `resolveBranding(settings, base)` que combina `organization_settings` sobre la base.
- `src/branding/BrandingContext.jsx`: contexto con **default = Johel**. Sin provider
  o en modo legacy, la app se ve **idéntica a hoy** (cero riesgo).
- La UI (`Logo`, `LoginPage`, `Sidebar`, `AppFooter`) lee de `useBranding()`.
- El `TenantProvider` inyecta el branding del tenant resuelto cuando el multi-tenant
  está encendido; en legacy inyecta Johel.

Johel conserva su apariencia por doble vía: branding migrado en `organization_settings`
(en el bootstrap de Johel) **y** fallback a `JOHEL_BRANDING` si faltara algún campo.

## Storage

Buckets (`supabase/cutover/storage.sql`, manual):

| Bucket | Público | Uso |
|--------|---------|-----|
| `org-logos` | sí | logo de la organización (branding visible pre-login) |
| `trainer-photos` | sí | foto del entrenador (branding) |
| `avatars` | **no** | fotos de perfil de clientes (privadas) |

- Convención de ruta: `<organization_id>/<client_id | 'org'>/<archivo>`.
- Policies por ruta (`cutover/storage.sql`): logos/trainer-photos lectura pública, escritura owner/
  trainer de la org; avatars privado, lectura/escritura por miembro de la org o el
  propio cliente. **Los avatars de clientes NO quedan públicos.**
- `src/storage/storage.js`: `uploadLogo`, `uploadTrainerPhoto`, `uploadAvatar`
  (privado, con URL firmada) y `resolveAvatarSrc(user)`.

## Fotos legacy (fallback)

`resolveAvatarSrc(user)` = `user.avatarUrl` (Storage) → `localStorage['jh_photo_'+id]`
(legacy) → `null`. Así las fotos actuales **no desaparecen**.

- Migración `0013` agrega `users.avatar_url` (nullable).
- Importante: `userToDb` **no** persiste `avatar_url` todavía (para no romper el
  guardado si la columna no existe). Se conecta la escritura al aplicar `0013`.
  Las imágenes nuevas ya están **preparadas** para Storage vía `storage.js`.
