"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck2, Loader2, Phone } from "lucide-react";
import { BookingSuccess } from "@/components/booking/booking-success";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import type { ApiBooking } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "ready"; booking: ApiBooking }
  | { status: "missing" };

export function BookingSuccessPage({ reference }: { reference?: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("wbc:last-booking");
      if (!raw) {
        setState({ status: "missing" });
        return;
      }
      const booking = JSON.parse(raw) as ApiBooking;
      if (!booking?.reference || (reference && booking.reference !== reference)) {
        setState({ status: "missing" });
        return;
      }
      setState({ status: "ready", booking });
    } catch {
      setState({ status: "missing" });
    }
  }, [reference]);

  function newBooking() {
    try {
      sessionStorage.removeItem("wbc:last-booking");
    } catch {
      // ignore storage errors
    }
    router.push("/booking");
  }

  if (state.status === "loading") {
    return (
      <div className="container-wide flex min-h-[55vh] items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-taupe">
          <Loader2 className="h-5 w-5 animate-spin text-gold-600" />
          <p className="text-[10px] uppercase tracking-[0.18em]">
            Загружаем подтверждение
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "missing") {
    return (
      <div className="container-wide flex min-h-[65vh] items-center justify-center py-16">
        <div className="w-full max-w-lg rounded-[32px] border border-white/70 bg-white/40 p-8 text-center shadow-whisper backdrop-blur-md sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF4EC] text-gold-600">
            <CalendarCheck2 className="h-6 w-6" strokeWidth={1.4} />
          </span>
          <p className="mt-5 text-[8px] font-semibold uppercase tracking-[0.24em] text-gold-600">
            Запись создана
          </p>
          <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.8rem)] leading-none text-espresso">
            Всё уже
            <br />
            <span className="italic text-rose-500">в календаре</span>
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-[12px] leading-6 text-taupe">
            Мы не нашли детали в этой вкладке — возможно, страница была
            обновлена. Если вы записывались только что, позвоните нам, и
            администратор подтвердит визит по номеру.
          </p>
          {reference && (
            <p className="mt-4 rounded-full border border-espresso/10 bg-white/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-espresso/70">
              {reference}
            </p>
          )}
          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Button asChild>
              <a href={BRAND.phoneHref}>
                <Phone className="h-4 w-4" />
                Позвонить в клуб
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/booking">Записаться снова</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide py-10 sm:py-14">
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="text-[9px] font-semibold uppercase tracking-[0.18em] text-taupe transition-colors hover:text-espresso"
        >
          ← В World Beauty Club
        </Link>
      </div>
      <BookingSuccess booking={state.booking} onNewBooking={newBooking} />
    </div>
  );
}
