import { describe, it, expect } from "vitest";
import { resolveBranding, JOHEL_BRANDING, NEUTRAL_BRANDING } from "./branding";

describe("resolveBranding", () => {
  it("sin settings → base Johel (apariencia intacta)", () => {
    const b = resolveBranding(null);
    expect(b.displayName).toBe("Johel Herrera");
    expect(b.tagline).toBe("Strength · Discipline · Evolution");
    expect(b.taglineShort).toBe("Str·Dis·Evo");
    expect(b.logoUrl).toBe(JOHEL_BRANDING.logoUrl);
  });

  it("aplica settings de un tenant sobre base neutra (no filtra Johel)", () => {
    const b = resolveBranding(
      {
        display_name: "Tito Trainer Demo",
        tagline: "Demo de Tito Apps",
        primary_color: "#7B1FA2",
        call_to_action: "¿Querés tu propia plataforma? Contactá a Tito Apps",
      },
      NEUTRAL_BRANDING
    );
    expect(b.displayName).toBe("Tito Trainer Demo");
    expect(b.tagline).toBe("Demo de Tito Apps");
    expect(b.taglineShort).toBe("Dem"); // sin separadores "·", toma las 3 primeras letras
    expect(b.primaryColor).toBe("#7B1FA2");
    expect(b.callToAction).toContain("Tito Apps");
    // No hereda el logo ni el nombre de Johel
    expect(b.logoUrl).toBeNull();
    expect(b.footerName).toBe("Tito Trainer Demo");
  });

  it("un campo faltante usa la base, no revienta", () => {
    const b = resolveBranding({ display_name: "X" }, NEUTRAL_BRANDING);
    expect(b.displayName).toBe("X");
    expect(b.primaryColor).toBe(NEUTRAL_BRANDING.primaryColor);
  });
});
