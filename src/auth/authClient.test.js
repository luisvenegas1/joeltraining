import { vi, describe, it, expect, beforeEach } from "vitest";

// Estado compartido con el mock (hoisted para poder usarse dentro de vi.mock).
const h = vi.hoisted(() => ({ user: { id: "auth-uid-1" }, eqArgs: null, fromCalled: 0 }));

vi.mock("../supabase", () => ({
  sb: {
    auth: { getUser: async () => ({ data: { user: h.user } }) },
    from: () => {
      h.fromCalled++;
      return {
        select: () => ({
          eq: async (col, val) => {
            h.eqArgs = [col, val];
            return { data: [], error: null };
          },
        }),
      };
    },
  },
}));

import { loadMemberships } from "./authClient";

beforeEach(() => {
  h.user = { id: "auth-uid-1" };
  h.eqArgs = null;
  h.fromCalled = 0;
});

describe("loadMemberships — aísla membresías por usuario Auth", () => {
  it("filtra por el user_id del usuario autenticado (.eq('user_id', authId))", async () => {
    await loadMemberships();
    expect(h.eqArgs).toEqual(["user_id", "auth-uid-1"]);
  });

  it("usa el UUID del usuario actual, no una lista global", async () => {
    h.user = { id: "otro-uid-999" };
    await loadMemberships();
    expect(h.eqArgs).toEqual(["user_id", "otro-uid-999"]);
  });

  it("sin sesión → [] y NO consulta organization_members", async () => {
    h.user = null;
    const r = await loadMemberships();
    expect(r).toEqual([]);
    expect(h.fromCalled).toBe(0);
  });
});
