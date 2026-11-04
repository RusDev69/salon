"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addWeeks,
  format,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAdminWeekSlots, useToggleSlot } from "@/hooks/use-admin";
import { DAY_SLOTS, salonDateKey } from "@/lib/time";
import type { AdminSlotState } from "@/lib/types";
import { cn } from "@/lib/utils";

const CELL_STYLES: Record<AdminSlotState, string> = {
  AVAILABLE:
    "border-espresso/8 bg-white/55 text-espresso/55 hover:border-gold-500/60 hover:bg-white",
  BOOKED: "border-rose-200/80 bg-rose-100/85 text-rose-900/75",
  BLOCKED: "border-espresso bg-espresso text-cream/80",
  PAST: "border-transparent bg-espresso/[0.025] text-espresso/15",
  CLOSED: "border-transparent bg-espresso/[0.025] text-espresso/15",
};

const CELL_DOT: Record<AdminSlotState, string> = {
  AVAILABLE: "bg-emerald-500",
  BOOKED: "bg-rose-500",
  BLOCKED: "bg-gold-300",
  PAST: "bg-espresso/15",
  CLOSED: "bg-espresso/10",
};

export function WeekSlotGrid({
  masterId,
  anchorDate,
}: {
  masterId: string | null;
  anchorDate: string;
}) {
  const today = salonDateKey();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(parseISO(anchorDate), { weekStartsOn: 1 }),
  );

  useEffect(() => {
    setWeekStart(startOfWeek(parseISO(anchorDate), { weekStartsOn: 1 }));
  }, [anchorDate]);

  const dates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        format(addDays(weekStart, index), "yyyy-MM-dd"),
      ),
    [weekStart],
  );

  const queries = useAdminWeekSlots(masterId, dates);
  const toggle = useToggleSlot();
  const [pending, setPending] = useState<string | null>(null);

  const times = useMemo(() => {
    const set = new Set<string>();
    for (const query of queries) {
      for (const slot of query.data?.slots ?? []) set.add(slot.time);
    }
    return set.size ? [...set].sort() : DAY_SLOTS;
  }, [queries]);

  const slotLookup = useMemo(() => {
    const map = new Map<string, AdminSlotState>();
    dates.forEach((date, index) => {
      for (const slot of queries[index]?.data?.slots ?? []) {
        map.set(`${date}-${slot.time}`, slot.state);
      }
    });
    return map;
  }, [dates, queries]);

  const isLoading = queries.some((query) => query.isLoading);
  const weekLabel = `${format(weekStart, "d MMMM", { locale: ru })} — ${format(
    addDays(weekStart, 6),
    "d MMMM yyyy",
    { locale: ru },
  )}`;

  function toggleCell(date: string, time: string, state: AdminSlotState) {
    if (!masterId) return;
    if (state !== "AVAILABLE" && state !== "BLOCKED") return;

    const occupied = state === "BLOCKED";
    const key = `${date}-${time}`;
    setPending(key);

    toggle.mutate(
      { masterId, date, time, occupied: !occupied },
      {
        onSuccess: () => {
          toast.success(
            occupied ? "Слот снова открыт для записи" : "Слот закрыт",
          );
        },
        onError: (error) => toast.error(error.message),
        onSettled: () => setPending(null),
      },
    );
  }

  if (!masterId) {
    return (
      <div className="rounded-2xl border border-dashed border-espresso/12 p-12 text-center text-[11px] text-taupe">
        Выберите мастера, чтобы увидеть недельную сетку.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-600">
            Неделя · шаг 30 минут
          </p>
          <p className="mt-1 font-display text-xl capitalize text-espresso">
            {weekLabel}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWeekStart((date) => subWeeks(date, 1))}
            aria-label="Предыдущая неделя"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-espresso/10 bg-white/40 text-espresso transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[9px]"
            onClick={() =>
              setWeekStart(startOfWeek(parseISO(today), { weekStartsOn: 1 }))
            }
          >
            Текущая неделя
          </Button>
          <button
            type="button"
            onClick={() => setWeekStart((date) => addWeeks(date, 1))}
            aria-label="Следующая неделя"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-espresso/10 bg-white/40 text-espresso transition-colors hover:bg-white"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[8px] uppercase tracking-[0.08em] text-taupe/55">
        {[
          ["bg-white border border-espresso/20", "Свободно"],
          ["bg-rose-300", "Запись"],
          ["bg-espresso", "Закрыто"],
        ].map(([color, label]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", color)} />
            {label}
          </span>
        ))}
        <span className="text-taupe/35">Нажмите на клетку, чтобы закрыть/открыть слот</span>
      </div>

      <div className="mt-4 overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          <div
            className="grid items-center gap-1"
            style={{ gridTemplateColumns: "58px repeat(7, minmax(0, 1fr))" }}
          >
            <span />
            {dates.map((date) => {
              const isToday = date === today;
              return (
                <div
                  key={date}
                  className={cn(
                    "rounded-xl px-1 py-2 text-center",
                    isToday ? "bg-espresso/[0.06]" : "",
                  )}
                >
                  <p className="text-[7px] uppercase tracking-[0.1em] text-taupe/50">
                    {format(parseISO(date), "EEEEEE", { locale: ru })}
                  </p>
                  <p className="mt-0.5 font-display text-lg leading-none text-espresso">
                    {format(parseISO(date), "d")}
                  </p>
                  <p className="mt-0.5 text-[7px] uppercase tracking-[0.08em] text-taupe/40">
                    {format(parseISO(date), "MMM", { locale: ru })}
                  </p>
                </div>
              );
            })}

            {times.map((time) => (
              <div key={time} className="contents">
                <span className="pr-2 text-right font-mono text-[9px] text-taupe/50">
                  {time}
                </span>
                {dates.map((date) => {
                  const state =
                    slotLookup.get(`${date}-${time}`) ??
                    (queryDateLoading(queries, dates, date) ? null : "PAST");
                  const key = `${date}-${time}`;
                  const busy = pending === key;
                  const interactive =
                    state === "AVAILABLE" || state === "BLOCKED";

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!interactive || busy}
                      onClick={() => state && toggleCell(date, time, state)}
                      aria-label={`${format(parseISO(date), "d MMMM", {
                        locale: ru,
                      })}, ${time}: ${
                        state
                          ? {
                              AVAILABLE: "свободно",
                              BOOKED: "запись гостя",
                              BLOCKED: "закрыто",
                              PAST: "недоступно",
                              CLOSED: "выходной",
                            }[state]
                          : "загрузка"
                      }`}
                      className={cn(
                        "flex h-8 items-center justify-center rounded-lg border text-[8px] transition-all",
                        state
                          ? CELL_STYLES[state]
                          : "border-transparent bg-espresso/[0.025]",
                        interactive && "cursor-pointer",
                        busy && "opacity-60",
                      )}
                    >
                      {busy ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : state ? (
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            state === "BLOCKED" ? "bg-gold-300" : CELL_DOT[state],
                          )}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <p className="mt-2 flex items-center gap-1.5 text-[8px] uppercase tracking-[0.1em] text-taupe/45">
          <Loader2 className="h-3 w-3 animate-spin" />
          Загружаем неделю
        </p>
      )}
    </div>
  );
}

function queryDateLoading(
  queries: ReturnType<typeof useAdminWeekSlots>,
  dates: string[],
  date: string,
) {
  const index = dates.indexOf(date);
  return queries[index]?.isLoading ?? false;
}
