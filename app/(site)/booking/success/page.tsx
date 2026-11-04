import type { Metadata } from "next";
import { BookingSuccessPage } from "@/components/booking/booking-success-page";

export const metadata: Metadata = {
  title: "Запись создана",
  description: "Подтверждение онлайн-записи в World Beauty Club.",
  robots: { index: false, follow: false },
};

export default async function BookingSuccessRoute({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return <BookingSuccessPage reference={ref} />;
}
