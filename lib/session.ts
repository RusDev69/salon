import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "wbc_session";
const SESSION_TTL = "8h";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
};

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ||
      "wbc-development-secret-change-in-production",
  );
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}
