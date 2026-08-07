# Auditoría de seguridad — TrainSync (by Tito Apps)

_Fecha: 2026-08-07 · Alcance: app React (frontend), Edge Functions, base de datos Supabase (RLS), manejo de secretos y flujos de autenticación._

Este documento clasifica los hallazgos por severidad (Crítico / Alto / Medio / Bajo / Informativo), indica el estado (✅ mitigado, ⚠️ requiere acción manual, ℹ️ observación) y da la recomendación. No sustituye una auditoría externa formal; es una revisión interna del código actual.

---

## Resumen ejecutivo

El sistema sigue un modelo de seguridad sólido para un SaaS multi-tenant: el aislamiento entre organizaciones se hace en la base de datos con Row Level Security (RLS), no en el frontend; las operaciones privilegiadas viven en Edge Functions que nunca exponen la `service_role` al navegador; y los secretos no están en el repositorio. No se encontraron hallazgos **Críticos abiertos** al cierre de esta revisión. El hallazgo más serio históricamente —una policy "allow all" que anulaba el aislamiento— ya fue detectado y corregido.

| Severidad | Abiertos | Mitigados |
|-----------|:--------:|:---------:|
| Crítico | 0 | 1 |
| Alto | 0 | 3 |
| Medio | 3 | 2 |
| Bajo | 4 | 2 |
| Informativo | — | — |

---

## Crítico

### C-1 · Policy permisiva "allow all" anulaba el aislamiento entre tenants — ✅ MITIGADO
**Descripción:** Varias tablas de datos tenían una policy heredada (`policyname = 'allow all'`, `qual = true`, `roles = {public}`, `cmd = ALL`) que dejaba pasar cualquier fila sin filtrar por `organization_id`. En la práctica un entrenador podía ver datos de otras organizaciones.
**Impacto:** Fuga de datos entre tenants (confidencialidad rota).
**Corrección aplicada:** `supabase/cutover/drop_permissive_policies.sql` elimina en bloque toda policy con `policyname = 'allow all'`; las policies correctas basadas en `is_org_member()` / `can_write_org()` quedan como único control. Verificado con una cuenta de entrenador **no superadmin** (el superadmin ve cross-org por diseño).
**Recomendación:** Antes de cada cutover a producción correr `supabase/validation/rls_readiness_audit.sql` y confirmar que ninguna tabla de datos vuelva a tener una policy `qual = true` para `public`.

---

## Alto

### A-1 · Exposición de `service_role` / secretos al navegador — ✅ MITIGADO
Ninguna clave `service_role`, secreto de Resend, `CRON_SECRET` ni API key privada aparece en el bundle del frontend. El código solo usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (ambas públicas por diseño). Toda operación privilegiada (crear cliente, resetear contraseña, panel de plataforma, envío de recordatorios) vive en Edge Functions donde el `service_role` se lee de `Deno.env` en el servidor. `.env` y `.env.*` están en `.gitignore` (solo se versiona `.env.example`).
**Recomendación:** Mantener la regla de nunca prefijar un secreto con `VITE_`. Considerar un chequeo de CI que falle si aparece `service_role` en `src/`.

### A-2 · Autorización de la función de plataforma basada en tabla, no en email hardcodeado — ✅ MITIGADO
`platform-admin` valida el JWT del llamante y comprueba pertenencia a `platform_admins` (no un email en el código). El acceso de superadmin es data-driven y revocable sin desplegar.
**Recomendación:** Auditar periódicamente las filas de `platform_admins`.

### A-3 · RLS activo en tablas nuevas — ✅ MITIGADO
La tabla nueva `payment_reminder_logs` (migración 0026) se crea con RLS **encendido** y una policy de `select` restringida a `is_superadmin()` o `is_org_member(organization_id)`. La escritura la hace solo la Edge Function con `service_role` (bypassa RLS intencionalmente). No queda abierta al público.
**Recomendación:** Regla permanente: toda tabla nueva con `organization_id` debe encender RLS en su misma migración.

---

## Medio

### M-1 · Envío de recordatorios protegido solo por secreto compartido — ⚠️ ACCIÓN
`send-payment-reminders` se despliega con `--no-verify-jwt` (necesario para el cron) y se protege con el header `x-cron-secret == CRON_SECRET`. Es adecuado, pero si `CRON_SECRET` se filtra, un tercero podría disparar envíos.
**Recomendación:** Usar un `CRON_SECRET` largo y aleatorio (≥32 bytes), rotarlo periódicamente, y —si el proveedor de cron lo permite— restringir por IP de origen. La función ya limita el daño: solo envía a clientes cuya mensualidad vence exactamente en `hoy + días`, y el `UNIQUE` de `payment_reminder_logs` evita reenvíos.

### M-2 · Rate limiting / abuso en Edge Functions — ⚠️ ACCIÓN
Las funciones de invitación y reset de contraseña no tienen límite de tasa propio más allá del de Supabase.
**Recomendación:** Confiar en los límites de Supabase Auth para envíos de email y, si se observa abuso, añadir un contador por IP/entrenador en las funciones `invite-client` / `reset-client-password`.

### M-3 · Validación de entrada del lado servidor — ⚠️ ACCIÓN
La validación de formularios (slug sin espacios, plan como dropdown, email) hoy vive mayormente en el frontend. RLS impide escrituras cross-org, pero no valida formato/valor de cada campo.
**Recomendación:** Añadir `CHECK` constraints donde aplique (p. ej. `plan in ('base','pro','premium')` en la capa de suscripción, `reminders_days_before between 0 and 30`) para defensa en profundidad. El helper `setOrgReminderConfig` ya clampa 0–30 en la capa de datos.

### M-4 · Escapado de HTML en emails — ✅ MITIGADO
El correo de recordatorio construye HTML con el nombre del cliente pasado por `escapeHtml()`, evitando inyección de HTML/atributos en el email.

### M-5 · Cuenta demo de solo lectura — ✅ MITIGADO
El rol `demo_viewer` fuerza `readOnly` en el frontend y las escrituras están bloqueadas; el reset de la demo está protegido (`resetGuard`) para no tocar otros tenants.

---

## Bajo

### B-1 · Columna `users.password` legacy — ⚠️ OBSERVACIÓN
Persiste una columna `password` de la era pre-Supabase-Auth. Ya no se usa para autenticar (el login real es Supabase Auth) y el código no la escribe con claves reales, pero conviene limpiarla.
**Recomendación:** En una migración futura, dejar la columna en `'x'`/null para todos y planificar su eliminación una vez confirmado que nada la lee.

### B-2 · Contenido mixto de logs en consola — ℹ️ INFORMATIVO
Hay `console.log`/`console.warn` de diagnóstico (registro de service worker, fallos no críticos de recordatorio). No filtran secretos.
**Recomendación:** Silenciar o degradar a nivel debug en producción.

### B-3 · `--no-verify-jwt` en varias funciones — ℹ️ INFORMATIVO
Se usa en las funciones que reciben preflight CORS o corren por cron. Cada una implementa su propia autorización (JWT manual, pertenencia a tabla, o `x-cron-secret`). Es correcto, pero requiere disciplina: **desactivar la verificación del gateway obliga a autorizar dentro de la función**.
**Recomendación:** Documentar por función qué control de acceso propio implementa (ver tabla al final).

### B-4 · Cabeceras de seguridad del hosting — ⚠️ ACCIÓN
Conviene fijar cabeceras HTTP en Vercel: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, y una `Content-Security-Policy` acotada a Supabase + el CDN usado.
**Recomendación:** Añadir `vercel.json` con `headers`. (Plantilla incluida al final.)

### B-5 · Tokens de invitación/recuperación en el hash de la URL — ✅ MITIGADO
El flujo captura `window.__authFlow` antes de que supabase-js limpie el hash y fuerza la pantalla de fijar contraseña. Los tokens son de un solo uso y de vida corta (los gestiona Supabase Auth).

---

## Controles de acceso por Edge Function (referencia)

| Función | verify_jwt | Control de acceso propio |
|---------|:----------:|--------------------------|
| `platform-admin` | manual | JWT válido + fila en `platform_admins` |
| `reset-client-password` | manual | JWT del entrenador + pertenencia a la org del cliente |
| `invite-client` | manual | JWT del entrenador + org derivada de su membresía |
| `admin-users` | manual | Superadmin (`platform_admins`) |
| `reset-demo` | manual | Guard de tenant demo (`resetGuard`) |
| `send-payment-reminders` | `--no-verify-jwt` | `x-cron-secret == CRON_SECRET` + org Premium + dedup |

## Plantilla de cabeceras (`vercel.json`)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
      ]
    }
  ]
}
```

## Acciones recomendadas (priorizadas)

1. **(Medio)** Añadir `CHECK` constraints de plan y `reminders_days_before` (M-3).
2. **(Medio)** Rotar y endurecer `CRON_SECRET`; considerar restricción por IP (M-1).
3. **(Bajo)** Agregar `vercel.json` con cabeceras de seguridad (B-4).
4. **(Bajo)** Planificar retiro de `users.password` legacy (B-1).
5. **(Proceso)** Correr `rls_readiness_audit.sql` antes de cada cutover (C-1).
