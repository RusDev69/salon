import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/common/reveal";
import { Button } from "@/components/ui/button";

const PRINCIPLES = [
  {
    icon: Leaf,
    title: "Полный beauty-маршрут",
    text: "169 услуг: ногти и подология, волосы и окрашивание, косметология, лазерная эпиляция, брови и перманентный макияж.",
  },
  {
    icon: ShieldCheck,
    title: "Команда, которую рекомендуют",
    text: "Рейтинг 5.0 и 389 отзывов на Яндекс Картах. Гости возвращаются к своим мастерам и приводят близких.",
  },
  {
    icon: Sparkles,
    title: "Каждый день рядом",
    text: "Работаем без выходных с 10:00 до 22:00. Можно совместить несколько услуг в один визит и не спешить.",
  },
];

export function PhilosophySection() {
  return (
    <section id="philosophy" className="section-space relative overflow-hidden">
      <div className="container-wide">
        <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative mx-auto w-[88%] max-w-[520px] lg:mx-0">
              <div className="absolute -inset-4 rounded-[260px_260px_36px_36px] border border-gold-500/25" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[260px_260px_28px_28px] bg-sand shadow-[0_45px_90px_-45px_rgba(20,34,27,.5)]">
                <Image
                  src="/images/wbc/asset-02.jpg"
                  alt="Интерьер World Beauty Club на Варшавском шоссе"
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 88vw, 520px"
                  className="object-cover"
                />
              </div>

              <div className="glass absolute -bottom-6 -right-4 rounded-3xl px-5 py-4 sm:-right-10 sm:px-6">
                <p className="font-display text-4xl leading-none text-espresso">5.0</p>
                <p className="mt-1 text-[9px] uppercase leading-4 tracking-[0.18em] text-taupe">
                  рейтинг
                  <br />
                  389 отзывов
                </p>
              </div>

              <div className="absolute -left-3 top-10 hidden h-24 w-24 items-center justify-center rounded-full border border-gold-500/40 bg-cream/60 backdrop-blur-sm sm:flex">
                <span className="text-center font-display text-[9px] uppercase leading-[1.7] tracking-[0.18em] text-gold-600">
                  Beauty
                  <br />
                  without
                  <br />
                  borders
                </span>
              </div>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <div className="eyebrow">Наша философия</div>
              <h2 className="mt-5 text-balance text-[clamp(2.5rem,5vw,4.6rem)] font-normal leading-[0.98] tracking-[-0.035em] text-espresso">
                Красота без границ
                <br />
                начинается с{" "}
                <span className="italic text-rose-500">заботы</span>
                <br />о вас
              </h2>
              <p className="mt-6 max-w-xl text-pretty text-[15px] leading-7 text-taupe">
                World Beauty Club — пространство на Варшавском шоссе, где в одном
                месте собраны уход за руками и стопами, стрижки и цвет,
                косметология, лазерные протоколы и перманентный макияж. Без
                суеты, с вниманием к деталям и вашим планам.
              </p>
            </Reveal>

            <div className="mt-9 space-y-6">
              {PRINCIPLES.map(({ icon: Icon, title, text }, index) => (
                <Reveal key={title} delay={0.1 + index * 0.07}>
                  <div className="group flex gap-4 border-b border-espresso/10 pb-6">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-white/30 text-gold-600 transition-colors group-hover:bg-espresso group-hover:text-gold-300">
                      <Icon className="h-4 w-4" strokeWidth={1.4} />
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-espresso">{title}</h3>
                      <p className="mt-1.5 max-w-lg text-[12.5px] leading-6 text-taupe">
                        {text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Button asChild variant="outline">
                  <Link href="/#masters">
                    Познакомиться с командой
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl italic text-rose-500">Svetlana</span>
                  <span className="h-8 w-px bg-espresso/15" />
                  <p className="text-[9px] uppercase leading-4 tracking-[0.16em] text-taupe">
                    Светлана Ерофеева
                    <br />
                    основатель World Beauty Club
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-20 grid grid-cols-2 gap-6 border-t border-espresso/10 pt-8 sm:grid-cols-4 lg:mt-24">
            {[
              ["5.0", "рейтинг на Яндекс Картах"],
              ["389", "отзывов гостей"],
              ["169", "услуг в каталоге"],
              ["7", "дней в неделю"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-display text-[clamp(2rem,4vw,3rem)] leading-none text-espresso">
                  {value}
                </p>
                <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-taupe">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

