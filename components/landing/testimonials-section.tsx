import { Quote } from "lucide-react";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { StarRating } from "@/components/common/star-rating";
import { TESTIMONIALS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

export function TestimonialsSection() {
  return (
    <section id="reviews" className="section-space relative overflow-hidden">
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-[36px] border border-white/60 bg-gradient-to-br from-[#E5F0E6] via-[#EFF5EC] to-[#D9E8DD] px-5 py-14 shadow-[0_40px_90px_-55px_rgba(20,34,27,.28)] sm:px-10 lg:px-14 lg:py-20">
          <div className="pointer-events-none absolute -right-24 -top-28 h-[360px] w-[360px] rounded-full border border-gold-500/20" />
          <div className="pointer-events-none absolute -bottom-36 -left-24 h-[420px] w-[420px] rounded-full border border-white/50" />
          <Quote
            className="pointer-events-none absolute right-8 top-6 h-28 w-28 text-white/30"
            strokeWidth={0.6}
          />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <Reveal>
              <SectionHeading
                eyebrow="Отзывы гостей"
                title={
                  <>
                    Слова, которые
                    <br />
                    <span className="italic text-rose-600">остаются</span>
                  </>
                }
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/35 px-5 py-4 backdrop-blur-sm">
                <p className="font-display text-4xl leading-none text-espresso">5.0</p>
                <div>
                  <StarRating value={5} />
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-espresso/45">
                    389 отзывов · Яндекс Карты
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="relative mt-10 grid gap-4 md:grid-cols-2">
            {TESTIMONIALS.map((review, index) => (
              <Reveal key={review.name} delay={index * 0.07}>
                <figure className="flex h-full flex-col rounded-3xl border border-white/55 bg-[#FBFCF7]/70 p-6 backdrop-blur-sm transition-colors duration-500 hover:bg-[#FBFCF7] sm:p-7">
                  <StarRating value={review.rating} size="sm" />
                  <blockquote className="mt-4 flex-1 text-pretty font-display text-[19px] leading-[1.55] text-espresso/85">
                    «{review.text}»
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-espresso/10 pt-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-espresso text-[10px] font-semibold tracking-wider text-cream">
                      {getInitials(review.name)}
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-espresso">
                        {review.name}
                      </p>
                      <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-taupe">
                        {review.service}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
