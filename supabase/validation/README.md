# supabase/validation — validaciones MANUALES (solo lectura)

No son migraciones; `supabase db push` no las aplica. Se corren a mano en el SQL
Editor para decidir go/no-go, sin modificar datos.

| Archivo | Qué verifica | Cuándo |
|---------|--------------|--------|
| `pre_rls.sql` | Registros sin `organization_id`, duplicados, huérfanos referenciales | **Antes** de activar RLS (`cutover/enable_rls.sql`). Si algo crítico falla → **no-go**. |

Pruebas de aislamiento relacionadas: `tests/rls/isolation_test*.sql`.
