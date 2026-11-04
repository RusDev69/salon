import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: { default: "Кабинет владельца", template: "%s · World Beauty Club Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireOwner();
  const pendingCount = await prisma.booking.count({
    where: { status: "PENDING" },
  });

  return (
    <div className="min-h-screen bg-[#F2F6EF]">
      <AdminSidebar
        user={{ name: session.name, email: session.email }}
        pendingCount={pendingCount}
      />
      <div className="lg:pl-[264px]">
        <main className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}

