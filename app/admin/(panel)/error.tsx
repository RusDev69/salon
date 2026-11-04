"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin panel error", error);
  }, [error]);

  return (
    <div className="flex min-h-[65vh] items-center justify-center">
      <div className="w-full max-w-md rounded-[26px] border border-rose-200/70 bg-ivory/85 p-8 text-center shadow-soft">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-espresso">
          Не удалось загрузить раздел
        </h2>
        <p className="mt-2 text-[11.5px] leading-5 text-taupe">
          Проверьте соединение и повторите попытку. Записи не потеряны — они
          хранятся в базе.
        </p>
        <Button onClick={reset} className="mt-5">
          <RotateCcw className="h-4 w-4" />
          Повторить
        </Button>
        {error.digest && (
          <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.12em] text-taupe/35">
            {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
