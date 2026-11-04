import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeMaster } from "@/lib/serializers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const serviceId = request.nextUrl.searchParams.get("serviceId");
  const all = request.nextUrl.searchParams.get("all") === "1";

  const masters = await prisma.master.findMany({
    where: {
      ...(all ? {} : { isActive: true }),
      ...(serviceId ? { services: { some: { serviceId } } } : {}),
    },
    include: { services: { select: { serviceId: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(masters.map(serializeMaster));
}
