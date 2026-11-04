import type { Metadata } from "next";
import { MastersManager } from "@/components/admin/masters-manager";
import { AdminPageHeader } from "@/components/admin/page-header";
import { prisma } from "@/lib/prisma";
import { serializeService } from "@/lib/serializers";

export const metadata: Metadata = { title: "Мастера" };
export const dynamic = "force-dynamic";

export default async function MastersPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Команда клуба"
        title={
          <>
            Наши <span className="italic text-rose-500">мастера</span>
          </>
        }
        description="Добавляйте новых специалистов, редактируйте профили и управляйте тем, кто виден на сайте. Скрытие сохраняет историю визитов."
      />
      <MastersManager services={services.map(serializeService)} />
    </div>
  );
}
