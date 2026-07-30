import { useState, useEffect, useCallback } from "react";
import {
  getSession, onAuthChange, signIn as doSignIn, signOut as doSignOut, loadIsSuperadmin,
} from "../auth/authClient";
import { resolvePlatformAccess } from "./platformAccess";

// Acceso al Panel de Plataforma, INDEPENDIENTE del tenant. No resuelve membresías
// de ninguna org: solo confirma sesión + platform_admins (loadIsSuperadmin lee
// platform_admins filtrando por auth.uid()). Estado: loading|anonymous|authorized|unauthorized.
export function usePlatformApp() {
  const [status, setStatus] = useState("loading"); // loading|anonymous|authorized|unauthorized
  const [formError, setFormError] = useState(null);

  const resolve = useCallback(async (session) => {
    if (!session) {
      setStatus("anonymous");
      return;
    }
    try {
      const isSuperadmin = await loadIsSuperadmin();
      setStatus(resolvePlatformAccess({ hasSession: true, isSuperadmin }));
    } catch (e) {
      console.error("platform access:", e);
      setStatus("unauthorized");
    }
  }, []);

  useEffect(() => {
    let alive = true;
    let unsub = null;
    (async () => {
      const session = await getSession();
      if (!alive) return;
      await resolve(session);
      unsub = onAuthChange((s) => { if (alive) resolve(s); });
    })();
    return () => { alive = false; if (unsub) unsub(); };
  }, [resolve]);

  const signIn = useCallback(async (email, password) => {
    setFormError(null);
    try {
      await doSignIn(email, password);
    } catch {
      setFormError("Correo o contraseña incorrectos.");
    }
  }, []);

  const signOut = useCallback(async () => {
    try { await doSignOut(); } catch (e) { console.error("signOut:", e); }
    setStatus("anonymous");
  }, []);

  return { status, formError, signIn, signOut };
}
