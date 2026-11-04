import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeService } from "@/lib/serializers";

export const dynamic = "force-dynamic";

export async function GET() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(services.map(serializeService));
}
