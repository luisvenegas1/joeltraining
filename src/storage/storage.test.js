import { describe, it, expect } from "vitest";
import { resolveAvatarSrc } from "./storage";

describe("resolveAvatarSrc — fallback de fotos", () => {
  it("prefiere el avatar de Storage", () => {
    expect(resolveAvatarSrc({ id: "u1", avatarUrl: "https://cdn/x.png" })).toBe("https://cdn/x.png");
  });
  it("sin avatar ni localStorage → null (no revienta en entorno sin DOM)", () => {
    expect(resolveAvatarSrc({ id: "u1" })).toBeNull();
  });
  it("usuario nulo → null", () => {
    expect(resolveAvatarSrc(null)).toBeNull();
  });
});
