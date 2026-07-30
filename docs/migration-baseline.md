# Estrategia de baseline para la base legacy existente

## Situación real

- La base remota **ya tiene** el esquema legacy (`users`, `exercises`, `routines`,
  `routine_days`, `routine_groups`, `routine_exercises`, `measurements`, `payments`,
  `workout_sessions`, `workout_logs`, `catalogs`) **con datos reales**.
- **No** tiene historial de migraciones de Supabase (`supabase migration list --linked`
  muestra todo local, nada aplicado remoto).
- Hay un backup verificado de producción (externo al repo; no se toca).

## Principio del baseline

Las migraciones en `supabase/migrations/` (0001–0008, 0013) son **aditivas** y
**nunca (re)crean las tablas legacy**:

- Tablas **nuevas** (organizations, organization_settings, profiles,
  organization_members) → `create table if not exists`.
- Tablas legacy → **solo** `alter table … add column if not exists` /
  `create or replace function` / `drop … if exists` + `create`.

Por eso **no hace falta un baseline destructivo ni recrear nada**: las migraciones se
aplican *encima* del esquema legacy sin conflicto. El esquema legacy **es** el baseline.

## Qué se sacó de `supabase/migrations/` (no se aplica con `db push`)

| Archivo | Nueva ubicación | Motivo |
|---------|-----------------|--------|
| `0003_seed_johel_backfill.sql` | `supabase/cutover/bootstrap_johel_preflight.sql` (revisar) + `bootstrap_johel_apply.sql` (aplicar) | Crea Johel + **backfill**: dividido en preflight (solo lectura) y apply (mutación + verificación atómica) |
| `0009_rls_enable.sql` | `supabase/cutover/enable_rls.sql` | Activa RLS: es el corte, manual |
| `0010_validations_pre_rls.sql` | `supabase/validation/pre_rls.sql` | Validación manual pre-RLS (solo lectura) |
| `0012_storage.sql` | `supabase/cutover/storage.sql` | Setup de Storage: cutover, manual |
| `0021_reset_demo_function.sql` | `supabase/demo/reset_demo_function.sql` | Operación de demo |

Además: `0005` ya **no** hace los UPDATE de visibilidad (dependen del backfill →
movidos al bootstrap); `0014` ya **no** siembra la suscripción de Johel (se crea en
el bootstrap). `0013_avatar_url.sql`, `0014` y `0015` se **mantienen** en migrations
(aditivos; no activan RLS).

## Cómo registrar/marcar el baseline (revisar ANTES de ejecutar)

> No ejecutar nada de esto automáticamente. Revisar el dry-run primero.

1. **Link** al proyecto (lo hacés vos, con tus credenciales):
   `supabase link --project-ref <REF>`.
2. **Revisar** qué aplicaría, sin ejecutar:
   `supabase db push --dry-run`
   → debe listar **solo**: `0001, 0002, 0004, 0005, 0006, 0007, 0008, 0013, 0014, 0015`.
   **No** debe aparecer el backfill de Johel (`0003` → bootstrap), ni activar RLS
   (`enable_rls`), ni validaciones (`pre_rls`): ya no están en `migrations/`.
3. **Opción A (recomendada) — sin baseline formal:** como las migraciones son
   aditivas/idempotentes, aplicarlas directamente:
   `supabase db push`
   No recrea tablas legacy; solo agrega. Luego, **a mano**: revisar
   `cutover/bootstrap_johel_preflight.sql` (solo lectura) y recién entonces correr
   `cutover/bootstrap_johel_apply.sql` (crea Johel + backfill + suscripción, con
   verificación atómica).
4. **Opción B (baseline formal) — solo si querés que el historial refleje "legacy ya
   existía":** crear una migración baseline no-op que documente el estado legacy y
   marcarla como aplicada **sin ejecutarla**:
   `supabase migration repair --status applied <version_baseline>`
   Nuestras migraciones no lo necesitan (agregan, no recrean); usá `repair` solo si un
   archivo representara estado ya presente.

## Reglas

- No intentar crear de nuevo tablas legacy existentes (ninguna migración lo hace).
- No ejecutar el baseline/migraciones remotas automáticamente: revisar `--dry-run`.
- Mantener las migraciones posteriores aditivas e idempotentes cuando sea posible.
- RLS, validaciones, Storage y demo se corren **a mano** desde sus carpetas, en el
  orden del cutover (`docs/auth-and-legacy-migration.md`).
