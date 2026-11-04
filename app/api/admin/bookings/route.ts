import { NextResponse, type NextRequest } from "next/server";
import { requireApiOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBooking } from "@/lib/serializers";
import { getDayBounds } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await requireApiOwner();
  if (denied) return denied;

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const date = searchParams.get("date");
  const query = searchParams.get("q")?.trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 200), 500);

  const validStatus = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(
    status ?? "",
  );

  const where = {
    ...(validStatus && status ? { status } : {}),
    ...(date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? getDateWhere(date) : {}),
    ...(query
      ? {
          OR: [
            { customerName: { contains: query } },
            { customerPhone: { contains: query } },
            { reference: { contains: query } },
          ],
        }
      : {}),
  };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      service: true,
      master: { include: { services: { select: { serviceId: true } } } },
    },
    orderBy: { startsAt: "asc" },
    take: limit,
  });

  return NextResponse.json(bookings.map(serializeBooking));
}

function getDateWhere(date: string) {
  const { start, end } = getDayBounds(date);
  return { startsAt: { gte: start, lt: end } };
}
