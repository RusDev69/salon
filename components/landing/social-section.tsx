import Image from "next/image";
import { ArrowUpRight, Camera, Images } from "lucide-react";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

const POSTS = [
  {
    src: "/images/wbc/asset-13.jpg",
    alt: "Интерьер World Beauty Club",
    caption: "Пространство клуба",
  },
  {
    src: "/images/wbc/asset-15.jpg",
    alt: "Рабочее место nail-мастера",
    caption: "Ногтевой сервис",
  },
  {
    src: "/images/wbc/asset-02.jpg",
    alt: "Зал World Beauty Club",
    caption: "Пространство клуба",
  },
  {
    src: "/images/wbc/asset-18.jpg",
    alt: "Работа стилиста с волосами",
    caption: "Стрижки и уход",
  },
];

export function SocialSection() {
  return (
    <section className="relative overflow-hidden border-t border-espresso/5 bg-[#F0F5EE] py-20 lg:py-24">
      <div className="container-wide">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <SectionHeading
              eyebrow="Сообщество"
              title={
                <>
                  Жизнь <span className="italic text-rose-500">клуба</span>
                </>
              }
              titleClassName="text-[clamp(2.2rem,4.5vw,3.6rem)]"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <p className="max-w-xs text-[12px] leading-6 text-taupe">
                Новые услуги, работы мастеров и атмосфера World Beauty Club — в
                нашем сообществе ВКонтакте.
              </p>
              <Button asChild variant="outline" className="shrink-0">
                <a
                  href={BRAND.vk}
                  target="_blank"
                  rel="noreferrer"
                  className="group"
                >
                  <Camera className="h-4 w-4" />
                  @worldbeautyclub
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {POSTS.map((post, index) => (
            <Reveal key={post.src} delay={index * 0.06}>
              <a
                href={BRAND.vk}
                target="_blank"
                rel="noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-[24px] bg-sand"
              >
                <Image
                  src={post.src}
                  alt={post.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14221B]/75 via-[#14221B]/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-x-4 bottom-4 flex translate-y-2 items-center justify-between text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-[10px] font-medium tracking-[0.04em]">
                    {post.caption}
                  </p>
                  <Images className="h-3.5 w-3.5 text-cream/70" />
                </div>
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-cream/20 text-cream opacity-0 backdrop-blur-md transition-opacity duration-500 group-hover:opacity-100">
                  <Camera className="h-3.5 w-3.5" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center text-[9px] uppercase tracking-[0.2em] text-taupe/50">
          Больше фото и видео — в сообществе World Beauty Club ВКонтакте
        </p>
      </div>
    </section>
  );
}
