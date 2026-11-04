import type { Metadata } from "next";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "World Beauty Club — салон красоты на Варшавском шоссе",
    template: "%s · World Beauty Club",
  },
  description:
    "World Beauty Club на Варшавском шоссе, 122А: маникюр и педикюр, стрижки и окрашивание, косметология, лазерная эпиляция, брови и перманентный макияж. Рейтинг 5.0 на Яндекс Картах, 389 отзывов. Онлайн-запись.",
  keywords: [
    "World Beauty Club",
    "салон красоты Варшавское шоссе",
    "маникюр Москва",
    "лазерная эпиляция",
    "косметология",
    "стрижка и окрашивание волос",
    "брови и ресницы",
  ],
  openGraph: {
    title: "World Beauty Club — красота без границ",
    description:
      "Полный спектр beauty-услуг на Варшавском шоссе, 122А. 169 услуг, 5.0 на Яндекс Картах, ежедневно 10:00–22:00.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        {/* Content stays visible if JavaScript is unavailable or fails. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            offset={92}
            toastOptions={{
              style: {
                background: "#FBFCF7",
                border: "1px solid #E8DCCD",
                color: "#14221B",
                borderRadius: "16px",
                boxShadow: "0 24px 60px -30px rgba(20,34,27,.4)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

