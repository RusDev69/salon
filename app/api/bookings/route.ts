import { randomBytes } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBooking } from "@/lib/serializers";
import { notifyBooking } from "@/lib/telegram";
import {
  buildScheduleSlots,
  fitsSchedule,
  isSlotInPast,
  isWithinBookingHorizon,
  isoWeekday,
  overlaps,
  salonDateTime,
  timeValue,
} from "@/lib/time";
import { normalizePhone } from "@/lib/utils";
import { bookingRequestSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

function reference() {
  return `WBC-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Проверьте данные" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const phone = normalizePhone(data.customerPhone);
  if (phone.length < 11) {
    return NextResponse.json(
      { error: "Введите корректный номер телефона" },
      { status: 400 },
    );
  }

  if (!isWithinBookingHorizon(data.date)) {
    return NextResponse.json(
      { error: "Дата вне периода онлайн-записи" },
      { status: 400 },
    );
  }
  if (isSlotInPast(data.date, data.time)) {
    return NextResponse.json(
      { error: "Это время уже прошло" },
      { status: 409 },
    );
  }

  const [service, master, schedules] = await Promise.all([
    prisma.service.findUnique({ where: { id: data.serviceId } }),
    prisma.master.findUnique({
      where: { id: data.masterId },
      include: { services: { select: { serviceId: true } } },
    }),
    prisma.masterSchedule.findMany({
      where: {
        masterId: data.masterId,
        dayOfWeek: isoWeekday(data.date),
        isActive: true,
      },
      select: { startTime: true, endTime: true },
    }),
  ]);

  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Услуга недоступна" }, { status: 404 });
  }
  if (
    !master ||
    !master.isActive ||
    !master.services.some((item) => item.serviceId === data.serviceId)
  ) {
    return NextResponse.json(
      { error: "Мастер недоступен для этой услуги" },
      { status: 400 },
    );
  }

  if (schedules.length === 0) {
    return NextResponse.json(
      { error: "Мастер не работает в этот день" },
      { status: 400 },
    );
  }

  const startsAt = salonDateTime(data.date, data.time);
  const endsAt = new Date(startsAt.getTime() + service.durationMin * 60_000);
  const ranges = schedules.map((schedule) => ({
    startTime: timeValue(schedule.startTime),
    endTime: timeValue(schedule.endTime),
  }));

  // The client sees only generated slots, but the request is re-validated
  // against the weekly schedule so a tampered payload cannot book an
  // out-of-hours appointment.
  if (
    !buildScheduleSlots(data.date, ranges).includes(data.time) ||
    !fitsSchedule(data.date, data.time, service.durationMin, ranges)
  ) {
    return NextResponse.json(
      { error: "Это время вне графика мастера" },
      { status: 400 },
    );
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const [conflict, block] = await Promise.all([
        tx.booking.findFirst({
          where: {
            masterId: data.masterId,
            status: { in: ["PENDING", "CONFIRMED"] },
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
          select: { id: true },
        }),
        tx.slotBlock.findFirst({
          where: {
            masterId: data.masterId,
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
          select: { id: true },
        }),
      ]);

      if (conflict || block) {
        throw new Error("SLOT_TAKEN");
      }

      return tx.booking.create({
        data: {
          reference: reference(),
          customerName: data.customerName.trim(),
          customerPhone: phone,
          customerEmail: data.customerEmail?.trim() || null,
          notes: data.notes?.trim() || null,
          startsAt,
          endsAt,
          status: "PENDING",
          serviceId: data.serviceId,
          masterId: data.masterId,
        },
        include: {
          service: true,
          master: { include: { services: { select: { serviceId: true } } } },
        },
      });
    });

    // Send Telegram notifications after the response. A Telegram outage must
    // never turn a successfully created booking into a 500 for the guest.
    after(async () => {
      try {
        await notifyBooking(booking, { type: "created" });
      } catch (error) {
        console.error("Telegram booking notification failed", error);
      }
    });

    return NextResponse.json(serializeBooking(booking), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return NextResponse.json(
        { error: "Это время только что заняли. Выберите другой слот." },
        { status: 409 },
      );
    }
    console.error("Booking failed", error);
    return NextResponse.json(
      { error: "Не удалось создать запись. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
