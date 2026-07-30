import { describe, it, expect } from "vitest";
import { slugFromHostname, slugFromPath, resolveTenantSlug, usesPathResolution } from "./resolveTenant";

describe("slugFromHostname — familia tito-apps.com (producción real, con guion)", () => {
  it("joeltraining.tito-apps.com → joheltraining (alias de subdominio)", () => {
    expect(slugFromHostname("joeltraining.tito-apps.com")).toBe("joheltraining");
  });
  it("titotrainer.tito-apps.com → titotrainer", () => {
    expect(slugFromHostname("titotrainer.tito-apps.com")).toBe("titotrainer");
  });
  it("apex/www de tito-apps.com → null (por ruta)", () => {
    expect(slugFromHostname("tito-apps.com")).toBeNull();
    expect(slugFromHostname("www.tito-apps.com")).toBeNull();
  });
});

describe("slugFromHostname — familia titoapps.com (soporte futuro, sin guion)", () => {
  it("joeltraining.titoapps.com → joheltraining (alias)", () => {
    expect(slugFromHostname("joeltraining.titoapps.com")).toBe("joheltraining");
  });
  it("joheltraining.titoapps.com → joheltraining (slug directo)", () => {
    expect(slugFromHostname("joheltraining.titoapps.com")).toBe("joheltraining");
  });
  it("titotrainer.titoapps.com → titotrainer", () => {
    expect(slugFromHostname("titotrainer.titoapps.com")).toBe("titotrainer");
  });
  it("brunotraining.titoapps.com → brunotraining (futuro tenant)", () => {
    expect(slugFromHostname("brunotraining.titoapps.com")).toBe("brunotraining");
  });
  it("apex/www → null", () => {
    expect(slugFromHostname("titoapps.com")).toBeNull();
    expect(slugFromHostname("www.titoapps.com")).toBeNull();
  });
});

describe("slugFromHostname — otros hosts", () => {
  it("localhost no resuelve por hostname", () => {
    expect(slugFromHostname("localhost")).toBeNull();
  });
  it("dominio personalizado no adivina slug (lo maneja custom_domains)", () => {
    expect(slugFromHostname("app.brunofitness.com")).toBeNull();
  });
  it("host ajeno → null", () => {
    expect(slugFromHostname("random.example.com")).toBeNull();
  });
});

describe("slugFromPath", () => {
  it("toma el primer segmento", () => {
    expect(slugFromPath("/joheltraining")).toBe("joheltraining");
    expect(slugFromPath("/titotrainer/dashboard")).toBe("titotrainer");
  });
  it("ignora rutas reservadas", () => {
    expect(slugFromPath("/assets/x.js")).toBeNull();
  });
  it("raíz -> null", () => {
    expect(slugFromPath("/")).toBeNull();
  });
});

describe("usesPathResolution", () => {
  it("apex/www de AMBAS familias, localhost, *.local y *.vercel.app resuelven por ruta", () => {
    expect(usesPathResolution("tito-apps.com")).toBe(true);
    expect(usesPathResolution("www.tito-apps.com")).toBe(true);
    expect(usesPathResolution("titoapps.com")).toBe(true);
    expect(usesPathResolution("www.titoapps.com")).toBe(true);
    expect(usesPathResolution("localhost")).toBe(true);
    expect(usesPathResolution("mi-maquina.local")).toBe(true);
    expect(usesPathResolution("joeltraining-git-main-tito.vercel.app")).toBe(true);
    expect(usesPathResolution("joeltraining.vercel.app")).toBe(true);
  });
  it("subdominios de plataforma y hosts desconocidos NO resuelven por ruta", () => {
    expect(usesPathResolution("titotrainer.tito-apps.com")).toBe(false);
    expect(usesPathResolution("joeltraining.tito-apps.com")).toBe(false);
    expect(usesPathResolution("titotrainer.titoapps.com")).toBe(false);
    expect(usesPathResolution("random.example.com")).toBe(false);
    expect(usesPathResolution("app.brunofitness.com")).toBe(false);
  });
});

describe("resolveTenantSlug — producción, previews y seguridad", () => {
  it("PRODUCCIÓN: joeltraining.tito-apps.com → joheltraining (subdominio con alias)", () => {
    expect(resolveTenantSlug({ hostname: "joeltraining.tito-apps.com", pathname: "/" })).toBe("joheltraining");
    // el subdominio gana sobre cualquier ruta
    expect(resolveTenantSlug({ hostname: "joeltraining.tito-apps.com", pathname: "/titotrainer" })).toBe("joheltraining");
  });
  it("demo por subdominio: titotrainer.tito-apps.com → titotrainer", () => {
    expect(resolveTenantSlug({ hostname: "titotrainer.tito-apps.com", pathname: "/" })).toBe("titotrainer");
  });
  it("familia futura titoapps.com también funciona", () => {
    expect(resolveTenantSlug({ hostname: "joeltraining.titoapps.com", pathname: "/" })).toBe("joheltraining");
    expect(resolveTenantSlug({ hostname: "titotrainer.titoapps.com", pathname: "/x" })).toBe("titotrainer");
  });
  it("apex de ambas familias resuelve por ruta", () => {
    expect(resolveTenantSlug({ hostname: "tito-apps.com", pathname: "/joheltraining" })).toBe("joheltraining");
    expect(resolveTenantSlug({ hostname: "www.tito-apps.com", pathname: "/titotrainer" })).toBe("titotrainer");
    expect(resolveTenantSlug({ hostname: "titoapps.com", pathname: "/joheltraining" })).toBe("joheltraining");
  });
  it("preview de Vercel resuelve por ruta", () => {
    expect(resolveTenantSlug({ hostname: "joeltraining-abc123.vercel.app", pathname: "/titotrainer" })).toBe("titotrainer");
    expect(resolveTenantSlug({ hostname: "joeltraining.vercel.app", pathname: "/joheltraining/dashboard" })).toBe("joheltraining");
  });
  it("apex/vercel sin ruta válida → null (o default explícito), nunca Johel", () => {
    expect(resolveTenantSlug({ hostname: "tito-apps.com", pathname: "/" })).toBeNull();
    expect(resolveTenantSlug({ hostname: "joeltraining.vercel.app", pathname: "/assets/x.js" })).toBeNull();
    expect(resolveTenantSlug({ hostname: "tito-apps.com", pathname: "/" }, { defaultSlug: "titotrainer" })).toBe("titotrainer");
  });
  it("host desconocido NUNCA cae a Johel", () => {
    expect(resolveTenantSlug({ hostname: "random.example.com", pathname: "/joheltraining" })).toBeNull();
    expect(resolveTenantSlug({ hostname: "app.brunofitness.com", pathname: "/" })).toBeNull();
  });
  it("dev (localhost) usa la ruta; sin ruta usa default explícito", () => {
    expect(resolveTenantSlug({ hostname: "localhost", pathname: "/joheltraining" })).toBe("joheltraining");
    expect(resolveTenantSlug({ hostname: "localhost", pathname: "/" })).toBeNull();
    expect(resolveTenantSlug({ hostname: "localhost", pathname: "/" }, { defaultSlug: "titotrainer" })).toBe("titotrainer");
  });
});
