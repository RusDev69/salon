import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Award } from "lucide-react";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { StarRating } from "@/components/common/star-rating";
import { Button } from "@/components/ui/button";
import type { ApiMaster } from "@/lib/types";

export function MastersSection({ masters }: { masters: ApiMaster[] }) {
  return (
    <section
      id="masters"
      className="section-space relative overflow-hidden border-y border-espresso/5 bg-[#F0F5EE]"
    >
      <div className="pointer-events-none absolute left-1/2 top-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-white/40 blur-[120px]" />

      <div className="container-wide relative">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="Наши мастера"
              title={
                <>
                  Мастера, которым
                  <br />
                  <span className="italic text-rose-500">доверяют</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.1} className="lg:pb-2">
            <p className="max-w-md text-pretty text-[15px] leading-7 text-taupe">
              Эльвина, Мария и Надежда — мастера, которых гости называют по имени
              в отзывах. Ногтевой сервис, косметология, стрижки и цвет: команда
              закрывает полный beauty-маршрут в одном клубе.
            </p>
            <div className="mt-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#14221B]/50">
              <Award className="h-4 w-4 text-gold-500" strokeWidth={1.4} />
              Средний стаж — 8 лет · 389 отзывов
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {masters.map((master, index) => (
            <Reveal key={master.id} delay={index * 0.08}>
              <article className="group">
                <div className="relative">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[180px_180px_24px_24px] bg-sand shadow-[0_25px_55px_-38px_rgba(20,34,27,.55)]">
                    <Image
                      src={master.photoUrl}
                      alt={`${master.name} — ${master.specialty}`}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso/55 via-espresso/0 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

                    <div className="absolute left-3 top-3 rounded-full border border-white/40 bg-cream/75 px-2.5 py-1.5 backdrop-blur-md">
                      <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-espresso">
                        <Award className="h-3 w-3 text-gold-600" />
                        {master.experienceYears} лет
                      </span>
                    </div>

                    <div className="absolute inset-x-4 bottom-4 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-cream text-espresso hover:bg-white"
                      >
                        <Link href={`/booking?master=${master.slug}`}>
                          Записаться
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-3 px-1">
                    <div>
                      <h3 className="font-display text-[25px] leading-tight text-espresso">
                        {master.name}
                      </h3>
                      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-rose-600">
                        {master.specialty}
                      </p>
                    </div>
                    <div className="shrink-0 pt-1 text-right">
                      <StarRating value={master.rating} size="sm" className="justify-end" />
                      <p className="mt-1 text-[9px] text-taupe">
                        {master.rating.toFixed(1)} · {master.reviewsCount}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 px-1 text-[12px] leading-6 text-taupe">
                    {master.bio}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

