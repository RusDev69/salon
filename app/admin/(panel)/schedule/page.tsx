import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ScheduleWorkspace } from "@/components/admin/schedule-workspace";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { serializeMaster } from "@/lib/serializers";

export const metadata: Metadata = { title: "Расписание" };
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const masters = await prisma.master.findMany({
    where: { isActive: true },
    include: { services: { select: { serviceId: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Управление слотами"
        title={
          <>
            Расписание <span className="italic text-rose-500">клуба</span>
          </>
        }
        description="Настройте рабочую неделю мастера и закрывайте отдельные слоты одним нажатием. Изменения сразу отражаются в онлайн-записи."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/bookings">
                <CalendarDays className="h-4 w-4" />
                Все записи
              </Link>
            </Button>
            <Button asChild>
              <Link href="/booking" target="_blank">
                Проверить запись
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />
      <ScheduleWorkspace masters={masters.map(serializeMaster)} />
    </div>
  );
}
