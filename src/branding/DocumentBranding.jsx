import { useEffect } from "react";

// Ajusta en runtime la identidad de la app por tenant:
//  - FAVICON (pestaña del navegador)
//  - apple-touch-icon + apple-mobile-web-app-title (instalación PWA en iOS)
//  - manifest dinámico (nombre + íconos al instalar en Android/Chrome)
//  - theme-color
// Así cada cliente muestra su propio logo/nombre y no siempre el de Johel.
export function DocumentBranding({ branding }) {
  useEffect(() => {
    if (!branding) return;
    const name = branding.displayName || "";
    const icon = branding.faviconUrl || branding.logoUrl || null;

    if (name) document.title = name;
    if (name) setMeta("apple-mobile-web-app-title", name);
    if (branding.secondaryColor) setMeta("theme-color", branding.secondaryColor);

    // Colores del tenant como variables CSS (los usa el CSS: sidebar, botones, etc.)
    const root = document.documentElement;
    if (branding.primaryColor) root.style.setProperty("--brand-primary", branding.primaryColor);
    if (branding.secondaryColor) root.style.setProperty("--brand-secondary", branding.secondaryColor);

    if (icon) {
      setLink("icon", icon);
      setLink("apple-touch-icon", icon);
      injectManifest(name, icon);
    }
  }, [branding]);

  return null;
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// Genera un manifest por tenant como Blob y lo enlaza. Los navegadores lo usan
// para el nombre/ícono al "Instalar app". start_url/scope absolutos (un blob no
// resuelve rutas relativas contra la página).
let lastBlobUrl = null;
function injectManifest(name, icon) {
  try {
    const origin = window.location.origin;
    const manifest = {
      name: name || "Entrenamiento",
      short_name: (name || "App").slice(0, 12),
      description: "Tu plataforma de entrenamiento",
      start_url: origin + "/",
      scope: origin + "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#0B1F4B",
      orientation: "portrait",
      icons: [
        { src: icon, sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: icon, sizes: "512x512", type: "image/png", purpose: "any maskable" },
      ],
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
    const blobUrl = URL.createObjectURL(blob);
    setLink("manifest", blobUrl);
    if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
    lastBlobUrl = blobUrl;
  } catch {
    /* si algo falla, se queda el manifest estático */
  }
}
