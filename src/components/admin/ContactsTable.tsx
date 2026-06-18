"use client";

import { useMemo, useState } from "react";
import { formatDate, toLatinDigits } from "@/lib/site-config";
import type { Contact, ContactSource } from "@/lib/admin/contacts";

const SOURCE_META: Record<ContactSource, { label: string; cls: string }> = {
  account: { label: "عضو", cls: "bg-primary/15 text-primary-light" },
  guest: { label: "ضيف", cls: "bg-white/5 text-faint" },
  zbooni: { label: "زبوني", cls: "bg-amber-400/15 text-amber-300" },
  paypal: { label: "باي بال", cls: "bg-sky-400/15 text-sky-300" },
  paypal_graphics: { label: "باي بال · جرافكس", cls: "bg-sky-400/15 text-sky-300" },
  paypal_pkg3: { label: "باي بال · باقة ثالثة", cls: "bg-violet-400/15 text-violet-300" },
  paypal_reinstall: { label: "باي بال · إعادة تركيب", cls: "bg-cyan-400/15 text-cyan-300" },
};

type SortKey = "name" | "value" | "ordersCount" | "lastDate" | "source";
const PAGE_SIZE = 25;

const FILTERS: { key: string; label: string; match: (s: ContactSource) => boolean }[] = [
  { key: "all", label: "الكل", match: () => true },
  { key: "account", label: "أعضاء", match: (s) => s === "account" },
  { key: "guest", label: "ضيوف", match: (s) => s === "guest" },
  { key: "paypal", label: "باي بال", match: (s) => s.startsWith("paypal") },
  { key: "zbooni", label: "زبوني", match: (s) => s === "zbooni" },
];

export function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "lastDate",
    dir: "desc",
  });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = toLatinDigits(query).trim().toLowerCase();
    const f = FILTERS.find((x) => x.key === filter) ?? FILTERS[0];
    let rows = contacts.filter((c) => f.match(c.source));
    if (q) {
      rows = rows.filter((c) => {
        const hay = `${c.name ?? ""} ${c.email} ${toLatinDigits(c.phone ?? "")} ${c.products}`.toLowerCase();
        return hay.includes(q);
      });
    }
    const { key, dir } = sort;
    const mul = dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (key === "value" || key === "ordersCount") cmp = a[key] - b[key];
      else cmp = String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "ar");
      return cmp * mul;
    });
  }, [contacts, query, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    setPage(0);
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          placeholder="بحث بالاسم أو الإيميل أو التليفون أو المنتج…"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(0); }}
              className={
                "rounded-lg px-3 py-2 text-xs font-semibold transition-colors " +
                (filter === f.key
                  ? "bg-primary/15 text-primary-light"
                  : "text-muted hover:bg-white/[0.04] hover:text-white")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-faint">
        {filtered.length} نتيجة{query || filter !== "all" ? ` (من ${contacts.length})` : ""}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
        <table className="w-full min-w-[920px] text-right text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-faint">
              <Th onClick={() => toggleSort("name")}>الاسم{arrow("name")}</Th>
              <Th>الإيميل</Th>
              <Th>التليفون</Th>
              <Th>المنتجات</Th>
              <Th onClick={() => toggleSort("value")}>القيمة{arrow("value")}</Th>
              <Th onClick={() => toggleSort("ordersCount")}>الطلبات{arrow("ordersCount")}</Th>
              <Th onClick={() => toggleSort("source")}>المصدر{arrow("source")}</Th>
              <Th onClick={() => toggleSort("lastDate")}>آخر نشاط{arrow("lastDate")}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((c) => {
              const meta = SOURCE_META[c.source];
              return (
                <tr key={c.email} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">{c.name || "—"}</td>
                  <td className="px-5 py-4 text-muted" dir="ltr">{c.email}</td>
                  <td className="px-5 py-4 text-muted" dir="ltr">{c.phone || "—"}</td>
                  <td className="max-w-[240px] truncate px-5 py-4 text-faint" title={c.products}>
                    {c.products || "—"}
                  </td>
                  <td className="px-5 py-4 font-semibold text-primary-light" dir="ltr">
                    {c.value > 0 ? `$${c.value}` : "—"}
                  </td>
                  <td className="px-5 py-4 text-muted">{c.ordersCount || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-faint">{formatDate(c.lastDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">لا توجد نتائج.</p>
        )}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="rounded-lg border border-white/10 px-4 py-2 font-semibold text-muted hover:text-white disabled:opacity-40"
          >
            السابق
          </button>
          <span className="text-xs text-faint" dir="ltr">{safePage + 1} / {pageCount}</span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            className="rounded-lg border border-white/10 px-4 py-2 font-semibold text-muted hover:text-white disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

function Th({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <th
      onClick={onClick}
      className={
        "px-4 py-3 font-medium " + (onClick ? "cursor-pointer select-none hover:text-white" : "")
      }
    >
      {children}
    </th>
  );
}
