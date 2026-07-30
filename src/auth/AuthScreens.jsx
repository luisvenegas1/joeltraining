import { useState } from "react";
import { useBranding } from "../branding/BrandingContext";

// Spinner de carga de sesión.
export function AuthLoading({ label = "Verificando sesión…" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16, background: "#F4F6FB" }}>
      <div style={{ width: 48, height: 48, border: "4px solid #DDE4F0", borderTop: "4px solid #1A5DC8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: "#6B7A99" }}>{label}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// Login real con Supabase Auth (email + contraseña). No lee usuarios/hashes.
export function SupabaseLogin({ onSubmit, formError }) {
  const brand = useBranding();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(email.trim(), pw);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          {brand.logoUrl && <img src={brand.logoUrl} alt={brand.displayName} style={{ width: 120, height: 120, objectFit: "contain", display: "block", margin: "0 auto 10px" }} />}
          <div className="login-brand">{brand.displayName}</div>
          <div className="login-sub">{brand.tagline}</div>
        </div>
        {formError && <div className="err">⚠ {formError}</div>}
        <form onSubmit={submit}>
          <div className="fg"><label>Correo</label><input className="inp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="username" /></div>
          <div className="fg"><label>Contraseña</label><input className="inp" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></div>
          <button className="btn btn-p btn-full" type="submit" style={{ marginTop: 8 }} disabled={busy}>{busy ? "Ingresando…" : "Ingresar →"}</button>
        </form>
      </div>
    </div>
  );
}

// Pantallas de error de acceso/ sesión.
export function AuthErrorScreen({ kind, slug, onLogout }) {
  const map = {
    no_membership: { icon: "🚫", title: "Sin acceso", detail: "Tu cuenta no pertenece a ninguna organización. Pedile a tu entrenador que te invite." },
    wrong_org: { icon: "⛔", title: "Organización incorrecta", detail: `Tu cuenta no pertenece a “${slug || "esta organización"}”. Iniciá sesión desde la URL de tu organización.` },
    suspended: { icon: "⏸️", title: "Organización suspendida", detail: "Esta organización está temporalmente inactiva. Contactá al administrador." },
    invalid_session: { icon: "🔒", title: "Sesión inválida", detail: "Tu sesión expiró o no es válida. Volvé a iniciar sesión." },
    org_not_found: { icon: "🏋️", title: "Organización no encontrada", detail: "No existe una organización para esta dirección." },
    error: { icon: "⚠️", title: "Algo salió mal", detail: "No se pudo verificar tu sesión. Intentá de nuevo." },
  };
  const m = map[kind] || map.error;
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, background: "#0B1F4B", color: "#fff", padding: 24, textAlign: "center", fontFamily: "'Barlow',sans-serif" }}>
      <div style={{ fontSize: 40 }}>{m.icon}</div>
      <div style={{ fontSize: 19, fontWeight: 800 }}>{m.title}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", maxWidth: 380 }}>{m.detail}</div>
      <button className="btn btn-p" style={{ marginTop: 8 }} onClick={onLogout}>Cerrar sesión</button>
    </div>
  );
}

// Pantalla de organización suspendida (para trainer/cliente/demo de una org bloqueada).
export function SuspendedScreen({ onLogout }) {
  const brand = useBranding();
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, background: "#0B1F4B", color: "#fff", padding: 24, textAlign: "center", fontFamily: "'Barlow',sans-serif" }}>
      <div style={{ fontSize: 42 }}>⏸️</div>
      <div style={{ fontSize: 19, fontWeight: 800 }}>Cuenta suspendida</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", maxWidth: 380 }}>
        El acceso a <strong>{brand.displayName}</strong> está temporalmente suspendido.
        Contactá a tu entrenador o administrador para reactivarlo.
      </div>
      <button className="btn btn-p" style={{ marginTop: 8 }} onClick={onLogout}>Cerrar sesión</button>
    </div>
  );
}

// Pantalla de cuenta/facturación (para el OWNER de una org bloqueada): puede ver su
// estado aunque el acceso operativo esté cortado.
export function BillingScreen({ subscription, onLogout }) {
  const brand = useBranding();
  const s = subscription || {};
  const label = { trial: "Prueba", active: "Activa", past_due: "Pago pendiente", suspended: "Suspendida", canceled: "Cancelada" }[s.status] || (s.status || "—");
  const fmt = (d) => (d ? new Date(d).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" }) : "—");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F6FB", padding: 24, fontFamily: "'Barlow',sans-serif" }}>
      <div style={{ background: "#fff", border: "1px solid #DDE4F0", borderRadius: 16, padding: 28, maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💳</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#0B1F4B" }}>Estado de tu cuenta</div>
        <div style={{ fontSize: 13, color: "#6B7A99", marginBottom: 16 }}>{brand.displayName}</div>
        <div style={{ textAlign: "left", border: "1px solid #DDE4F0", borderRadius: 10, padding: 12, marginBottom: 16 }}>
          {[["Estado", label], ["Plan", s.plan || "—"], ["Vence", fmt(s.current_period_end)], ["Gracia hasta", fmt(s.grace_period_ends_at)]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: "1px solid #EEF1F7" }}>
              <span style={{ color: "#6B7A99" }}>{k}</span><span style={{ fontWeight: 700, color: "#0B1F4B" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#E53935", fontWeight: 700, marginBottom: 4 }}>
          El acceso operativo está bloqueado.
        </div>
        <div style={{ fontSize: 12, color: "#6B7A99", marginBottom: 16 }}>
          Para reactivar tu organización, contactá a <strong>Tito Apps</strong>.
        </div>
        <button className="btn btn-g btn-full" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </div>
  );
}

// Aviso de solo lectura para demo_viewer.
export function DemoBanner() {
  return (
    <div style={{ background: "#F3E5F5", border: "1px solid #E1BEE7", color: "#7B1FA2", borderRadius: 10, padding: "8px 14px", marginBottom: 12, fontSize: 12, fontWeight: 700, fontFamily: "'Barlow',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
      <span>👀</span> Modo demostración — solo lectura. Las acciones que modifican datos están deshabilitadas.
    </div>
  );
}
