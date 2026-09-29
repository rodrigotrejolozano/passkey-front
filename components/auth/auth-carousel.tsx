"use client";

import {
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    icon: Fingerprint,
    eyebrow: "PASSKEYS",
    title: "Your device is your sign-in.",
    description:
      "Use the fingerprint, face recognition, or screen lock you already trust. Nothing to remember or type.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "PHISHING RESISTANT",
    title: "A safer way to prove it is you.",
    description:
      "Passkeys are tied to this site, so a convincing fake page cannot reuse your sign-in approval.",
  },
  {
    icon: KeyRound,
    eyebrow: "RECOVERY READY",
    title: "Secure access has a backup plan.",
    description:
      "Add recovery methods and keep control of your account when a device is unavailable.",
  },
];

export function AuthCarousel() {
  const [active, setActive] = useState(0);

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
            {slide.eyebrow}
          </p>
          <h2 className="mt-3 max-w-sm text-3xl font-bold tracking-tight">
            {slide.title}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
            {slide.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2" aria-label="Carousel slides">
            {slides.map((item, index) => (
              <button
                key={item.eyebrow}
                type="button"
                aria-label={`Show ${item.eyebrow.toLowerCase()} information`}
                aria-current={index === active || undefined}
                onClick={() => setActive(index)}
                className={`h-2 rounded-full transition-all ${index === active ? "w-7 bg-white" : "w-2 bg-white/35 hover:bg-white/60"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={previous}
              className="grid size-9 place-items-center rounded-lg border border-white/20 text-white hover:bg-white/10"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
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
