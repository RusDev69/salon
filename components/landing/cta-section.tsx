import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { Reveal } from "@/components/common/reveal";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-cream py-16 lg:py-20">
      <div className="container-wide">
        <Reveal>
          <div className="noise relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#2E6B53] via-[#245843] to-[#142F25] px-6 py-14 text-cream shadow-[0_40px_90px_-45px_rgba(20,47,37,.65)] sm:px-12 lg:px-16 lg:py-20">
            <div className="pointer-events-none absolute -right-20 -top-32 h-[420px] w-[420px] rounded-full border border-cream/10" />
            <div className="pointer-events-none absolute -right-6 -top-16 h-[300px] w-[300px] rounded-full border border-gold-300/20" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-t-full border border-cream/10" />

            <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-200">
                  <span className="h-px w-8 bg-gold-300/70" />
                  Осенняя акция · до 31.12.2026
                </p>
                <h2 className="mt-6 max-w-2xl text-balance font-display text-[clamp(2.8rem,6vw,5.4rem)] font-normal leading-[0.96] tracking-[-0.035em]">
                  Стрижка + уход
                  <br />
                  <span className="italic text-[#D8EBDD]">за 3 950 ₽</span>
                </h2>
              </div>

              <div className="lg:pb-2">
                <p className="max-w-sm text-pretty text-[13px] leading-7 text-cream/70">
                  Модельная стрижка, пилинг и массаж кожи головы, питательный уход
                  по типу волос. Фиксированная цена на любую длину — вместо
                  6 000 ₽.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="bg-cream text-espresso hover:bg-white">
                    <Link href="/booking?service=promo-hair">
                      Записаться на акцию
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-cream/30 text-cream hover:border-cream/70 hover:bg-white/10"
                  >
                    <a href={BRAND.phoneHref}>
                      <Phone className="h-4 w-4" />
                      Позвонить
                    </a>
                  </Button>
                </div>
                <p className="mt-4 text-[9px] uppercase tracking-[0.16em] text-cream/40">
                  Ежедневно 10:00–22:00 · Варшавское шоссе, 122А
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
