"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { addDays, format, isSameDay, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import {
  CalendarOff,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Lock,
  RefreshCw,
  Rows3,
  Unlock,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { WeekSlotGrid } from "@/components/admin/week-slot-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSlots, useToggleSlot } from "@/hooks/use-admin";
import { salonDateKey } from "@/lib/time";
import type { ApiMaster } from "@/lib/types";
import { cn, pluralize } from "@/lib/utils";

function addMinutesToTime(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const STATE_META = {
  AVAILABLE: {
    label: "Свободно",
    className:
      "border-espresso/10 bg-white/55 text-espresso hover:border-gold-500/60 hover:bg-white",
  },
  BOOKED: {
    label: "Запись гостя",
    className: "border-rose-200 bg-rose-50/80 text-rose-900",
  },
  BLOCKED: {
    label: "Занято вами",
    className: "border-espresso bg-espresso text-cream",
  },
  PAST: {
    label: "Прошло",
    className: "border-espresso/5 bg-espresso/[0.03] text-espresso/25",
  },
  CLOSED: {
    label: "Выходной",
    className: "border-espresso/5 bg-espresso/[0.03] text-espresso/25",
  },
} as const;

export function ScheduleManager({ masters }: { masters: ApiMaster[] }) {
  const today = useMemo(() => salonDateKey(), []);
  const [date, setDate] = useState(today);
  const [view, setView] = useState<"day" | "week">("day");
  const [masterId, setMasterId] = useState<string | null>(masters[0]?.id ?? null);
  const slotsQuery = useAdminSlots(masterId, date);
  const toggle = useToggleSlot();
  const [pendingTime, setPendingTime] = useState<string | null>(null);

  const selectedMaster = masters.find((master) => master.id === masterId) ?? null;
  const slots = slotsQuery.data?.slots ?? [];
  const counts = {
    available: slots.filter((slot) => slot.state === "AVAILABLE").length,
    booked: slots.filter((slot) => slot.state === "BOOKED").length,
    blocked: slots.filter((slot) => slot.state === "BLOCKED").length,
    past: slots.filter((slot) => slot.state === "PAST").length,
  };
  const activeSlots = slots.filter(
    (slot) => slot.state !== "PAST" && slot.state !== "CLOSED",
  ).length;
  const load = activeSlots
    ? Math.round(((counts.booked + counts.blocked) / activeSlots) * 100)
    : 0;
  const workSlots = slots.filter(
    (slot) => slot.state !== "PAST" && slot.state !== "CLOSED",
  );
  const shiftStart = workSlots[0]?.time;
  const shiftEnd = workSlots.length
    ? addMinutesToTime(workSlots[workSlots.length - 1].time, 30)
    : null;

  const days = Array.from({ length: 10 }).map((_, index) => {
    const key = salonDateKey(addDays(new Date(), index));
    return {
      key,
      day: format(addDays(new Date(), index), "d", { locale: ru }),
      weekday: format(addDays(new Date(), index), "EEEEEE", { locale: ru }),
      isToday: key === today,
    };
  });

  useEffect(() => {
    if (!masterId && masters[0]) setMasterId(masters[0].id);
  }, [masterId, masters]);

  function shiftDay(delta: number) {
    const current = parseISO(date);
    const next = addDays(current, delta);
    if (salonDateKey(next) < today) return;
    setDate(salonDateKey(next));
  }

  function handleToggle(time: string, occupied: boolean) {
    if (!masterId) return;
    setPendingTime(time);
    toggle.mutate(
      { masterId, date, time, occupied },
      {
        onSuccess: () => {
          toast.success(
            occupied ? "Слот отмечен как занятый" : "Слот снова свободен",
          );
        },
        onError: (error) => toast.error(error.message),
        onSettled: () => setPendingTime(null),
      },
    );
  }

  if (masters.length === 0) {
    return (
      <div className="rounded-[26px] border border-white/70 bg-ivory/80 p-16 text-center">
        <UsersRound className="mx-auto h-8 w-8 text-gold-500" strokeWidth={1.2} />
        <p className="mt-4 font-display text-2xl text-espresso">Нет мастеров</p>
        <p className="mt-2 text-[11px] text-taupe">
          Добавьте мастера, чтобы управлять расписанием.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[26px] border border-white/70 bg-ivory/80 p-5 shadow-[0_20px_50px_-44px_rgba(20,34,27,.4)] backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-600">
              Мастер в смене
            </p>
            <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {masters.map((master) => (
                <button
                  key={master.id}
                  type="button"
                  onClick={() => setMasterId(master.id)}
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

          <div className="flex items-end gap-2">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                Дата смены
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => shiftDay(-1)}
                  disabled={date <= today}
                  aria-label="Предыдущий день"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso/10 text-espresso transition-colors hover:bg-white disabled:opacity-25"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="min-w-[150px] rounded-full border border-espresso/10 bg-white/55 px-4 py-2 text-center">
                  <p className="text-[11px] font-semibold capitalize text-espresso">
                    {format(parseISO(date), "d MMMM, EEEE", { locale: ru })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => shiftDay(1)}
                  aria-label="Следующий день"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso/10 text-espresso transition-colors hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Input
                type="date"
                min={today}
                value={date}
                onChange={(event) => event.target.value && setDate(event.target.value)}
                aria-label="Выбрать дату"
                className="h-9 w-[42px] rounded-full px-0 opacity-0"
              />
              <Clock3 className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-taupe/50" />
            </div>
          </div>
        </div>

        <div className="hide-scrollbar mt-5 flex gap-1.5 overflow-x-auto border-t border-espresso/8 pt-4">
          {days.map((day) => (
            <button
              key={day.key}
              type="button"
              onClick={() => setDate(day.key)}
              className={cn(
                "flex min-w-[54px] flex-1 flex-col items-center gap-1 rounded-2xl border px-2 py-2.5 transition-all",
                date === day.key
                  ? "border-espresso bg-espresso text-cream"
                  : "border-transparent bg-[#EDF3EC]/65 text-espresso hover:border-gold-500/40 hover:bg-white/60",
              )}
            >
              <span
                className={cn(
                  "text-[7px] uppercase tracking-[0.12em]",
                  date === day.key ? "text-cream/40" : "text-taupe/50",
                )}
              >
                {day.weekday}
              </span>
              <span className="font-display text-lg leading-none">{day.day}</span>
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  day.isToday
                    ? "bg-gold-400"
                    : date === day.key
                      ? "bg-cream/30"
                      : "bg-transparent",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4",
          view === "day" && "xl:grid-cols-[1fr_300px]",
        )}
      >
        <div className="rounded-[26px] border border-white/70 bg-ivory/80 p-5 shadow-[0_20px_50px_-44px_rgba(20,34,27,.4)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                Сетка слотов · шаг 30 минут
              </p>
              <h2 className="mt-1.5 font-display text-2xl text-espresso">
                {selectedMaster?.name ?? "Выберите мастера"}
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 text-[9px] text-taupe/55">
              <div className="flex items-center rounded-full border border-espresso/10 bg-white/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setView("day")}
                  aria-pressed={view === "day"}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.08em] transition-colors",
                    view === "day"
                      ? "bg-espresso text-cream"
                      : "text-taupe hover:text-espresso",
                  )}
                >
                  <Rows3 className="h-3 w-3" />
                  День
                </button>
                <button
                  type="button"
                  onClick={() => setView("week")}
                  aria-pressed={view === "week"}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.08em] transition-colors",
                    view === "week"
                      ? "bg-espresso text-cream"
                      : "text-taupe hover:text-espresso",
                  )}
                >
                  <CalendarRange className="h-3 w-3" />
                  Неделя
                </button>
              </div>
              {view === "day" && slotsQuery.isFetching && (
                <RefreshCw className="h-3 w-3 animate-spin text-gold-500" />
              )}
              {view === "day" && slotsQuery.dataUpdatedAt > 0 && (
                <span>
                  обновлено{" "}
                  {format(new Date(slotsQuery.dataUpdatedAt), "HH:mm")}
                </span>
              )}
            </div>
          </div>

          {view === "week" ? (
            <div className="mt-5">
              <WeekSlotGrid masterId={masterId} anchorDate={date} />
            </div>
          ) : (
            <>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[8px] uppercase tracking-[0.08em] text-taupe/55">
            {[
              ["bg-white border border-espresso/20", "Свободно"],
              ["bg-rose-300", "Запись"],
              ["bg-espresso", "Занято вами"],
              ["bg-espresso/10", "Прошло"],
            ].map(([color, label]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", color)} />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-5">
            {slotsQuery.isLoading && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {Array.from({ length: 15 }).map((_, index) => (
                  <Skeleton key={index} className="h-[78px] rounded-2xl" />
                ))}
              </div>
            )}

            {slotsQuery.isError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
                <p className="text-[12px] text-rose-800">
                  Не удалось загрузить слоты
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => slotsQuery.refetch()}
                >
                  Повторить
                </Button>
              </div>
            )}

            {!slotsQuery.isLoading && !slotsQuery.isError && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {slots.map((slot) => {
                  const meta = STATE_META[slot.state];
                  const interactive =
                    slot.state === "AVAILABLE" || slot.state === "BLOCKED";
                  const occupied = slot.state === "BLOCKED";
                  const busy = pendingTime === slot.time;

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!interactive || busy}
                      onClick={() => interactive && handleToggle(slot.time, !occupied)}
                      title={
                        interactive
                          ? occupied
                            ? "Вернуть слот в онлайн-запись"
                            : "Отметить слот занятым"
                          : undefined
                      }
                      className={cn(
                        "relative flex h-[78px] flex-col items-start justify-between rounded-2xl border p-3 text-left transition-all duration-200",
                        meta.className,
                        interactive &&
                          "cursor-pointer hover:-translate-y-0.5 hover:shadow-soft",
                        !interactive && "cursor-default",
                      )}
                    >
                      <div className="flex w-full items-start justify-between">
                        <span className="font-display text-[18px] leading-none">
                          {slot.time}
                        </span>
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin opacity-60" />
                        ) : slot.state === "BOOKED" ? (
                          <Lock className="h-3 w-3 opacity-35" />
                        ) : slot.state === "BLOCKED" ? (
                          <Unlock className="h-3 w-3 text-gold-300/80" />
                        ) : slot.state === "AVAILABLE" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        ) : null}
                      </div>
                      <span className="w-full">
                        <span
                          className={cn(
                            "block truncate text-[7.5px] font-semibold uppercase tracking-[0.08em]",
                            slot.state === "BLOCKED"
                              ? "text-cream/45"
                              : "text-current/45",
                          )}
                        >
                          {meta.label}
                        </span>
                        {slot.state === "BOOKED" && (
                          <span className="mt-0.5 block truncate text-[9px] font-medium normal-case tracking-normal text-rose-900/70">
                            {slot.customerName}
                          </span>
                        )}
                        {slot.state === "BLOCKED" && (
                          <span className="mt-0.5 block truncate text-[8px] normal-case tracking-normal text-cream/35">
                            нажмите, чтобы открыть
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#EDF3EC]/70 px-4 py-3">
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
            <p className="text-[9px] leading-4 text-taupe">
              Нажмите на свободный слот, чтобы закрыть его для онлайн-записи.
              Нажмите на занятый вами слот, чтобы снова открыть. Слоты с
              реальными визитами гостей изменить нельзя.
            </p>
          </div>
            </>
          )}
        </div>

        {view === "day" && (
        <aside className="space-y-4">
          <div className="rounded-[26px] bg-espresso p-6 text-cream shadow-[0_30px_60px_-45px_rgba(44,37,33,.8)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-300/70">
                  Смена
                </p>
                <h3 className="mt-1.5 font-display text-2xl">Загрузка</h3>
              </div>
              <span className="text-[9px] text-cream/35">{load}%</span>
            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-cream/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
                style={{ width: `${load}%` }}
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-cream/10 pt-4 text-center">
              <div>
                <p className="font-display text-2xl text-cream">{counts.available}</p>
                <p className="mt-1 text-[7px] uppercase tracking-[0.1em] text-cream/35">
                  свободно
                </p>
              </div>
              <div>
                <p className="font-display text-2xl text-rose-200">{counts.booked}</p>
                <p className="mt-1 text-[7px] uppercase tracking-[0.1em] text-cream/35">
                  записей
                </p>
              </div>
              <div>
                <p className="font-display text-2xl text-gold-300">{counts.blocked}</p>
                <p className="mt-1 text-[7px] uppercase tracking-[0.1em] text-cream/35">
                  закрыто
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/70 bg-ivory/80 p-5">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-600">
              Детали смены
            </p>
            {selectedMaster && (
              <div className="mt-3 flex items-center gap-3">
                <span className="relative h-11 w-11 overflow-hidden rounded-full border border-white bg-sand">
                  <Image
                    src={selectedMaster.photoUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <div>
                  <p className="text-[11.5px] font-semibold text-espresso">
                    {selectedMaster.name}
                  </p>
                  <p className="text-[8px] uppercase tracking-[0.1em] text-rose-600">
                    {selectedMaster.specialty}
                  </p>
                </div>
              </div>
            )}
            <div className="mt-4 space-y-2 border-t border-espresso/8 pt-3 text-[9px] text-taupe">
              <p className="flex items-center justify-between">
                <span>Рабочий день</span>
                <span className="text-espresso/65">
                  {shiftStart && shiftEnd ? `${shiftStart}–${shiftEnd}` : "выходной"}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span>Шаг сетки</span>
                <span className="text-espresso/65">30 минут</span>
              </p>
              <p className="flex items-center justify-between">
                <span>Всего слотов</span>
                <span className="text-espresso/65">
                  {slots.length}{" "}
                  {pluralize(slots.length, ["слот", "слота", "слотов"])}
                </span>
              </p>
            </div>
            {counts.past > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-[8px] text-taupe/45">
                <CalendarOff className="h-3 w-3" />
                {counts.past} прошедших слотов скрыто из действий
              </p>
            )}
          </div>
        </aside>
        )}
      </div>
    </div>
  );
}

