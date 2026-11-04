"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BOOKING_HORIZON_DAYS, salonDateKey } from "@/lib/time";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function BookingCalendar({
  selected,
  onSelect,
  className,
}: {
  selected: string | null;
  onSelect: (dateKey: string) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = useMemo(() => salonDateKey(), []);
  const horizon = useMemo(
    () => addDays(today, BOOKING_HORIZON_DAYS),
    [today],
  );
  const [visibleMonth, setVisibleMonth] = useState(() =>
    selected ? new Date(`${selected}T12:00:00`) : new Date(),
  );

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  const monthLabel = format(visibleMonth, "LLLL yyyy", { locale: ru });
  const canGoBack =
    startOfMonth(visibleMonth).getTime() > startOfMonth(today).getTime();
  const canGoForward =
    startOfMonth(visibleMonth).getTime() < startOfMonth(horizon).getTime();

  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/70 bg-white/45 p-4 backdrop-blur-sm sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-gold-600">
            Выберите день
          </p>
          <p className="mt-1 font-display text-[22px] capitalize leading-none text-espresso">
            {monthLabel}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => subMonths(month, 1))}
            disabled={!canGoBack}
            aria-label="Предыдущий месяц"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso/10 bg-white/50 text-espresso transition-all hover:border-gold-500/50 hover:bg-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            disabled={!canGoForward}
            aria-label="Следующий месяц"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso/10 bg-white/50 text-espresso transition-all hover:border-gold-500/50 hover:bg-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="pb-2 text-center text-[8px] font-semibold uppercase tracking-[0.12em] text-taupe/70"
          >
            {day}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={format(visibleMonth, "yyyy-MM")}
          initial={reduce ? false : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -8 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="calendar-grid gap-1"
        >
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const currentMonth = isSameMonth(day, visibleMonth);
            const past = isBefore(day, today);
            const beyond = isBefore(horizon, day);
            const disabled = !currentMonth || past || beyond;
            const isSelected = selected === key;
            const isToday = isSameDay(day, today);

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(key)}
                aria-label={format(day, "d MMMM, EEEE", { locale: ru })}
                aria-pressed={isSelected}
                className={cn(
                  "relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-medium transition-all duration-300 sm:h-11 sm:w-11",
                  !currentMonth && "pointer-events-none opacity-0",
                  currentMonth && past && "text-taupe/25",
                  currentMonth &&
                    !disabled &&
                    !isSelected &&
                    "text-espresso/75 hover:bg-white hover:text-espresso hover:shadow-soft",
                  isSelected &&
                    "bg-espresso text-cream shadow-[0_10px_25px_-12px_rgba(44,37,33,.7)]",
                  isToday &&
                    !isSelected &&
                    "ring-1 ring-gold-500/55 ring-offset-2 ring-offset-[#f8f1e8]",
                )}
              >
                {format(day, "d")}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-gold-500" />
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-espresso/10 px-1 pt-4 text-[9px] text-taupe/70">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
          Сегодня
        </span>
        <span>Ежедневно 10:00–22:00</span>
        <span>Запись на {BOOKING_HORIZON_DAYS} дней</span>
      </div>
    </div>
  );
}
