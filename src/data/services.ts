/**
 * Additional à-la-carte services (separate from the 3 performance-tier
 * `packages`). These have richer marketing detail, optional tiered pricing,
 * and accent-colored callout boxes — hence their own model.
 */

export type ServiceFeature = { icon: string; title: string; description: string };

/** Accent theme for the bottom callout box on the detail page. */
export type CalloutTone = "green" | "blue" | "discord" | "amber";

export type ServiceCallout = {
  icon: string;
  title: string;
  description: string;
  tone: CalloutTone;
};

/** A single priced option for services sold per-component (e.g. overclocking). */
export type ServicePriceTier = { label: string; price: number };

export type ServiceCategory = "system" | "performance" | "consulting";

export type Service = {
  id: string;
  name: string;
  /** Short one-liner shown on the card. */
  tagline: string;
  image: string;
  category: ServiceCategory;
  currency: string;
  /** Fixed price (USD). `null` when `priceTiers` applies instead. */
  price: number | null;
  /** Original price for a strike-through discount, if any. */
  oldPrice?: number;
  /** For services priced per component; card shows "يبدأ من" the lowest. */
  priceTiers?: ServicePriceTier[];
  intro: string;
  featuresIcon: string;
  features: ServiceFeature[];
  includesTitle: string;
  includes: string[];
  callout: ServiceCallout;
  href: string;
};

export const serviceCategories: { id: ServiceCategory; title: string; subtitle: string }[] = [
  {
    id: "system",
    title: "خدمات النظام",
    subtitle: "تأسيس نظيف وآمن لنظام التشغيل — فورمات، تفعيل، وتحديث البايوس.",
  },
  {
    id: "performance",
    title: "كسر السرعة والأداء",
    subtitle: "استخراج أقصى أداء ممكن من قطع جهازك ويد التحكم بأمان تام.",
  },
  {
    id: "consulting",
    title: "الفحص والاستشارة",
    subtitle: "قرارات مبنية على بيانات حقيقية — فحص شامل وتجميعة مدروسة هندسياً.",
  },
];

export const services: Service[] = [
  {
    id: "format",
    name: "فورمات النظام",
    tagline: "إعادة تثبيت ويندوز نظيف واحترافي من الصفر",
    image: "/services/format.png",
    category: "system",
    currency: "$",
    price: 10,
    oldPrice: 15,
    intro:
      "خدمة مخصصة لإعادة تثبيت نظام Windows بشكل نظيف ومحترف. نقوم بعمل فورمات كامل للنظام مع إعداد كل شيء من الصفر، للحصول على أداء مستقر وسلس كما لو كان الجهاز جديداً، ونثبت التعريفات اللازمة، مع حرية الاختيار بين Windows 11 أو Windows 10.",
    featuresIcon: "🔧",
    features: [
      {
        icon: "🧼",
        title: "تثبيت نظيف (Clean Install)",
        description: "تخلص تام من الملفات القديمة، الفيروسات، والأخطاء السابقة.",
      },
      {
        icon: "🚀",
        title: "استعادة سرعة المصنع",
        description: "تحسين وقت الإقلاع واستجابة النظام ليعود كالجديد تماماً.",
      },
      {
        icon: "🧠",
        title: "حل جذري للمشاكل",
        description: "الحل الأمثل بعد تغيير قطع الهاردوير (مثل SSD) أو تعليق النظام.",
      },
      {
        icon: "📦",
        title: "جاهزية فورية",
        description: "تستلم الجهاز جاهزاً للاستخدام فوراً مع كافة التعريفات الأساسية.",
      },
    ],
    includesTitle: "ماذا تشمل هذه الخدمة؟",
    includes: [
      "تهيئة القرص والنظام بالكامل وتثبيت نسخة Windows أصلية ومستقرة.",
      "تثبيت التعريفات الأساسية يدوياً (كرت الشاشة، الصوت، الشبكة، الشيبسيت).",
      "تثبيت البرامج الضرورية مثل المتصفح ومشغلات الميديا (اختياري).",
      "حرية الاختيار في الترقية أو الرجوع بين Windows 10 و Windows 11.",
      "نسخة احتياطية (Backup) للملفات المهمة قبل الفورمات (عند الطلب).",
    ],
    callout: {
      icon: "⚠️",
      title: "الحفاظ على ملفاتك",
      description:
        "يمكننا حفظ ملفاتك المهمة قبل الفورمات عند الطلب – أخبرنا مسبقاً بما تريد الاحتفاظ به.",
      tone: "blue",
    },
    href: "/services/format",
  },
  {
    id: "activation",
    name: "تفعيل النظام",
    tagline: "تفعيل أصلي دائم وآمن 100% بدون كراكات",
    image: "/services/activation.png",
    category: "system",
    currency: "$",
    price: 10,
    intro:
      "خدمة مخصصة لتفعيل نظام Windows بشكل دائم وآمن 100%. نوفر لك تفعيلاً أصلياً وخالياً من أي برامج ضارة أو أدوات غير موثوقة (Cracks)، لتضمن استقرار التحديثات وحماية نظامك من المشاكل أو الأعطال، مع دعم فني للتأكد من نجاح العملية.",
    featuresIcon: "🔧",
    features: [
      {
        icon: "🔐",
        title: "تفعيل دائم (Lifetime)",
        description: "تفعيل أصلي يستمر معك مدى الحياة دون الحاجة لتجديده لاحقاً.",
      },
      {
        icon: "🛡️",
        title: "آمن ونظيف 100%",
        description: "بدون كراكات، بدون أدوات تجسس أو برمجيات خبيثة تهدد جهازك.",
      },
      {
        icon: "🔄",
        title: "دعم شامل للنسخ",
        description: "يدعم جميع الإصدارات: Home و Pro و Enterprise بكفاءة تامة.",
      },
      {
        icon: "💬",
        title: "ضمان ودعم فني",
        description: "نضمن لك نجاح التفعيل وندعمك في حال واجهت أي مشكلة.",
      },
    ],
    includesTitle: "ماذا تشمل هذه الخدمة؟",
    includes: [
      "تحديد إصدار ويندوز بدقة والتحقق من حالته قبل البدء.",
      "تأكيد نجاح التفعيل رسمياً من إعدادات النظام.",
      "ضمان بقاء التفعيل مستقراً حتى بعد تحديثات الويندوز المستقبلية.",
    ],
    callout: {
      icon: "✅",
      title: "ضمان مدى الحياة",
      description: "مناسب للأجهزة الشخصية، المكتبية، أو أجهزة العمل – تفعيل لا يزول.",
      tone: "green",
    },
    href: "/services/activation",
  },
  {
    id: "bios-update",
    name: "تحديث البايوس",
    tagline: "استقرار أعلى ودعم كامل للقطع الأحدث",
    image: "/services/bios-update.png",
    category: "system",
    currency: "$",
    price: 10,
    intro:
      "خدمة مخصصة لتحسين استقرار جهازك، ودعم المعالجات والرامات الأحدث، وحل مشاكل التهنيق والتعليق الناتجة عن إصدارات بايوس قديمة. يتم التحديث يدويًا بأمان تام، مع التأكد من توافق الإصدار مع جهازك، وتنفيذه بخطوات احترافية تضمن سلامة النظام.",
    featuresIcon: "🔧",
    features: [
      {
        icon: "✅",
        title: "تحديث آمن ومستقر",
        description: "تحديث يدوي إلى أحدث إصدار BIOS رسمي ومستقر من الشركة المصنعة.",
      },
      {
        icon: "🧠",
        title: "توافق القطع الحديثة",
        description: "ضمان دعم كامل للمعالجات، الرامات، وكروت الشاشة الجديدة.",
      },
      {
        icon: "🛡️",
        title: "حماية النظام",
        description: "تجنب المشاكل التقنية والتعليق الناتج عن إصدارات BIOS القديمة.",
      },
      {
        icon: "⚙️",
        title: "فحص شامل للاستقرار",
        description: "اختبارات قبل وبعد التحديث للتأكد من أن الجهاز يعمل بكفاءة تامة.",
      },
    ],
    includesTitle: "ماذا تشمل هذه الخدمة؟",
    includes: [
      "فحص نوع المذربورد بدقة والتحقق من الإصدار الحالي للـ BIOS.",
      "اختيار النسخة الأنسب والأكثر استقراراً من الموقع الرسمي للشركة المصنّعة.",
      "تنفيذ التحديث يدويًا باستخدام أدوات رسمية وآمنة دون أي مخاطرة.",
      "اختبار استقرار الجهاز بعد التحديث للتأكد من توافق القطع والأداء.",
    ],
    callout: {
      icon: "💬",
      title: "دعم مباشر عبر ديسكورد",
      description: "تشمل الخدمة متابعة ودعم فني مباشر أثناء عملية التحديث لضمان راحة بالك.",
      tone: "discord",
    },
    href: "/services/bios-update",
  },
  {
    id: "controller-overclock",
    name: "كسر سرعة اليد",
    tagline: "استجابة أسرع ودقة تصويب أعلى في يد التحكم",
    image: "/services/controller-overclock.png",
    category: "performance",
    currency: "$",
    price: 10,
    intro:
      "خدمة مخصصة لتسريع يد التحكم وتحسين استجابتها بدقة عالية. نقوم بتعديل إعدادات يد PS أو Xbox أو أي يد تحكم على PC بهدف القضاء على التأخير (Input Lag)، وضبط الـ Deadzone، وتفعيل كسر سرعة USB لتجربة لعب أسرع وأكثر سلاسة – وتحديداً في ألعاب التصويب والمنافسة.",
    featuresIcon: "🎮",
    features: [
      {
        icon: "⚡",
        title: "استجابة فورية (Low Latency)",
        description: "تقليل التأخير في نقل الأوامر لأقل جزء من الثانية لتفوق تنافسي.",
      },
      {
        icon: "🎯",
        title: "ضبط Deadzone دقيق",
        description: "إلغاء المنطقة الميتة أو ضبطها بدقة لتقليل بطء حركة الأنالوج.",
      },
      {
        icon: "🔌",
        title: "كسر سرعة USB Polling",
        description: "رفع معدل التحديث حتى 1000Hz أو 8000Hz حسب دعم اليد والنظام.",
      },
      {
        icon: "🛡️",
        title: "آمن وبرمجي 100%",
        description: "آمن 100% ومتوافق مع سياسة الضمان الخاصة بالكنترولر.",
      },
    ],
    includesTitle: "ماذا تشمل هذه الخدمة؟",
    includes: [
      "تحليل نوع اليد (Controller Model) والتأكد من قابليتها للتسريع.",
      "تفعيل كسر سرعة USB بأدوات احترافية لرفع معدل الاستجابة.",
      "ضبط Deadzone يدوياً وبرمجياً للحصول على أفضل حساسية.",
      "اختبار الأداء (Benchmark) قبل وبعد التعديل لإثبات الفرق.",
      "دعم فني بعد التسليم لأي تعديل إضافي أو استفسار.",
    ],
    callout: {
      icon: "🎮",
      title: "للاعبين التنافسيين (FPS)",
      description: "ستشعر بفرق فعلي في سرعة الاستجابة ودقة التصويب (Aim) في الألعاب التنافسية.",
      tone: "green",
    },
    href: "/services/controller-overclock",
  },
  {
    id: "custom-overclock",
    name: "كسر سرعة مخصص",
    tagline: "أقصى أداء من المعالج أو الكرت أو الرام",
    image: "/services/custom-overclock.png",
    category: "performance",
    currency: "$",
    price: null,
    priceTiers: [
      { label: "كسر سرعة الكرت (GPU)", price: 15 },
      { label: "كسر سرعة المعالج (CPU)", price: 40 },
      { label: "كسر سرعة الرامات (RAM)", price: 60 },
    ],
    intro:
      "خدمة احترافية مخصصة لكسر سرعة المعالج، البطاقة الرسومية، أو الرام. نوفر لك ضبطاً يدوياً دقيقاً للوصول لأقصى أداء ممكن من القطعة المختارة، مع معادلة دقيقة بين الحرارة والاستقرار، بأسلوب هندسي يناسب استخدامك سواء للألعاب التنافسية أو صناعة المحتوى.",
    featuresIcon: "🔧",
    features: [
      {
        icon: "⚡",
        title: "كسر سرعة مخصص",
        description: "تركيز كامل على القطعة التي تحددها (CPU / GPU / RAM) لاستخراج كامل قوتها.",
      },
      {
        icon: "📈",
        title: "دفعة أداء ملحوظة",
        description: "تحسين الأداء العام والفريمات بنسبة ملموسة مع الحفاظ على استقرار النظام.",
      },
      {
        icon: "🌡️",
        title: "إدارة الحرارة والفولت",
        description: "ضبط الفولت والترددات ومنحنى المراوح يدوياً لضمان درجات حرارة آمنة.",
      },
      {
        icon: "🧪",
        title: "اختبارات Stress Tests",
        description: "تجارب أداء قاسية ومتقدمة للتأكد من أن الكسر مستقر 100% ولا يسبب مشاكل.",
      },
    ],
    includesTitle: "ماذا تشمل هذه الخدمة؟",
    includes: [
      "مراجعة المواصفات الحرارية والمعمارية للقطعة المستهدفة لضمان الأمان.",
      "تطبيق الكسر يدويًا من خلال BIOS أو أدوات احترافية بعيداً عن الطرق التلقائية.",
      "اختبار درجات الحرارة والأداء بمقاييس دقيقة قبل وبعد الكسر.",
      "تسليم تقرير بالنتائج يوضح الفرق في الأداء والتوصيات.",
      "إمكانية التراجع للكسر القديم أو الإعدادات الافتراضية في أي وقت.",
    ],
    callout: {
      icon: "⚠️",
      title: "ملاحظة تقنية هامة",
      description:
        "عملية كسر السرعة لدينا تتم باحتراف وبأمان كامل، لكن النتائج تعتمد دائماً على جودة التبريد لديك وتوافق القطع (Silicon Lottery).",
      tone: "amber",
    },
    href: "/services/custom-overclock",
  },
  {
    id: "diagnostic",
    name: "فحص شامل للجهاز",
    tagline: "تحليل الحرارة والاستقرار بتقرير مفصّل",
    image: "/services/diagnostic.png",
    category: "consulting",
    currency: "$",
    price: 20,
    intro:
      "خدمة مخصصة لتحليل درجات الحرارة، استهلاك الموارد، واستقرار النظام. نقيس أداء جهازك تحت أقصى درجات الضغط، لنكشف الاختناقات الحرارية (Thermal Throttling) أو المشاكل البرمجية، ونقدم لك تقريراً مفصلاً مع توصيات عملية لتحسين الأداء.",
    featuresIcon: "🔧",
    features: [
      {
        icon: "🌡️",
        title: "تحليل حراري دقيق",
        description: "قياس حرارة المعالج، الكرت، ودوائر الطاقة (VRM) في الخمول والضغط.",
      },
      {
        icon: "📊",
        title: "مراقبة استهلاك الموارد",
        description: "تتبع دقيق لاستهلاك المعالج والرامات وحجم سحب الطاقة للـ GPU.",
      },
      {
        icon: "⚙️",
        title: "اختبارات Stress Test",
        description: "ضغط مطول لاكتشاف الأعطال المخفية أو مشاكل عدم الاستقرار.",
      },
      {
        icon: "📝",
        title: "تقارير ومناقشة",
        description: "تقرير شامل مع رسوم بيانية، وجلسة ديسكورد لشرح النتائج.",
      },
    ],
    includesTitle: "ماذا تشمل هذه الخدمة؟",
    includes: [
      "إعداد برامج المراقبة الاحترافية (HWiNFO / MSI Afterburner).",
      "تشغيل اختبارات الضغط (OCCT / Cinebench / 3DMark) لمدة تصل إلى 30 دقيقة.",
      "تحليل السجلات (Logs) لاستخراج أعلى درجات حرارة وأقصى استهلاك للطاقة.",
      "إنشاء تقرير يوضح النتائج والمشكلات المكتشفة بالأرقام.",
      "تقديم توصيات للتبريد أو الترقية بناءً على بيانات جهازك الفعلية.",
    ],
    callout: {
      icon: "🛡️",
      title: "راحة بالك تهمنا",
      description:
        "الخدمة مثالية للتأكد من استقرار النظام وسلامة قطع الجهاز، خاصة بعد التجميع الجديد أو الشراء.",
      tone: "blue",
    },
    href: "/services/diagnostic",
  },
  {
    id: "pc-build",
    name: "تجميع كمبيوتر مخصص",
    tagline: "نجهّز لك تجميعة متوازنة أداءً وسعرًا",
    image: "/services/pc-build.png",
    category: "consulting",
    currency: "$",
    price: 25,
    intro:
      "خدمة استشارية مخصصة لمساعدتك في اختيار وتجميع جهاز كمبيوتر مثالي. سواء كنت لاعباً محترفاً، مصمماً، مبرمجاً، أو مستخدماً عادياً، نجهز لك أفضل تجميعة متوازنة تحقق معادلة الأداء مقابل السعر، وتضمن التوافق التام بين القطع بدون أي تعقيد.",
    featuresIcon: "🧩",
    features: [
      {
        icon: "🧠",
        title: "تحليل دقيق للاحتياج",
        description: "دراسة استخدامك (ألعاب، رندر، برمجة) لتحديد القطع المناسبة تماماً.",
      },
      {
        icon: "💸",
        title: "أفضل قيمة مقابل سعر",
        description: "اختيار قطع تقدم أعلى أداء لميزانيتك دون دفع مبالغ إضافية غير ضرورية.",
      },
      {
        icon: "⚙️",
        title: "توافق تام (Zero Bottleneck)",
        description: "ضمان تناغم المعالج مع كرت الشاشة والرام واللوحة الأم وتوافق الباور سبلاي.",
      },
      {
        icon: "🧾",
        title: "مصادر شراء موثوقة",
        description: "نسلمك قائمة مفصلة بالقطع مع روابط شراء مباشرة من متاجر مضمونة.",
      },
    ],
    includesTitle: "ماذا تشمل هذه الخدمة؟",
    includes: [
      "تحليل احتياجاتك بشكل كامل بناءً على أسلوب استخدامك اليومي أو المهني.",
      "تحديد الميزانية وتقديم خيارات بأكثر من فئة سعرية (اقتصادي، متوسط، عالي) عند الطلب.",
      "اختيار المكونات الأفضل تقنياً من حيث التبريد، سرعة النقل، وجودة التصنيع.",
      "تسليم التجميعة النهائية في ملف منظم أو رابط مباشر مع نصائح التركيب.",
      "دعم فني بعد الشراء للتأكد من توافق القطع عند وصولها وسلامة التركيب.",
    ],
    callout: {
      icon: "💻",
      title: "وفر وقتك وتجنب الحيرة",
      description:
        "دعنا نجهز لك تجميعة أداء مضمونة ومدروسة هندسياً حسب طلبك، بدلاً من البحث العشوائي.",
      tone: "green",
    },
    href: "/services/pc-build",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.id === slug);
}

export function getServicesByCategory(category: ServiceCategory): Service[] {
  return services.filter((service) => service.category === category);
}

/** Lowest price for display (handles tiered pricing). */
export function getStartingPrice(service: Service): number | null {
  if (service.price !== null) return service.price;
  if (service.priceTiers && service.priceTiers.length > 0) {
    return Math.min(...service.priceTiers.map((t) => t.price));
  }
  return null;
}
