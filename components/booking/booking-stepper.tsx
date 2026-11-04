"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStep } from "@/store/booking-store";

const STEPS: { step: BookingStep; label: string; hint: string }[] = [
  { step: 1, label: "Услуга", hint: "Направление" },
  { step: 2, label: "Мастер", hint: "Кому доверить" },
  { step: 3, label: "Время", hint: "Дата и слот" },
  { step: 4, label: "Данные", hint: "Подтверждение" },
];

export function BookingStepper({
  current,
  canNavigate,
  onNavigate,
}: {
  current: BookingStep;
  canNavigate: (step: BookingStep) => boolean;
  onNavigate: (step: BookingStep) => void;
}) {
  return (
    <div className="relative grid grid-cols-4 gap-1 rounded-[24px] border border-white/70 bg-white/35 px-2 py-4 backdrop-blur-sm sm:px-4">
      <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[35px] h-px bg-espresso/10" />
      {STEPS.map((item) => {
        const done = item.step < current;
        const active = item.step === current;
        const available = canNavigate(item.step);

        return (
          <button
            key={item.step}
            type="button"
            disabled={!available || active}
            onClick={() => onNavigate(item.step)}
            className={cn(
              "group relative z-10 flex flex-col items-center gap-2 text-center",
              available && !active ? "cursor-pointer" : "cursor-default",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-semibold transition-all duration-300",
                active &&
                  "border-espresso bg-espresso text-cream shadow-[0_8px_20px_-10px_rgba(44,37,33,.7)]",
                done && "border-gold-500 bg-gold-500 text-white",
                !active && !done && "border-espresso/15 bg-cream text-espresso/45",
                available && !active && "group-hover:border-gold-500/60",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : item.step}
            </span>
            <span>
              <span
                className={cn(
                  "block text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors sm:text-[10px]",
                  active ? "text-espresso" : "text-taupe/65",
                )}
              >
                {item.label}
              </span>
              <span className="mt-0.5 hidden text-[8px] text-taupe/45 sm:block">
                {item.hint}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
