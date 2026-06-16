import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "الشروط والأحكام",
  description: "اتفاقية الخدمة وشروط الضمان لمتجر أداء (Adaa Store)",
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

export default function TermsPage() {
  return (
    <Section spacing="none" className="ambient-glow overflow-hidden pb-24 pt-32 sm:pt-36">
      <Container size="wide" className="relative z-10 max-w-4xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            📜 اتفاقية الخدمة وشروط الضمان
          </h1>
          <p className="mt-3 text-sm text-faint">آخر تحديث: مايو 2026</p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted">
            مرحبًا بك في <strong className="text-primary-light">أداء (Adaa Store)</strong>. إتمامك للطلب وتحديدك لمربع الموافقة (Checkbox) قبل الدفع يُعتبر عقدًا إلكترونيًا وموافقة نهائية على البنود التالية، والتي صُمّمت لضمان حقوقك وتقديم أفضل تجربة أداء لجهازك.
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-4">

          <SectionCard number="01" title="آلية العمل وإثبات التسليم">
            <BulletList>
              <Li>جميع خدماتنا رقمية وتتم عن بُعد بالكامل.</Li>
              <Li><Em>إثبات التسليم (Delivery Proof):</Em> يتم تنفيذ وتسليم الخدمة عبر تذكرة (Ticket) رسمية في سيرفر الديسكورد الخاص بنا.</Li>
              <Li>بعد انتهاء التعديل، يتم إرفاق <Em>تقرير PDF خاص بعملية التركيب</Em> داخل التذكرة ويتم إرساله للعميل، وتُغيّر حالة التذكرة إلى "تم التركيب"، ويُعد هذا <Em>إثباتًا موثّقًا لاستلام الخدمة</Em>.</Li>
              <Li><Em>دعم مستمر:</Em> لضمان راحتك، تظل تذكرتك مفتوحة لمدة <Em>شهر كامل (30 يومًا)</Em> بعد التركيب لتقديم أي دعم فني أو استفسار تحتاجه ولضمان الحصول على أفضل تجربة ممكنة للعميل.</Li>
              <Li><Em>ما بعد الـ 30 يومًا:</Em> الدعم المجاني لا يشمل عمل فحص شامل للجهاز أو إعادة التركيب مجانًا. في حال رغبتك لاحقًا في التأكد من درجات الحرارة والاستقرار، يمكنك شراء خدمة "الفحص الشامل" بشكل منفصل، أو الاستفادة من خصم العملاء (30%) عبر كود الخصم: <strong className="text-primary-light">re30</strong> لطلب "إعادة التركيب لنفس الباقة" للحصول على فحص شامل وإعادة تطبيق أحدث التعديلات المتاحة.</Li>
            </BulletList>
          </SectionCard>

          <SectionCard number="02" title="سياسة الدفع والضمان الذهبي">
            <p className="mb-4 text-sm leading-relaxed text-subtle">
              بمجرد إتمام عملية الدفع، يتم حجز موعد التركيب وتخصيص جميع الموارد اللازمة لتجهيز ملفات العميل والبدء في إعداد الخدمة. ولذلك تُعد المبالغ المدفوعة غير قابلة للاسترداد (No Refunds)، فيما عدا الحالات الموضحة في شروط <Em>الضمان الذهبي</Em>.
            </p>
            <div className="mb-5 rounded-lg border-r-4 border-primary bg-primary/[0.08] p-4 text-sm leading-relaxed text-muted">
              <strong className="mb-1.5 block text-primary-light">🛡️ الضمان الذهبي (لاسترداد المبلغ):</strong>
              إذا أثبت التقرير النهائي لعملية التركيب عدم حدوث أي تحسن في أداء النظام أو سرعات قطع الجهاز، تسترد مبلغك بالكامل.
            </div>
            <BulletList>
              <Li><Em>شرط أساسي للضمان (الفورمات):</Em> يشترط لفعالية الضمان أن يقوم العميل بعمل "فورمات" وتثبيت ويندوز نظيف رسمي <Em>قبل</Em> بدء التركيب. يسقط الضمان بالكامل في حال رفض العميل عمل الفورمات المسبق، أو قام بعمل فورمات جديد <Em>بعد</Em> التركيب.</Li>
              <Li><Em>القياس المرجعي قبل وبعد (Benchmark):</Em> يقوم الفريق بعمل قياس مرجعي لأداء الجهاز قبل بدء التعديل ليتم مقارنته بالنتائج بعد الانتهاء. ويوثّق التقرير النهائي حالة الجهاز قبل وبعد التعديل (الاستقرار، الحرارة، سحب طاقة المعالج، ومقدار كسر السرعة الآمن للكرت + تفاصيل تحسين وتخفيف الوندوز وقطع الجهاز). ويُعتبر هذا التقرير هو المرجع الرسمي لإثبات التحسن وإثبات تركيب الخدمة، ويستلمه العميل في نهاية التركيب على الخاص وفي التذكرة.</Li>
              <Li><Em>معايير التحسن:</Em> نحن لا نضمن زيادة الفريمات (FPS) بمقدار معين لأنها تعتمد كليًا على مواصفات جهازك، والإعدادات، والبرامج العاملة في الخلفية التي تستهلك من موارد الجهاز. ولكن التحسن يُترجم إلى زيادة في الفريمات، استقرار اللعب (1% Low)، القضاء على التقطيع (Micro-stutters)، تحسّن زمن الاستجابة (Input Lag)، أو تحسّن سحب الطاقة وسرعات عمل قطع الجهاز، وذلك وفق ما يوثّقه ويوضحه التقرير النهائي لعملية التركيب.</Li>
              <Li><Em>نصيحة:</Em> يُفضّل أن يقوم العميل بعمل اختبار أداء (Benchmark) قبل التعديل لمقارنتها بالنتائج بعد الانتهاء.</Li>
            </BulletList>
          </SectionCard>

          <SectionCard number="03" title="استقرار الجهاز وأمان التعديلات">
            <p className="mb-3 text-sm leading-relaxed text-subtle">
              جميع تعديلاتنا آمنة ومجرّبة. للتأكد من ذلك، يتم عمل فحص شامل واختبار ضغط (Stress Test) لضمان استقرار القطع بعد الانتهاء.
            </p>
            <p className="text-sm leading-relaxed text-subtle">
              التقرير النهائي المُسلَّم لك سيتضمن أعلى درجة حرارة وصل لها الجهاز <Em>تحت أقصى ضغط</Em>، ونسبة استقرار المعالج والنظام، لضمان عمل جهازك بأعلى كفاءة وأمان.
            </p>
          </SectionCard>

          <SectionCard number="04" title="إخلاء المسؤولية التقنية وتحديثات النظام">
            <BulletList>
              <Li><Em>تحديثات الويندوز:</Em> كجزء من خدمتنا، نقوم بتحديث النظام والتعريفات بالكامل قبل التعديل، ثم نغلق التحديثات التلقائية. لا ننصح بتحديث الويندوز لاحقًا لأن التحديثات قد تلغي تعديلاتنا وتسبب عدم استقرار. أي تحديث للنظام بعد التركيب يقع على مسؤولية العميل الشخصية (يتم إرسال توضيح مفصل للعميل بهذا الخصوص).</Li>
              <Li><Em>العبث الشخصي وتغيير القطع:</Em> المتجر غير مسؤول عن أي أعطال أو عدم توافق ينتج عن عبث العميل في النظام، أو إضافة تعديلات شخصية، أو <Em>تغيير قطع الهاردوير الأساسية</Em> بعد انتهاء عملنا. يتحمل العميل نتيجة هذه التعديلات بالكامل، مع التزامنا بتقديم المساعدة والنصح قدر الإمكان.</Li>
              <Li><Em>ظروف خارجة عن الإرادة:</Em> لا يتحمل المتجر مسؤولية المشاكل الخارجة عن إرادته مثل انقطاع الكهرباء أثناء التركيب، أو الأخطاء البرمجية (Bugs) المعترف بها رسميًا من أنظمة مايكروسوفت أو الشركات المُصنّعة.</Li>
            </BulletList>
          </SectionCard>

          <SectionCard number="05" title="الخصوصية وأدوات التحكم عن بُعد">
            <BulletList>
              <Li>يتم تقديم الخدمة باستخدام برامج تحكم موثوقة عالميًا مثل (AnyDesk، RustDesk، أو TeamViewer)، بالإضافة إلى برمجيات متجر أداء الحصرية لضبط النظام باحترافية.</Li>
              <Li><Em>أمان تام:</Em> نحن لا نمتلك أي تحكم مخفي على جهازك. عملية الدخول تتم فقط بعد إرسال طلب إليك، و<Em>بموافقتك اليدوية</Em>، وكل التعديلات تتم أمام عينيك.</Li>
            </BulletList>
          </SectionCard>

          <SectionCard number="06" title="الملكية الفكرية">
            <BulletList>
              <Li>جميع الأدوات والبرمجيات والإعدادات والتقارير الخاصة بمتجر أداء (Adaa Store) هي ملكية فكرية حصرية للمتجر.</Li>
              <Li>بإتمامك للطلب، تحصل على حق شخصي غير قابل للتحويل للاستفادة من نتائج الخدمة على جهازك فقط.</Li>
              <Li>يُمنع منعًا باتًا نسخ أو توزيع أو إعادة بيع أو محاولة الهندسة العكسية لأي من أدوات أو ملفات المتجر، أو مشاركتها مع أي طرف ثالث. وأي مخالفة تُسقط الدعم والضمان بالكامل.</Li>
            </BulletList>
          </SectionCard>

          <SectionCard number="07" title="السن القانوني وسياسة المشتريات">
            <p className="text-sm leading-relaxed text-subtle">
              بإتمامك للطلب، أنت تقر صراحةً بأنك تبلغ من العمر 18 عامًا أو أكثر، أو أنك تمتلك الإذن المسبق من وليّ الأمر أو مالك البطاقة الائتمانية لإتمام عملية الشراء. أي عملية شراء غير مصرّح بها يتحمل مسؤوليتها العميل بالكامل، ولا يتحمل المتجر أي تبعات قانونية أو مالية متعلقة بها.
            </p>
          </SectionCard>

          <SectionCard number="08" title="الدعم والسلوك والمواعيد">
            <BulletList>
              <Li><Em>الدعم وحل المشكلات:</Em> فريق الدعم متواجد لخدمتك والرد على استفساراتك وحل أي مشكلة في أسرع وقت. في حال واجهتك أي ملاحظة على الخدمة أو نتائجها، يُرجى التواصل معنا مباشرة عبر التذكرة في الديسكورد أو عبر الواتساب، وسيقوم فريقنا بمراجعة حالتك وفق شروط الخدمة والضمان الموضحة في هذه الاتفاقية. والتواصل المباشر معنا هو أسرع وأضمن وسيلة للوصول إلى حل مناسب.</Li>
              <Li><Em>عدم الاستلام:</Em> في حال الدفع ورفض العميل استلام الخدمة لأي سبب كان، لا يحق له المطالبة باسترداد المبلغ، ولكن يحق له تأجيل موعد الاستلام لوقت لاحق، أو إهداء الخدمة لصديق.</Li>
              <Li><Em>الاحترام المتبادل:</Em> نلتزم بتقديم أفضل دعم فني باحترافية واحترام كامل. وأي تطاول أو إساءة تجاه فريق الدعم (سواء في الديسكورد أو أي منصة أخرى) يمنح المتجر الحق الفوري في إلغاء الخدمة وإغلاق التذكرة.</Li>
            </BulletList>
          </SectionCard>

          <SectionCard number="09" title="تحديث الشروط">
            <p className="text-sm leading-relaxed text-subtle">
              يحق للمتجر تعديل أو تحديث هذه الاتفاقية في أي وقت، وتُعد النسخة المنشورة على الموقع وقت إتمامك للطلب هي النسخة السارية على معاملتك. واستمرارك في استخدام الخدمة بعد أي تحديث يُعتبر موافقة على الشروط المُحدَّثة.
            </p>
          </SectionCard>

          {/* Discount callout */}
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-l from-transparent to-primary/[0.08] p-6 sm:p-7">
            <h3 className="mb-3 font-display text-lg font-bold text-primary-light">
              🎉 إعادة التركيب: كود خصم re30
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              فرمت جهازك؟ ولا يهمك. عملاؤنا يحصلون على <strong>خصم 30%</strong> عند طلب إعادة تركيب نفس الباقة عبر استخدام كود الخصم:{" "}
              <strong className="text-primary-light">re30</strong>
              <span className="mr-1 text-xs text-primary-light">(يرجى التواصل معنا برقم طلبك القديم للتأكيد)</span>
            </p>
          </div>

        </div>

        {/* Footer links */}
        <div className="mt-12 border-t border-white/5 pt-8 text-center">
          <p className="mb-5 text-sm text-faint">نحن هنا للمساعدة دائمًا</p>
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
            للاطلاع على سياسة الخصوصية،{" "}
            <Link href="/privacy" className="text-primary-light underline underline-offset-2 hover:no-underline">
              اضغط هنا
            </Link>
          </p>
        </div>

      </Container>
    </Section>
  );
}
