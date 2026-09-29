"use client";

import { FormEvent, useEffect, useEffectEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ApiError } from "@/lib/api/client";

export function PasskeyRenameDialog({
  passkey,
  onCancel,
  onSave,
}: {
  passkey: { id: string; name: string };
  onCancel: () => void;
  onSave: (id: string, name: string) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(passkey.name);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const cancelFromKeyboard = useEffectEvent(() => {
    if (!saving) onCancel();
  });

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    input.current?.focus();
    input.current?.select();
    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelFromKeyboard();
        return;
      }
      if (event.key !== "Tab" || !dialog.current) return;
      const controls = Array.from(
        dialog.current.querySelectorAll<HTMLElement>(
          "input:not([disabled]), button:not([disabled])",
        ),
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyboard);
    return () => {
      document.removeEventListener("keydown", handleKeyboard);
      previousFocus?.focus();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter a Passkey name.");
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await onSave(passkey.id, name.trim());
      onCancel();
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "The Passkey name could not be updated.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-passkey-title"
        aria-describedby="rename-passkey-description"
        className="fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 overflow-auto rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6"
      >
        <div className="grid gap-2">
          <p className="text-xs font-bold tracking-[0.14em] text-brand-700">
            SIGN-IN METHODS
          </p>
          <h2 id="rename-passkey-title" className="text-xl font-bold text-ink">
            Rename Passkey
          </h2>
          <p
            id="rename-passkey-description"
            className="text-sm leading-6 text-muted"
          >
            Choose a name that helps you recognize this device later.
          </p>
        </div>
        <form onSubmit={submit} className="grid gap-4">
          <Field
            ref={input}
            id="passkey-name"
            label="Passkey name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
            error={error}
            required
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="danger"
              type="button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save name
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
