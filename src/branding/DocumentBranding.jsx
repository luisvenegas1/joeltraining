import { useEffect } from "react";

// Ajusta en runtime el FAVICON (pestaña del navegador) y el TÍTULO según el
// branding del tenant, para que cada cliente muestre su propio logo/nombre y no
// siempre el de Johel. No renderiza nada.
export function DocumentBranding({ branding }) {
  useEffect(() => {
    if (!branding) return;

    const iconUrl = branding.faviconUrl || branding.logoUrl;
    if (iconUrl) {
      setLink("icon", iconUrl);
      setLink("apple-touch-icon", iconUrl);
    }

    if (branding.displayName) {
      document.title = branding.displayName;
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
