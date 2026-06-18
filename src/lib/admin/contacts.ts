import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type ContactSource =
  | "account"
  | "guest"
  | "zbooni"
  | "paypal"
  | "paypal_graphics"
  | "paypal_pkg3"
  | "paypal_reinstall";

export type Contact = {
  name: string | null;
  email: string;
  phone: string | null;
  /** Total spent across site orders + external (paypal/zbooni) records. */
  value: number;
  ordersCount: number;
  lastDate: string | null;
  source: ContactSource;
  /** Readable list of what they bought (categories), across all sources. */
  products: string;
};

type Acc = {
  name: string | null;
  email: string;
  phone: string | null;
  value: number;
  ordersCount: number;
  lastDate: string | null;
  hasAccount: boolean;
  hasSiteOrder: boolean; // woo / site checkout (NOT paypal_invoice)
  hasPaypalInvoice: boolean;
  hasZbooni: boolean;
  paypalCats: Set<string>; // pkg3 | graphics | reinstall | perf | other
  products: Set<string>;
};

/** Category label for an order item name. */
function productLabel(itemName: string): string {
  if (itemName.includes("باقة ثالثة")) return "باقة ثالثة";
  if (itemName.includes("تحسين")) return "تحسين الأداء";
  if (itemName.includes("اشتراك")) return "اشتراك AdaaX";
  return "خدمة";
}

const EXT_PRODUCT: Record<string, string> = {
  paypal_graphics: "جرافكس",
  paypal_reinstall: "إعادة تركيب جرافكس",
  paypal_other: "أخرى (باي بال)",
  zbooni: "زبوني",
};
const EXT_CAT: Record<string, string> = {
  paypal_graphics: "graphics",
  paypal_reinstall: "reinstall",
  paypal_other: "other",
};

export async function getContacts(): Promise<{ contacts: Contact[]; phoneCount: number }> {
  const db = createAdminClient();

  const [{ data: orderRows }, { data: profileRows }, { data: extRows }] = await Promise.all([
    db
      .from("orders")
      .select("email, phone, name, amount, created_at, provider, items")
      .not("email", "is", null)
      .order("created_at", { ascending: false }),
    db.from("profiles").select("email, display_name"),
    db.from("external_contacts").select("name, email, phone, order_value, last_order_at, source"),
  ]);

  const map = new Map<string, Acc>();
  const get = (email: string): Acc => {
    let a = map.get(email);
    if (!a) {
      a = {
        name: null, email, phone: null, value: 0, ordersCount: 0, lastDate: null,
        hasAccount: false, hasSiteOrder: false, hasPaypalInvoice: false, hasZbooni: false,
        paypalCats: new Set(), products: new Set(),
      };
      map.set(email, a);
    }
    return a;
  };

  for (const o of orderRows ?? []) {
    const email = (o.email || "").trim().toLowerCase();
    if (!email) continue;
    const a = get(email);
    a.ordersCount += 1;
    a.value += Number(o.amount) || 0;
    if (!a.phone && o.phone) a.phone = String(o.phone).trim();
    if (!a.name && o.name) a.name = String(o.name).trim();
    if (o.created_at && (!a.lastDate || o.created_at > a.lastDate)) a.lastDate = o.created_at;

    const isPaypalInvoice = o.provider === "paypal_invoice";
    if (isPaypalInvoice) a.hasPaypalInvoice = true;
    else a.hasSiteOrder = true;

    const items = (o.items as { name?: string }[] | null) ?? [];
    for (const it of items) {
      if (!it?.name) continue;
      a.products.add(productLabel(it.name));
      if (isPaypalInvoice) {
        a.paypalCats.add(it.name.includes("باقة ثالثة") ? "pkg3" : "perf");
      }
    }
  }

  for (const p of profileRows ?? []) {
    const email = (p.email || "").trim().toLowerCase();
    if (!email) continue;
    const a = get(email);
    a.hasAccount = true;
    if (!a.name && p.display_name) a.name = String(p.display_name).trim();
  }

  for (const e of extRows ?? []) {
    const email = (e.email || "").trim().toLowerCase();
    if (!email) continue;
    const a = get(email);
    const source = String(e.source);
    a.value += Number(e.order_value) || 0;
    if (!a.name && e.name) a.name = String(e.name).trim();
    if (!a.phone && e.phone) a.phone = String(e.phone).trim();
    if (e.last_order_at && (!a.lastDate || e.last_order_at > a.lastDate)) a.lastDate = e.last_order_at;
    if (source === "zbooni") a.hasZbooni = true;
    else if (EXT_CAT[source]) a.paypalCats.add(EXT_CAT[source]);
    a.products.add(EXT_PRODUCT[source] ?? "أخرى");
  }

  // Website-priority badge: account > site order > paypal > zbooni.
  function badge(a: Acc): ContactSource {
    if (a.hasAccount) return "account";
    if (a.hasSiteOrder) return "guest";
    if (a.hasPaypalInvoice || a.paypalCats.size > 0) {
      if (a.paypalCats.has("pkg3")) return "paypal_pkg3";
      if (a.paypalCats.has("graphics")) return "paypal_graphics";
      if (a.paypalCats.has("reinstall")) return "paypal_reinstall";
      return "paypal";
    }
    if (a.hasZbooni) return "zbooni";
    return "guest";
  }

  const contacts: Contact[] = [...map.values()].map((a) => ({
    name: a.name,
    email: a.email,
    phone: a.phone,
    value: Math.round(a.value * 100) / 100,
    ordersCount: a.ordersCount,
    lastDate: a.lastDate,
    source: badge(a),
    products: [...a.products].join("، "),
  }));

  contacts.sort((x, y) => (y.lastDate ?? "").localeCompare(x.lastDate ?? ""));
  const phoneCount = new Set(
    contacts.map((c) => c.phone).filter((p): p is string => Boolean(p)),
  ).size;

  return { contacts, phoneCount };
}

const SOURCE_CSV: Record<ContactSource, string> = {
  account: "account",
  guest: "guest",
  zbooni: "zbooni",
  paypal: "paypal_invoice",
  paypal_graphics: "paypal_graphics",
  paypal_pkg3: "paypal_third_package",
  paypal_reinstall: "paypal_graphics_reinstall",
};

/** Build a CSV (with UTF-8 BOM so Excel renders Arabic correctly). */
export function contactsToCsv(contacts: Contact[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["name", "email", "phone", "value_usd", "orders_count", "last_date", "source", "products"];
  const lines = [header.join(",")];
  for (const c of contacts) {
    lines.push(
      [
        esc(c.name ?? ""),
        esc(c.email),
        esc(c.phone ?? ""),
        String(c.value),
        String(c.ordersCount),
        esc(c.lastDate ? c.lastDate.slice(0, 10) : ""),
        SOURCE_CSV[c.source],
        esc(c.products),
      ].join(","),
    );
  }
  return "﻿" + lines.join("\r\n");
}
