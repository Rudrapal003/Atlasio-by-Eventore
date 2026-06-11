/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PUBLIC_URL: string;
  readonly VITE_ANALYTICS_DOMAIN: string;
  readonly VITE_ANALYTICS_SCRIPT: string;
  readonly VITE_ENABLE_SPONSORED: string;
  readonly VITE_ENABLE_OUTBOUND_TRACKING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
