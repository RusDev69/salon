import { BRAND } from "@/lib/constants";

/**
 * BeautySalon structured data helps search engines show the address, phone
 * and rating for branded queries. Values are static and controlled by us, so
 * serialising them into a script tag is safe.
 */
export function SalonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/#salon`,
    name: BRAND.fullName,
    description:
      "World Beauty Club — салон красоты на Варшавском шоссе: маникюр и педикюр, стрижки и окрашивание, косметология, лазерная эпиляция, брови и перманентный макияж.",
    telephone: BRAND.phone,
    email: BRAND.email,
    priceRange: "₽₽",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Варшавское шоссе, 122А",
      addressLocality: "Москва",
      addressCountry: "RU",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "10:00",
        closes: "22:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "389",
      bestRating: "5",
    },
    sameAs: [BRAND.vk, BRAND.telegram, BRAND.whatsapp],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
