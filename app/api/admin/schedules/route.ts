import { NextResponse, type NextRequest } from "next/server";
import { requireApiOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timeStringToDate, timeValue } from "@/lib/time";
import { masterScheduleUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

const DEFAULT_START = "10:00";
const DEFAULT_END = "22:00";

function toDays(
  rows: {
    dayOfWeek: number;
    startTime: Date | string;
    endTime: Date | string;
    isActive: boolean;
  }[],
) {
  return Array.from({ length: 7 }, (_, index) => {
    const dayOfWeek = index + 1;
    const row = rows.find((item) => item.dayOfWeek === dayOfWeek);
    return {
      dayOfWeek,
      startTime: row ? timeValue(row.startTime) : DEFAULT_START,
      endTime: row ? timeValue(row.endTime) : DEFAULT_END,
      isActive: row?.isActive ?? false,
    };
  });
}

export async function GET(request: NextRequest) {
  const denied = await requireApiOwner();
  if (denied) return denied;

  const masterId = request.nextUrl.searchParams.get("masterId");
  if (!masterId) {
    return NextResponse.json(
      { error: "Нужно передать мастера" },
      { status: 400 },
    );
  }

  const master = await prisma.master.findUnique({
    where: { id: masterId },
    select: { id: true },
  });
  if (!master) {
    return NextResponse.json({ error: "Мастер не найден" }, { status: 404 });
  }

  const rows = await prisma.masterSchedule.findMany({
    where: { masterId, isActive: true },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json(
    { masterId, days: toDays(rows) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PUT(request: NextRequest) {
  const denied = await requireApiOwner();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = masterScheduleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Проверьте график" },
      { status: 400 },
    );
  }

  const { masterId, days } = parsed.data;
  const master = await prisma.master.findUnique({
    where: { id: masterId },
    select: { id: true },
  });
  if (!master) {
    return NextResponse.json({ error: "Мастер не найден" }, { status: 404 });
  }

  const activeDays = days.filter((day) => day.isActive);

  try {
    await prisma.$transaction([
      prisma.masterSchedule.deleteMany({ where: { masterId } }),
      prisma.masterSchedule.createMany({
        data: activeDays.map((day) => ({
          masterId,
          dayOfWeek: day.dayOfWeek,
          startTime: timeStringToDate(day.startTime),
          endTime: timeStringToDate(day.endTime),
          isActive: true,
        })),
      }),
    ]);

    return NextResponse.json({
      masterId,
      days: toDays(activeDays.map((day) => ({ ...day, isActive: true }))),
    });
  } catch (error) {
    console.error("Save master schedule failed", error);
    return NextResponse.json(
      { error: "Не удалось сохранить график. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
