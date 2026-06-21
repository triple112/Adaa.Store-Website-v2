/**
 * AdaaxFeatures — what the AdaaX app actually does. Site-language cards
 * (glass + green accent), data-driven.
 */
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  GamepadIcon,
  LockIcon,
  RefreshIcon,
  ShieldCheckIcon,
  TrashIcon,
  ZapIcon,
} from "@/components/ui/icons";

const FEATURES = [
  {
    icon: ZapIcon,
    title: "تحسين شامل للقطع",
    desc: "ضبط دقيق للمعالج وكرت الشاشة والرامات لأعلى فريمات وأقل تأخير، مع مراقبة لحظية للحرارة والأداء.",
  },
  {
    icon: GamepadIcon,
    title: "إعدادات الويندوز للألعاب",
    desc: "تعديل إعدادات الويندوز والطاقة وخطة الأداء بما يناسب الألعاب، وقفل دقّة المؤقّت (Timer Resolution).",
  },
  {
    icon: TrashIcon,
    title: "تخفيف النظام (Debloat)",
    desc: "إزالة البرامج والخدمات الزائدة وتسريع الإقلاع، لتفريغ موارد الجهاز للي يهمّك فعلاً.",
  },
  {
    icon: ShieldCheckIcon,
    title: "آمن وقابل للتراجع",
    desc: "نقطة استعادة قبل أي تعديل، فتقدر ترجّع جهازك لأي حالة سابقة بضغطة واحدة وبدون قلق.",
  },
  {
    icon: RefreshIcon,
    title: "تحديثات مستمرة",
    desc: "تحسينات وأدوات جديدة تنزل باستمرار مع اشتراكك، فالبرنامج بيتطوّر مع كل تحديث للألعاب والويندوز.",
  },
  {
    icon: LockIcon,
    title: "ترخيص مربوط بحسابك",
    desc: "اشتراك واحد لجهاز واحد مربوط بحسابك، يتفعّل تلقائياً أول ما تسجّل دخولك في التطبيق.",
  },
];

export function AdaaxFeatures() {
  return (
    <Section id="features">
      <Container size="wide">
        <SectionHeading
          eyebrow="مميزات AdaaX"
          title={
            <>
              كل اللي محتاجه جهازك <span className="text-gradient">في مكان واحد</span>
            </>
          }
          subtitle="مش مجرد أداة — استوديو تحسين أداء متكامل يشتغل على جهازك ويتحدّث باستمرار."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary-light/30 hover:shadow-[0_20px_60px_rgba(80,141,78,0.12)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
              />
              <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary-light shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-5 font-display text-xl font-bold text-white">{title}</h3>
              <p className="relative mt-2.5 text-sm leading-relaxed text-muted">{desc}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
