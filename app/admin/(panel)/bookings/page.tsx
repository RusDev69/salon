import type { Metadata } from "next";
import { AppointmentsManager } from "@/components/admin/appointments-manager";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BOOKING_STATUSES } from "@/lib/constants";

export const metadata: Metadata = { title: "Записи" };
export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const valid = BOOKING_STATUSES.some((item) => item.value === status)
    ? status
    : "ALL";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Клиенты и визиты"
        title={
          <>
            Все <span className="italic text-rose-500">записи</span>
          </>
        }
        description="Подтверждайте, завершайте или отменяйте визиты. Гость получит актуальный статус, а слот автоматически вернётся в онлайн-запись."
      />
      <AppointmentsManager defaultStatus={valid} />
    </div>
  );
}
