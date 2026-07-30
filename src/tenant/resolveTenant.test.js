import { describe, it, expect } from "vitest";
import { slugFromHostname, slugFromPath, resolveTenantSlug, usesPathResolution } from "./resolveTenant";

describe("slugFromHostname", () => {
  it("resuelve Johel por subdominio", () => {
    expect(slugFromHostname("joheltraining.titoapps.com")).toBe("joheltraining");
  });
  it("resuelve la demo por subdominio", () => {
    expect(slugFromHostname("titotrainer.titoapps.com")).toBe("titotrainer");
  });
  it("resuelve un futuro tenant Bruno", () => {
    expect(slugFromHostname("brunotraining.titoapps.com")).toBe("brunotraining");
  });
  it("apex no es un tenant", () => {
    expect(slugFromHostname("titoapps.com")).toBeNull();
    expect(slugFromHostname("www.titoapps.com")).toBeNull();
  });
  it("localhost no resuelve por hostname", () => {
    expect(slugFromHostname("localhost")).toBeNull();
  });
  it("dominio personalizado no adivina slug (lo maneja custom_domains)", () => {
    expect(slugFromHostname("app.brunofitness.com")).toBeNull();
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
  it("apex, www, localhost, *.local y *.vercel.app resuelven por ruta", () => {
    expect(usesPathResolution("titoapps.com")).toBe(true);
    expect(usesPathResolution("www.titoapps.com")).toBe(true);
    expect(usesPathResolution("localhost")).toBe(true);
    expect(usesPathResolution("mi-maquina.local")).toBe(true);
    expect(usesPathResolution("joeltraining-git-main-tito.vercel.app")).toBe(true);
    expect(usesPathResolution("joeltraining.vercel.app")).toBe(true);
  });
  it("subdominios de plataforma y hosts desconocidos NO resuelven por ruta", () => {
    expect(usesPathResolution("titotrainer.titoapps.com")).toBe(false);
    expect(usesPathResolution("random.example.com")).toBe(false);
    expect(usesPathResolution("app.brunofitness.com")).toBe(false);
  });
});

describe("resolveTenantSlug — SEGURIDAD y previews", () => {
  it("host desconocido NUNCA cae a Johel", () => {
    expect(resolveTenantSlug({ hostname: "random.example.com", pathname: "/joheltraining" })).toBeNull();
    expect(resolveTenantSlug({ hostname: "app.brunofitness.com", pathname: "/" })).toBeNull();
  });
  it("subdominio de plataforma gana sobre la ruta", () => {
    expect(
      resolveTenantSlug({ hostname: "titotrainer.titoapps.com", pathname: "/joheltraining" })
    ).toBe("titotrainer");
    expect(resolveTenantSlug({ hostname: "joheltraining.titoapps.com", pathname: "/" })).toBe("joheltraining");
  });
  it("preview de Vercel resuelve por ruta", () => {
    expect(
      resolveTenantSlug({ hostname: "joeltraining-abc123.vercel.app", pathname: "/titotrainer" })
    ).toBe("titotrainer");
    expect(
      resolveTenantSlug({ hostname: "joeltraining.vercel.app", pathname: "/joheltraining/dashboard" })
    ).toBe("joheltraining");
  });
  it("apex titoapps.com resuelve por ruta", () => {
    expect(resolveTenantSlug({ hostname: "titoapps.com", pathname: "/joheltraining" })).toBe("joheltraining");
    expect(resolveTenantSlug({ hostname: "www.titoapps.com", pathname: "/titotrainer" })).toBe("titotrainer");
  });
  it("apex/vercel sin ruta válida → null (o default explícito), nunca Johel", () => {
    expect(resolveTenantSlug({ hostname: "titoapps.com", pathname: "/" })).toBeNull();
    expect(resolveTenantSlug({ hostname: "joeltraining.vercel.app", pathname: "/assets/x.js" })).toBeNull();
    expect(
      resolveTenantSlug({ hostname: "titoapps.com", pathname: "/" }, { defaultSlug: "titotrainer" })
    ).toBe("titotrainer");
  });
  it("dev (localhost) usa la ruta; sin ruta usa default explícito", () => {
    expect(resolveTenantSlug({ hostname: "localhost", pathname: "/joheltraining" })).toBe("joheltraining");
    expect(resolveTenantSlug({ hostname: "localhost", pathname: "/" })).toBeNull();
    expect(
      resolveTenantSlug({ hostname: "localhost", pathname: "/" }, { defaultSlug: "titotrainer" })
    ).toBe("titotrainer");
  });
});
