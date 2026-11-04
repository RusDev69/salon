"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/constants";
import { loginSchema, type LoginValues } from "@/lib/validators";

export function LoginForm({ from }: { from?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const serverError = errors.root?.server?.message;

  async function submit(values: LoginValues) {
    setPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError("root.server", {
          message: payload.error ?? "Не удалось войти",
        });
        return;
      }

      const target = from && from.startsWith("/admin") ? from : "/admin";
      router.replace(target);
      router.refresh();
    } catch {
      setError("root.server", {
        message: "Сервер недоступен. Попробуйте ещё раз.",
      });
    } finally {
      setPending(false);
    }
  }

  function fillDemo() {
    setValue("email", "owner@worldbeautyclub.ru", { shouldValidate: true });
    setValue("password", "WBC2026!", { shouldValidate: true });
    clearErrors("root.server");
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 flex items-center justify-between lg:hidden">
        <Link href="/" className="font-display text-2xl tracking-[0.18em] text-espresso">
          WORLD BEAUTY
          <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-gold-500 align-top" />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-taupe"
        >
          <ArrowLeft className="h-3 w-3" />
          На сайт
        </Link>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-300/10 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-gold-600">
        <LockKeyhole className="h-3 w-3" />
        Кабинет владельца
      </div>

      <h1 className="mt-5 font-display text-[clamp(2.6rem,5vw,3.6rem)] leading-[0.98] tracking-[-0.035em] text-espresso">
        С возвращением
        <br />
        <span className="italic text-rose-500">в клуб</span>
      </h1>
      <p className="mt-4 max-w-sm text-[12.5px] leading-6 text-taupe">
        Войдите, чтобы управлять записями, расписанием и командой. Доступ только
        для владельца салона.
      </p>

      {serverError && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11.5px] text-rose-800">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(submit)} className="mt-7 space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe/40" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="owner@worldbeautyclub.ru"
              aria-invalid={Boolean(errors.email)}
              className="pl-11"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-rose-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe/40" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              className="px-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-taupe/40 transition-colors hover:text-espresso"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] text-rose-600">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Входим...
            </>
          ) : (
            <>
              Войти в кабинет
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
        <div className="mt-6 rounded-2xl border border-espresso/8 bg-white/35 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-taupe">
              <Sparkles className="h-3 w-3 text-gold-500" />
              Демо-доступ
            </p>
            <button
              type="button"
              onClick={fillDemo}
              className="text-[9px] font-semibold uppercase tracking-[0.12em] text-gold-600 underline-offset-4 hover:underline"
            >
              Заполнить
            </button>
          </div>
          <p className="mt-2 font-mono text-[11px] text-espresso/70">
            owner@worldbeautyclub.ru · WBC2026!
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-[9px] text-taupe/50">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          Защищённая сессия · 8 часов
        </span>
        <a href={`mailto:${BRAND.email}`} className="underline-offset-4 hover:underline">
          Забыли пароль?
        </a>
      </div>

      <div className="mt-8 hidden items-center justify-between border-t border-espresso/10 pt-5 text-[9px] uppercase tracking-[0.14em] text-taupe/40 lg:flex">
        <span>© {new Date().getFullYear()} World Beauty Club</span>
        <Link href="/" className="transition-colors hover:text-espresso">
          Вернуться на сайт
        </Link>
      </div>
    </div>
  );
}
