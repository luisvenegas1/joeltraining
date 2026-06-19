import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wfqnrelnryyzjlrmkwti.supabase.co";
const SUPABASE_KEY = "sb_publishable_Rit3YDzrLWmzGr_eSrkQeQ_m-3aPUkx";

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
