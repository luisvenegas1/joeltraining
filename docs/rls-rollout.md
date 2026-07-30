# RLS — modelo, policies y orden de activación

## Principio

Aislamiento estricto por organización. Un usuario de un tenant **no** puede
leer ni escribir datos de otro aunque manipule hostname, slug, ids, payloads o
la consola. La autorización vive en la **base** (RLS), no en el frontend.

## Funciones auxiliares (`0007`)

Todas `SECURITY DEFINER` + `search_path=public` + `STABLE`. Al ser DEFINER, leen
`organization_members` **sin** disparar las policies de esa tabla → **no hay
recursión**.

| Función | Devuelve |
|---------|----------|
| `is_org_member(org)` | el usuario Auth es miembro (cualquier rol) de `org` |
| `has_org_role(org, roles[])` | el usuario tiene alguno de esos roles en `org` |
| `can_write_org(org)` | `has_org_role(org, {owner,trainer})` (demo_viewer = false) |
| `current_client_id()` | id de la fila `users` vinculada al Auth actual |
| `shares_org_with(uid)` | comparte organización con otro usuario |
| `client_owns_routine/day/group/session(id)` | propiedad de la cadena de rutina/sesión |

## Matriz de acceso (policies `0008`)

| Rol | Lectura | Escritura |
|-----|---------|-----------|
| owner | toda su organización | toda su organización (+ branding, miembros) |
| trainer | toda su organización | datos de su organización |
| demo_viewer | toda su organización | **ninguna** (solo lectura) |
| cliente | **solo lo suyo** | su perfil, sus sesiones de entrenamiento |
| anónimo | nada | nada |

- **Ejercicios globales** (`visibility='global'`, `organization_id NULL`): legibles
  por cualquier miembro autenticado; **no** modificables por trainers (ninguna
  policy de escritura los alcanza).
- **Ejercicios privados**: solo visibles/editables dentro de su organización.
- Cliente crea/edita **sus** `workout_sessions`/`workout_logs`.

## Separación creación vs activación

1. `0007` helpers.
2. `0008` **crea** las policies (quedan inertes: RLS aún off).
3. `validation/pre_rls.sql` (manual) **valida** (sin huérfanos, sin duplicados).
4. `cutover/enable_rls.sql` (manual) **activa** RLS — GUARD que aborta si hay
   registros sin `organization_id`. Solo tras esto las policies entran en vigor.
5. `cutover/storage.sql` (manual) buckets + policies de Storage.

Nota: `0009/0010/0012` se sacaron de `supabase/migrations/` a carpetas manuales
(`cutover/`, `validation/`) para que `supabase db push` no los aplique. Ver
`docs/migration-baseline.md`.

> No activar `0009` hasta que el **frontend con Supabase Auth ya esté desplegado y
> verificado en producción (con RLS aún OFF)** y los usuarios estén vinculados. Como
> las variables `VITE_*` se hornean en build, activar RLS antes del deploy Auth
> bloquearía a la app legacy (clave anon) hasta terminar ese deploy. Orden completo y
> checklist go/no-go en `docs/auth-and-legacy-migration.md`.

## Prueba de aislamiento

`tests/rls/isolation_test.sql`: transaccional (hace ROLLBACK). Crea 3 tenants
(A prod, B demo, C prod), activa RLS en la tx, simula cada usuario con
`request.jwt.claims` y verifica con `ASSERT`:

- staff A no ve ni escribe datos de B/C (probando ids/org directos);
- `demo_viewer` lee pero no escribe/borra;
- global visible por todos, privado aislado;
- cliente solo ve lo suyo;
- anónimo sin acceso.

## Rollback

Desactivar RLS puntualmente sin borrar policies:

```sql
alter table public.<tabla> disable row level security;
```

Las policies quedan definidas; reactivar es `enable row level security`.
