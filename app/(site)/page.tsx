import { CtaSection } from "@/components/landing/cta-section";
import { Hero } from "@/components/landing/hero";
import { SocialSection } from "@/components/landing/social-section";
import { Marquee } from "@/components/landing/marquee";
import { MastersSection } from "@/components/landing/masters-section";
import { PhilosophySection } from "@/components/landing/philosophy-section";
import { ServicesSection } from "@/components/landing/services-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { prisma } from "@/lib/prisma";
import { serializeMaster, serializeService } from "@/lib/serializers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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

  const reviewCount = masters.reduce((sum, master) => sum + master.reviewsCount, 0);

  return (
    <>
      <Hero reviewCount={reviewCount} />
      <Marquee />
      <ServicesSection services={services.map(serializeService)} />
      <MastersSection masters={masters.map(serializeMaster)} />
      <PhilosophySection />
      <TestimonialsSection />
      <SocialSection />
      <CtaSection />
    </>
  );
}
