import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { BookingFlow } from "@/components/booking/booking-flow";
import { BRAND } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { serializeMaster, serializeService } from "@/lib/serializers";

export const metadata: Metadata = {
  title: "Онлайн-запись",
  description:
    "Онлайн-запись в World Beauty Club на Варшавском шоссе: выберите услугу, мастера и удобное время. Свободные окна обновляются в реальном времени.",
};

export const dynamic = "force-dynamic";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; master?: string }>;
}) {
  const params = await searchParams;
  const [services, masters] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.master.findMany({
      where: { isActive: true },
      include: { services: { select: { serviceId: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-8 sm:pt-10">
        <div className="pointer-events-none absolute -right-40 top-0 h-[460px] w-[460px] rounded-full bg-rose-200/25 blur-[100px]" />
        <div className="pointer-events-none absolute left-1/4 top-20 h-[300px] w-[300px] rounded-full bg-gold-300/15 blur-[100px]" />
        <div className="pointer-events-none absolute right-[8%] top-16 hidden select-none font-display text-[11rem] leading-none text-espresso/[0.025] lg:block">
          Beauty
        </div>

        <div className="container-wide relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-taupe transition-colors hover:text-espresso"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            На главную
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="eyebrow">Онлайн-запись · 2 минуты</div>
              <h1 className="mt-5 text-balance font-display text-[clamp(3rem,6.5vw,5.8rem)] font-normal leading-[0.92] tracking-[-0.045em] text-espresso">
                Красота
                <br />
                начинается{" "}
                <span className="italic text-rose-500">здесь</span>
              </h1>
              <p className="mt-5 max-w-lg text-pretty text-[14px] leading-7 text-taupe">
                Четыре спокойных шага — и время для себя уже в календаре.
                Маникюр, волосы, косметология или лазер — выбирайте услугу и
                мастера.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[9px] uppercase tracking-[0.14em] text-espresso/50">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold-600" />
                  Без предоплаты
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5 text-gold-600" />
                  Отмена за 24 часа
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-gold-600" />
                  Подтверждение администратором
                </span>
              </div>
            </div>

            <div className="glass ml-auto w-full max-w-sm rounded-[26px] p-5">
              <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-gold-600">
                Нужна помощь с выбором?
              </p>
              <a
                href={BRAND.phoneHref}
                className="mt-2.5 flex items-center gap-2 font-display text-2xl text-espresso transition-colors hover:text-rose-600"
              >
                <Phone className="h-4 w-4 text-gold-600" />
                {BRAND.phone}
              </a>
              <div className="mt-3 space-y-1 text-[10px] leading-5 text-taupe">
                <p>{BRAND.hours}</p>
                <p>{BRAND.address}</p>
              </div>
              <div className="mt-4 border-t border-espresso/10 pt-3 text-[9px] leading-4 text-taupe/60">
                Администратор поможет подобрать услугу и мастера, если вы
                сомневаетесь.
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingFlow
        services={services.map(serializeService)}
        masters={masters.map(serializeMaster)}
        initialServiceSlug={params.service}
        initialMasterSlug={params.master}
      />
    </>
  );
}
