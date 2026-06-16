export type ProcessStep = {
  number: string;
  icon: string;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    icon: "🛒",
    title: "اختر الخدمة",
    description: "حدّد الباقة المناسبة لاحتياجات جهازك.",
  },
  {
    number: "02",
    icon: "💳",
    title: "الدفع والحجز",
    description: "ادفع بأمان واحجز موعدك فوراً.",
  },
  {
    number: "03",
    icon: "🚀",
    title: "ابدأ التركيب",
    description: "مهندس IT سيتواصل معك في الموعد.",
  },
];
