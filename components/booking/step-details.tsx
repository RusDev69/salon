"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateHuman } from "@/lib/time";
import type { ApiMaster, ApiService } from "@/lib/types";
import { cn, formatPhone } from "@/lib/utils";
import {
  bookingDetailsSchema,
  type BookingDetailsValues,
} from "@/lib/validators";

export function StepDetails({
  service,
  master,
  date,
  time,
  customerName,
  customerPhone,
  customerEmail,
  notes,
  setContact,
  onBack,
  onSubmit,
  isPending,
  error,
}: {
  service: ApiService;
  master: ApiMaster;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  setContact: (
    field: "customerName" | "customerPhone" | "customerEmail" | "notes",
    value: string,
  ) => void;
  onBack: () => void;
  onSubmit: (values: BookingDetailsValues) => void;
  isPending: boolean;
  error?: string | null;
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingDetailsValues>({
    resolver: zodResolver(bookingDetailsSchema),
    mode: "onTouched",
    defaultValues: {
      customerName,
      customerPhone,
      customerEmail,
      notes,
      consent: true,
    },
  });

  // Keep the Zustand draft in sync while the guest moves between steps.
  useEffect(() => {
    const subscription = watch((values) => {
      setContact("customerName", values.customerName ?? "");
      setContact("customerPhone", values.customerPhone ?? "");
      setContact("customerEmail", values.customerEmail ?? "");
      setContact("notes", values.notes ?? "");
    });
    return () => subscription.unsubscribe();
  }, [setContact, watch]);

  const fieldClass = (invalid: boolean) =>
    cn(invalid && "border-rose-300 bg-rose-50/30");

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <form onSubmit={submit} noValidate>
      <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-gold-600">
        04 · Подтверждение
      </p>
      <h2 className="mt-3 text-balance font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.02] tracking-[-0.03em] text-espresso">
        Осталось
        <br />
        <span className="italic text-rose-500">познакомиться</span>
      </h2>
      <p className="mt-3 max-w-lg text-[12.5px] leading-6 text-taupe">
        Оставьте контакты — администратор подтвердит запись и ответит на вопросы.
        Никаких рассылок и звонков без повода.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-gold-500/20 bg-[#EEF4EC]/70 px-4 py-3 text-[11px] text-espresso">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-gold-600" />
          {formatDateHuman(date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-gold-600" />
          {time}
        </span>
        <span className="text-taupe/60">
          {service.name} · {master.name.split(" ")[0]}
        </span>
      </div>

      {(error || Object.keys(errors).length > 0) && (
        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11.5px] leading-5 text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error ?? "Проверьте выделенные поля — и можно подтверждать."}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerName">Имя *</Label>
          <Input
            id="customerName"
            autoComplete="name"
            placeholder="Как к вам обращаться"
            aria-invalid={Boolean(errors.customerName)}
            className={fieldClass(Boolean(errors.customerName))}
            {...register("customerName")}
          />
          {errors.customerName && (
            <p className="text-[10px] text-rose-600">
              {errors.customerName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Телефон *</Label>
          <Controller
            control={control}
            name="customerPhone"
            render={({ field }) => (
              <Input
                id="customerPhone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+7 (___) ___-__-__"
                aria-invalid={Boolean(errors.customerPhone)}
                className={fieldClass(Boolean(errors.customerPhone))}
                value={field.value}
                onBlur={field.onBlur}
                ref={field.ref}
                onChange={(event) =>
                  field.onChange(formatPhone(event.target.value))
                }
              />
            )}
          />
          {errors.customerPhone && (
            <p className="text-[10px] text-rose-600">
              {errors.customerPhone.message}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="customerEmail">Email — по желанию</Label>
          <Input
            id="customerEmail"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.customerEmail)}
            className={fieldClass(Boolean(errors.customerEmail))}
            {...register("customerEmail")}
          />
          {errors.customerEmail && (
            <p className="text-[10px] text-rose-600">
              {errors.customerEmail.message}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Пожелания</Label>
          <Textarea
            id="notes"
            placeholder="Аллергии, предпочтения, важные детали — всё, что нам стоит знать"
            className="min-h-[92px]"
            {...register("notes")}
          />
        </div>
      </div>

      <label
        className={cn(
          "mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border bg-white/30 p-3.5",
          errors.consent ? "border-rose-300" : "border-espresso/8",
        )}
      >
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#14221B]"
          {...register("consent")}
        />
        <span className="text-[10px] leading-5 text-taupe">
          Согласен(-на) с обработкой персональных данных и{" "}
          <span className="underline decoration-gold-500/50 underline-offset-2">
            политикой конфиденциальности
          </span>
          . Без спама — только подтверждение записи.
          {errors.consent && (
            <span className="mt-1 block text-rose-600">
              {errors.consent.message}
            </span>
          )}
        </span>
      </label>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-espresso/10 pt-6">
        <Button type="button" variant="ghost" onClick={onBack} className="px-3">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Записываем...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Подтвердить запись
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

