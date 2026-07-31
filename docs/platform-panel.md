# Panel de Plataforma (Tito Apps)

Panel administrativo **global** accesible únicamente por el superusuario de la
plataforma (registrado en `public.platform_admins`). Está separado por completo
de los paneles de entrenador y de cliente: se sirve bajo la ruta `/platform` y no
depende del subdominio/slug de ningún tenant.

> Preproducción: nada remoto se ejecuta automáticamente. Las migraciones y la
> Edge Function quedan **listas** para que las apliqués vos.

---

## 1. Seguridad (resumen)

- El acceso se basa en `platform_admins`, **nunca** en un email hardcodeado ni
  en ocultar enlaces del frontend. El link "Plataforma" del sidebar solo aparece
  para superadmins, pero el acceso real se **re-valida** en `/platform` con
  `loadIsSuperadmin()` (consulta `platform_admins` filtrando por `auth.uid()`).
- Usuarios normales, entrenadores, `demo_viewer` y clientes que entren por URL a
  `/platform` ven **"Acceso no autorizado"**.
- El `service_role` **no** se expone en Vite / `VITE_*` / navegador / repo. Vive
  solo dentro de la Edge Function `platform-admin`.
- Toda operación privilegiada (crear org, invitar owner, cambiar suscripción,
  suspender/reactivar, registrar pago, branding) pasa por la Edge Function, que
  **verifica el JWT del caller y que esté en `platform_admins`** antes de actuar.
- Cada acción sensible se registra en `platform_audit_log` (sin secretos).

---

## 2. Módulos del panel

1. **Dashboard**: organizaciones por estado (activas/prueba/pago pendiente/
   suspendidas/canceladas/sin suscripción), totales de miembros y clientes,
   suscripciones próximas a vencer o vencidas, pagos manuales recientes y accesos
   rápidos (nueva organización / registrar pago). No inventa MRR.
2. **Organizaciones**: tabla con búsqueda y filtros (nombre, slug, owner, tipo,
   plan/estado, conteos, fecha) y acciones ver / suspender / reactivar. El detalle
   permite editar organización, suscripción, pagos, branding y ver historial.
3. **Nueva organización**: formulario con slug único validado; crea org → invita
   owner (por correo, sin contraseñas manuales) → membresía owner → suscripción
   inicial → branding. Idempotente: reintentar no duplica datos.
4. **Suscripciones**: cambiar plan/estado (`trial|active|past_due|suspended|
   canceled`), fechas de vencimiento y gracia, notas internas; suspender/reactivar.
   La demo (`tenant_type='demo'`) no se puede bloquear.
5. **Pagos**: registra pagos manuales de plataforma (tabla separada de la legacy
   `payments` de clientes) y, opcionalmente, activa la suscripción.
6. **Branding**: edita nombre visible, logo y colores usando
   `organization_settings`, con vista previa. El logo se puede **subir como
   archivo** (se guarda en el bucket público `org-logos` de Supabase Storage) o
   pegar una URL. En el alta de organización, el archivo se sube después de crear
   la org (ya con su `organization_id`).
7. **Auditoría**: registro de acciones sensibles con responsable, acción, org,
   fecha y metadatos seguros.

---

## 3. Archivos

Frontend (nuevo, en `src/platform/`):

- `platformLogic.js` — lógica pura (slug, validaciones, transiciones de
  suscripción, idempotencia del alta, agregados del dashboard). **Con tests.**
- `platformAccess.js` / `platformRoute.js` — acceso y ruta `/platform`. **Con tests.**
- `platformApi.js` — lecturas directas (anon+JWT) y `invokePlatform()` para la
  Edge Function.
- `usePlatformApp.js` — hook de acceso (sesión → `platform_admins`).
- `PlatformApp.jsx` — gating (login propio / no autorizado / panel).
- `PlatformPanel.jsx` — UI de todos los módulos.

Wiring:

- `src/main.jsx` — ruta `/platform/*` → `PlatformApp` (separada del tenant).
- `src/johel-training-app.jsx` — pasa `isSuperadmin` a `MainApp`/`Sidebar`.
- `src/johel-training.ui.jsx` — link "🛰️ Plataforma" solo si `isSuperadmin`.

Backend:

- `supabase/migrations/0019_platform_payments.sql` — `platform_payments` +
  columnas `admin_notes`, `started_at` en `organization_subscriptions` + policy
  superadmin.
- `supabase/migrations/0020_platform_audit_log.sql` — `platform_audit_log` +
  policy superadmin + RPC `log_platform_action`.
- `supabase/migrations/0021_platform_admin_reads.sql` — SELECT transversal del
  superadmin sobre `organization_members`, `profiles`, `users`, `routines`.
- `supabase/functions/platform-admin/index.ts` — Edge Function segura.

---

## 4. Cómo aplicar (pasos manuales)

Todas las migraciones son **aditivas e idempotentes** y **no activan RLS**.

### 4.1 Migraciones

```bash
# desde la raíz del repo, con Supabase CLI enlazado a tu proyecto
supabase db push
# (aplica 0019, 0020, 0021 junto con las anteriores ya aplicadas)
```

O corré manualmente `0019`, `0020`, `0021` en el SQL Editor, en orden.

### 4.2 Edge Function

```bash
supabase functions deploy platform-admin

# Secretos (NO commitear): el service_role vive solo aquí.
supabase secrets set \
  PROJECT_URL="https://<tu-proyecto>.supabase.co" \
  SERVICE_ROLE_KEY="<tu service_role key>" \
  ANON_KEY="<tu anon/publishable key>"
```

### 4.3 Registrar tu usuario como superadmin (si aún no lo está)

```sql
insert into public.platform_admins (user_id)
values ('<tu-auth-user-uuid>')
on conflict (user_id) do nothing;
```

Verificalo directamente (en el SQL Editor `auth.uid()` es null; consultá por id):

```sql
select * from public.platform_admins where user_id = '<tu-auth-user-uuid>';
```

### 4.4 Usar el panel

- La app debe correr con `VITE_AUTH_MODE=supabase` (preproducción).
- Entrá a **`https://trainingapp.tito-apps.com/platform`** (subdominio neutral del
  panel; ver `docs/dominios-vercel.md`). También funciona en cualquier host + `/platform`.
- Iniciá sesión con tu cuenta superadmin.
- El sidebar del panel de entrenador también muestra "🛰️ Plataforma" solo si sos
  superadmin.

### 4.5 Storage para logos (subir archivo)

El logo se puede subir como archivo al bucket público `org-logos`. Ese bucket y sus
policies se crean con `supabase/cutover/storage.sql` (operación manual). La policy
de escritura ya incluye al superadmin (`is_superadmin()`), para que puedas subir
logos de cualquier organización desde el panel cuando se active RLS. En
preproducción (RLS apagado) funciona sin más.

---

## 5. Notas de diseño

- **Idempotencia del alta**: `create_organization` reutiliza la org por slug,
  encuentra/invita al owner por email, y hace `upsert` de membresía/suscripción/
  branding. Reintentar tras un fallo parcial completa solo lo que falta, sin
  duplicar. La respuesta incluye `steps` indicando qué se hizo.
- **Sin contraseñas manuales**: el owner se crea por invitación por correo
  (`inviteUserByEmail`). El panel nunca muestra ni guarda contraseñas.
- **Demo protegida**: `set_subscription`/`suspend` rechazan bloquear una org
  `tenant_type='demo'`.
- **Separación de pagos**: `platform_payments` (suscripción de la org a la
  plataforma) es una tabla distinta de la legacy `payments` (clientes del
  entrenador).
- **RLS**: sigue **apagado** por decisión de preproducción. Las policies de las
  tablas nuevas y las lecturas del superadmin quedan definidas para cuando se
  active; el frontend no depende de RLS para identificar el rol.

---

## 6. Tests

`src/platform/platformLogic.test.js` y `platformAccess.test.js` cubren:

- acceso exclusivo de platform_admin y bloqueo de usuario normal;
- validación de slug único (y normalización/ reservados);
- validación del alta de organización;
- idempotencia (reintento no deja datos duplicados / completa lo que falta);
- transiciones de suscripción (suspender/reactivar) y activación por pago;
- la demo permanece disponible (no se puede suspender);
- validación de registro de pago;
- clasificación del dashboard y suscripciones por vencer.

Ejecutar: `npm run lint && npx vitest run && npx vite build`.
