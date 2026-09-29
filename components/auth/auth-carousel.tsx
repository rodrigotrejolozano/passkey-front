"use client";

import {
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function AuthCarousel() {
  const [active, setActive] = useState(0);
  const t = useTranslations("carousel");
  const slides = [
    { icon: Fingerprint, key: "passkeys" },
    { icon: ShieldCheck, key: "phishing" },
    { icon: KeyRound, key: "recovery" },
  ] as const;

  useEffect(() => {
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];
  const Icon = slide.icon;
  function previous() {
    setActive((current) => (current - 1 + slides.length) % slides.length);
  }
  function next() {
    setActive((current) => (current + 1) % slides.length);
  }

  return (
    <aside className="relative m-4 min-h-80 overflow-hidden rounded-3xl border border-brand-300/50 bg-plum p-8 text-white shadow-sm sm:p-12 lg:h-[calc(100dvh-2rem)] lg:min-h-0 lg:p-16">
      <div className="absolute -right-16 -top-20 size-64 rounded-full bg-brand-500/35 blur-2xl" />
      <div className="absolute -bottom-20 -left-16 size-52 rounded-full border-[28px] border-mint/20" />
      <div className="relative flex min-h-64 flex-col justify-between gap-10 lg:h-full lg:min-h-0">
        <div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/12 text-mint">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-8 text-xs font-bold tracking-[0.18em] text-mint">
            {t(`${slide.key}.eyebrow`)}
          </p>
          <h2 className="mt-3 max-w-sm text-3xl font-bold tracking-tight">
            {t(`${slide.key}.title`)}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
            {t(`${slide.key}.description`)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2" aria-label="Carousel slides">
            {slides.map((item, index) => (
              <button
                key={item.key}
                type="button"
                aria-label={t("show", { slide: t(`${item.key}.eyebrow`) })}
                aria-current={index === active || undefined}
                onClick={() => setActive(index)}
                className={`h-2 rounded-full transition-all ${index === active ? "w-7 bg-white" : "w-2 bg-white/35 hover:bg-white/60"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={t("previous")}
              onClick={previous}
              className="grid size-9 place-items-center rounded-lg border border-white/20 text-white hover:bg-white/10"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={t("next")}
              onClick={next}
              className="grid size-9 place-items-center rounded-lg border border-white/20 text-white hover:bg-white/10"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
