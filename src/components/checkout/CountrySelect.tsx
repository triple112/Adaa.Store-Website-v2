"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { COUNTRIES } from "@/data/countries";
import { cn } from "@/lib/utils";

/** Forgiving normalization: lowercases, strips Arabic diacritics and unifies
 *  alef/ya/ta-marbuta so "مصر"/"إسرائيل" etc. match regardless of spelling. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْٰ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

export function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value);

  const filtered = useMemo(() => {
    const ql = query.trim();
    if (!ql) return COUNTRIES;
    const qn = normalize(ql);
    const qDigits = ql.replace(/\D/g, "");
    return COUNTRIES.filter(
      (c) =>
        normalize(c.name).includes(qn) ||
        normalize(c.en).includes(qn) ||
        c.code.toLowerCase().includes(qn) ||
        (qDigits.length > 0 && c.dial.includes(qDigits)),
    );
  }, [query]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // On open: focus the search, reset query, point the highlight at the selection.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    const idx = filtered.findIndex((c) => c.code === value);
    setActive(idx >= 0 ? idx : 0);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = filtered[active];
      if (c) choose(c.code);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white transition-colors hover:border-white/20 focus:border-primary-light/60 focus:outline-none focus:ring-1 focus:ring-primary-light/30"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <span className="truncate font-semibold">{selected.name}</span>
              <span className="truncate text-subtle">· {selected.en}</span>
            </>
          ) : (
            <span className="text-subtle">اختر الدولة</span>
          )}
        </span>
        <ChevronDownIcon
          className={cn("h-4 w-4 shrink-0 text-subtle transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/12 bg-elevated shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="border-b border-white/10 p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="ابحث بالعربي أو English…"
              className="w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-subtle focus:border-primary-light/60 focus:outline-none"
            />
          </div>

          <ul ref={listRef} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-center text-sm text-subtle">لا توجد نتيجة</li>
            ) : (
              filtered.map((c, i) => {
                const isSelected = c.code === value;
                const isActive = i === active;
                return (
                  <li key={c.code} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(c.code)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-right text-sm transition-colors",
                        isActive ? "bg-white/[0.07]" : "",
                        isSelected ? "text-primary-light" : "text-white",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-semibold">{c.name}</span>
                        <span className="truncate text-subtle">· {c.en}</span>
                      </span>
                      <span className="shrink-0 text-xs text-faint" dir="ltr">
                        +{c.dial}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
