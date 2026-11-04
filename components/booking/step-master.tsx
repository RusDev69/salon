"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Award, Check } from "lucide-react";
import { StarRating } from "@/components/common/star-rating";
import { Button } from "@/components/ui/button";
import type { ApiMaster, ApiService } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StepMaster({
  service,
  masters,
  selected,
  onSelect,
  onBack,
  onContinue,
}: {
  service: ApiService;
  masters: ApiMaster[];
  selected: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-gold-600">
        02 · Мастер
      </p>
      <h2 className="mt-3 text-balance font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.02] tracking-[-0.03em] text-espresso">
        Кому доверим
        <br />
        <span className="italic text-rose-500">вашу красоту?</span>
      </h2>
      <p className="mt-3 max-w-lg text-[12.5px] leading-6 text-taupe">
        Для «{service.name}» доступны мастера ниже. У каждого — свой почерк, но
        одинаково бережное отношение к деталям.
      </p>

      {masters.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-espresso/15 p-8 text-center">
          <p className="font-display text-2xl text-espresso">
            Пока нет доступных мастеров
          </p>
          <p className="mt-2 text-sm text-taupe">
            Выберите другую услугу или свяжитесь с нами — подберём время вручную.
          </p>
          <Button variant="outline" className="mt-5" onClick={onBack}>
            Вернуться к услугам
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {masters.map((master) => {
            const active = selected === master.id;

            return (
              <button
                key={master.id}
                type="button"
                onClick={() => onSelect(master.id)}
                aria-pressed={active}
                className={cn(
                  "group flex items-stretch gap-4 rounded-3xl border p-3 text-left transition-all duration-300 sm:gap-5 sm:p-4",
                  active
                    ? "border-espresso bg-white shadow-soft"
                    : "border-espresso/10 bg-white/35 hover:border-gold-500/40 hover:bg-white/70",
                )}
              >
                <span className="relative h-[112px] w-[86px] shrink-0 overflow-hidden rounded-[60px_60px_15px_15px] bg-sand sm:h-[124px] sm:w-[98px]">
                  <Image
                    src={master.photoUrl}
                    alt={master.name}
                    fill
                    unoptimized
                    sizes="100px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </span>

                <span className="flex min-w-0 flex-1 flex-col py-1">
                  <span className="flex items-start justify-between gap-2">
                    <span>
                      <span className="block font-display text-[23px] leading-tight text-espresso">
                        {master.name}
                      </span>
                      <span className="mt-1 block text-[8.5px] font-semibold uppercase tracking-[0.18em] text-rose-600">
                        {master.specialty}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
                        active
                          ? "border-espresso bg-espresso text-cream"
                          : "border-espresso/15 text-transparent",
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </span>

                  <span className="mt-2 flex items-center gap-2">
                    <StarRating value={master.rating} size="sm" />
                    <span className="text-[9px] text-taupe">
                      {master.rating.toFixed(1)} · {master.reviewsCount} отзывов
                    </span>
                  </span>

                  <span className="mt-2 line-clamp-2 text-[11px] leading-5 text-taupe">
                    {master.bio}
                  </span>

                  <span className="mt-auto flex items-center gap-1.5 pt-2 text-[9px] uppercase tracking-[0.12em] text-espresso/45">
                    <Award className="h-3 w-3 text-gold-500" />
                    Опыт {master.experienceYears} лет
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-espresso/10 pt-6">
        <Button variant="ghost" onClick={onBack} className="px-3">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <Button
          size="lg"
          onClick={onContinue}
          disabled={!selected || masters.length === 0}
        >
          Выбрать время
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
