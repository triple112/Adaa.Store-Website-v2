export type Benchmark = {
  game: string;
  beforeFps: number;
  afterFps: number;
};

/** Average FPS before/after on popular competitive titles. Boost % is derived. */
export const benchmarks: Benchmark[] = [
  { game: "FiveM", beforeFps: 86, afterFps: 183 },
  { game: "Valorant", beforeFps: 344, afterFps: 627 },
  { game: "Fortnite", beforeFps: 392, afterFps: 584 },
  { game: "Warzone", beforeFps: 98, afterFps: 171 },
];

export const inputLag = {
  beforeMs: 18,
  afterMs: 3,
};

export const network = {
  beforeGrade: "C",
  afterGrade: "A+",
};

export type TrustItem = {
  id: string;
  icon: "shield" | "headset" | "refresh";
  title: string;
  description: string;
};

export const trustItems: TrustItem[] = [
  {
    id: "guarantee",
    icon: "shield",
    title: "ضمان استرداد المبلغ",
    description: "إذا لم تستفد من الخدمة، نُعيد لك كامل المبلغ بدون تعقيد.",
  },
  {
    id: "support",
    icon: "headset",
    title: "دعم فني مستمر",
    description: "متابعة بعد الخدمة وردّ سريع على أي استفسار أو مشكلة.",
  },
  {
    id: "no-format",
    icon: "refresh",
    title: "مع وبدون فورمات",
    description: "نقدر نركّب لك الخدمة مع أو بدون فورمات حسب حالة جهازك، دون مسح بياناتك.",
  },
];
