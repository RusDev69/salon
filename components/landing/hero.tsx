"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Clock3, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ reviewCount }: { reviewCount: number }) {
  const reduce = useReducedMotion();
  const fade = (delay: number, y = 26) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease },
  });

  return (
    <section className="relative overflow-hidden pb-16 pt-8 sm:pb-20 sm:pt-10 lg:pb-28 lg:pt-6">
      {/* Ambient decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-rose-200/30 blur-[100px]" />
        <div className="absolute -right-20 top-1/3 h-[360px] w-[360px] rounded-full bg-gold-300/20 blur-[110px]" />
        <div className="absolute left-1/2 top-0 h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
        <span className="absolute left-[4%] top-[28%] hidden font-display text-[11rem] leading-none text-espresso/[0.025] xl:block">
          É
        </span>
      </div>

      <div className="container-wide relative grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <div className="relative z-10 max-w-[650px] lg:pb-10">
          <motion.div {...fade(0.05)} className="eyebrow">
            Beauty club · Москва · Варшавское шоссе 122А
          </motion.div>

          <motion.h1
            {...fade(0.14, 34)}
            className="mt-7 text-[clamp(3.3rem,7vw,6.8rem)] font-normal leading-[0.9] tracking-[-0.055em] text-espresso"
          >
            Красота
            <br />
            без{" "}
            <span className="relative inline-block italic text-rose-500">
              границ
              <svg
                viewBox="0 0 300 22"
                className="absolute -bottom-3 left-0 h-4 w-full text-gold-400"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 16C69 5 183 3 297 11"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            {...fade(0.26)}
            className="mt-8 max-w-lg text-pretty text-[15px] leading-7 text-taupe sm:text-base sm:leading-8"
          >
            World Beauty Club — большой салон красоты на Варшавском шоссе.
            Маникюр и педикюр, стрижки и цвет, косметология, лазерная эпиляция,
            брови и перманентный макияж — 169 услуг в одном пространстве.
          </motion.p>

          <motion.div {...fade(0.36)} className="mt-9 flex flex-wrap items-center gap-3.5">
            <Button asChild size="lg" className="group">
              <Link href="/booking">
                Записаться онлайн
                <ArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/#services">
                Смотреть каталог
                <ArrowDown className="transition-transform duration-300 group-hover:translate-y-0.5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            {...fade(0.46)}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-espresso/10 pt-7"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {["/images/wbc/master-1.svg", "/images/wbc/master-2.svg", "/images/wbc/master-3.svg"].map(
                  (src) => (
                    <span
                      key={src}
                      className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-cream bg-sand"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        unoptimized
                        sizes="36px"
                        className="object-cover"
                      />
                    </span>
                  ),
                )}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-gold-400 text-gold-400"
                      strokeWidth={1.2}
                    />
                  ))}
                  <span className="ml-1 text-xs font-semibold text-espresso">5.0</span>
                </div>
                <p className="mt-0.5 text-[11px] text-taupe">
                  {reviewCount} отзывов на Яндекс Картах
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[11px] text-taupe">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-300/50 text-gold-600">
                <Clock3 className="h-3.5 w-3.5" />
              </span>
              <span>
                Онлайн-запись
                <br />
                <span className="text-espresso/75">круглосуточно</span>
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.15, delay: 0.2, ease }}
          className="relative mx-auto w-full max-w-[590px] lg:max-w-none"
        >
          <div className="relative mx-auto aspect-[4/4.75] w-[88%] sm:w-[80%] lg:w-full lg:max-w-[520px]">
            <div className="absolute -inset-3 rounded-[999px_999px_34px_34px] border border-gold-500/25" />
            <div className="absolute inset-0 overflow-hidden rounded-[999px_999px_28px_28px] bg-sand shadow-[0_45px_100px_-40px_rgba(78,49,40,.55)]">
              <Image
                src="/images/wbc/asset-14.jpg"
                alt="Атмосфера и работа стилиста World Beauty Club"
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 80vw, 520px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/20 via-transparent to-transparent" />
            </div>

            <div className="absolute -left-4 top-[20%] z-10 sm:-left-10">
              <motion.div
                initial={reduce ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.8, ease }}
                className="glass flex items-center gap-3 rounded-2xl px-4 py-3 sm:px-5 sm:py-4"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-espresso text-gold-300">
                  <Sparkles className="h-4 w-4" strokeWidth={1.4} />
                </span>
                <div>
                  <p className="font-display text-2xl leading-none text-espresso">5.0</p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-taupe">
                    {reviewCount} отзывов
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="absolute -right-2 bottom-[9%] z-10 sm:-right-8">
              <motion.div
                initial={reduce ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.95, ease }}
                className="glass rounded-2xl px-4 py-3.5 sm:px-5"
              >
                <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-gold-600">
                  Beauty & wellness
                </p>
                <p className="mt-1.5 font-display text-lg leading-tight text-espresso">
                  169 услуг · 7 дней в неделю
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="h-px w-7 bg-gold-500/60" />
                  <span className="text-[9px] uppercase tracking-[0.18em] text-taupe">
                    {BRAND.addressShort}
                  </span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, rotate: -20 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 1.1, ease }}
              className="absolute -right-1 top-8 z-10 hidden h-[88px] w-[88px] items-center justify-center rounded-full border border-gold-500/40 bg-cream/70 backdrop-blur-md sm:flex"
            >
              <div className="absolute inset-2 animate-[spin_22s_linear_infinite] rounded-full border border-dashed border-gold-500/40" />
              <span className="text-center font-display text-[10px] uppercase leading-[1.6] tracking-[0.22em] text-gold-600">
                WBC
                <br />
                CLUB
              </span>
            </motion.div>
          </div>

          <p className="absolute -left-8 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[8px] uppercase tracking-[0.45em] text-taupe/60 xl:block">
            Москва · Варшавское шоссе
          </p>
        </motion.div>
      </div>
    </section>
  );
}
