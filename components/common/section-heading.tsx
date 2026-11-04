import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleClassName,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <div
        className={cn(
          "eyebrow",
          align === "center" && "justify-center",
        )}
      >
        {eyebrow}
      </div>
      <h2
        className={cn(
          "mt-5 text-balance text-[clamp(2.3rem,5vw,4.25rem)] font-normal leading-[1.02] tracking-[-0.03em] text-espresso",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 max-w-xl text-pretty text-[15px] leading-7 text-taupe",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
