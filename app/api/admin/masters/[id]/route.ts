import { NextResponse, type NextRequest } from "next/server";
import { requireApiOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeMaster } from "@/lib/serializers";
import { masterInputSchema } from "@/lib/validators";

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

  const parsed = masterInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Проверьте данные" },
      { status: 400 },
    );
  }

  const existing = await prisma.master.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Мастер не найден" }, { status: 404 });
  }

  const { serviceIds, ...data } = parsed.data;
  const master = await prisma.master.update({
    where: { id },
    data: {
      ...data,
      ...(serviceIds
        ? {
            services: {
              deleteMany: {},
              create: serviceIds.map((serviceId) => ({ serviceId })),
            },
          }
        : {}),
    },
    include: { services: { select: { serviceId: true } } },
  });

  return NextResponse.json(serializeMaster(master));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireApiOwner();
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.master.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Мастер не найден" }, { status: 404 });
  }

  // Мягкое удаление сохраняет историю визитов и статистику.
  const master = await prisma.master.update({
    where: { id },
    data: { isActive: false },
    include: { services: { select: { serviceId: true } } },
  });

  return NextResponse.json({ ...serializeMaster(master), archived: true });
}
