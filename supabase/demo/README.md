# supabase/demo — operaciones de la DEMO (manuales)

No son migraciones; `supabase db push` no las aplica. Se ejecutan solo al preparar
o mantener **Tito Trainer Demo**, nunca contra los datos de Johel.

| Archivo | Qué hace | Cuándo |
|---------|----------|--------|
| `reset_demo_function.sql` | Crea la función guardada `reset_demo_data(uuid)` que verifica `tenant_type='demo'` y **rechaza producción** | Al preparar la demo (una vez). |

Seed de datos ficticios de la demo: `supabase/seeds/tito_trainer_demo.sql`.
Detalle completo: `docs/tito-trainer-demo.md`.

> La demo se puebla **después** del corte de Johel; nunca automáticamente en producción.
