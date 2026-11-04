import { NextResponse, type NextRequest } from "next/server";
import { authenticate, createSession } from "@/lib/auth";
import { authenticateWithSupabase } from "@/lib/supabase/auth";
import { loginSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function getClientKey(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

export async function POST(request: NextRequest) {
  const key = getClientKey(request);
  const now = Date.now();
  const current = attempts.get(key);
  if (current && current.resetAt > now && current.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Слишком много попыток. Попробуйте через 10 минут." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Проверьте данные" },
      { status: 400 },
    );
  }

  // Production path: Supabase Auth verifies the password and the owner role.
  // Local demo path is used only when Supabase credentials are absent.
  const supabaseAuth = await authenticateWithSupabase(
    parsed.data.email,
    parsed.data.password,
  );

  if (supabaseAuth.enabled) {
    if (!supabaseAuth.ok) {
      attempts.set(key, {
        count: (current && current.resetAt > now ? current.count : 0) + 1,
        resetAt:
          current && current.resetAt > now ? current.resetAt : now + WINDOW_MS,
      });
      return NextResponse.json(
        { error: supabaseAuth.message },
        { status: supabaseAuth.reason === "unavailable" ? 503 : 401 },
      );
    }

    attempts.delete(key);
    const { user } = supabaseAuth;
    await createSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    attempts.set(key, {
      count: (current && current.resetAt > now ? current.count : 0) + 1,
      resetAt: current && current.resetAt > now ? current.resetAt : now + WINDOW_MS,
    });
    return NextResponse.json(
      { error: "Неверный email или пароль" },
      { status: 401 },
    );
  }

  attempts.delete(key);
  await createSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
