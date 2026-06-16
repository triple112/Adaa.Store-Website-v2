"use client";

import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-elevated px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:border-primary/40 hover:text-primary-light"
    >
      {copied ? "تم النسخ ✓" : (label ?? "نسخ")}
    </button>
  );
}
