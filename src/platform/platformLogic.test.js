import { describe, it, expect } from "vitest";
import {
  normalizeSlug, validateSlug, isEmail, validateNewOrg,
  planOrgCreation, pendingSteps, isCreationComplete,
  applySubscriptionAction, subscriptionAfterPayment,
  isDemoOrg, canSuspendOrg, validatePayment,
  bucketOrganizations, expiringSubscriptions, statusLabel,
} from "./platformLogic";

describe("slug — normalización y unicidad", () => {
  it("normaliza acentos, espacios y mayúsculas", () => {
    expect(normalizeSlug("Juan Fitness")).toBe("juan-fitness");
    expect(normalizeSlug("  Gimnasio Ñandú  ")).toBe("gimnasio-nandu");
    expect(normalizeSlug("A/B*C")).toBe("a-b-c");
  });
  it("rechaza slug duplicado (validación de unicidad)", () => {
    const r = validateSlug("Juan Fitness", ["juan-fitness", "joheltraining"]);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/en uso/);
  });
  it("acepta slug único y lo normaliza", () => {
    const r = validateSlug("Nuevo Coach", ["joheltraining"]);
    expect(r).toEqual({ ok: true, slug: "nuevo-coach" });
  });
  it("rechaza slugs reservados y demasiado cortos", () => {
    expect(validateSlug("platform", []).ok).toBe(false);
    expect(validateSlug("ab", []).ok).toBe(false);
  });
});

describe("email", () => {
  it("valida correctamente", () => {
    expect(isEmail("a@b.com")).toBe(true);
    expect(isEmail("no-email")).toBe(false);
  });
});

describe("validateNewOrg — alta de organización", () => {
  const existing = ["joheltraining", "titotrainer"];
  it("acepta un alta completa (Juan Fitness)", () => {
    const r = validateNewOrg(
      { name: "Juan Fitness", ownerName: "Juan", ownerEmail: "juan@fit.com", initialStatus: "trial" },
      existing
    );
    expect(r.ok).toBe(true);
    expect(r.value.slug).toBe("juan-fitness");
    expect(r.value.displayName).toBe("Juan Fitness");
    expect(r.value.ownerEmail).toBe("juan@fit.com");
  });
  it("marca errores de owner y slug duplicado", () => {
    const r = validateNewOrg(
      { name: "Johel", slug: "joheltraining", ownerName: "", ownerEmail: "malo" },
      existing
    );
    expect(r.ok).toBe(false);
    expect(r.errors.slug).toBeTruthy();
    expect(r.errors.ownerName).toBeTruthy();
    expect(r.errors.ownerEmail).toBeTruthy();
  });
});

describe("planOrgCreation — idempotencia / sin duplicados al reintentar", () => {
  it("todo pendiente cuando no existe nada", () => {
    const plan = planOrgCreation({});
    expect(pendingSteps(plan)).toEqual(["organization", "owner_user", "membership", "subscription", "branding"]);
    expect(isCreationComplete(plan)).toBe(false);
  });
  it("reintento con todo existente ⇒ ningún paso pendiente", () => {
    const plan = planOrgCreation({
      organization: true, owner_user: true, membership: true, subscription: true, branding: true,
    });
    expect(pendingSteps(plan)).toEqual([]);
    expect(isCreationComplete(plan)).toBe(true);
  });
  it("reintento parcial completa solo lo que falta", () => {
    const plan = planOrgCreation({ organization: true, owner_user: true });
    expect(pendingSteps(plan)).toEqual(["membership", "subscription", "branding"]);
  });
});

describe("suscripción — transiciones y pago", () => {
  it("suspend/reactivate mapean a estados", () => {
    expect(applySubscriptionAction("suspend")).toEqual({ ok: true, status: "suspended" });
    expect(applySubscriptionAction("reactivate")).toEqual({ ok: true, status: "active" });
    expect(applySubscriptionAction("cancel")).toEqual({ ok: true, status: "canceled" });
    expect(applySubscriptionAction("no-existe").ok).toBe(false);
  });
  it("un pago activa la suscripción, salvo cancelada", () => {
    expect(subscriptionAfterPayment("past_due")).toBe("active");
    expect(subscriptionAfterPayment("suspended")).toBe("active");
    expect(subscriptionAfterPayment("canceled")).toBe("canceled");
    expect(subscriptionAfterPayment("past_due", { activate: false })).toBe("past_due");
  });
});

describe("demo — permanece disponible", () => {
  const demo = { tenant_type: "demo", slug: "titotrainer" };
  const prod = { tenant_type: "production", slug: "joheltraining" };
  it("la demo se reconoce y no se puede suspender por reglas comerciales", () => {
    expect(isDemoOrg(demo)).toBe(true);
    expect(canSuspendOrg(demo)).toBe(false);
  });
  it("una org de producción sí se puede suspender", () => {
    expect(isDemoOrg(prod)).toBe(false);
    expect(canSuspendOrg(prod)).toBe(true);
  });
});

describe("validatePayment — registro de pago", () => {
  it("acepta un pago válido", () => {
    const r = validatePayment({ organizationId: "o1", amount: "25000", currency: "crc", paidAt: "2026-07-30", method: "sinpe" });
    expect(r.ok).toBe(true);
    expect(r.value.amount).toBe(25000);
    expect(r.value.currency).toBe("CRC");
  });
  it("rechaza monto no positivo, sin fecha o método inválido", () => {
    expect(validatePayment({ organizationId: "o1", amount: 0, currency: "USD", paidAt: "x" }).errors.amount).toBeTruthy();
    expect(validatePayment({ organizationId: "o1", amount: 10, currency: "USD" }).errors.paidAt).toBeTruthy();
    expect(validatePayment({ organizationId: "o1", amount: 10, currency: "USD", paidAt: "x", method: "bitcoin" }).errors.method).toBeTruthy();
  });
});

describe("dashboard — agregados", () => {
  const orgs = [
    { subStatus: "active" }, { subStatus: "active" }, { subStatus: "trial" },
    { subStatus: "suspended" }, { subStatus: "canceled" }, { subStatus: null },
  ];
  it("clasifica por estado", () => {
    const b = bucketOrganizations(orgs);
    expect(b).toMatchObject({ active: 2, trial: 1, suspended: 1, canceled: 1, none: 1, total: 6 });
  });
  it("detecta suscripciones próximas a vencer o vencidas", () => {
    const now = Date.parse("2026-07-30T00:00:00Z");
    const list = [
      { slug: "a", currentPeriodEnd: "2026-07-25" }, // vencida
      { slug: "b", currentPeriodEnd: "2026-08-02" }, // dentro de 7 días
      { slug: "c", currentPeriodEnd: "2026-09-30" }, // lejos
      { slug: "d", currentPeriodEnd: null },
    ];
    const exp = expiringSubscriptions(list, now, 7).map((o) => o.slug);
    expect(exp).toEqual(["a", "b"]);
  });
  it("etiqueta estados en español", () => {
    expect(statusLabel("past_due")).toBe("Pago pendiente");
  });
});
