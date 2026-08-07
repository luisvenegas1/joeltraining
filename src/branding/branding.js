// Branding por organización. En modo legacy (o si falta un campo en Johel) se
// usan los valores actuales de Johel para que su apariencia NO cambie.
// Para otros tenants el fallback es NEUTRO (nunca la marca de Johel).
import { LOGO_IMG } from "../trainsync.assets";

// Marca actual de Johel (migrada a organization_settings en 0003; acá como fallback).
export const JOHEL_BRANDING = {
  displayName: "Johel Herrera",
  tagline: "Strength · Discipline · Evolution",
  taglineShort: "Str·Dis·Evo",
  logoUrl: LOGO_IMG,
  faviconUrl: null,
  bio: null,
  trainerPhotoUrl: null,
  primaryColor: "#1A5DC8",
  secondaryColor: "#0B1F4B",
  whatsapp: "50688238325",
  instagram: null,
  contactEmail: null,
  callToAction: null,
  footerName: "Johel Herrera",
};

// Fallback neutro para tenants que no sean Johel (sin filtrar la marca de Johel).
export const NEUTRAL_BRANDING = {
  displayName: "Mi Entrenador",
  tagline: "Entrená con propósito",
  taglineShort: "",
  logoUrl: "/brand/tito-training.png",
  faviconUrl: "/brand/tito-training.png",
  bio: null,
  trainerPhotoUrl: null,
  primaryColor: "#1A5DC8",
  secondaryColor: "#0B1F4B",
  whatsapp: null,
  instagram: null,
  contactEmail: null,
  callToAction: null,
  footerName: "",
};

function shortTagline(t) {
  // "Strength · Discipline · Evolution" -> "Str·Dis·Evo"
  return t
    .split("·")
    .map((w) => w.trim().slice(0, 3))
    .join("·");
}

// Combina los settings de una organización (snake_case, de la BD) sobre una base.
export function resolveBranding(settings, base = JOHEL_BRANDING) {
  if (!settings) return base;
  return {
    displayName: settings.display_name || base.displayName,
    tagline: settings.tagline || base.tagline,
    taglineShort: settings.tagline ? shortTagline(settings.tagline) : base.taglineShort,
    logoUrl: settings.logo_url || base.logoUrl,
    faviconUrl: settings.favicon_url || base.faviconUrl,
    bio: settings.bio || base.bio,
    trainerPhotoUrl: settings.trainer_photo_url || base.trainerPhotoUrl,
    primaryColor: settings.primary_color || base.primaryColor,
    secondaryColor: settings.secondary_color || base.secondaryColor,
    whatsapp: settings.whatsapp || base.whatsapp,
    instagram: settings.instagram || base.instagram,
    contactEmail: settings.contact_email || base.contactEmail,
    callToAction: settings.call_to_action || base.callToAction,
    footerName: settings.display_name || base.footerName,
  };
}
