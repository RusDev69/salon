import "server-only";

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  signSession,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return user;
}

function useSecureCookies() {
  if (process.env.NODE_ENV !== "production") return false;

  // `pnpm start` is frequently used for local production checks. A Secure
  // cookie would be silently dropped over http://localhost, so only enable it
  // when the configured public URL is actually HTTPS.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) return true;
  return siteUrl.startsWith("https://");
}

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: useSecureCookies(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireOwner() {
  const session = await getSession();
  if (!session || session.role !== "OWNER") redirect("/admin/login");
  return session;
}

export async function getApiSession() {
  const session = await getSession();
  if (!session || session.role !== "OWNER") return null;
  return session;
}

/**
 * Defence in depth for route handlers: middleware already blocks requests,
 * but an API route must not rely on it alone (e.g. if the matcher changes).
 */
export async function requireApiOwner() {
  const session = await getApiSession();
  if (session) return null;

  return NextResponse.json(
    { error: "Недостаточно прав для этого действия" },
    { status: 403 },
  );
}
