import { createClient } from "@supabase/supabase-js";

// La configuración viene de variables de entorno (Vite: VITE_*).
// Fallback a los valores publicables actuales para no romper desarrollo local
// mientras se termina la migración a .env. La clave publishable/anon es segura
// en el frontend: la seguridad depende de Supabase Auth + RLS.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://wfqnrelnryyzjlrmkwti.supabase.co";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_Rit3YDzrLWmzGr_eSrkQeQ_m-3aPUkx";

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
