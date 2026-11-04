import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.26em] text-gold-600">
          {eyebrow}
        </p>
        <h1 className="mt-2.5 font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1] tracking-[-0.03em] text-espresso">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-xl text-[12px] leading-6 text-taupe">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
