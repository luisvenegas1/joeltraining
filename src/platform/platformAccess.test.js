import { describe, it, expect } from "vitest";
import { resolvePlatformAccess } from "./platformAccess";
import { isPlatformPath } from "./platformRoute";

describe("resolvePlatformAccess — acceso exclusivo de platform_admin", () => {
  it("sin sesión → anonymous (login)", () => {
    expect(resolvePlatformAccess({ hasSession: false, isSuperadmin: false })).toBe("anonymous");
    expect(resolvePlatformAccess({ hasSession: false, isSuperadmin: true })).toBe("anonymous");
  });
  it("sesión + platform_admin → authorized", () => {
    expect(resolvePlatformAccess({ hasSession: true, isSuperadmin: true })).toBe("authorized");
  });
  it("usuario normal / entrenador / demo / cliente (no admin) → unauthorized", () => {
    expect(resolvePlatformAccess({ hasSession: true, isSuperadmin: false })).toBe("unauthorized");
  });
});

describe("isPlatformPath — ruta separada del tenant", () => {
  it("reconoce /platform y subrutas", () => {
    expect(isPlatformPath("/platform")).toBe(true);
    expect(isPlatformPath("/platform/")).toBe(true);
    expect(isPlatformPath("/platform/organizations")).toBe(true);
  });
  it("no confunde rutas de tenant", () => {
    expect(isPlatformPath("/")).toBe(false);
    expect(isPlatformPath("/joheltraining")).toBe(false);
    expect(isPlatformPath("/platformx")).toBe(false);
  });
});
