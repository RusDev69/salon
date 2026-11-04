import Image from "next/image";
import Link from "next/link";
import { addDays } from "date-fns";
import {
  ArrowUpRight,
  CalendarCheck2,
  CalendarDays,
  Clock3,
  Gauge,
  Hourglass,
  Sparkles,
  UsersRound,
  Wallet,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatSalon, getDayBounds, salonDateKey } from "@/lib/time";
import { formatPrice, getInitials, pluralize } from "@/lib/utils";
import type { BookingStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function AdminOverviewPage() {
  const session = await requireOwner();
  const now = new Date();
  const todayKey = salonDateKey(now);
  const { start, end } = getDayBounds(todayKey);
  const weekEnd = addDays(now, 7);

  const [todayBookings, pendingCount, weekBookings, masters, totalBookings, pending] =
    await Promise.all([
      prisma.booking.findMany({
        where: { startsAt: { gte: start, lt: end } },
        include: { service: true, master: true },
        orderBy: { startsAt: "asc" },
      }),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.findMany({
        where: {
          startsAt: { gte: start, lt: weekEnd },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        include: { service: true },
      }),
      prisma.master.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.booking.count(),
      prisma.booking.findMany({
        where: { status: "PENDING" },
        include: { service: true, master: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

  const activeToday = todayBookings.filter((booking) =>
    ["PENDING", "CONFIRMED"].includes(booking.status),
  );
  const capacity = Math.max(masters.length, 1) * 12 * 60;
  const bookedMinutes = activeToday.reduce(
    (sum, booking) =>
      sum + (booking.endsAt.getTime() - booking.startsAt.getTime()) / 60_000,
    0,
  );
  const occupancy = Math.min(100, Math.round((bookedMinutes / capacity) * 100));
  const weekRevenue = weekBookings.reduce(
    (sum, booking) => sum + booking.service.price,
    0,
  );

  const hour = Number(formatSalon(now, "H"));
  const greeting =
    hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
  const firstName = session.name.split(" ")[0];

  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(now, index);
    const key = formatSalon(date, "yyyy-MM-dd");
    const count = weekBookings.filter(
      (booking) => formatSalon(booking.startsAt, "yyyy-MM-dd") === key,
    ).length;
    return {
      key,
      count,
      day: formatSalon(date, "d", { locale: true }),
      weekday: capitalize(formatSalon(date, "EEEEEE", { locale: true })),
      isToday: index === 0,
    };
  });
  const maxDay = Math.max(...weekDays.map((day) => day.count), 1);

  const masterLoads = masters.map((master) => {
    const bookings = activeToday.filter((booking) => booking.masterId === master.id);
    const minutes = bookings.reduce(
      (sum, booking) =>
        sum + (booking.endsAt.getTime() - booking.startsAt.getTime()) / 60_000,
      0,
    );
    return {
      ...master,
      count: bookings.length,
      percent: Math.min(100, Math.round((minutes / (12 * 60)) * 100)),
    };
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={capitalize(formatSalon(now, "d MMMM, EEEE", { locale: true }))}
        title={
          <>
            {greeting}, <span className="italic text-rose-500">{firstName}</span>
          </>
        }
        description={`Сегодня в клубе ${activeToday.length} ${pluralize(
          activeToday.length,
          ["запись", "записи", "записей"],
        )}. Всё под контролем — хорошего дня.`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/schedule">
                <CalendarDays className="h-4 w-4" />
                Расписание
              </Link>
            </Button>
            <Button asChild>
              <Link href="/booking" target="_blank">
                Новая запись
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Записей сегодня"
          value={String(todayBookings.length)}
          note={`${activeToday.length} активных · ${todayBookings.length - activeToday.length} завершено/отменено`}
          icon={CalendarCheck2}
        />
        <StatCard
          label="Ожидают подтверждения"
          value={String(pendingCount)}
          note={pendingCount ? "Нужен ваш ответ гостям" : "Все заявки обработаны"}
          icon={Hourglass}
          accent="rose"
        />
        <StatCard
          label="Выручка за 7 дней"
          value={formatPrice(weekRevenue)}
          note={`${weekBookings.length} подтверждённых визитов`}
          icon={Wallet}
          accent="green"
        />
        <StatCard
          label="Загрузка дня"
          value={`${occupancy}%`}
          note={`${Math.round(bookedMinutes / 60)} ч из ${Math.round(capacity / 60)} ч доступно`}
          icon={Gauge}
          accent="gold"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_0.85fr]">
        <section className="rounded-[26px] border border-white/70 bg-ivory/80 p-5 shadow-[0_20px_50px_-42px_rgba(20,34,27,.45)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                Расписание
              </p>
              <h2 className="mt-1.5 font-display text-2xl text-espresso">
                Сегодня в клубе
              </h2>
            </div>
            <Link
              href="/admin/bookings"
              className="group inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-espresso/55 transition-colors hover:text-espresso"
            >
              Все записи
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-6 space-y-1">
            {todayBookings.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-espresso/12 py-14 text-center">
                <Sparkles className="h-7 w-7 text-gold-400" strokeWidth={1.2} />
                <p className="mt-3 font-display text-xl text-espresso">
                  Сегодня записей нет
                </p>
                <p className="mt-1 text-[11px] text-taupe">
                  Отличный день, чтобы подготовить новые ритуалы.
                </p>
              </div>
            )}

            {todayBookings.map((booking) => (
              <div
                key={booking.id}
                className="group flex gap-4 rounded-2xl px-2 py-3 transition-colors hover:bg-white/50"
              >
                <div className="w-[52px] shrink-0 pt-0.5 text-right">
                  <p className="font-display text-lg leading-none text-espresso">
                    {formatSalon(booking.startsAt, "HH:mm")}
                  </p>
                  <p className="mt-1 text-[8px] text-taupe/50">
                    {formatSalon(booking.endsAt, "HH:mm")}
                  </p>
                </div>

                <div className="relative flex flex-col items-center">
                  <span className="mt-1 h-2 w-2 rounded-full border-2 border-gold-500 bg-ivory" />
                  <span className="mt-1 w-px flex-1 bg-espresso/10 group-last:hidden" />
                </div>

                <div className="min-w-0 flex-1 pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold text-espresso">
                        {booking.customerName}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-taupe">
                        {booking.service.name}
                      </p>
                    </div>
                    <StatusBadge status={booking.status as BookingStatus} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-taupe/65">
                    <span className="flex items-center gap-1.5">
                      <span className="relative h-4 w-4 overflow-hidden rounded-full bg-sand">
                        <Image
                          src={booking.master.photoUrl}
                          alt=""
                          fill
                          unoptimized
                          sizes="16px"
                          className="object-cover"
                        />
                      </span>
                      {booking.master.name}
                    </span>
                    <span>{formatPrice(booking.service.price)}</span>
                    <span className="text-taupe/40">{booking.reference}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <section className="relative overflow-hidden rounded-[26px] bg-espresso p-6 text-cream shadow-[0_30px_60px_-42px_rgba(44,37,33,.8)]">
            <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border border-gold-400/15" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-300/70">
                  Загрузка
                </p>
                <h2 className="mt-1.5 font-display text-2xl">Ритм дня</h2>
              </div>
              <Gauge className="h-4 w-4 text-gold-300/60" />
            </div>

            <div className="mt-6 flex items-center gap-5">
              <div
                className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#DCC59A 0 ${occupancy}%, rgba(255,255,255,.09) ${occupancy}% 100%)`,
                }}
              >
                <div className="flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full bg-espresso">
                  <span className="font-display text-[28px] leading-none text-cream">
                    {occupancy}%
                  </span>
                  <span className="mt-1 text-[7px] uppercase tracking-[0.18em] text-cream/35">
                    занято
                  </span>
                </div>
              </div>
              <div className="space-y-2.5">
                <p className="text-[10px] leading-5 text-cream/50">
                  {activeToday.length} активных визитов
                  <br />
                  {masters.length} мастеров в смене
                </p>
                <p className="text-[8px] uppercase tracking-[0.12em] text-emerald-300/80">
                  ● Онлайн-запись включена
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-cream/10 pt-4">
              {masterLoads.map((master) => (
                <div key={master.id}>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-cream/55">{master.name}</span>
                    <span className="text-cream/30">{master.percent}%</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-cream/10">
                    <div
                      className="h-full rounded-full bg-gold-400/80"
                      style={{ width: `${master.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] border border-white/70 bg-ivory/80 p-5 shadow-[0_20px_50px_-42px_rgba(20,34,27,.45)]">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-600">
              Быстрые действия
            </p>
            <div className="mt-3 grid gap-2">
              <Link
                href="/admin/schedule"
                className="group flex items-center justify-between rounded-2xl bg-[#EDF3EC] px-4 py-3 transition-colors hover:bg-[#DCE9DF]"
              >
                <span className="flex items-center gap-2.5 text-[11px] text-espresso">
                  <CalendarDays className="h-4 w-4 text-gold-600" />
                  Управлять слотами
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-espresso/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/admin/masters"
                className="group flex items-center justify-between rounded-2xl bg-[#EDF3EC] px-4 py-3 transition-colors hover:bg-[#DCE9DF]"
              >
                <span className="flex items-center gap-2.5 text-[11px] text-espresso">
                  <UsersRound className="h-4 w-4 text-gold-600" />
                  Команда клуба
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-espresso/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[26px] border border-white/70 bg-ivory/80 p-5 shadow-[0_20px_50px_-42px_rgba(20,34,27,.45)] sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                Прогноз
              </p>
              <h2 className="mt-1.5 font-display text-2xl text-espresso">
                Ближайшие 7 дней
              </h2>
            </div>
            <p className="text-[9px] text-taupe/50">
              {weekBookings.length} визитов
            </p>
          </div>

          <div className="mt-6 flex h-36 items-end gap-2">
            {weekDays.map((day) => (
              <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[8px] text-taupe/45">{day.count || "—"}</span>
                <div className="relative flex h-24 w-full items-end justify-center overflow-hidden rounded-t-xl bg-[#EDF3EC]/70">
                  <div
                    className={
                      day.isToday
                        ? "w-full rounded-t-xl bg-gradient-to-t from-rose-500 to-rose-300"
                        : "w-full rounded-t-xl bg-gradient-to-t from-gold-600/80 to-gold-300/80"
                    }
                    style={{
                      height: `${Math.max(8, (day.count / maxDay) * 100)}%`,
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-semibold text-espresso/70">{day.day}</p>
                  <p className="text-[7px] uppercase tracking-[0.08em] text-taupe/45">
                    {day.weekday}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-white/70 bg-ivory/80 p-5 shadow-[0_20px_50px_-42px_rgba(20,34,27,.45)] sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                Требуют внимания
              </p>
              <h2 className="mt-1.5 font-display text-2xl text-espresso">
                Новые заявки
              </h2>
            </div>
            <Link
              href="/admin/bookings"
              className="text-[9px] font-semibold uppercase tracking-[0.1em] text-gold-600 hover:underline"
            >
              Все
            </Link>
          </div>

          <div className="mt-5 space-y-2">
            {pending.length === 0 && (
              <div className="rounded-2xl bg-[#EDF3EC]/60 px-4 py-8 text-center text-[11px] text-taupe">
                Новых заявок нет — все гости подтверждены.
              </div>
            )}
            {pending.map((booking) => (
              <Link
                key={booking.id}
                href="/admin/bookings"
                className="group flex items-center gap-3 rounded-2xl border border-transparent px-2 py-2.5 transition-colors hover:border-espresso/8 hover:bg-white/45"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[9px] font-semibold text-rose-700">
                  {getInitials(booking.customerName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11.5px] font-semibold text-espresso">
                    {booking.customerName}
                  </p>
                  <p className="truncate text-[9px] text-taupe">
                    {booking.service.name} ·{" "}
                    {capitalize(formatSalon(booking.startsAt, "d MMM, HH:mm", { locale: true }))}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[9px] text-espresso/60">
                    {formatPrice(booking.service.price)}
                  </p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-[7px] uppercase tracking-[0.08em] text-rose-500">
                    <Clock3 className="h-2.5 w-2.5" />
                    ответить
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#EDF3EC]/70 px-4 py-3">
            <p className="text-[9px] text-taupe">
              Всего записей за всё время:{" "}
              <span className="font-semibold text-espresso">{totalBookings}</span>
            </p>
            <Link
              href="/admin/bookings"
              className="text-[9px] font-semibold text-gold-600 hover:underline"
            >
              Открыть
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

