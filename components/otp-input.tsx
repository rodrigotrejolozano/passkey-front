"use client";

import { useRef } from "react";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
};

const digits = Array.from({ length: 6 });

export function OtpInput({ value, onChange, error = false }: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const values = value.padEnd(6, " ").slice(0, 6).split("");

  function update(index: number, input: string) {
    const entered = input.replace(/\D/g, "");
    if (!entered) {
      const next = values.map((digit) => (digit === " " ? "" : digit));
      next[index] = "";
      onChange(next.join(""));
      return;
    }
    const next = [...values];
    entered
      .split("")
      .slice(0, 6 - index)
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });
    onChange(next.join("").replace(/ /g, ""));
    inputs.current[Math.min(index + entered.length, 5)]?.focus();
  }

  return (
    <fieldset className="grid gap-2" aria-describedby="recovery-code-hint">
      <legend className="text-sm font-semibold text-ink">Recovery code</legend>
      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {digits.map((_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            aria-label={`Recovery code digit ${index + 1}`}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={6}
            value={values[index] === " " ? "" : values[index]}
            onChange={(event) => update(index, event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Backspace" &&
                values[index] === " " &&
                index > 0
              )
                inputs.current[index - 1]?.focus();
            }}
            className={`min-h-12 min-w-0 w-full rounded-xl border bg-white text-center text-lg font-bold text-ink outline-none transition focus:border-brand-600 focus:ring-3 focus:ring-brand-100 ${error ? "border-danger-500" : "border-line"}`}
          />
        ))}
      </div>
      <p id="recovery-code-hint" className="text-sm leading-6 text-muted">
        Enter the six-digit code from your email.
      </p>
    </fieldset>
  );
}
