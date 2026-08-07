import { usePermissions } from "../auth/PermissionsContext";
import { upsellFor, minPlanFor, PLAN_LABELS } from "./entitlements";

// Gatea contenido por FEATURE del plan. Si el tenant no tiene la feature, muestra
// un upsell en vez del contenido. (La UI gatea; el backend refuerza lo sensible.)
export function PlanGate({ feature, children }) {
  const { features } = usePermissions();
  if (features && features[feature]) return children;
  const min = minPlanFor(feature);
  return (
    <div className="card" style={{ textAlign: "center", padding: 28 }}>
      <div style={{ fontSize: 34, marginBottom: 8 }}>🔒</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#0B1F4B", marginBottom: 6 }}>
        Función del plan {min ? PLAN_LABELS[min] : "superior"}
      </div>
      <div style={{ fontSize: 13, color: "#64748B", maxWidth: 420, margin: "0 auto 4px", lineHeight: 1.55 }}>
        {upsellFor(feature)}
      </div>
      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8 }}>
        Para activarla, mejorá tu plan con <strong>Tito Apps</strong>.
      </div>
    </div>
  );
}
