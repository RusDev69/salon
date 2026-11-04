import Link from "next/link";
import {
  ArrowUpRight,
  Brush,
  Droplets,
  Eye,
  Footprints,
  Hand,
  Scissors,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { formatDuration, formatPrice } from "@/lib/utils";
import type { ApiService } from "@/lib/types";

const CATEGORY_META: Record<
  string,
  { label: string; icon: LucideIcon; tint: string; number: string }
> = {
  HAIR: {
    label: "Волосы",
    icon: Scissors,
    tint: "from-[#E8F1E9] via-[#D9E8DD] to-[#C7DCCB]",
    number: "I",
  },
  NAILS: {
    label: "Ногти",
    icon: Hand,
    tint: "from-[#F1F5EC] via-[#E4EEE3] to-[#D3E4D5]",
    number: "II",
  },
  SKIN: {
    label: "Косметология",
    icon: Droplets,
    tint: "from-[#EAF2EB] via-[#DCEBDE] to-[#C9DDCE]",
    number: "III",
  },
  MAKEUP: {
    label: "Перманентный макияж",
    icon: Brush,
    tint: "from-[#EEF4EC] via-[#E1EDE2] to-[#D0E1D3]",
    number: "IV",
  },
  BROWS: {
    label: "Брови и ресницы",
    icon: Eye,
    tint: "from-[#F3F6EE] via-[#E7EFE3] to-[#D8E5D4]",
    number: "V",
  },
  LASER: {
    label: "Лазерная эпиляция",
    icon: Zap,
    tint: "from-[#E9F3ED] via-[#D9E9E0] to-[#C4DACC]",
    number: "VI",
  },
  PODOLOGY: {
    label: "Подология",
    icon: Footprints,
    tint: "from-[#F5F7EF] via-[#E9F0E5] to-[#D7E4D4]",
    number: "VII",
  },
};

// The full catalog lives in the booking flow; the landing page shows a curated
// cross-category selection so the story stays scannable.
const FEATURED_SLUGS = [
  "manicure-gel",
  "smart-pedicure",
  "nail-extension",
  "women-haircut",
  "men-haircut",
  "airtouch",
  "lebel-absolute",
  "combined-cleansing",
  "face-massage",
  "brow-architecture",
  "lash-lamination",
  "laser-bikini",
];

export function ServicesSection({ services }: { services: ApiService[] }) {
  const featured = FEATURED_SLUGS.map((slug) =>
    services.find((service) => service.slug === slug),
  ).filter((service): service is ApiService => Boolean(service));
  const visible = featured.length >= 9 ? featured : services.slice(0, 12);

  return (
    <section id="services" className="section-space relative overflow-hidden">
      <div className="pointer-events-none absolute -right-16 top-24 hidden select-none font-display text-[18rem] leading-none text-espresso/[0.025] xl:block">
        01
      </div>

      <div className="container-wide relative">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="Каталог и прайс"
              title={
                <>
                  Красота, собранная
                  <br />
                  <span className="italic text-rose-500">для вас</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.1} className="lg:pb-2">
            <p className="max-w-md text-pretty text-[15px] leading-7 text-taupe">
              От ухода за руками и стопами до сложного окрашивания, косметологии,
              лазерной эпиляции и перманентного макияжа. В полном каталоге — 169
              услуг, здесь — самые востребованные.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link href="/booking">
                Подобрать услугу
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {visible.map((service, index) => {
            const meta =
              CATEGORY_META[service.category] ??
              ({
                label: "Услуга",
                icon: Sparkles,
                tint: "from-[#EEF4EC] to-[#D8E4D6]",
                number: "VIII",
              } satisfies (typeof CATEGORY_META)[string]);
            const category = SERVICE_CATEGORIES.find(
              (item) => item.value === service.category,
            );
            const Icon = meta.icon;

            return (
              <Reveal key={service.id} delay={Math.min(index * 0.055, 0.3)}>
                <Link
                  href={`/booking?service=${service.slug}`}
                  className={`group relative flex h-full min-h-[310px] flex-col overflow-hidden rounded-[28px] border border-white/65 bg-gradient-to-br ${meta.tint} p-6 shadow-[0_20px_50px_-38px_rgba(20,34,27,.5)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_34px_70px_-36px_rgba(20,34,27,.4)] sm:p-7`}
                >
                  <div className="pointer-events-none absolute -right-6 -top-5 font-display text-[7rem] leading-none text-espresso/[0.055] transition-transform duration-700 group-hover:-translate-y-1 group-hover:translate-x-1">
                    {meta.number}
                  </div>

                  <div className="relative flex items-start justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-espresso/65 backdrop-blur-sm">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {category?.label ?? meta.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-espresso/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="relative mt-auto pt-12">
                    <h3 className="max-w-[15rem] font-display text-[29px] leading-[1.07] tracking-[-0.02em] text-espresso">
                      {service.name}
                    </h3>
                    <p className="mt-3 line-clamp-2 max-w-[19rem] text-[12.5px] leading-6 text-espresso/55">
                      {service.description}
                    </p>

                    <div className="mt-6 flex items-end justify-between border-t border-espresso/10 pt-4">
                      <div>
                        <p className="font-display text-xl text-espresso">
                          {formatPrice(service.price)}
                        </p>
                        <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-espresso/40">
                          {formatDuration(service.durationMin)}
                        </p>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-espresso/15 bg-white/20 text-espresso transition-all duration-300 group-hover:border-espresso group-hover:bg-espresso group-hover:text-cream">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl border border-gold-500/20 bg-white/25 px-6 py-5 backdrop-blur-sm sm:flex-row sm:items-center">
            <p className="flex items-center gap-3 text-[12px] text-taupe">
              <Sparkles className="h-4 w-4 text-gold-500" strokeWidth={1.4} />
              В полном каталоге — 169 услуг. Позвоните, если нужно подобрать
              мастера или направление.
            </p>
            <Link
              href="/booking"
              className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso"
            >
              Все услуги и запись
              <span className="h-px w-7 bg-gold-500 transition-all group-hover:w-10" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

