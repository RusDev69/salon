import { STATUS_STYLES, type BookingStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
  dot = true,
}: {
  status: BookingStatus;
  className?: string;
  dot?: boolean;
}) {
  const meta = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.08em]",
        meta.className,
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />}
      {meta.label}
    </span>
  );
}
