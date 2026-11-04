"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

/**
 * Browser client for future client-side features (favourites, client account,
 * realtime status updates). The booking flow itself goes through typed API
 * routes so validation and rate limiting stay server-side.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  return createBrowserClient(url, anonKey);
}
