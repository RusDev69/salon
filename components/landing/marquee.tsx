import { Asterisk } from "lucide-react";

const WORDS = [
  "Маникюр и педикюр",
  "Стрижки и окрашивание",
  "Косметология",
  "Лазерная эпиляция",
  "Брови и ресницы",
  "Перманентный макияж",
];

export function Marquee() {
  const line = [...WORDS, ...WORDS];

  return (
    <div className="relative overflow-hidden border-y border-espresso/10 bg-[#EAF1E8] py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#EAF1E8] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#EAF1E8] to-transparent" />
      <div className="flex w-max animate-marquee items-center">
        {line.map((word, index) => (
          <div key={`${word}-${index}`} className="flex items-center">
            <span className="whitespace-nowrap px-8 font-display text-lg italic tracking-wide text-espresso/55 sm:text-xl">
              {word}
            </span>
            <Asterisk className="h-4 w-4 text-gold-500/70" strokeWidth={1.2} />
          </div>
        ))}
      </div>
    </div>
  );
}
