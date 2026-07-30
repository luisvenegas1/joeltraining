# supabase/cutover — operaciones MANUALES del corte

Estos archivos **NO** son migraciones y **NO** los aplica `supabase db push`.
Se ejecutan a mano, en momentos específicos del cutover, con autorización explícita.

| Archivo | Qué hace | Cuándo se ejecuta |
|---------|----------|-------------------|
| `bootstrap_johel_preflight.sql` | **SOLO LECTURA**: conteos y verificaciones previas (sin BEGIN/UPDATE/INSERT/COMMIT) | **Primero.** Revisar y aprobar manualmente antes del apply. |
| `bootstrap_johel_apply.sql` | Crea Johel + backfill + visibilidad + suscripción, con **verificación de 0 huérfanos DENTRO de la transacción antes del COMMIT** (si falla → excepción → rollback total). Query de estado tras el commit | **Solo tras aprobar el preflight**, con backup + autorización. |
| `storage.sql` | Crea buckets (org-logos, trainer-photos, avatars) + policies de Storage | Durante el cutover, **después** de `0007_rls_helpers` (usa `is_org_member`/`can_write_org`). Antes o junto con activar RLS. Solo afecta Storage, no la app legacy. |

> `bootstrap_johel_legacy_data.sql` quedó **obsoleto/vacío** (dividido en los dos de
> arriba para forzar la pausa de revisión humana). Se puede borrar del repo.
| `enable_rls.sql` | **ACTIVA RLS** en todas las tablas (con GUARD anti-huérfanos) | El "corte". **Solo** después de: migraciones aditivas aplicadas, usuarios Auth vinculados, `validation/pre_rls.sql` sin huérfanos, y **frontend con Supabase Auth ya desplegado y verificado con RLS OFF**. Ver checklist go/no-go en `docs/auth-and-legacy-migration.md`. |

Se sacaron de `supabase/migrations/` a propósito para que un `supabase db push`
inicial **no** los aplique automáticamente.
