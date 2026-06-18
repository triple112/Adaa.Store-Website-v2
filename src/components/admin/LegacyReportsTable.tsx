"use client";

import { useMemo, useState, useTransition } from "react";
import { formatDate, toLatinDigits } from "@/lib/site-config";
import { updateLegacyReportUsername } from "@/lib/reports/actions";

export type LegacyReport = {
  id: string;
  nickname: string;
  discordUsername: string | null;
  fileSize: number | null;
  createdAt: string;
};

const PAGE_SIZE = 30;

function humanSize(bytes: number | null): string {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

export function LegacyReportsTable({ reports }: { reports: LegacyReport[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = toLatinDigits(query).trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) =>
      `${r.nickname} ${r.discordUsername ?? ""}`.toLowerCase().includes(q),
    );
  }, [reports, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
        placeholder="بحث بالنيك نيم (اسم الملف) أو يوزر ديسكورد…"
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
      />
      <p className="text-xs text-faint">
        {filtered.length} ملف{query ? ` (من ${reports.length})` : ""}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-faint">
              <th className="px-4 py-3 font-medium">النيك نيم (اسم الملف)</th>
              <th className="px-4 py-3 font-medium">يوزر ديسكورد</th>
              <th className="px-4 py-3 font-medium">الحجم</th>
              <th className="px-4 py-3 font-medium">تاريخ الرفع</th>
              <th className="px-4 py-3 font-medium">—</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <LegacyRow key={r.id} report={r} />
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">لا توجد ملفات مطابقة.</p>
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

function LegacyRow({ report }: { report: LegacyReport }) {
  const [value, setValue] = useState(report.discordUsername ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const dirty = value.trim() !== (report.discordUsername ?? "");

  function save() {
    startTransition(async () => {
      const res = await updateLegacyReportUsername(report.id, value);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="px-4 py-3 font-medium text-white" dir="auto">{report.nickname}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="—"
            dir="ltr"
            className="w-32 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
          />
          {dirty && (
            <button
              onClick={save}
              disabled={pending}
              className="rounded-lg bg-primary/15 px-2 py-1 text-xs font-semibold text-primary-light disabled:opacity-50"
            >
              حفظ
            </button>
          )}
          {saved && <span className="text-xs text-primary-light">✓</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-faint" dir="ltr">{humanSize(report.fileSize)}</td>
      <td className="px-4 py-3 text-faint">{formatDate(report.createdAt)}</td>
      <td className="px-4 py-3">
        <a
          href={`/api/admin/legacy-report/${report.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-primary-light hover:bg-white/[0.04]"
        >
          تحميل
        </a>
      </td>
    </tr>
  );
}
