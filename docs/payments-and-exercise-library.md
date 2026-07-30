# Pagos y biblioteca de ejercicios (Fase 2)

## Pagos — corrección del bug

**Antes:** los pagos se guardaban dentro del objeto `client.payments`, pero
`userToDb` no persiste ese campo → los pagos se perdían al recargar. La tabla
`payments` existía pero la app nunca la cargaba.

**Ahora:** la tabla `payments` es la fuente de verdad.

- `App` carga `getPayments()` y expone `payments` + `setPayments` (con **rollback**:
  si falla la persistencia, revierte el estado).
- `PaymentModule` recibe `payments`/`setPayments`, filtra por `client.id` y
  escribe en la tabla real. El plan (`endDate`) del cliente se recalcula desde el
  pago más reciente y se guarda vía `setClient`.
- Guardado en dos pasos con rollback visual: primero el pago, luego el plan; si
  el segundo paso falla, se revierte el cliente para no mostrar datos no guardados.
- Mapeo de columnas: la columna `payments.period` guarda la **cantidad de meses**
  (`months` en el frontend). `end_date ↔ endDate`.
- `organization_id` de un pago lo autocompleta un trigger desde el cliente
  (migración `0004`), así nunca queda huérfano.

Comportamiento visual: idéntico al actual (historial, badges de estado, preview
de vencimiento). Solo que ahora **persiste de verdad**.

## Biblioteca de ejercicios — global vs privada

Una sola tabla `exercises` con dos clases (columnas creadas en `0002`):

| Clase | organization_id | visibility | Editable por trainer |
|-------|-----------------|------------|----------------------|
| Global | `NULL` | `global` | No |
| Privada | `<org>` | `organization` | Sí (su org) |

- `routine_exercises` mantiene **una sola** FK a `exercises` (no se duplica nada).
- Los datos específicos (series, reps, peso, unidad, equipo, superficie, notas,
  orden) siguen en `routine_exercises`; el historial usa snapshots en `workout_logs`.
- Migración `0005`: por defecto **no** promueve nada (Johel conserva sus ejercicios
  como privados). Incluye plantilla **opt-in y reversible** para promover ejercicios
  base a globales conservando los IDs.

### Pendiente para fases siguientes
- El **selector** de ejercicios mostrará global + privados del tenant cuando exista
  contexto de organización en runtime (Fase 7) y RLS (Fase 4). Hoy la app es
  monotenant (Johel) y sigue mostrando todos, sin romperse.
- La restricción "trainer no edita globales" se aplicará por RLS (Fase 4) además
  de en la UI.
