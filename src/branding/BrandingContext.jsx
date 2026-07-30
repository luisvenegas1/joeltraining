import { createContext, useContext } from "react";
import { JOHEL_BRANDING } from "./branding";

// Contexto de branding. Valor por defecto = Johel (para que sin provider, o en
// modo legacy, la app se vea exactamente igual que hoy).
export const BrandingContext = createContext(JOHEL_BRANDING);

export function useBranding() {
  return useContext(BrandingContext);
}
