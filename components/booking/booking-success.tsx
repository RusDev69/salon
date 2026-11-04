"use client";

import Link from "next/link";
import {
  CalendarPlus,
  Check,
  Clock3,
  Home,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { formatSalon } from "@/lib/time";
import type { ApiBooking } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toIcsDate(value: string) {
  return `${new Date(value).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

export function BookingSuccess({
  booking,
  onNewBooking,
}: {
  booking: ApiBooking;
  onNewBooking: () => void;
}) {
  function downloadCalendar() {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//World Beauty Club//Booking//RU",
      "BEGIN:VEVENT",
      `UID:${booking.id}@worldbeautyclub.ru`,
      `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
      `DTSTART:${toIcsDate(booking.startsAt)}`,
      `DTEND:${toIcsDate(booking.endsAt)}`,
      `SUMMARY:${booking.service.name} — World Beauty Club`,
      `DESCRIPTION:Мастер: ${booking.master.name}. Номер записи: ${booking.reference}`,
      `LOCATION:${BRAND.address}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wbc-${booking.reference}.ics`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-[32px] border border-white/70 bg-ivory/90 shadow-lift backdrop-blur-md">
        <div className="relative overflow-hidden bg-espresso px-6 py-12 text-center text-cream sm:px-10">
          <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full border border-gold-400/15" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full border border-gold-400/15" />
          <Sparkles className="pointer-events-none absolute left-[18%] top-10 h-4 w-4 text-gold-400/50" />
          <Sparkles className="pointer-events-none absolute right-[16%] bottom-12 h-3 w-3 text-gold-400/40" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold-400/50 bg-gold-500/10">
            <span className="absolute -inset-2 rounded-full border border-gold-400/20" />
            <Check className="h-7 w-7 text-gold-300" strokeWidth={1.4} />
          </div>
          <p className="mt-5 text-[8px] font-semibold uppercase tracking-[0.3em] text-gold-300/80">
            Запись создана
          </p>
          <h1 className="mt-3 text-balance font-display text-[clamp(2.6rem,6vw,4.2rem)] leading-[0.98] tracking-[-0.035em]">
            Вы записаны,
            <br />
            <span className="italic text-[#D8EBDD]">{booking.customerName.split(" ")[0]}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[12px] leading-6 text-cream/55">
            Администратор подтвердит запись в течение дня. Сохраните номер — он
            понадобится при визите.
          </p>
          <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-cream/15 bg-white/5 px-5 py-2.5">
            <span className="text-[8px] uppercase tracking-[0.2em] text-cream/40">
              Номер записи
            </span>
            <span className="font-display text-lg tracking-[0.08em] text-cream">
              {booking.reference}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#EEF4EC]/70 p-4">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-taupe/60">
                Когда
              </p>
              <p className="mt-2 font-display text-xl leading-snug text-espresso">
                {capitalize(formatSalon(booking.startsAt, "d MMMM, EEEE", { locale: true }))}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-taupe">
                <Clock3 className="h-3.5 w-3.5 text-gold-600" />
                {formatSalon(booking.startsAt, "HH:mm")}–
                {formatSalon(booking.endsAt, "HH:mm")}
              </p>
            </div>
            <div className="rounded-2xl bg-[#EEF4EC]/70 p-4">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-taupe/60">
                Услуга
              </p>
              <p className="mt-2 font-display text-xl leading-snug text-espresso">
                {booking.service.name}
              </p>
              <p className="mt-1 text-[11px] text-taupe">
                {booking.master.name} · {formatPrice(booking.service.price)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-espresso/8 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[12px] font-semibold text-espresso">
                {BRAND.address}
              </p>
              <p className="mt-1 text-[10px] leading-5 text-taupe">
                {BRAND.address}. Приходите за 5 минут до начала — успеем
                предложить чай или кофе.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button onClick={downloadCalendar} className="flex-1">
              <CalendarPlus className="h-4 w-4" />
              Добавить в календарь
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4" />
                На главную
              </Link>
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-espresso/10 pt-5">
            <p className="flex items-center gap-2 text-[9.5px] text-taupe">
              <Phone className="h-3.5 w-3.5 text-gold-600" />
              Вопросы? {BRAND.phone}
            </p>
            <button
              type="button"
              onClick={onNewBooking}
              className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gold-600 underline-offset-4 hover:underline"
            >
              Записаться ещё раз
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

