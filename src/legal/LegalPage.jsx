import { STYLES } from "../trainsync.styles";
import { LEGAL_DOCS, LEGAL } from "./legalContent";
import { LEGAL_PATHS } from "./legalRoute";

// Página legal pública (Términos o Privacidad). No depende de tenant ni de sesión.
export default function LegalPage({ doc = "terms" }) {
  const data = LEGAL_DOCS[doc] || LEGAL_DOCS.terms;
  const other = doc === "terms" ? "privacy" : "terms";

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight: "100vh", background: "#F4F6FB", fontFamily: "'Barlow',sans-serif", color: "#1F2933", padding: "24px 16px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", background: "#fff", border: "1px solid #E3E6EA", borderRadius: 16, padding: "28px 26px" }}>
          <a href="/" style={{ color: "#1A5DC8", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>← Volver</a>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0B1F4B", margin: "14px 0 6px" }}>{data.title}</h1>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 18 }}>{LEGAL.platform} · Última actualización: {LEGAL.updated}</div>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: "#334155", marginBottom: 18 }}>{data.intro}</p>
          {data.sections.map((s) => (
            <div key={s.h} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0B1F4B", marginBottom: 4 }}>{s.h}</div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "#334155" }}>{s.p}</p>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #E3E6EA", marginTop: 20, paddingTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href={LEGAL_PATHS[other]} style={{ color: "#1A5DC8", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              {other === "privacy" ? "Ver Política de Privacidad →" : "Ver Términos y Condiciones →"}
            </a>
            <a href="/" style={{ color: "#6B7280", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Volver al inicio</a>
          </div>
        </div>
      </div>
    </>
  );
}
