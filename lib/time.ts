import { addDays, addMinutes } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ru } from "date-fns/locale";

export const SALON_TIMEZONE =
  process.env.NEXT_PUBLIC_SALON_TIMEZONE || "Europe/Moscow";
export const OPEN_TIME = "10:00";
export const CLOSE_TIME = "22:00";
export const SLOT_STEP = 30;
export const BOOKING_HORIZON_DAYS = 60;

export function salonDateKey(date: Date = new Date()) {
  return formatInTimeZone(date, SALON_TIMEZONE, "yyyy-MM-dd");
}

export function salonTime(date: Date) {
  return formatInTimeZone(date, SALON_TIMEZONE, "HH:mm");
}

export function salonDateTime(dateKey: string, time: string) {
  return fromZonedTime(`${dateKey}T${time}:00`, SALON_TIMEZONE);
}

export function formatSalon(
  value: Date | string,
  pattern: string,
  options?: { locale?: boolean },
) {
  return formatInTimeZone(
    new Date(value),
    SALON_TIMEZONE,
    pattern,
    options?.locale ? { locale: ru } : undefined,
  );
}

export function buildDaySlots() {
  const slots: string[] = [];
  let cursor = salonDateTime("2026-01-01", OPEN_TIME);
  const close = salonDateTime("2026-01-01", CLOSE_TIME);
  while (addMinutes(cursor, SLOT_STEP) <= close) {
    slots.push(formatInTimeZone(cursor, SALON_TIMEZONE, "HH:mm"));
    cursor = addMinutes(cursor, SLOT_STEP);
  }
  return slots;
}

export const DAY_SLOTS = buildDaySlots();

export type ScheduleRange = {
  startTime: string;
  endTime: string;
};

/**
 * Prisma stores a Postgres `time` column as a Date anchored at 1970-01-01.
 * Convert it to the `HH:MM` string used by the UI and domain layer.
 */
export function timeValue(value: Date | string) {
  if (typeof value === "string") return value.slice(0, 5);
  return value.toISOString().slice(11, 16);
}

export function timeStringToDate(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

/** ISO weekday: 1 = Monday, 7 = Sunday. Matches master_schedules. */
export function isoWeekday(dateKey: string) {
  const day = new Date(`${dateKey}T12:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

export function getDayBounds(dateKey: string) {
  const start = salonDateTime(dateKey, "00:00");
  return { start, end: addDays(start, 1) };
}

/**
 * Start times of 30-minute slots inside the master's recurring schedule.
 * Multiple ranges per day are supported (e.g. a lunch break).
 */
export function buildScheduleSlots(
  dateKey: string,
  ranges: ScheduleRange[],
  stepMinutes = SLOT_STEP,
) {
  const result = new Set<string>();

  for (const range of ranges) {
    let cursor = salonDateTime(dateKey, range.startTime);
    const end = salonDateTime(dateKey, range.endTime);
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) continue;

    while (addMinutes(cursor, stepMinutes) <= end) {
      result.add(formatInTimeZone(cursor, SALON_TIMEZONE, "HH:mm"));
      cursor = addMinutes(cursor, stepMinutes);
    }
  }

  return [...result].sort();
}

/**
 * A service fits when its full duration is inside at least one working range.
 * Checking the whole interval (not only the start) prevents a long treatment
 * from spilling over the end of the shift.
 */
export function fitsSchedule(
  dateKey: string,
  time: string,
  durationMinutes: number,
  ranges: ScheduleRange[],
) {
  const start = salonDateTime(dateKey, time);
  const end = addMinutes(start, durationMinutes);

  return ranges.some((range) => {
    const rangeStart = salonDateTime(dateKey, range.startTime);
    const rangeEnd = salonDateTime(dateKey, range.endTime);
    return start >= rangeStart && end <= rangeEnd;
  });
}

export function isSlotInPast(dateKey: string, time: string) {
  return salonDateTime(dateKey, time).getTime() <= Date.now();
}

export function isWithinBookingHorizon(dateKey: string) {
  const today = salonDateKey();
  const limit = formatInTimeZone(
    addDays(new Date(), BOOKING_HORIZON_DAYS),
    SALON_TIMEZONE,
    "yyyy-MM-dd",
  );
  return dateKey >= today && dateKey <= limit;
}

export function overlaps(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) {
  return startA < endB && endA > startB;
}

export function formatDateHuman(dateKey: string) {
  return formatInTimeZone(
    salonDateTime(dateKey, "12:00"),
    SALON_TIMEZONE,
    "d MMMM, EEEE",
    { locale: ru },
  );
}
