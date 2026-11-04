import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { BRAND, NAV_LINKS } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer id="contacts" className="relative overflow-hidden bg-espresso text-cream">
      <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full border border-gold-500/10" />
      <div className="pointer-events-none absolute -right-16 -top-24 h-[300px] w-[300px] rounded-full border border-gold-500/10" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="container-wide relative pb-10 pt-20 lg:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.7fr_0.7fr_1fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-7 max-w-xs text-pretty text-sm leading-7 text-cream/55">
              Салон красоты на Варшавском шоссе, 122А. 169 услуг, три мастера и
              рейтинг 5.0 на Яндекс Картах. Ежедневно с 10:00 до 22:00.
            </p>
            <div className="mt-7 flex items-center gap-2.5">
              {[
                { icon: Camera, label: "ВКонтакте", href: BRAND.vk },
                { icon: Send, label: "Telegram", href: BRAND.telegram },
                { icon: MessageCircle, label: "WhatsApp", href: BRAND.whatsapp },
                { icon: Phone, label: "Позвонить", href: BRAND.phoneHref },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream/60 transition-all hover:border-gold-400/60 hover:text-gold-300"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-400/70">
              Навигация
            </p>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/60 transition-colors hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/booking"
                  className="text-sm text-cream/60 transition-colors hover:text-cream"
                >
                  Онлайн-запись
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-400/70">
              Услуги
            </p>
            <ul className="mt-5 space-y-3 text-sm text-cream/60">
              <li>Волосы и цвет</li>
              <li>Ногтевой сервис</li>
              <li>Косметология</li>
              <li>Лазерная эпиляция</li>
              <li>Брови и перманентный макияж</li>
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-400/70">
              Контакты
            </p>
            <div className="mt-5 space-y-4 text-sm text-cream/60">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400/70" />
                <span>
                  {BRAND.address}
                  <br />
                  <span className="text-cream/35">Варшавское шоссе · ежедневно 10:00–22:00</span>
                </span>
              </p>
              <a
                href={BRAND.phoneHref}
                className="flex items-center gap-2.5 transition-colors hover:text-cream"
              >
                <Phone className="h-4 w-4 text-gold-400/70" />
                {BRAND.phone}
              </a>
              <p className="text-cream/35">{BRAND.hours}</p>
              <a
                href={BRAND.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-300 transition-colors hover:text-gold-200"
              >
                Построить маршрут
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-cream/10 pt-7 text-[10px] uppercase tracking-[0.16em] text-cream/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} World Beauty Club · {BRAND.legalName}</p>
          <div className="flex flex-wrap gap-6">
            <Link href="#" className="transition-colors hover:text-cream/60">
              Политика конфиденциальности
            </Link>
            <Link href="#" className="transition-colors hover:text-cream/60">
              Публичная оферта
            </Link>
            <Link
              href="/admin/login"
              className="transition-colors hover:text-cream/60"
            >
              Для владельца
            </Link>
          </div>
        </div>

        <div className="pointer-events-none mt-12 select-none overflow-hidden">
          <p className="text-center font-display text-[clamp(5rem,18vw,15rem)] leading-[0.72] tracking-[0.08em] text-cream/[0.035]">
            WBC
          </p>
        </div>
      </div>
    </footer>
  );
}
