import { describe, it, expect } from "vitest";
import { subscriptionState, isUsable, orgAccessFor } from "./subscription";

const NOW = Date.parse("2026-07-30T00:00:00Z");
const future = "2026-08-30T00:00:00Z";
const past = "2026-07-01T00:00:00Z";

describe("subscriptionState", () => {
  it("sin fila → active (fail-open)", () => {
    expect(subscriptionState(null, NOW)).toBe("active");
  });
  it("trial/active → active", () => {
    expect(subscriptionState({ status: "trial" }, NOW)).toBe("active");
    expect(subscriptionState({ status: "active" }, NOW)).toBe("active");
  });
  it("past_due dentro del grace → grace (usable)", () => {
    expect(subscriptionState({ status: "past_due", grace_period_ends_at: future }, NOW)).toBe("grace");
  });
  it("suspended/canceled sin grace vigente → blocked", () => {
    expect(subscriptionState({ status: "suspended" }, NOW)).toBe("blocked");
    expect(subscriptionState({ status: "canceled" }, NOW)).toBe("blocked");
    expect(subscriptionState({ status: "past_due", grace_period_ends_at: past }, NOW)).toBe("blocked");
  });
});

describe("isUsable coincide con subscription_usable (SQL)", () => {
  it("active y grace son usables; blocked no", () => {
    expect(isUsable({ status: "active" }, NOW)).toBe(true);
    expect(isUsable({ status: "past_due", grace_period_ends_at: future }, NOW)).toBe(true);
    expect(isUsable({ status: "suspended" }, NOW)).toBe(false);
  });
});

describe("orgAccessFor", () => {
  it("superadmin siempre ok (soporte)", () => {
    expect(orgAccessFor({ role: "owner", subscription: { status: "suspended" }, isSuperadmin: true, nowMs: NOW })).toBe("ok");
  });
  it("usable → ok", () => {
    expect(orgAccessFor({ role: "trainer", subscription: { status: "active" }, nowMs: NOW })).toBe("ok");
  });
  it("bloqueado: owner ve billing, otros suspended", () => {
    expect(orgAccessFor({ role: "owner", subscription: { status: "suspended" }, nowMs: NOW })).toBe("billing");
    expect(orgAccessFor({ role: "trainer", subscription: { status: "canceled" }, nowMs: NOW })).toBe("suspended");
    expect(orgAccessFor({ role: "client", subscription: { status: "canceled" }, nowMs: NOW })).toBe("suspended");
    expect(orgAccessFor({ role: "demo_viewer", subscription: { status: "suspended" }, nowMs: NOW })).toBe("suspended");
  });
});
