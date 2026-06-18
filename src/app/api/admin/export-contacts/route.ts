import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth/dal";
import { getContacts, contactsToCsv } from "@/lib/admin/contacts";

/**
 * Admin-only CSV export of all contacts (emails + phones). Not under the /admin
 * page prefix, so the proxy doesn't gate it — we verify the admin role here.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { contacts } = await getContacts();
  const csv = contactsToCsv(contacts);
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="adaa-contacts-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
