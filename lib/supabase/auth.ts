import "server-only";

import { isSupabaseAuthEnabled } from "@/lib/supabase/config";
import {
  createSupabaseAdminClient,
  createSupabaseAuthClient,
} from "@/lib/supabase/server";

type SupabaseOwner = {
  id: string;
  email: string;
  name: string;
  role: "OWNER";
};

export type SupabaseAuthResult =
  | { enabled: false }
  | { enabled: true; ok: true; user: SupabaseOwner }
  | {
      enabled: true;
      ok: false;
      reason: "invalid" | "forbidden" | "unavailable";
      message: string;
    };

/**
 * Verify the password with Supabase Auth, then check the owner role from
 * `profiles` using a trusted server client. A failed login never falls back
 * to the local demo credentials when Supabase is configured.
 */
export async function authenticateWithSupabase(
  email: string,
  password: string,
): Promise<SupabaseAuthResult> {
  if (!isSupabaseAuthEnabled()) return { enabled: false };

  try {
    const auth = createSupabaseAuthClient();
    const { data, error } = await auth.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      return {
        enabled: true,
        ok: false,
        reason: "invalid",
        message: "Неверный email или пароль",
      };
    }

    const admin = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", data.user.id)
      .maybeSingle<{
        id: string;
        email: string | null;
        full_name: string | null;
        role: string;
      }>();

    if (profileError) throw profileError;

    if (!profile || profile.role !== "owner") {
      // Do not keep a valid Supabase session for a non-owner account.
      await auth.auth.signOut();
      return {
        enabled: true,
        ok: false,
        reason: "forbidden",
        message: "Доступ только для владельца салона",
      };
    }

    await auth.auth.signOut();

    return {
      enabled: true,
      ok: true,
      user: {
        id: profile.id,
        email: profile.email ?? data.user.email ?? email,
        name: profile.full_name?.trim() || "Владелец",
        role: "OWNER",
      },
    };
  } catch (error) {
    console.error("Supabase auth failed", error);
    return {
      enabled: true,
      ok: false,
      reason: "unavailable",
      message: "Сервис авторизации временно недоступен. Попробуйте позже.",
    };
  }
}
