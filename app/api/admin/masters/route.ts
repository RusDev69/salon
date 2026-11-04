import { NextResponse, type NextRequest } from "next/server";
import { requireApiOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeMaster } from "@/lib/serializers";
import { slugify } from "@/lib/utils";
import { masterInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

async function uniqueSlug(name: string) {
  const base = slugify(name) || "master";
  let slug = base;
  let index = 1;
  while (await prisma.master.findUnique({ where: { slug } })) {
    slug = `${base}-${index++}`;
  }
  return slug;
}

export async function GET() {
  const denied = await requireApiOwner();
  if (denied) return denied;

  const masters = await prisma.master.findMany({
    include: { services: { select: { serviceId: true } } },
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(masters.map(serializeMaster));
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

  const parsed = masterInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Проверьте данные" },
      { status: 400 },
    );
  }

  const { serviceIds, ...data } = parsed.data;
  const maxSort = await prisma.master.aggregate({ _max: { sortOrder: true } });

  try {
    const master = await prisma.master.create({
      data: {
        ...data,
        slug: await uniqueSlug(data.name),
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        services: {
          create: serviceIds.map((serviceId) => ({ serviceId })),
        },
      },
      include: { services: { select: { serviceId: true } } },
    });
    return NextResponse.json(serializeMaster(master), { status: 201 });
  } catch (error) {
    console.error("Create master failed", error);
    return NextResponse.json(
      { error: "Не удалось добавить мастера" },
      { status: 500 },
    );
  }
}
