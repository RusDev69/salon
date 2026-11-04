import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FBFCF7] px-5 py-20">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-500/15" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-300/25" />

      <div className="relative max-w-xl text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 font-display text-2xl tracking-[0.2em] text-espresso"
        >
          WORLD BEAUTY CLUB
          <span className="mb-3 inline-block h-1.5 w-1.5 rounded-full bg-gold-500" />
        </Link>
        <p className="mt-10 font-display text-[clamp(6rem,20vw,11rem)] leading-none tracking-[-0.04em] text-espresso/[0.08]">
          404
        </p>
        <h1 className="-mt-7 font-display text-[clamp(2.2rem,6vw,3.8rem)] leading-[0.98] tracking-[-0.03em] text-espresso">
          Здесь только
          <br />
          <span className="italic text-rose-500">тишина</span>
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-[13px] leading-6 text-taupe">
          Страница, которую вы искали, переехала или больше не существует.
          Вернитесь к ритуалам — там всё на месте.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/booking">
              Записаться онлайн
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

