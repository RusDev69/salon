import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  accent = "stone",
  className,
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  accent?: "stone" | "rose" | "gold" | "green";
  className?: string;
}) {
  const accents = {
    stone: "bg-espresso/[0.055] text-espresso/65",
    rose: "bg-rose-100 text-rose-600",
    gold: "bg-gold-300/20 text-gold-600",
    green: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-white/70 bg-ivory/80 p-5 shadow-[0_20px_45px_-38px_rgba(20,34,27,.45)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-soft",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-taupe/65">
          {label}
        </p>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105",
            accents[accent],
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </span>
      </div>
      <p className="mt-5 font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-none tracking-[-0.02em] text-espresso">
        {value}
      </p>
      <p className="mt-2.5 text-[9.5px] leading-4 text-taupe">{note}</p>
    </div>
  );
}

