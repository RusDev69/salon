/**
 * Supabase is optional for the self-contained demo (Prisma + SQLite) and
 * required in production. Keeping the check in one place means the rest of
 * the application never reads deployment credentials directly.
 */
export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim();

  return { url, anonKey, serviceRoleKey };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

/**
 * Supabase Auth is used only when a trusted server-side key is available.
 * Without it the app keeps the local demo authentication path; it never
 * falls back from a failed production auth attempt.
 */
export function isSupabaseAuthEnabled() {
  const { url, anonKey, serviceRoleKey } = getSupabaseConfig();
  return Boolean(url && anonKey && serviceRoleKey);
}
