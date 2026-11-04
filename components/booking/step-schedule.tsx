"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  CalendarX2,
  Clock3,
  RefreshCw,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailability } from "@/hooks/use-booking";
import type { ApiMaster, ApiService } from "@/lib/types";
import { cn } from "@/lib/utils";

const GROUPS = [
  { label: "Утро", from: "00:00", to: "12:00" },
  { label: "День", from: "12:00", to: "17:00" },
  { label: "Вечер", from: "17:00", to: "23:59" },
];

export function StepSchedule({
  service,
  master,
  date,
  time,
  onDate,
  onTime,
  onBack,
  onContinue,
}: {
  service: ApiService;
  master: ApiMaster;
  date: string | null;
  time: string | null;
  onDate: (date: string) => void;
  onTime: (time: string | null) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const query = useAvailability({
    masterId: master.id,
    serviceId: service.id,
    date,
  });
  const cleared = useRef<string | null>(null);

  useEffect(() => {
    if (!query.data || !time) return;
    if (!query.data.slots.includes(time)) {
      onTime(null);
      if (cleared.current !== `${date}-${time}`) {
        cleared.current = `${date}-${time}`;
        toast.info("Этот слот только что заняли — выберите другое время");
      }
    }
  }, [query.data, time, onTime, date]);

  const slots = query.data?.slots ?? [];
  const closed = query.data?.closed ?? false;
  const updatedAt = query.dataUpdatedAt
    ? format(new Date(query.dataUpdatedAt), "HH:mm:ss")
    : null;

  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-gold-600">
        03 · Дата и время
      </p>
      <h2 className="mt-3 text-balance font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.02] tracking-[-0.03em] text-espresso">
        Найдите свой
        <br />
        <span className="italic text-rose-500">час тишины</span>
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <p className="max-w-md text-[12.5px] leading-6 text-taupe">
          Свободные окна обновляются автоматически. Занятые слоты исчезают из
          списка — без звонков и уточнений.
        </p>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
          </span>
          Онлайн
          {updatedAt && <span className="text-emerald-700/50">· {updatedAt}</span>}
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <BookingCalendar selected={date} onSelect={onDate} />

        <div className="rounded-[28px] border border-white/70 bg-white/35 p-5 backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-gold-600">
                Свободное время
              </p>
              <p className="mt-1 font-display text-[22px] leading-none text-espresso">
                {date
                  ? format(new Date(`${date}T12:00:00`), "d MMMM", { locale: ru })
                  : "Выберите день"}
              </p>
            </div>
            {query.isFetching && (
              <RefreshCw className="h-4 w-4 animate-spin text-gold-500" />
            )}
          </div>

          <div className="mt-5">
            {!date && (
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-espresso/12 px-6 text-center">
                <CalendarX2 className="h-8 w-8 text-gold-500/60" strokeWidth={1.2} />
                <p className="mt-4 font-display text-xl text-espresso">
                  Начните с даты
                </p>
                <p className="mt-1.5 max-w-[210px] text-[11px] leading-5 text-taupe">
                  Выберите день в календаре — покажем доступные окна у{" "}
                  {master.name.split(" ")[0]}.
                </p>
              </div>
            )}

            {date && query.isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((group) => (
                  <div key={group}>
                    <Skeleton className="mb-2 h-2.5 w-16" />
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((slot) => (
                        <Skeleton key={slot} className="h-10 rounded-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {date && query.isError && (
              <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                <p className="font-display text-xl text-espresso">
                  Не удалось загрузить окна
                </p>
                <p className="mt-2 text-[11px] text-taupe">
                  Проверьте соединение и попробуйте снова.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => query.refetch()}
                >
                  Обновить
                </Button>
              </div>
            )}

            {date && query.isSuccess && closed && (
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl bg-[#EAF1E8]/70 px-6 text-center">
                <CalendarX2 className="h-8 w-8 text-rose-400" strokeWidth={1.2} />
                <p className="mt-4 font-display text-xl text-espresso">
                  В этот день мастер не работает
                </p>
                <p className="mt-1.5 max-w-[220px] text-[11px] leading-5 text-taupe">
                  Выберите другую дату — свободные окна обновляются автоматически.
                </p>
              </div>
            )}

            {date && query.isSuccess && !closed && slots.length === 0 && (
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl bg-[#EAF1E8]/70 px-6 text-center">
                <Clock3 className="h-8 w-8 text-gold-500/60" strokeWidth={1.2} />
                <p className="mt-4 font-display text-xl text-espresso">
                  На этот день всё занято
                </p>
                <p className="mt-1.5 max-w-[220px] text-[11px] leading-5 text-taupe">
                  Попробуйте соседнюю дату: часто освобождаются окна утром и
                  после 18:00.
                </p>
              </div>
            )}

            {date && query.isSuccess && !closed && slots.length > 0 && (
              <div className="space-y-5">
                {GROUPS.map((group) => {
                  const times = slots.filter(
                    (slot) => slot >= group.from && slot < group.to,
                  );
                  if (!times.length) return null;

                  return (
                    <div key={group.label}>
                      <div className="mb-2.5 flex items-center gap-2">
                        <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-taupe/55">
                          {group.label}
                        </span>
                        <span className="h-px flex-1 bg-espresso/8" />
                        <span className="text-[8px] text-taupe/35">
                          {times.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {times.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => onTime(slot)}
                            aria-pressed={time === slot}
                            className={cn(
                              "rounded-full border px-2 py-2.5 text-[11px] font-semibold transition-all duration-200",
                              time === slot
                                ? "border-espresso bg-espresso text-cream shadow-soft"
                                : "border-espresso/10 bg-white/60 text-espresso hover:border-gold-500/60 hover:bg-white",
                            )}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center gap-2 rounded-xl bg-[#EDF3EC]/70 px-3 py-2 text-[8.5px] text-taupe">
                  <Wifi className="h-3 w-3 text-emerald-600" />
                  Свободно {slots.length} окон · обновление каждые 15 секунд
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-espresso/10 pt-6">
        <Button variant="ghost" onClick={onBack} className="px-3">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <Button size="lg" onClick={onContinue} disabled={!date || !time}>
          Продолжить
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

