import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "سياسة الخصوصية وحماية البيانات لمتجر أداء (Adaa Store)",
};

function SectionCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 sm:p-7">
      <h3 className="mb-4 flex items-center gap-2.5 font-display text-lg font-bold text-white">
        <span className="text-primary-light">{number}.</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function BulletList({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col gap-2.5 text-sm leading-relaxed text-subtle">{children}</ul>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="flex gap-2"><span className="mt-0.5 shrink-0 text-primary-light">•</span><span>{children}</span></li>;
}

function Em({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-muted">{children}</strong>;
}

const dataChips = [
  "👤 اسم العميل (اللقب)",
  "📧 البريد الإلكتروني",
  "🖥️ مواصفات الجهاز",
];

export default function PrivacyPage() {
  return (
    <Section spacing="none" className="ambient-glow overflow-hidden pb-24 pt-32 sm:pt-36">
      <Container size="wide" className="relative z-10 max-w-4xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            🔐 سياسة الخصوصية وحماية البيانات
          </h1>
          <p className="mt-3 text-sm text-faint">آخر تحديث: نوفمبر 2025</p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted">
            في متجر <strong className="text-primary-light">أداء (Adaa Store)</strong>، خصوصيتك ليست مجرد سياسة، بل هي أساس عملنا. تهدف هذه الوثيقة لتوضيح كيف نحمي بياناتك بوضوح وشفافية.
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-4">

          <SectionCard number="01" title="البيانات التي نقوم بجمعها">
            <p className="mb-4 text-sm leading-relaxed text-subtle">
              نقتصر في جمع البيانات على الحد الأدنى اللازم لتنفيذ الخدمة وتوثيقها، وهي:
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {dataChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-md border border-primary/20 bg-primary/[0.08] px-3 py-1 text-xs text-primary-light"
                >
                  {chip}
                </span>
              ))}
            </div>
            <p className="text-xs text-faint">
              * يتم استخدام HWID حصريًا لإدراجه في ملف التقرير (PDF) كإثبات تقني لتنفيذ الخدمة على جهازك.
            </p>
          </SectionCard>

          <SectionCard number="02" title="الغرض من استخدام البيانات">
            <BulletList>
              <Li><Em>التوثيق الفني:</Em> تُستخدم البيانات التقنية فقط لإنشاء تقرير ما بعد الخدمة.</Li>
              <Li><Em>التواصل:</Em> لاستخدام بريدك أو الديسكورد لتنسيق المواعيد.</Li>
              <Li><Em>لا نستخدم</Em> هذه البيانات لأي أغراض إعلانية مزعجة أو تحليلية خارجية.</Li>
            </BulletList>
          </SectionCard>

          <SectionCard number="03" title="الأمان المالي وبيانات الدفع">
            <p className="mb-4 text-sm leading-relaxed text-subtle">
              نحن لا نقوم بجمع أو تخزين أي بيانات دفع.
            </p>
            <div className="rounded-lg border-r-4 border-primary bg-primary/[0.08] p-4 text-sm leading-relaxed text-muted">
              تتم عملية الدفع بالكامل عبر بوابة الدفع (<strong className="text-white">PayPal</strong>)، والتي تعمل كوسيط آمن 100% بيننا وبينك.
            </div>
          </SectionCard>

          <SectionCard number="04" title="حفظ ومشاركة البيانات">
            <BulletList>
              <Li><Em>التخزين:</Em> نحتفظ بسجلات الطلبات (مثل التقارير) فقط لضمان حقك في الدعم المستقبلي وإثبات الملكية.</Li>
              <Li><Em>الطرف الثالث:</Em> نتعهد بعدم بيع أو مشاركة أي معلومة تخصك مع أي جهة خارجية، باستثناء الامتثال القانوني الرسمي إذا طُلب ذلك.</Li>
            </BulletList>
          </SectionCard>

          <SectionCard number="05" title="حقوقك كمستخدم">
            <p className="text-sm leading-relaxed text-subtle">
              لك الحق الكامل في طلب <Em>حذف بياناتك</Em> من سجلاتنا بعد انتهاء فترة الضمان، أو طلب نسخة من المعلومات المسجلة لدينا في أي وقت.
            </p>
          </SectionCard>

          <SectionCard number="06" title="تحديث السياسة">
            <p className="text-sm leading-relaxed text-subtle">
              نحتفظ بحق تعديل هذه السياسة لضمان الامتثال للقوانين أو تحسين الخدمة. سيتم الإعلان عن أي تحديث جوهري عبر هذه الصفحة.
            </p>
          </SectionCard>

        </div>

        {/* Footer links */}
        <div className="mt-12 border-t border-white/5 pt-8 text-center">
          <p className="mb-5 text-sm text-faint">لديك استفسار حول خصوصيتك؟</p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:support@adaa.store"
              className="rounded-lg border border-white/10 px-5 py-2 text-sm text-subtle transition-colors hover:text-white"
            >
              Email Support
            </a>
            <a
              href="https://discord.gg/anJZTCEr8R"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary-light px-5 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90"
            >
              Join Discord
            </a>
          </div>
          <p className="mt-8 text-xs text-faint">
            للاطلاع على شروط الخدمة،{" "}
            <Link href="/terms" className="text-primary-light underline underline-offset-2 hover:no-underline">
              اضغط هنا
            </Link>
          </p>
        </div>

      </Container>
    </Section>
  );
}
