import { after, NextResponse, type NextRequest } from "next/server";
import { requireApiOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBooking } from "@/lib/serializers";
import { notifyBooking } from "@/lib/telegram";
import { bookingStatusSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireApiOwner();
  if (denied) return denied;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = bookingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Неизвестный статус" }, { status: 400 });
  }

  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: { status: parsed.data.status },
    include: {
      service: true,
      master: { include: { services: { select: { serviceId: true } } } },
    },
  });

  if (existing.status !== parsed.data.status) {
    const previousStatus = existing.status;
    after(async () => {
      try {
        await notifyBooking(booking, {
          type: "status",
          previousStatus,
        });
      } catch (error) {
        console.error("Telegram status notification failed", error);
      }
    });
  }

  return NextResponse.json(serializeBooking(booking));
}
