import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  tone = "dark",
  compact = false,
}: {
  className?: string;
  tone?: "dark" | "light";
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="World Beauty Club — на главную"
      className={cn("group inline-flex flex-col leading-none", className)}
    >
      <span
        className={cn(
          "flex items-center gap-2 font-display leading-none tracking-[0.15em] transition-colors",
          compact ? "text-[24px]" : "text-[21px]",
          tone === "light" ? "text-cream" : "text-espresso",
        )}
      >
        {compact ? "WBC" : "WORLD BEAUTY"}
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-500" />
      </span>
      {!compact && (
        <span
          className={cn(
            "mt-1.5 flex items-center gap-2 pl-0.5 text-[7.5px] font-semibold uppercase tracking-[0.34em]",
            tone === "light" ? "text-cream/50" : "text-espresso/45",
          )}
        >
          CLUB <span className="h-px w-5 bg-gold-500/60" /> BEAUTY & WELLNESS
        </span>
      )}
    </Link>
  );
}
