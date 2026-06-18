import "server-only";
import { sendEmail } from "./mailer";
import {
  orderConfirmationEmail,
  subscriptionConfirmationEmail,
  welcomeMagicLinkEmail,
  passwordResetEmail,
  subscriptionRenewalEmail,
  installationReportEmail,
} from "./templates";
import { siteConfig } from "@/lib/site-config";
import type { ReportMetric } from "@/lib/reports/types";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://adaa.store";

type Item = { name?: string; qty?: number; price?: number; currency?: string };

export function sendOrderConfirmation(
  to: string,
  d: { orderNumber: number; orderId: string; items: Item[]; amount: number; currency: string },
) {
  return sendEmail({
    to,
    ...orderConfirmationEmail({
      orderNumber: d.orderNumber,
      items: d.items,
      amount: d.amount,
      currency: d.currency,
      orderUrl: `${SITE}/order/${d.orderId}`,
      discordUrl: siteConfig.discordUrl,
      whatsappUrl: siteConfig.whatsappUrl,
    }),
  });
}

export function sendSubscriptionConfirmation(
  to: string,
  d: { orderNumber: number; orderId: string; planLabel: string; amount: number; currency: string },
) {
  return sendEmail({
    to,
    ...subscriptionConfirmationEmail({
      orderNumber: d.orderNumber,
      planLabel: d.planLabel,
      amount: d.amount,
      currency: d.currency,
      orderUrl: `${SITE}/order/${d.orderId}`,
      downloadUrl: siteConfig.adaaxDownloadUrl,
      accountUrl: `${SITE}/account`,
    }),
  });
}

export function sendWelcomeMagicLink(to: string, name: string | undefined, magicLink: string) {
  return sendEmail({ to, ...welcomeMagicLinkEmail({ name, magicLink }) });
}

export function sendPasswordReset(to: string, resetLink: string) {
  return sendEmail({ to, ...passwordResetEmail({ resetLink }) });
}

export function sendInstallationReport(
  to: string,
  d: {
    orderNumber: number;
    reportId: string;
    customerName?: string | null;
    cpuModel?: string | null;
    gpuModel?: string | null;
    metrics: ReportMetric[];
    tweaksCount?: number;
  },
) {
  return sendEmail({
    to,
    ...installationReportEmail({
      orderNumber: d.orderNumber,
      customerName: d.customerName,
      cpuModel: d.cpuModel,
      gpuModel: d.gpuModel,
      metrics: d.metrics,
      tweaksCount: d.tweaksCount ?? 0,
      reportUrl: `${SITE}/report/${d.reportId}`,
      discordUrl: siteConfig.discordUrl,
    }),
  });
}

export function sendSubscriptionRenewal(
  to: string,
  d: { orderNumber: number; planLabel: string; amount: number; currency: string; periodEnd: string | null },
) {
  return sendEmail({
    to,
    ...subscriptionRenewalEmail({
      orderNumber: d.orderNumber,
      planLabel: d.planLabel,
      amount: d.amount,
      currency: d.currency,
      periodEnd: d.periodEnd,
      accountUrl: `${SITE}/account`,
    }),
  });
}
