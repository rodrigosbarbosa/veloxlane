import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./index";

export type SupabaseAuthStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export function createSupabaseClient(
  url: string,
  anonKey: string,
  storage?: SupabaseAuthStorage,
): SupabaseClient<Database> {
  return createClient<Database>(url, anonKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: Boolean(storage),
      detectSessionInUrl: false,
    },
  });
}
