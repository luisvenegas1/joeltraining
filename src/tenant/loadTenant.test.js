import { describe, it, expect } from "vitest";
import { tenantStatus, brandingBaseFor } from "./loadTenant";
import { JOHEL_BRANDING, NEUTRAL_BRANDING } from "../branding/branding";

describe("tenantStatus", () => {
  it("org inexistente → not_found", () => {
    expect(tenantStatus(null)).toBe("not_found");
    expect(tenantStatus(undefined)).toBe("not_found");
  });
  it("org suspendida/archivada → suspended", () => {
    expect(tenantStatus({ status: "suspended" })).toBe("suspended");
    expect(tenantStatus({ status: "archived" })).toBe("suspended");
  });
  it("org activa → ok", () => {
    expect(tenantStatus({ status: "active" })).toBe("ok");
  });
});

describe("brandingBaseFor — no filtra Johel a otros tenants", () => {
  it("joheltraining usa base Johel", () => {
    expect(brandingBaseFor("joheltraining")).toBe(JOHEL_BRANDING);
  });
  it("otros slugs usan base neutra", () => {
    expect(brandingBaseFor("titotrainer")).toBe(NEUTRAL_BRANDING);
    expect(brandingBaseFor("brunotraining")).toBe(NEUTRAL_BRANDING);
  });
});
