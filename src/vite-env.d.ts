/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The Supabase project's URL, such as https://abcd.supabase.co. */
  readonly VITE_SUPABASE_URL?: string;
  /** The project's publishable key: safe in the browser, row level security guards the data. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
