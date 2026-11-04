import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Загрузка кабинета">
      <div className="space-y-3">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="h-12 w-[320px]" />
        <Skeleton className="h-3 w-[420px] max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[24px]" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.55fr_0.85fr]">
        <Skeleton className="h-[420px] rounded-[26px]" />
        <Skeleton className="h-[420px] rounded-[26px]" />
      </div>
    </div>
  );
}
