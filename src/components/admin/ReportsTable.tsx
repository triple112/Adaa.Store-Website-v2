"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate, formatOrderNumber, toLatinDigits } from "@/lib/site-config";

export type AdminReport = {
  id: string;
  customerName: string | null;
  discordUsername: string | null;
  discordNickname: string | null;
  cpuModel: string | null;
  createdAt: string;
  orderNumber: number | null;
  email: string | null;
};

type SortKey = "createdAt" | "orderNumber";
const PAGE_SIZE = 25;

export function ReportsTable({ reports }: { reports: AdminReport[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "createdAt",
    dir: "desc",
  });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = toLatinDigits(query).trim().toLowerCase();
    let rows = reports;
    if (q) {
      rows = rows.filter((r) => {
        const hay = `#${r.orderNumber ?? ""} ${r.customerName ?? ""} ${r.email ?? ""} ${r.discordUsername ?? ""} ${r.discordNickname ?? ""} ${r.cpuModel ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }
    const { key, dir } = sort;
    const mul = dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (key === "orderNumber") cmp = (a.orderNumber ?? 0) - (b.orderNumber ?? 0);
      else cmp = String(a.createdAt).localeCompare(String(b.createdAt));
      return cmp * mul;
    });
  }, [reports, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    setPage(0);
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  }
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
        placeholder="بحث بالاسم أو الإيميل أو يوزر ديسكورد أو المعالج أو رقم الطلب…"
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
      />
      <p className="text-xs text-faint">
        {filtered.length} تقرير{query ? ` (من ${reports.length})` : ""}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-faint">
              <Th>العميل</Th>
              <Th>ديسكورد</Th>
              <Th>المعالج</Th>
              <Th onClick={() => toggleSort("orderNumber")}>الطلب{arrow("orderNumber")}</Th>
              <Th onClick={() => toggleSort("createdAt")}>التاريخ{arrow("createdAt")}</Th>
              <Th>—</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="text-white">{r.customerName || "—"}</div>
                  <div className="text-xs text-faint" dir="ltr">{r.email || "—"}</div>
                </td>
                <td className="px-4 py-3 text-muted">
                  {r.discordUsername || r.discordNickname || "—"}
                </td>
                <td className="px-4 py-3 text-muted">{r.cpuModel || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-primary-light">
                  {formatOrderNumber(r.orderNumber)}
                </td>
                <td className="px-4 py-3 text-faint">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/report/${r.id}`}
                    target="_blank"
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-primary-light hover:bg-white/[0.04]"
                  >
                    عرض
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">لا توجد تقارير مطابقة.</p>
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
      className={"px-4 py-3 font-medium " + (onClick ? "cursor-pointer select-none hover:text-white" : "")}
    >
      {children}
    </th>
  );
}
