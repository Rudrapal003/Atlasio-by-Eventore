import { createClient } from '@supabase/supabase-js';

/* =========================================================
   Supabase client — shared schema with the main Eventore app.
   atlasio uses tables prefixed fd_* (kept for git continuity).
   ========================================================= */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasConfig = Boolean(url && anonKey);

/** Returns null when env vars are absent (e.g. dev without .env.local). */
export const supabase = hasConfig
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export const supabaseReady = hasConfig;
