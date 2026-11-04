import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = "default",
  className,
}: {
  value: number;
  size?: "sm" | "default";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`Рейтинг ${value} из 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
            index < Math.round(value)
              ? "fill-gold-400 text-gold-400"
              : "fill-transparent text-gold-300/40",
          )}
          strokeWidth={1.4}
        />
      ))}
    </div>
  );
}
