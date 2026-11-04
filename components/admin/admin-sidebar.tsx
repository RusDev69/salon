"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn, getInitials } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Записи", icon: CalendarRange },
  { href: "/admin/schedule", label: "Расписание", icon: CalendarDays },
  { href: "/admin/masters", label: "Мастера", icon: UsersRound },
];

function SidebarInner({
  user,
  pendingCount,
  onNavigate,
}: {
  user: { name: string; email: string };
  pendingCount: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        weekday: "long",
      }).format(new Date()),
    );
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Вы вышли из кабинета");
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col bg-espresso text-cream">
      <div className="relative border-b border-cream/10 px-6 py-7">
        <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full border border-gold-400/15" />
        <Logo tone="light" />
        <p className="mt-5 flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-cream/35">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Клуб открыт · онлайн-запись
        </p>
      </div>

      <div className="px-4 pt-6">
        <p className="px-3 text-[8px] font-semibold uppercase tracking-[0.24em] text-cream/25">
          Управление
        </p>
        <nav className="mt-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[12px] transition-all",
                  active
                    ? "bg-cream/10 text-cream"
                    : "text-cream/50 hover:bg-cream/[0.055] hover:text-cream/80",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold-400" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-gold-300" : "text-cream/35",
                  )}
                  strokeWidth={1.5}
                />
                <span className="flex-1">{label}</span>
                {href === "/admin/bookings" && pendingCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-400/90 px-1.5 text-[9px] font-semibold text-white">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mx-4 mt-6 rounded-2xl border border-cream/10 bg-cream/[0.04] p-4">
        <p className="flex items-center gap-2 text-[8px] uppercase tracking-[0.16em] text-gold-300/70">
          <Scissors className="h-3 w-3" />
          Сегодня
        </p>
        <p className="mt-2 text-[11px] capitalize text-cream/70">{today}</p>
        <Link
          href="/admin/schedule"
          onClick={onNavigate}
          className="mt-3 inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-gold-300 transition-colors hover:text-gold-200"
        >
          Открыть расписание
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-cream/10 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/20 text-[10px] font-semibold text-gold-200">
              {getInitials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-cream/85">
                {user.name}
              </p>
              <p className="truncate text-[8px] text-cream/35">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="h-8 flex-1 justify-start px-2 text-[9px] text-cream/45 hover:bg-cream/5 hover:text-cream"
            >
              <Link href="/" onClick={onNavigate}>
                <ArrowUpRight className="h-3 w-3" />
                На сайт
              </Link>
            </Button>
            <button
              type="button"
              onClick={logout}
              aria-label="Выйти"
              className="flex h-8 w-8 items-center justify-center rounded-full text-cream/35 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="mt-4 text-center text-[7px] uppercase tracking-[0.24em] text-cream/15">
          WBC OS · v1.0
        </p>
      </div>
    </div>
  );
}

export function AdminSidebar({
  user,
  pendingCount,
}: {
  user: { name: string; email: string };
  pendingCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-cream/5 lg:block">
        <SidebarInner user={user} pendingCount={pendingCount} />
      </aside>

      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-espresso/10 bg-[#F4F8F1]/90 px-4 backdrop-blur-xl lg:hidden">
        <Logo compact />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Меню кабинета">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[84%] max-w-[300px] border-cream/10 bg-espresso p-0 text-cream [&>button]:text-cream/50"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Меню кабинета</SheetTitle>
              <SheetDescription>Навигация по панели управления</SheetDescription>
            </SheetHeader>
            <SidebarInner
              user={user}
              pendingCount={pendingCount}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

