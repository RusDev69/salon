import { NextResponse, type NextRequest } from "next/server";
import { requireApiOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DAY_SLOTS,
  buildScheduleSlots,
  isSlotInPast,
  isoWeekday,
  salonDateTime,
  timeValue,
} from "@/lib/time";
import type { AdminSlot } from "@/lib/types";
import { slotToggleSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await requireApiOwner();
  if (denied) return denied;

  const { searchParams } = request.nextUrl;
  const masterId = searchParams.get("masterId");
  const date = searchParams.get("date");

  if (!masterId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Нужно передать мастера и дату" },
      { status: 400 },
    );
  }

  const master = await prisma.master.findUnique({ where: { id: masterId } });
  if (!master) {
    return NextResponse.json({ error: "Мастер не найден" }, { status: 404 });
  }

  const schedules = await prisma.masterSchedule.findMany({
    where: {
      masterId,
      dayOfWeek: isoWeekday(date),
      isActive: true,
    },
    select: { startTime: true, endTime: true },
  });

  if (schedules.length === 0) {
    return NextResponse.json(
      {
        date,
        masterId,
        slots: DAY_SLOTS.map((time) => ({
          time,
          state: "CLOSED" as const,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const ranges = schedules.map((schedule) => ({
    startTime: timeValue(schedule.startTime),
    endTime: timeValue(schedule.endTime),
  }));
  const start = salonDateTime(date, "00:00");
  const end = salonDateTime(date, "23:59");
  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        masterId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startsAt: { gte: start, lte: end },
      },
      include: { service: true },
    }),
    prisma.slotBlock.findMany({
      where: { masterId, startsAt: { gte: start, lte: end } },
    }),
  ]);

  const closed = false;
  const slots: AdminSlot[] = buildScheduleSlots(date, ranges).map((time) => {
    if (closed) return { time, state: "CLOSED" };
    if (isSlotInPast(date, time)) return { time, state: "PAST" };

    const slotStart = salonDateTime(date, time);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60_000);
    const booking = bookings.find(
      (item) => item.startsAt < slotEnd && item.endsAt > slotStart,
    );
    if (booking) {
      return {
        time,
        state: "BOOKED",
        bookingId: booking.id,
        customerName: booking.customerName,
        serviceName: booking.service.name,
      };
    }

    const block = blocks.find(
      (item) => item.startsAt < slotEnd && item.endsAt > slotStart,
    );
    if (block) {
      return {
        time,
        state: "BLOCKED",
        blockId: block.id,
        blockReason: block.reason,
      };
    }

    return { time, state: "AVAILABLE" };
  });

  return NextResponse.json(
    { date, masterId, slots },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const denied = await requireApiOwner();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = slotToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте данные" }, { status: 400 });
  }

  const { masterId, date, time, occupied } = parsed.data;

  const schedules = await prisma.masterSchedule.findMany({
    where: {
      masterId,
      dayOfWeek: isoWeekday(date),
      isActive: true,
    },
    select: { startTime: true, endTime: true },
  });

  if (
    schedules.length === 0 ||
    !buildScheduleSlots(
      date,
      schedules.map((schedule) => ({
        startTime: timeValue(schedule.startTime),
        endTime: timeValue(schedule.endTime),
      })),
    ).includes(time)
  ) {
    return NextResponse.json({ error: "Недоступный слот" }, { status: 400 });
  }
  if (isSlotInPast(date, time)) {
    return NextResponse.json({ error: "Слот уже прошёл" }, { status: 409 });
  }

  const startsAt = salonDateTime(date, time);
  const endsAt = new Date(startsAt.getTime() + 30 * 60_000);

  if (occupied) {
    const booking = await prisma.booking.findFirst({
      where: {
        masterId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { id: true },
    });
    if (booking) {
      return NextResponse.json(
        { error: "В этом слоте уже есть запись" },
        { status: 409 },
      );
    }

    await prisma.slotBlock.upsert({
      where: { masterId_startsAt: { masterId, startsAt } },
      update: { endsAt, reason: "Занято владельцем" },
      create: {
        masterId,
        startsAt,
        endsAt,
        reason: "Занято владельцем",
      },
    });
  } else {
    await prisma.slotBlock.deleteMany({ where: { masterId, startsAt } });
  }

  return NextResponse.json({ ok: true, occupied });
}
