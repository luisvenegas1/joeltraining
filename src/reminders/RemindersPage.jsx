import { useState, useEffect } from "react";
import { useTenant } from "../tenant/tenantContext";
import { usePermissions } from "../auth/PermissionsContext";
import { PlanGate } from "../plans/PlanGate";
import { getOrgReminderConfig, setOrgReminderConfig } from "../db";
import { Toast } from "../johel-training.ui";

// Configuración de recordatorios de pago (feature Premium). El envío real lo hace
// un proceso de cron en el backend; acá solo se configura por organización.
export function RemindersPage() {
  const tenant = useTenant();
  const orgId = tenant?.org?.id || null;
  const { readOnly } = usePermissions();

  return (
    <div>
      <div className="ph"><div><div className="pt">Recordatorios de pago</div><div className="ps">Avisá a tus clientes antes de que venza su mensualidad</div></div></div>
      <PlanGate feature="payment_reminders">
        <ReminderConfig orgId={orgId} readOnly={readOnly} />
      </PlanGate>
    </div>
  );
}

function ReminderConfig({ orgId, readOnly }) {
  const [enabled, setEnabled] = useState(false);
  const [daysBefore, setDaysBefore] = useState(3);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      await Promise.resolve();
      try {
        const cfg = await getOrgReminderConfig(orgId);
        if (alive) { setEnabled(cfg.enabled); setDaysBefore(cfg.daysBefore); }
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [orgId]);

  async function save() {
    if (readOnly) { setToast({ msg: "Modo demostración: solo lectura", type: "err" }); return; }
    setSaving(true);
    try {
      await setOrgReminderConfig(orgId, { enabled, daysBefore });
      setToast({ msg: "Configuración guardada", type: "ok" });
    } catch (e) { setToast({ msg: "No se pudo guardar: " + (e?.message || e), type: "err" }); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="card" style={{ textAlign: "center", color: "#6B7A99" }}>Cargando…</div>;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <div className="card" style={{ maxWidth: 520, marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 14 }}>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} disabled={readOnly} style={{ width: 18, height: 18 }} />
          <span style={{ fontWeight: 700, color: "#0B1F4B" }}>Activar recordatorios automáticos por email</span>
        </label>
        <div className="fg">
          <label>Enviar cuántos días antes del vencimiento</label>
          <input className="inp" type="number" min={0} max={30} value={daysBefore} onChange={(e) => setDaysBefore(Number(e.target.value))} disabled={readOnly || !enabled} style={{ maxWidth: 120 }} />
        </div>
        <button className="btn btn-p" onClick={save} disabled={saving || readOnly}>{saving ? "Guardando…" : "Guardar"}</button>
      </div>
      <div className="card" style={{ maxWidth: 520, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
        <div style={{ fontWeight: 800, color: "#0B1F4B", marginBottom: 6 }}>Cómo funciona</div>
        Cada día, TrainSync revisa qué clientes tienen su mensualidad por vencer y les envía un email (una sola vez por vencimiento, sin duplicados). Podés desactivar el recordatorio de un cliente puntual desde su ficha. El correo del cliente debe estar cargado.
      </div>
    </div>
  );
}
