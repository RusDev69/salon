"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FBFCF7] px-5 py-20">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-rose-200/30 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-gold-300/25 blur-[110px]" />

      <div className="relative w-full max-w-lg rounded-[32px] border border-white/70 bg-white/40 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-espresso text-gold-300">
          <Sparkles className="h-6 w-6" strokeWidth={1.4} />
        </span>
        <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.24em] text-gold-600">
          Что-то пошло не так
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.2rem,6vw,3.4rem)] leading-[0.98] tracking-[-0.03em] text-espresso">
          Нужна минута
          <br />
          <span className="italic text-rose-500">тишины</span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[12.5px] leading-6 text-taupe">
          Мы не смогли загрузить эту страницу. Попробуйте ещё раз — данные
          гостей и записи не пострадали.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Попробовать снова
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-6 font-mono text-[8px] uppercase tracking-[0.12em] text-taupe/35">
            Код ошибки: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}

