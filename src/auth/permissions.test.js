import { describe, it, expect } from "vitest";
import { can, isReadOnly, canDelete, canManageMembers, canMutate, ROLE } from "./permissions";

describe("canMutate — quién puede escribir en el panel", () => {
  it("owner y trainer pueden mutar", () => {
    expect(canMutate(ROLE.OWNER)).toBe(true);
    expect(canMutate(ROLE.TRAINER)).toBe(true);
  });
  it("demo_viewer y client NO pueden mutar", () => {
    expect(canMutate(ROLE.DEMO)).toBe(false);
    expect(canMutate(ROLE.CLIENT)).toBe(false);
    expect(canMutate("cualquier")).toBe(false);
  });
});

describe("permissions — demo_viewer no destructivo", () => {
  it("demo_viewer solo lee", () => {
    expect(can(ROLE.DEMO, "read")).toBe(true);
    expect(can(ROLE.DEMO, "write")).toBe(false);
    expect(can(ROLE.DEMO, "delete")).toBe(false);
    expect(can(ROLE.DEMO, "branding")).toBe(false);
    expect(can(ROLE.DEMO, "members")).toBe(false);
    expect(isReadOnly(ROLE.DEMO)).toBe(true);
  });
  it("owner puede todo lo administrativo", () => {
    expect(canManageMembers(ROLE.OWNER)).toBe(true);
    expect(canDelete(ROLE.OWNER)).toBe(true);
  });
  it("trainer escribe pero no gestiona miembros/branding", () => {
    expect(can(ROLE.TRAINER, "write")).toBe(true);
    expect(canManageMembers(ROLE.TRAINER)).toBe(false);
    expect(can(ROLE.TRAINER, "branding")).toBe(false);
  });
  it("client solo lo suyo", () => {
    expect(can(ROLE.CLIENT, "read_own")).toBe(true);
    expect(can(ROLE.CLIENT, "delete")).toBe(false);
  });
});
