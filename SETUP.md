# إعداد نظام الحسابات والاشتراكات (Adaa Store V2)

دليل الخطوات اليدوية لتشغيل الباك إند (Supabase + PayPal). الكود جاهز — دي الإعدادات
الخارجية اللي لازم تعملها إنت لأنها تحتاج حساباتك ومفاتيحك.

> الخطة الكاملة والمراحل في: `.claude/plans/reflective-cuddling-turtle.md`

---

## 1) Supabase (الباك إند)

1. اعمل مشروع جديد على https://supabase.com (اختر أقرب Region، مثلًا Frankfurt).
2. من **Project Settings → API** انسخ:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (سري!) → `SUPABASE_SERVICE_ROLE_KEY`
3. شغّل المايجريشن (الجداول + RLS). طريقتان:
   - **الأسهل:** من **SQL Editor** في الداشبورد، الصق محتوى الملفين بالترتيب وشغّلهم:
     1. `supabase/migrations/20260616000001_init_schema.sql`
     2. `supabase/migrations/20260616000002_rls_policies.sql`
   - **أو** عبر Supabase CLI: `supabase link` ثم `supabase db push`.

### تفعيل مزوّدي الدخول (OAuth)
من **Authentication → Providers**:

- **Email**: مفعّل افتراضيًا. (يفضّل تفعيل تأكيد الإيميل لاحقًا.)
- **Google**:
  1. من Google Cloud Console → APIs & Services → Credentials → OAuth Client ID (Web).
  2. Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
  3. حط الـ Client ID/Secret في Supabase → Google provider.
- **Discord**:
  1. من https://discord.com/developers/applications → New Application → OAuth2.
  2. Redirect: `https://<your-project-ref>.supabase.co/auth/v1/callback`
  3. حط الـ Client ID/Secret في Supabase → Discord provider.

> في **Authentication → URL Configuration** ظبط:
> - Site URL = `http://localhost:3000` (محليًا) / دومينك عند النشر.
> - Redirect URLs: أضف `http://localhost:3000/**` و دومين الإنتاج.

### تعيين أول حساب أدمن
سجّل دخول بإيميلك على الموقع مرة، بعدين من SQL Editor:
```sql
update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';
```

---

## 2) PayPal — اشتراك AdaaX (Phase 2 / الموجة 1)

1. من https://developer.paypal.com → Apps & Credentials (Sandbox) → افتح تطبيق الـ REST.
   - انسخ `Client ID` → `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
   - انسخ `Secret` → `PAYPAL_CLIENT_SECRET`  ← **ده اللي ناقص دلوقتي**
2. أنشئ خطط الاشتراك (مرة واحدة) — هيطبع لك الـ IDs:
   ```bash
   node --env-file=.env.local scripts/paypal-setup-plans.mjs
   ```
   حط الناتج في `.env.local`:
   ```
   PAYPAL_PLAN_ID_MONTHLY=P-xxxxxxxx
   PAYPAL_PLAN_ID_YEARLY=P-xxxxxxxx
   ```
3. أعد تشغيل `npm run dev`.
4. **جرّب:** افتح `/adaax` وأنت مسجّل دخول → اختر خطة → ادفع بحساب Sandbox مشتري
   (من Developer Dashboard → Sandbox → Accounts) → المفروض تتحوّل لـ `/account`
   ويظهر الاشتراك نشط + صف في سجل المشتريات.

### Webhook (لمزامنة التجديد/الإلغاء التلقائي — اختياري للتجربة الأولى)
الاشتراك الأول والإلغاء بيشتغلوا من غير webhook. الـ webhook بيزامن التجديدات الشهرية
والإلغاء من PayPal:
1. لازم رابط عام (للتجربة محليًا استخدم نفق زي ngrok/cloudflared على `:3000`).
2. PayPal → Webhooks → أضف `https://<رابطك>/api/paypal/webhook` واشترك في أحداث
   `BILLING.SUBSCRIPTION.*` و `PAYMENT.SALE.COMPLETED`.
3. انسخ الـ Webhook ID → `PAYPAL_WEBHOOK_ID` (بدونه الـ webhook بيرفض الأحداث لأسباب أمان).

> الباقات (دفعة واحدة) والكوبونات في الموجة 2.

---

## 3) سر ترخيص AdaaX

ولّد سر توقيع توكن الجهاز:
```bash
openssl rand -base64 48
```
وحطّه في `LICENSE_JWT_SECRET`. (يُستخدم في Phase 3 لتوقيع توكن الترخيص للبرنامج.)

---

## 4) التشغيل

```bash
cp .env.example .env.local   # واملأ القيم
npm run dev                  # http://localhost:3000
```

تأكد إن: التسجيل بإيميل/جوجل/ديسكورد بيشتغل، وإن صف اتعمل في جدول `profiles`،
وإن `/account` بتحوّلك للدخول وإنت مش مسجّل.
