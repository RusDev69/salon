import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Quote, Star } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Кабинет владельца",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await getSession();
  if (session?.role === "OWNER") redirect("/admin");
  const { from } = await searchParams;

  return (
    <main className="grid min-h-screen bg-cream lg:grid-cols-[1.02fr_0.98fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/wbc/asset-14.jpg"
          alt="Атмосфера World Beauty Club"
          fill
          priority
          unoptimized
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/30 to-espresso/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,247,235,.18),transparent_55%)]" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-10">
          <p className="font-display text-[26px] tracking-[0.18em] text-cream">
            WORLD BEAUTY
            <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-gold-400 align-top" />
          </p>
          <p className="text-[8px] uppercase tracking-[0.3em] text-cream/50">
            Owner&apos;s office
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
          <Quote className="h-10 w-10 text-gold-400/50" strokeWidth={0.8} />
          <blockquote className="mt-4 max-w-md font-display text-[clamp(2rem,3vw,2.9rem)] leading-[1.08] text-cream">
            «Красота без границ начинается с заботы о себе и внимания к деталям».
          </blockquote>
          <p className="mt-5 text-[9px] uppercase tracking-[0.24em] text-gold-300/70">
            Светлана Ерофеева · основатель
          </p>

          <div className="mt-9 flex items-center gap-6 border-t border-cream/15 pt-6">
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-3 w-3 fill-gold-400 text-gold-400"
                    strokeWidth={1}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-[9px] uppercase tracking-[0.14em] text-cream/45">
                5.0 · 389 отзывов
              </p>
            </div>
            <div className="h-8 w-px bg-cream/15" />
            <div>
              <p className="font-display text-2xl text-cream">169</p>
              <p className="text-[9px] uppercase tracking-[0.14em] text-cream/45">
                услуг
              </p>
            </div>
            <div className="h-8 w-px bg-cream/15" />
            <div>
              <p className="font-display text-2xl text-cream">7</p>
              <p className="text-[9px] uppercase tracking-[0.14em] text-cream/45">
                дней в неделю
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14">
        <div className="pointer-events-none absolute -right-28 top-24 h-72 w-72 rounded-full bg-rose-200/25 blur-[90px]" />
        <div className="pointer-events-none absolute -left-28 bottom-16 h-64 w-64 rounded-full bg-gold-300/15 blur-[90px]" />
        <div className="relative w-full max-w-md">
          <LoginForm from={from} />
        </div>
      </section>
    </main>
  );
}
