"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveUserByEmail } from "@/lib/orders/finalize";
import { sendInstallationReport, sendWelcomeMagicLink } from "@/lib/email/send";
import { buildAuthConfirmLink } from "@/lib/auth/links";
import { cleanMetrics, resolvePerfPackage, type ReportMetric } from "@/lib/reports/types";

type Result = { ok?: true; reportId?: string; orderId?: string; error?: string };

/** The report-specific fields shared by both creation flows. */
export type ReportFields = {
  customerName: string;
  discordUsername: string;
  discordNickname: string;
  cpuModel: string;
  gpuModel: string;
  metrics: ReportMetric[];
  notes: string;
};

function reportRow(orderId: string, adminId: string, f: ReportFields) {
  return {
    order_id: orderId,
    created_by: adminId,
    customer_name: f.customerName.trim() || null,
    discord_username: f.discordUsername.trim() || null,
    discord_nickname: f.discordNickname.trim() || null,
    cpu_model: f.cpuModel.trim() || null,
    gpu_model: f.gpuModel.trim() || null,
    metrics: cleanMetrics(f.metrics),
    notes: f.notes.trim() || null,
  };
}

function revalidateAll(orderId: string) {
  revalidatePath("/admin/reports");
  revalidatePath("/admin/orders");
  revalidatePath("/account");
  revalidatePath(`/order/${orderId}`);
}

/** Create a report for an EXISTING order → marks it installed + emails the customer. */
export async function createReportFromOrder(orderId: string, fields: ReportFields): Promise<Result> {
  const admin = await requireAdmin();
  const db = createAdminClient();

  const { data: order } = await db
    .from("orders")
    .select("id, order_number, type, email, name")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { error: "الطلب غير موجود" };
  if (order.type === "subscription") return { error: "تقارير التركيب للباقات/الخدمات فقط" };

  const { data: report, error } = await db
    .from("installation_reports")
    .insert(reportRow(order.id, admin.id, fields))
    .select("id")
    .single();
  if (error || !report) {
    return { error: error?.code === "23505" ? "يوجد تقرير لهذا الطلب بالفعل" : "تعذّر حفظ التقرير" };
  }

  await db
    .from("orders")
    .update({ status: "installed", installed_at: new Date().toISOString() })
    .eq("id", order.id);

  if (order.email) {
    await sendInstallationReport(order.email, {
      orderNumber: order.order_number,
      reportId: report.id,
      customerName: fields.customerName || order.name,
      cpuModel: fields.cpuModel,
      gpuModel: fields.gpuModel,
      metrics: cleanMetrics(fields.metrics),
    }).catch(() => {});
  }

  revalidateAll(order.id);
  return { ok: true, reportId: report.id, orderId: order.id };
}

/**
 * Manual flow: customer bought via Discord/off-site with no website order. We
 * create the order (claimed by email on login), attach the report, mark it
 * installed, and email the report (+ a welcome magic-link for brand-new accounts).
 */
export async function createManualReport(input: {
  email: string;
  name: string;
  packageId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  fields: ReportFields;
}): Promise<Result> {
  const admin = await requireAdmin();
  const db = createAdminClient();

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "إيميل غير صالح" };

  const pkg = resolvePerfPackage(input.packageId);
  if (!pkg) return { error: "الباقة غير معروفة" };

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount < 0) return { error: "المبلغ غير صالح" };

  const name = input.name.trim() || input.fields.customerName.trim() || null;

  let userId: string;
  let isNew = false;
  try {
    const r = await resolveUserByEmail(db, email, name ?? undefined);
    userId = r.userId;
    isNew = r.isNew;
  } catch {
    return { error: "تعذّر إنشاء حساب العميل" };
  }

  const createdAt = /^\d{4}-\d{2}-\d{2}$/.test(input.date)
    ? new Date(input.date + "T12:00:00Z").toISOString()
    : new Date().toISOString();

  const { data: order, error: orderErr } = await db
    .from("orders")
    .insert({
      user_id: userId,
      email,
      name,
      phone: null,
      type: "package",
      items: [{ name: pkg.name, qty: 1, price: amount, currency: "USD" }],
      amount,
      currency: "USD",
      status: "installed",
      provider: "manual",
      paypal_order_id: `MANUAL-${randomUUID()}`,
      installed_at: new Date().toISOString(),
      created_at: createdAt,
    })
    .select("id, order_number")
    .single();
  if (orderErr || !order) return { error: "تعذّر إنشاء الطلب" };

  const { data: report, error: reportErr } = await db
    .from("installation_reports")
    .insert(reportRow(order.id, admin.id, input.fields))
    .select("id")
    .single();
  if (reportErr || !report) return { error: "تم إنشاء الطلب لكن تعذّر حفظ التقرير" };

  await sendInstallationReport(email, {
    orderNumber: order.order_number,
    reportId: report.id,
    customerName: name,
    cpuModel: input.fields.cpuModel,
    gpuModel: input.fields.gpuModel,
    metrics: cleanMetrics(input.fields.metrics),
  }).catch(() => {});

  if (isNew) {
    const link = await buildAuthConfirmLink("magiclink", email, "/account").catch(() => null);
    if (link) await sendWelcomeMagicLink(email, name ?? undefined, link).catch(() => {});
  }

  revalidateAll(order.id);
  return { ok: true, reportId: report.id, orderId: order.id };
}

/** Fill in the Discord username on an archived legacy report (enables username search). */
export async function updateLegacyReportUsername(id: string, username: string): Promise<Result> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db
    .from("legacy_reports")
    .update({ discord_username: username.trim() || null })
    .eq("id", id);
  if (error) return { error: "تعذّر الحفظ" };
  revalidatePath("/admin/reports");
  return { ok: true };
}
