import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Admin-only: returns a short-lived signed URL redirect to a legacy PDF. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(); // redirects non-admins home
  const { id } = await params;

  const db = createAdminClient();
  const { data: row } = await db
    .from("legacy_reports")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!row) return new NextResponse("Not found", { status: 404 });

  const { data: signed, error } = await db.storage
    .from("installation-reports")
    .createSignedUrl(row.storage_path, 120);
  if (error || !signed) return new NextResponse("Error", { status: 500 });

  return NextResponse.redirect(signed.signedUrl);
}
