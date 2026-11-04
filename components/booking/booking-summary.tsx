"use client";

import Image from "next/image";
import { CalendarDays, Clock3, Lock, Scissors, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateHuman } from "@/lib/time";
import { formatDuration, formatPrice } from "@/lib/utils";
import type { ApiMaster, ApiService } from "@/lib/types";
import type { BookingStep } from "@/store/booking-store";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function BookingSummary({
  step,
  service,
  master,
  date,
  time,
  onChangeStep,
}: {
  step: BookingStep;
  service: ApiService | null;
  master: ApiMaster | null;
  date: string | null;
  time: string | null;
  onChangeStep: (step: BookingStep) => void;
}) {
  return (
    <aside className="lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-[28px] border border-white/70 bg-ivory/85 shadow-soft backdrop-blur-md">
        <div className="relative overflow-hidden bg-espresso px-6 py-5 text-cream">
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full border border-gold-400/20" />
          <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-gold-300/80">
            Ваша запись
          </p>
          <p className="mt-2 font-display text-2xl">
            {step === 4 ? "Почти готово" : "Ваша запись"}
          </p>
          <p className="mt-1 text-[10px] text-cream/45">
            Шаг {step} из 4 · займёт около 2 минут
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-taupe/60">
                Услуга
              </p>
              {service && step > 1 && (
                <button
                  type="button"
                  onClick={() => onChangeStep(1)}
                  className="text-[9px] uppercase tracking-[0.12em] text-gold-600 underline-offset-4 hover:underline"
                >
                  Изменить
                </button>
              )}
            </div>
            {service ? (
              <div className="mt-2">
                <p className="font-display text-lg leading-snug text-espresso">
                  {service.name}
                </p>
                <p className="mt-1 flex items-center gap-3 text-[10px] text-taupe">
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3 w-3 text-gold-500" />
                    {formatDuration(service.durationMin)}
                  </span>
                  <span>{formatPrice(service.price)}</span>
                </p>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-[12px] text-taupe/50">
                <Scissors className="h-3.5 w-3.5" />
                Выберите услугу
              </div>
            )}
          </div>

          <div className="h-px bg-espresso/10" />

          <div>
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-taupe/60">
                Мастер
              </p>
              {master && step > 2 && (
                <button
                  type="button"
                  onClick={() => onChangeStep(2)}
                  className="text-[9px] uppercase tracking-[0.12em] text-gold-600 underline-offset-4 hover:underline"
                >
                  Изменить
                </button>
              )}
            </div>
            {master ? (
              <div className="mt-2.5 flex items-center gap-3">
                <span className="relative h-10 w-10 overflow-hidden rounded-full border border-white bg-sand">
                  <Image
                    src={master.photoUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-espresso">
                    {master.name}
                  </p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.1em] text-rose-600">
                    {master.specialty}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-[12px] text-taupe/50">
                <Sparkles className="h-3.5 w-3.5" />
                Выберите мастера
              </div>
            )}
          </div>

          <div className="h-px bg-espresso/10" />

          <div>
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-taupe/60">
                Дата и время
              </p>
              {date && step > 3 && (
                <button
                  type="button"
                  onClick={() => onChangeStep(3)}
                  className="text-[9px] uppercase tracking-[0.12em] text-gold-600 underline-offset-4 hover:underline"
                >
                  Изменить
                </button>
              )}
            </div>
            {date ? (
              <div className="mt-2 flex items-start gap-2.5 text-[12px] text-espresso">
                <CalendarDays className="mt-0.5 h-3.5 w-3.5 text-gold-500" />
                <span>
                  {capitalize(formatDateHuman(date))}
                  <br />
                  <span className="text-[10px] text-taupe">
                    {time ? `${time} · ${formatDuration(service?.durationMin ?? 60)}` : "Выберите время"}
                  </span>
                </span>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-[12px] text-taupe/50">
                <CalendarDays className="h-3.5 w-3.5" />
                Выберите дату
              </div>
            )}
          </div>

          {service && (
            <>
              <div className="h-px bg-espresso/10" />
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-taupe/60">
                    Итого
                  </p>
                  <p className="mt-1 text-[9px] text-taupe/60">Оплата в салоне</p>
                </div>
                <p className="font-display text-3xl leading-none text-espresso">
                  {formatPrice(service.price)}
                </p>
              </div>
            </>
          )}

          <div className="rounded-2xl bg-[#EDF3EC] p-3.5">
            <p className="flex items-start gap-2 text-[9.5px] leading-4 text-taupe">
              <Lock className="mt-0.5 h-3 w-3 shrink-0 text-gold-600" />
              Бесплатная отмена за 24 часа. Данные защищены и видны только
              администратору салона.
            </p>
          </div>

          {step === 4 && (
            <Button
              type="submit"
              form="booking-details-form"
              size="lg"
              className="w-full"
            >
              Подтвердить запись
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-[9px] uppercase tracking-[0.16em] text-taupe/45">
        Нужна помощь? +7 (495) 120-38-08
      </p>
    </aside>
  );
}

