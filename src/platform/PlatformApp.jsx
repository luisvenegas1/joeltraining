import { useState } from "react";
import { STYLES } from "../johel-training.styles";
import { usePlatformApp } from "./usePlatformApp";
import { PlatformPanel } from "./PlatformPanel";
import { PasswordField } from "../auth/PasswordField";

// Login PROPIO del panel (branding "Tito Apps", sin branding de ningún tenant).
function PlatformLogin({ onSubmit, formError }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try { await onSubmit(email.trim(), pw); } finally { setBusy(false); }
  }
  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <img src="/brand/tito-training.png" alt="Tito Apps" style={{ width: 96, height: 96, objectFit: "contain", display: "block", margin: "0 auto 8px" }} />
          <div className="login-brand">Tito Apps</div>
          <div className="login-sub">Panel de Plataforma</div>
        </div>
        {formError && <div className="err">⚠ {formError}</div>}
        <form onSubmit={submit}>
          <div className="fg"><label>Correo</label><input className="inp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="username" /></div>
          <div className="fg"><label>Contraseña</label><PasswordField value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></div>
          <button className="btn btn-p btn-full" type="submit" style={{ marginTop: 8 }} disabled={busy}>{busy ? "Ingresando…" : "Ingresar →"}</button>
        </form>
      </div>
    </div>
  );
}

function CenteredCard({ icon, title, detail, action }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, background: "#0B1F4B", color: "#fff", padding: 24, textAlign: "center", fontFamily: "'Barlow',sans-serif" }}>
      <div style={{ fontSize: 42 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", maxWidth: 400 }}>{detail}</div>
      {action}
    </div>
  );
}

// Punto de entrada del Panel de Plataforma. Gating por platform_admins.
export default function PlatformApp() {
  const app = usePlatformApp();

  if (app.status === "loading") {
    return (<><style>{STYLES}</style><CenteredCard icon="🛰️" title="Tito Apps" detail="Verificando acceso de plataforma…" /></>);
  }
  if (app.status === "anonymous") {
    return (<><style>{STYLES}</style><PlatformLogin onSubmit={app.signIn} formError={app.formError} /></>);
  }
  if (app.status === "unauthorized") {
    return (<><style>{STYLES}</style><CenteredCard
      icon="⛔"
      title="Acceso no autorizado"
      detail="Este panel es exclusivo de la administración de la plataforma. Tu cuenta no tiene permisos de superusuario."
      action={<div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-p" onClick={() => { window.location.href = "/"; }}>Ir a la app</button>
        <button className="btn btn-g" onClick={app.signOut}>Cerrar sesión</button>
      </div>}
    /></>);
  }
  return (<><style>{STYLES}</style><PlatformPanel onLogout={app.signOut} /></>);
}
