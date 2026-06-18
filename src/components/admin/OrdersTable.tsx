"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate, formatOrderNumber, toLatinDigits } from "@/lib/site-config";

export type AdminOrder = {
  id: string;
  order_number: number;
  type: string;
  items: { name?: string }[] | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  email: string | null;
  name: string | null;
  provider: string | null;
};

const PROVIDER_META: Record<string, { label: string; cls: string }> = {
  woocommerce: { label: "ووكومرس", cls: "bg-white/5 text-muted" },
  paypal_invoice: { label: "فواتير باي بال", cls: "bg-sky-400/15 text-sky-300" },
  paypal: { label: "باي بال", cls: "bg-primary/15 text-primary-light" },
  test: { label: "تجريبي", cls: "bg-amber-400/15 text-amber-300" },
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  paid: { label: "مدفوع", cls: "bg-primary/15 text-primary-light" },
  installed: { label: "تم التركيب", cls: "bg-emerald-400/15 text-emerald-300" },
  pending: { label: "قيد المعالجة", cls: "bg-amber-400/15 text-amber-300" },
  failed: { label: "فشل", cls: "bg-red-500/15 text-red-300" },
  refunded: { label: "مسترد", cls: "bg-white/5 text-faint" },
};

const TYPE_LABEL: Record<string, string> = {
  package: "باقة",
  service: "خدمة",
  subscription: "اشتراك",
};

type SortKey = "order_number" | "amount" | "created_at" | "status";
const PAGE_SIZE = 25;

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "package", label: "باقات" },
  { key: "service", label: "خدمات" },
  { key: "subscription", label: "اشتراكات" },
];

function itemsText(o: AdminOrder): string {
  return (o.items ?? []).map((i) => i.name).filter(Boolean).join(" + ") || TYPE_LABEL[o.type] || o.type;
}

export function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "order_number",
    dir: "desc",
  });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = toLatinDigits(query).trim().toLowerCase();
    let rows = orders;
    if (filter !== "all") rows = rows.filter((o) => o.type === filter);
    if (q) {
      rows = rows.filter((o) => {
        const hay = `#${o.order_number} ${o.email ?? ""} ${o.name ?? ""} ${itemsText(o)}`.toLowerCase();
        return hay.includes(q);
      });
    }
    const { key, dir } = sort;
    const mul = dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (key === "amount" || key === "order_number") cmp = a[key] - b[key];
      else cmp = String(a[key] ?? "").localeCompare(String(b[key] ?? ""));
      return cmp * mul;
    });
  }, [orders, query, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    setPage(0);
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" },
    );
  }
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="بحث برقم الطلب أو الإيميل أو الاسم أو الخدمة…"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
        />
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(0);
              }}
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
        {filtered.length} طلب{query || filter !== "all" ? ` (من ${orders.length})` : ""}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-faint">
              <Th onClick={() => toggleSort("order_number")}>#{arrow("order_number")}</Th>
              <Th>العميل</Th>
              <Th>العناصر</Th>
              <Th onClick={() => toggleSort("amount")}>القيمة{arrow("amount")}</Th>
              <Th>المصدر</Th>
              <Th onClick={() => toggleSort("status")}>الحالة{arrow("status")}</Th>
              <Th onClick={() => toggleSort("created_at")}>التاريخ{arrow("created_at")}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((o) => {
              const meta = STATUS_META[o.status] ?? { label: o.status, cls: "bg-white/5 text-faint" };
              return (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/order/${o.id}`}
                      className="font-mono text-xs font-bold text-primary-light hover:underline"
                    >
                      {formatOrderNumber(o.order_number)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">{o.name || "—"}</div>
                    <div className="text-xs text-faint" dir="ltr">{o.email || "—"}</div>
                  </td>
                  <td className="max-w-[260px] truncate px-4 py-3 text-muted">{itemsText(o)}</td>
                  <td className="px-4 py-3 font-semibold text-primary-light" dir="ltr">
                    {o.currency === "USD" ? "$" : o.currency}{o.amount}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const p = PROVIDER_META[o.provider ?? ""] ?? { label: o.provider || "—", cls: "bg-white/5 text-faint" };
                      return (
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${p.cls}`}>
                          {p.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${meta.cls}`}>{meta.label}</span>
                  </td>
                  <td className="px-4 py-3 text-faint">{formatDate(o.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">لا توجد طلبات مطابقة.</p>
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
