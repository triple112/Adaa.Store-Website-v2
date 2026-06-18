import { getContacts } from "@/lib/admin/contacts";
import { ContactsTable } from "@/components/admin/ContactsTable";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  const { contacts, phoneCount } = await getContacts();
  const withAccount = contacts.filter((c) => c.source === "account").length;
  const paypal = contacts.filter((c) => c.source.startsWith("paypal")).length;
  const zbooni = contacts.filter((c) => c.source === "zbooni").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-white">جهات الاتصال</h2>
        <a
          href="/api/admin/export-contacts"
          className="rounded-xl bg-gradient-to-b from-[#2a2a2a] to-[#161616] px-4 py-2 text-sm font-bold text-white border border-white/10 border-b-2 border-b-primary transition-all hover:border-primary-light"
        >
          تصدير CSV
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="إجمالي الإيميلات" value={contacts.length} />
        <Stat label="أرقام التليفونات" value={phoneCount} />
        <Stat label="أعضاء" value={withAccount} />
        <Stat label="باي بال" value={paypal} />
        <Stat label="زبوني" value={zbooni} />
      </div>

      <ContactsTable contacts={contacts} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-4 text-center">
      <p className="text-2xl font-bold text-primary-light" dir="ltr">{value}</p>
      <p className="mt-1 text-xs text-faint">{label}</p>
    </div>
  );
}
