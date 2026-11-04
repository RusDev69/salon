"use client";

import { useDeferredValue, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminBookings,
  useUpdateBookingStatus,
} from "@/hooks/use-admin";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/constants";
import { formatSalon } from "@/lib/time";
import type { ApiBooking } from "@/lib/types";
import { cn, formatPrice, getInitials } from "@/lib/utils";

const FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "Все" },
  ...BOOKING_STATUSES.map((status) => ({
    value: status.value,
    label: status.label,
  })),
];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function AppointmentsManager({
  defaultStatus = "ALL",
}: {
  defaultStatus?: string;
}) {
  const [status, setStatus] = useState(defaultStatus);
  const [date, setDate] = useState("");
  const [query, setQuery] = useState("");
  const [cancelTarget, setCancelTarget] = useState<ApiBooking | null>(null);
  const deferredQuery = useDeferredValue(query);

  const bookingsQuery = useAdminBookings({
    status: status === "ALL" ? undefined : status,
    date: date || undefined,
    q: deferredQuery || undefined,
  });
  const updateStatus = useUpdateBookingStatus();

  const bookings = bookingsQuery.data ?? [];
  const hasFilters = status !== "ALL" || date || query;

  // Only the pagination model is delegated to TanStack Table; the visual
  // markup stays fully custom and follows the World Beauty Club language.
  const table = useReactTable({
    data: bookings,
    columns: [
      { accessorKey: "customerName" },
      { accessorKey: "reference" },
      { accessorKey: "status" },
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });
  const visibleBookings = table.getRowModel().rows.map((row) => row.original);
  const pageCount = Math.max(table.getPageCount(), 1);
  const pageIndex = table.getState().pagination.pageIndex;

  function changeStatus(booking: ApiBooking, next: BookingStatus) {
    updateStatus.mutate(
      { id: booking.id, status: next },
      {
        onSuccess: () => {
          const labels: Record<string, string> = {
            CONFIRMED: "Запись подтверждена",
            COMPLETED: "Визит завершён",
            CANCELLED: "Запись отменена",
            PENDING: "Запись возвращена в ожидание",
          };
          toast.success(labels[next] ?? "Статус обновлён");
          if (next === "CANCELLED") setCancelTarget(null);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function resetFilters() {
    setStatus("ALL");
    setDate("");
    setQuery("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-white/70 bg-ivory/80 p-4 shadow-[0_20px_50px_-44px_rgba(20,34,27,.4)] backdrop-blur-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="hide-scrollbar flex gap-1.5 overflow-x-auto">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] transition-all",
                  status === filter.value
                    ? "bg-espresso text-cream shadow-soft"
                    : "border border-espresso/10 bg-white/40 text-espresso/50 hover:border-gold-500/40 hover:text-espresso",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-taupe/40" />
              <Input
                placeholder="Имя, телефон или номер"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 w-full rounded-full pl-9 text-[11px] sm:w-[230px]"
              />
            </div>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-taupe/40" />
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-10 w-full rounded-full pl-9 text-[11px] sm:w-[160px]"
                aria-label="Фильтр по дате"
              />
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-espresso/10 px-3.5 text-[9px] uppercase tracking-[0.1em] text-taupe transition-colors hover:text-espresso"
              >
                <X className="h-3 w-3" />
                Сброс
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-espresso/8 pt-3 text-[9px] text-taupe/55">
          <span>
            {bookingsQuery.isLoading
              ? "Загружаем записи..."
              : `Найдено ${bookings.length} записей`}
          </span>
          <span className="flex items-center gap-3">
            {bookingsQuery.isFetching && (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin text-gold-500" />
                обновление
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              синхронизация каждые 30 сек
            </span>
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/70 bg-ivory/80 shadow-[0_24px_60px_-48px_rgba(20,34,27,.45)] backdrop-blur-sm">
        <div className="hidden overflow-x-auto lg:block">
          <Table className="min-w-[960px] border-collapse">
            <TableHeader>
              <TableRow className="border-b border-espresso/8 text-left">
                {["Гость", "Услуга и мастер", "Дата и время", "Стоимость", "Статус", "Действия"].map(
                  (header, index) => (
                    <TableHead
                      key={header}
                      className={cn(
                        "px-5 py-3.5",
                        index === 5 && "text-right",
                      )}
                    >
                      {header}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingsQuery.isLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index} className="border-b border-espresso/5">
                    <TableCell className="px-5 py-4" colSpan={6}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!bookingsQuery.isLoading &&
                visibleBookings.map((booking) => {
                  const busy =
                    updateStatus.isPending &&
                    updateStatus.variables?.id === booking.id;
                  const isFinal =
                    booking.status === "COMPLETED" || booking.status === "CANCELLED";

                  return (
                    <TableRow
                      key={booking.id}
                      className="group border-b border-espresso/5 transition-colors last:border-0 hover:bg-white/40"
                    >
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E6EFE7] text-[9px] font-semibold text-espresso/65">
                            {getInitials(booking.customerName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[11.5px] font-semibold text-espresso">
                              {booking.customerName}
                            </p>
                            <a
                              href={`tel:${booking.customerPhone}`}
                              className="mt-0.5 block text-[9.5px] text-taupe hover:text-espresso"
                            >
                              {booking.customerPhone}
                            </a>
                            <p className="mt-0.5 text-[8px] uppercase tracking-[0.08em] text-taupe/35">
                              {booking.reference}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <p className="text-[11px] font-medium text-espresso">
                          {booking.service.name}
                        </p>
                        <p className="mt-0.5 text-[9.5px] text-taupe">
                          {booking.master.name}
                        </p>
                        {booking.notes && (
                          <p
                            className="mt-1 max-w-[190px] truncate text-[8.5px] italic text-taupe/50"
                            title={booking.notes}
                          >
                            «{booking.notes}»
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <p className="text-[11px] font-medium text-espresso">
                          {capitalize(
                            formatSalon(booking.startsAt, "d MMM, EEEE", {
                              locale: true,
                            }),
                          )}
                        </p>
                        <p className="mt-0.5 text-[9.5px] text-taupe">
                          {formatSalon(booking.startsAt, "HH:mm")}–
                          {formatSalon(booking.endsAt, "HH:mm")}
                        </p>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <p className="font-display text-base text-espresso">
                          {formatPrice(booking.service.price)}
                        </p>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {busy ? (
                            <Loader2 className="mr-3 h-4 w-4 animate-spin text-gold-600" />
                          ) : (
                            <>
                              {booking.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  className="h-8 gap-1.5 px-3 text-[9px]"
                                  onClick={() =>
                                    changeStatus(booking, "CONFIRMED")
                                  }
                                >
                                  <Check className="h-3 w-3" />
                                  Подтвердить
                                </Button>
                              )}
                              {booking.status === "CONFIRMED" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 gap-1.5 px-3 text-[9px]"
                                  onClick={() =>
                                    changeStatus(booking, "COMPLETED")
                                  }
                                >
                                  <CheckCheck className="h-3 w-3" />
                                  Завершить
                                </Button>
                              )}
                              {!isFinal && (
                                <button
                                  type="button"
                                  title="Отменить запись"
                                  aria-label="Отменить запись"
                                  onClick={() => setCancelTarget(booking)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-taupe/40 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {booking.status === "CANCELLED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    changeStatus(booking, "CONFIRMED")
                                  }
                                  className="text-[9px] font-semibold uppercase tracking-[0.08em] text-gold-600 hover:underline"
                                >
                                  Восстановить
                                </button>
                              )}
                              {booking.status === "COMPLETED" && (
                                <span className="pr-2 text-[9px] text-taupe/30">
                                  архив
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        <div className="divide-y divide-espresso/5 lg:hidden">
          {bookingsQuery.isLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          {!bookingsQuery.isLoading &&
            visibleBookings.map((booking) => {
              const busy =
                updateStatus.isPending && updateStatus.variables?.id === booking.id;
              return (
                <div key={booking.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6EFE7] text-[9px] font-semibold text-espresso/65">
                        {getInitials(booking.customerName)}
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold text-espresso">
                          {booking.customerName}
                        </p>
                        <a
                          href={`tel:${booking.customerPhone}`}
                          className="text-[9.5px] text-taupe"
                        >
                          {booking.customerPhone}
                        </a>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="mt-3 rounded-2xl bg-[#F3EADF]/70 p-3">
                    <p className="text-[11px] font-medium text-espresso">
                      {booking.service.name}
                    </p>
                    <p className="mt-0.5 text-[9.5px] text-taupe">
                      {booking.master.name} · {formatPrice(booking.service.price)}
                    </p>
                    <p className="mt-1.5 text-[9.5px] text-espresso/65">
                      {capitalize(
                        formatSalon(booking.startsAt, "d MMM, EEEE", {
                          locale: true,
                        }),
                      )}{" "}
                      · {formatSalon(booking.startsAt, "HH:mm")}–
                      {formatSalon(booking.endsAt, "HH:mm")}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-[0.08em] text-taupe/35">
                      {booking.reference}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {busy && <Loader2 className="h-4 w-4 animate-spin text-gold-600" />}
                      {!busy && booking.status === "PENDING" && (
                        <Button
                          size="sm"
                          className="h-8 px-3 text-[9px]"
                          onClick={() => changeStatus(booking, "CONFIRMED")}
                        >
                          <Check className="h-3 w-3" />
                          Подтвердить
                        </Button>
                      )}
                      {!busy && booking.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 px-3 text-[9px]"
                          onClick={() => changeStatus(booking, "COMPLETED")}
                        >
                          <CheckCheck className="h-3 w-3" />
                          Завершить
                        </Button>
                      )}
                      {!busy &&
                        !["COMPLETED", "CANCELLED"].includes(booking.status) && (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(booking)}
                            className="flex h-8 items-center gap-1 rounded-full px-2.5 text-[9px] text-rose-500"
                          >
                            <X className="h-3 w-3" />
                            Отмена
                          </button>
                        )}
                      {!busy && booking.status === "CANCELLED" && (
                        <button
                          type="button"
                          onClick={() => changeStatus(booking, "CONFIRMED")}
                          className="text-[9px] font-semibold uppercase tracking-[0.08em] text-gold-600"
                        >
                          Восстановить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {!bookingsQuery.isLoading && bookings.length > 0 && bookings.length > 8 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-espresso/8 px-5 py-3">
            <p className="text-[9px] text-taupe/55">
              Страница {pageIndex + 1} из {pageCount} · всего {bookings.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Предыдущая страница"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-espresso/10 text-espresso transition-colors hover:bg-white disabled:opacity-35"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Следующая страница"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-espresso/10 text-espresso transition-colors hover:bg-white disabled:opacity-35"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {!bookingsQuery.isLoading && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3EADF]">
              <CalendarDays className="h-5 w-5 text-gold-600/70" strokeWidth={1.3} />
            </span>
            <p className="mt-4 font-display text-2xl text-espresso">
              Записей не найдено
            </p>
            <p className="mt-2 max-w-xs text-[11px] leading-5 text-taupe">
              Попробуйте изменить фильтры или сбросить поиск — записи появятся
              здесь автоматически.
            </p>
            {hasFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                <ChevronDown className="h-3.5 w-3.5" />
                Сбросить фильтры
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <DialogTitle className="mt-2">Отменить запись?</DialogTitle>
            <DialogDescription>
              {cancelTarget && (
                <>
                  Запись {cancelTarget.customerName} на{" "}
                  {capitalize(
                    formatSalon(cancelTarget.startsAt, "d MMMM, HH:mm", {
                      locale: true,
                    }),
                  )}{" "}
                  будет отменена. Слот снова станет доступен для онлайн-записи.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Оставить
            </Button>
            <Button
              variant="destructive"
              disabled={updateStatus.isPending}
              onClick={() =>
                cancelTarget && changeStatus(cancelTarget, "CANCELLED")
              }
            >
              {updateStatus.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Отменить запись
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

