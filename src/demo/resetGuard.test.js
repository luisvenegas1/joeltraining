import { describe, it, expect } from "vitest";
import { isResettableTenant, assertResettableTenant } from "./resetGuard";

describe("resetGuard — solo demos, nunca producción", () => {
  it("acepta la org demo válida", () => {
    expect(isResettableTenant({ tenant_type: "demo", slug: "titotrainer" })).toBe(true);
    expect(() => assertResettableTenant({ tenant_type: "demo", slug: "titotrainer" })).not.toThrow();
  });
  it("RECHAZA producción (Johel)", () => {
    const johel = { tenant_type: "production", slug: "joheltraining" };
    expect(isResettableTenant(johel)).toBe(false);
    expect(() => assertResettableTenant(johel)).toThrow(/RECHAZADO/);
  });
  it("RECHAZA un demo con slug desconocido", () => {
    expect(isResettableTenant({ tenant_type: "demo", slug: "otro" })).toBe(false);
  });
  it("RECHAZA null / sin tipo", () => {
    expect(isResettableTenant(null)).toBe(false);
    expect(() => assertResettableTenant(null)).toThrow();
  });
});
