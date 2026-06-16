import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/dal";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: "لوحة التحكم" };
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin(); // redirects non-admins home

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:pt-32">
      <h1 className="mb-6 font-display text-3xl font-bold text-white">لوحة التحكم</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[210px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
