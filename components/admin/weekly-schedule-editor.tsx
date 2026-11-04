"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CalendarClock, Check, Clock3, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMasterSchedule, useSaveMasterSchedule } from "@/hooks/use-admin";
import type { ApiMaster, ApiScheduleDay } from "@/lib/types";
import { cn, pluralize } from "@/lib/utils";

const WEEK = [
  { dayOfWeek: 1, short: "Пн", label: "Понедельник" },
  { dayOfWeek: 2, short: "Вт", label: "Вторник" },
  { dayOfWeek: 3, short: "Ср", label: "Среда" },
  { dayOfWeek: 4, short: "Чт", label: "Четверг" },
  { dayOfWeek: 5, short: "Пт", label: "Пятница" },
  { dayOfWeek: 6, short: "Сб", label: "Суббота" },
  { dayOfWeek: 7, short: "Вс", label: "Воскресенье" },
] as const;

function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

export function WeeklyScheduleEditor({ masters }: { masters: ApiMaster[] }) {
  const [masterId, setMasterId] = useState<string | null>(masters[0]?.id ?? null);
  const [days, setDays] = useState<ApiScheduleDay[]>([]);
  const scheduleQuery = useMasterSchedule(masterId);
  const save = useSaveMasterSchedule();

  // Hydrate local draft only when the server version for another master arrives.
  useEffect(() => {
    if (scheduleQuery.data?.days) {
      setDays(scheduleQuery.data.days);
    }
  }, [scheduleQuery.data]);

  useEffect(() => {
    if (!masterId && masters[0]) setMasterId(masters[0].id);
  }, [masterId, masters]);

  const selectedMaster = masters.find((master) => master.id === masterId) ?? null;
  const activeDays = days.filter((day) => day.isActive);
  const totalMinutes = useMemo(
    () =>
      activeDays.reduce(
        (sum, day) => sum + minutesBetween(day.startTime, day.endTime),
        0,
      ),
    [activeDays],
  );
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const isDirty = useMemo(() => {
    const source = scheduleQuery.data?.days;
    if (!source) return false;
    return JSON.stringify(source) !== JSON.stringify(days);
  }, [days, scheduleQuery.data?.days]);

  function updateDay(dayOfWeek: number, patch: Partial<ApiScheduleDay>) {
    setDays((current) =>
      current.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day,
      ),
    );
  }

  function submit() {
    if (!masterId) return;

    for (const day of activeDays) {
      if (day.startTime >= day.endTime) {
        toast.error(
          `Проверьте ${WEEK.find((item) => item.dayOfWeek === day.dayOfWeek)?.label.toLowerCase()}: начало позже окончания.`,
        );
        return;
      }
    }

    save.mutate(
      { masterId, days },
      {
        onSuccess: () => toast.success("График мастера обновлён"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function reset() {
    if (scheduleQuery.data?.days) setDays(scheduleQuery.data.days);
  }

  if (masters.length === 0) {
    return (
      <div className="rounded-[26px] border border-white/70 bg-ivory/80 p-16 text-center">
        <CalendarClock className="mx-auto h-8 w-8 text-gold-500" strokeWidth={1.2} />
        <p className="mt-4 font-display text-2xl text-espresso">Нет мастеров</p>
        <p className="mt-2 text-[11px] text-taupe">
          Сначала добавьте мастера, затем настройте его рабочую неделю.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[26px] border border-white/70 bg-ivory/80 p-5 shadow-[0_20px_50px_-44px_rgba(20,34,27,.4)] backdrop-blur-sm sm:p-6">
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-600">
          Мастер недели
        </p>
        <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {masters.map((master) => (
            <button
              key={master.id}
              type="button"
              onClick={() => {
                setMasterId(master.id);
                setDays([]);
              }}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 transition-all",
                masterId === master.id
                  ? "border-espresso bg-white shadow-soft"
                  : "border-espresso/10 bg-white/35 hover:border-gold-500/40",
              )}
            >
              <span className="relative h-8 w-8 overflow-hidden rounded-full bg-sand">
                <Image
                  src={master.photoUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="32px"
                  className="object-cover"
                />
              </span>
              <span className="text-left">
                <span className="block text-[10.5px] font-semibold text-espresso">
                  {master.name}
                </span>
                <span className="block text-[7px] uppercase tracking-[0.1em] text-taupe">
                  {master.specialty}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[26px] border border-white/70 bg-ivory/80 p-5 shadow-[0_20px_50px_-44px_rgba(20,34,27,.4)] backdrop-blur-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-600">
              Повторяющийся график
            </p>
            <h2 className="mt-1.5 font-display text-2xl text-espresso">
              {selectedMaster?.name ?? "Выберите мастера"}
            </h2>
            <p className="mt-1.5 max-w-xl text-[10.5px] leading-5 text-taupe">
              Свободные окна в онлайн-записи строятся из этих интервалов. Услуга
              целиком должна помещаться в смену мастера.
            </p>
          </div>
          <div className="rounded-2xl bg-[#EDF3EC]/70 px-4 py-2.5 text-right">
            <p className="font-display text-2xl text-espresso">{totalHours} ч</p>
            <p className="text-[8px] uppercase tracking-[0.12em] text-taupe">
              {activeDays.length}{" "}
              {pluralize(activeDays.length, ["день", "дня", "дней"])} в неделю
            </p>
          </div>
        </div>

        {scheduleQuery.isLoading && (
          <div className="mt-6 space-y-2">
            {WEEK.map((day) => (
              <Skeleton key={day.dayOfWeek} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {scheduleQuery.isError && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
            <p className="text-[11px] text-rose-800">
              Не удалось загрузить график мастера.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => scheduleQuery.refetch()}
            >
              Повторить
            </Button>
          </div>
        )}

        {scheduleQuery.isSuccess && (
          <div className="mt-5 divide-y divide-espresso/8">
            {WEEK.map(({ dayOfWeek, short, label }) => {
              const day =
                days.find((item) => item.dayOfWeek === dayOfWeek) ?? {
                  dayOfWeek,
                  startTime: "10:00",
                  endTime: "22:00",
                  isActive: false,
                };
              const duration = minutesBetween(day.startTime, day.endTime);

              return (
                <div
                  key={dayOfWeek}
                  className={cn(
                    "flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center",
                    !day.isActive && "opacity-55",
                  )}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={day.isActive}
                    aria-label={`${label}: рабочий день`}
                    onClick={() => updateDay(dayOfWeek, { isActive: !day.isActive })}
                    className="flex w-full items-center gap-3 sm:w-[190px]"
                  >
                    <span
                      className={cn(
                        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                        day.isActive ? "bg-espresso" : "bg-espresso/15",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-4 w-4 rounded-full bg-cream shadow-sm transition-transform",
                          day.isActive ? "translate-x-[18px]" : "translate-x-0.5",
                        )}
                      />
                    </span>
                    <span className="flex items-baseline gap-2">
                      <span className="font-display text-lg text-espresso">
                        {short}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.1em] text-taupe">
                        {label}
                      </span>
                    </span>
                  </button>

                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      type="time"
                      step={1800}
                      value={day.startTime}
                      disabled={!day.isActive}
                      onChange={(event) =>
                        updateDay(dayOfWeek, { startTime: event.target.value })
                      }
                      aria-label={`${label}: начало смены`}
                      className="h-9 w-[118px] rounded-full px-3 text-[11px]"
                    />
                    <span className="text-[10px] text-taupe/45">—</span>
                    <Input
                      type="time"
                      step={1800}
                      value={day.endTime}
                      disabled={!day.isActive}
                      onChange={(event) =>
                        updateDay(dayOfWeek, { endTime: event.target.value })
                      }
                      aria-label={`${label}: конец смены`}
                      className="h-9 w-[118px] rounded-full px-3 text-[11px]"
                    />
                    <span className="ml-auto hidden items-center gap-1.5 text-[8px] uppercase tracking-[0.08em] text-taupe/45 sm:flex">
                      <Clock3 className="h-3 w-3" />
                      {day.isActive
                        ? `${Math.floor(duration / 60)} ч ${duration % 60 ? `${duration % 60} мин` : ""}`
                        : "выходной"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-espresso/10 pt-5">
          <p className="flex items-center gap-2 text-[9px] text-taupe/60">
            <CalendarClock className="h-3.5 w-3.5 text-gold-600" />
            Изменения применятся к новым слотам онлайн-записи.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={!isDirty || save.isPending}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Сбросить
            </Button>
            <Button
              size="sm"
              onClick={submit}
              disabled={save.isPending || !isDirty || scheduleQuery.isLoading}
            >
              {save.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Сохранить график
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

