import { useState, useEffect } from "react";
import { resolveTenantSlug } from "./resolveTenant";
import { loadTenantBySlug } from "./loadTenant";
import { JOHEL_BRANDING } from "../branding/branding";
import { BrandingContext } from "../branding/BrandingContext";
import { TenantContext } from "./tenantContext";

// El multi-tenant se activa con VITE_MULTITENANT=on (tras migraciones + Auth).
// Mientras esté apagado, la app se comporta EXACTAMENTE como hoy (Johel legacy).
const MULTITENANT = String(import.meta.env.VITE_MULTITENANT || "").toLowerCase() === "on";

export function TenantProvider({ children }) {
  if (!MULTITENANT) {
    // Legacy: sin gating, branding Johel.
    return (
      <TenantContext.Provider value={{ mode: "legacy", slug: "joheltraining", org: null, branding: JOHEL_BRANDING }}>
        <BrandingContext.Provider value={JOHEL_BRANDING}>{children}</BrandingContext.Provider>
      </TenantContext.Provider>
    );
  }
  return <MultiTenant>{children}</MultiTenant>;
}

function MultiTenant({ children }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    (async () => {
      await Promise.resolve(); // asegura que los setState ocurran fuera del render-effect
      const slug = resolveTenantSlug(
        { hostname: window.location.hostname, pathname: window.location.pathname },
        { defaultSlug: import.meta.env.VITE_DEFAULT_TENANT_SLUG }
      );
      if (!slug) {
        if (alive) setState({ loading: false, status: "not_found", slug: null });
        return;
      }
      try {
        const r = await loadTenantBySlug(slug);
        if (alive) setState({ loading: false, ...r });
      } catch {
        if (alive) setState({ loading: false, status: "error", slug });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (state.loading) return <TenantScreen title="Cargando…" />;
  if (state.status !== "ok") {
    return (
      <TenantScreen
        title={state.status === "suspended" ? "Organización suspendida" : "Organización no encontrada"}
        detail={
          state.status === "suspended"
            ? "Esta organización está temporalmente inactiva."
            : `No existe una organización para “${state.slug || window.location.hostname}”.`
        }
      />
    );
  }

  const value = { mode: "tenant", slug: state.slug, org: state.org, branding: state.branding };
  return (
    <TenantContext.Provider value={value}>
      <BrandingContext.Provider value={state.branding}>{children}</BrandingContext.Provider>
    </TenantContext.Provider>
  );
}

function TenantScreen({ title, detail }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, background: "#0B1F4B", color: "#fff", padding: 24, textAlign: "center", fontFamily: "'Barlow',sans-serif" }}>
      <div style={{ fontSize: 34 }}>🏋️</div>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
      {detail && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", maxWidth: 360 }}>{detail}</div>}
    </div>
  );
}
