"use client";

import { useState } from "react";
import { ArrowRight, Check, Clock3, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND, SERVICE_CATEGORIES } from "@/lib/constants";
import type { ApiService } from "@/lib/types";
import { formatDuration, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function StepService({
  services,
  selected,
  onSelect,
  onContinue,
}: {
  services: ApiService[];
  selected: string | null;
  onSelect: (id: string) => void;
  onContinue: () => void;
}) {
  const [category, setCategory] = useState<string>("ALL");
  const visible =
    category === "ALL"
      ? services
      : services.filter((service) => service.category === category);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-gold-600">
            01 · Услуга
          </p>
          <h2 className="mt-3 text-balance font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.02] tracking-[-0.03em] text-espresso">
            Что выбираем
            <br />
            <span className="italic text-rose-500">сегодня?</span>
          </h2>
          <p className="mt-3 max-w-lg text-[12.5px] leading-6 text-taupe">
            Выберите направление — мы покажем мастеров и свободное время.
            Точную стоимость подтвердим до начала процедуры.
          </p>
        </div>
      </div>

      <div className="hide-scrollbar mt-7 flex gap-2 overflow-x-auto pb-1">
        {SERVICE_CATEGORIES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategory(item.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] transition-all",
              category === item.value
                ? "border-espresso bg-espresso text-cream"
                : "border-espresso/10 bg-white/40 text-espresso/55 hover:border-gold-500/50 hover:text-espresso",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {visible.map((service) => {
          const active = selected === service.id;
          const categoryLabel = SERVICE_CATEGORIES.find(
            (item) => item.value === service.category,
          )?.label;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service.id)}
              aria-pressed={active}
              className={cn(
                "group relative flex flex-col rounded-3xl border p-5 text-left transition-all duration-300",
                active
                  ? "border-espresso bg-white shadow-soft"
                  : "border-espresso/10 bg-white/35 hover:-translate-y-0.5 hover:border-gold-500/40 hover:bg-white/70 hover:shadow-soft",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-rose-600">
                  {categoryLabel}
                </span>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                    active
                      ? "border-espresso bg-espresso text-cream"
                      : "border-espresso/15 text-transparent",
                  )}
                >
                  <Check className="h-3 w-3" />
                </span>
              </div>

              <h3 className="mt-4 font-display text-[24px] leading-[1.1] text-espresso">
                {service.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-[11.5px] leading-5 text-taupe">
                {service.description}
              </p>

              <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                <p className="flex items-center gap-1.5 text-[10px] text-taupe/70">
                  <Clock3 className="h-3 w-3 text-gold-500" />
                  {formatDuration(service.durationMin)}
                </p>
                <p className="font-display text-xl text-espresso">
                  {formatPrice(service.price)}
                </p>
              </div>
            </button>
          );
        })}

        <a
          href={BRAND.phoneHref}
          className="group flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-gold-500/35 bg-[#EEF4EC]/45 p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500/70 hover:bg-[#EEF4EC]/80"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/30 bg-white/50 text-gold-600 transition-colors group-hover:bg-espresso group-hover:text-gold-300">
            <Sparkles className="h-4 w-4" strokeWidth={1.4} />
          </span>
          <p className="mt-4 font-display text-[21px] leading-tight text-espresso">
            Не знаете,
            <br />
            что выбрать?
          </p>
          <p className="mt-2 max-w-[170px] text-[10px] leading-4 text-taupe">
            Подскажем на бесплатной консультации
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-gold-600">
            <Phone className="h-3 w-3" />
            {BRAND.phone}
          </span>
        </a>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-espresso/10 pt-6">
        <p className="hidden text-[10px] text-taupe/55 sm:block">
          {selected
            ? "Отличный выбор. Дальше — мастер."
            : "Можно изменить выбор на любом шаге"}
        </p>
        <Button
          size="lg"
          onClick={onContinue}
          disabled={!selected}
          className="ml-auto w-full sm:w-auto"
        >
          Выбрать мастера
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

