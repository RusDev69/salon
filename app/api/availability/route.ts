import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildScheduleSlots,
  fitsSchedule,
  getDayBounds,
  isSlotInPast,
  isWithinBookingHorizon,
  isoWeekday,
  overlaps,
  salonDateTime,
  timeValue,
} from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const masterId = searchParams.get("masterId");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!masterId || !serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Нужно передать мастера, услугу и дату" },
      { status: 400 },
    );
  }

  if (!isWithinBookingHorizon(date)) {
    return NextResponse.json(
      { error: "Дата вне периода онлайн-записи" },
      { status: 400 },
    );
  }

  const [service, master] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.master.findUnique({
      where: { id: masterId },
      include: { services: { select: { serviceId: true } } },
    }),
  ]);

  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  }
  if (
    !master ||
    !master.isActive ||
    !master.services.some((item) => item.serviceId === serviceId)
  ) {
    return NextResponse.json(
      { error: "Мастер не оказывает выбранную услугу" },
      { status: 400 },
    );
  }

  const schedules = await prisma.masterSchedule.findMany({
    where: {
      masterId,
      dayOfWeek: isoWeekday(date),
      isActive: true,
    },
    orderBy: { startTime: "asc" },
    select: { startTime: true, endTime: true },
  });

  if (schedules.length === 0) {
    return NextResponse.json(
      {
        date,
        masterId,
        serviceId,
        slots: [],
        closed: true,
        fetchedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const ranges = schedules.map((schedule) => ({
    startTime: timeValue(schedule.startTime),
    endTime: timeValue(schedule.endTime),
  }));

  const { start, end } = getDayBounds(date);
  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        masterId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startsAt: { lt: end },
        endsAt: { gt: start },
      },
      select: { startsAt: true, endsAt: true },
    }),
    prisma.slotBlock.findMany({
      where: {
        masterId,
        startsAt: { lt: end },
        endsAt: { gt: start },
      },
      select: { startsAt: true, endsAt: true },
    }),
  ]);

  const available = buildScheduleSlots(date, ranges).filter((time) => {
    if (isSlotInPast(date, time)) return false;
    if (!fitsSchedule(date, time, service.durationMin, ranges)) return false;

    const slotStart = salonDateTime(date, time);
    const slotEnd = new Date(slotStart.getTime() + service.durationMin * 60_000);

    const busy =
      bookings.some((booking) =>
        overlaps(slotStart, slotEnd, booking.startsAt, booking.endsAt),
      ) ||
      blocks.some((block) =>
        overlaps(slotStart, slotEnd, block.startsAt, block.endsAt),
      );

    return !busy;
  });

  return NextResponse.json(
    {
      date,
      masterId,
      serviceId,
      slots: available,
      closed: false,
      fetchedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
