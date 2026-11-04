"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BRAND, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40">
      <div
        className={cn(
          "hidden overflow-hidden border-b border-espresso/10 bg-espresso text-cream/70 transition-all duration-500 lg:block",
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
        )}
      >
        <div className="container-wide flex h-9 items-center justify-between text-[9px] font-medium uppercase tracking-[0.22em]">
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gold-400" />
            {BRAND.address}
          </span>
          <span className="text-cream/50">Салон красоты · ежедневно 10:00–22:00</span>
          <a
            href={BRAND.phoneHref}
            className="transition-colors hover:text-gold-300"
          >
            {BRAND.phone}
          </a>
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-500",
          scrolled
            ? "border-b border-white/60 bg-cream/80 shadow-[0_14px_40px_-30px_rgba(20,34,27,.45)] backdrop-blur-2xl"
            : "bg-transparent",
        )}
      >
        <div className="container-wide flex h-[76px] items-center justify-between gap-4">
          <Logo className="hidden sm:inline-flex" />
          <Logo compact className="sm:hidden" />

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-2 text-[12px] font-medium text-espresso/70 transition-colors hover:text-espresso"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 scale-0 rounded-full bg-gold-500 transition-transform duration-300 group-hover:scale-100" />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={BRAND.phoneHref}
              className="hidden items-center gap-2 text-[12px] text-espresso/60 transition-colors hover:text-espresso xl:flex"
            >
              <Phone className="h-3.5 w-3.5" />
              {BRAND.phone}
            </a>
            <Button asChild size="default" className="px-6">
              <Link href="/booking">Записаться</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button asChild size="sm" className="px-4">
              <Link href="/booking">Записаться</Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Открыть меню">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="paper flex flex-col">
                <SheetHeader>
                  <SheetTitle className="sr-only">Меню</SheetTitle>
                  <Logo />
                </SheetHeader>
                <nav className="mt-10 flex flex-col gap-1">
                  {NAV_LINKS.map((link, index) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-baseline justify-between border-b border-espresso/10 py-4"
                    >
                      <span className="font-display text-3xl text-espresso">
                        {link.label}
                      </span>
                      <span className="text-[10px] text-gold-600">
                        0{index + 1}
                      </span>
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto space-y-5 pb-4">
                  <div className="rounded-3xl bg-espresso p-5 text-cream">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-cream/45">
                      Связаться
                    </p>
                    <a
                      href={BRAND.phoneHref}
                      className="mt-3 block font-display text-2xl"
                    >
                      {BRAND.phone}
                    </a>
                    <p className="mt-2 text-xs text-cream/55">
                      {BRAND.address} · {BRAND.hours}
                    </p>
                  </div>
                  <Button asChild size="lg" variant="rose" className="w-full">
                    <Link href="/booking">Записаться онлайн</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

