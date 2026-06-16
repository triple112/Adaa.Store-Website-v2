export type Review = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  rating: number;
  text: string;
  /** Substrings rendered as highlighted mentions (e.g. team handles). */
  mentions?: string[];
};

/** Top marquee row. */
export const reviewsTop: Review[] = [
  {
    id: "kai",
    name: "KAI",
    handle: "@kai.003",
    avatar: "/reviews/kai.webp",
    rating: 5,
    text: "كان عندي بطئ وتقطيع والـ FPS ما يتعدى الـ 80. بعد التويك فرق عندي تشغيل النظام، الآن الـ FPS ما ينزل عن 120. شكراً @Triple 🌹",
    mentions: ["@Triple"],
  },
  {
    id: "trook",
    name: "T R O O K",
    handle: "@_trook",
    avatar: "/reviews/trook.webp",
    rating: 5,
    text: "@Triple الله يعطيه العافية سوّى خدمة بوست للأداء، وللأمانة زادت فريماتي بشكل واضح والله، وقد تعاملت معه مرتين ❤️",
    mentions: ["@Triple"],
  },
  {
    id: "khaled",
    name: "Khaled",
    handle: "@Qp11",
    avatar: "/reviews/khaled.webp",
    rating: 5,
    text: "الجهاز أخف بكثير والفريمات ممتازة، وأهم شي الاستجابة والتأخير (Input Lag) تحسها خفيفة. درجات الحرارة ممتازة.",
  },
  {
    id: "saud",
    name: "SAUD",
    handle: "@58pi",
    avatar: "/reviews/saud.webp",
    rating: 5,
    text: "تقييمي للتجربة والتعامل وسرعة الرد والتركيب: 10/10. أنصح بالشراء. أشكر @Triple و @Omar ❤️ ما قصرتو.",
    mentions: ["@Triple", "@Omar"],
  },
];

/** Bottom marquee row (travels the opposite direction). */
export const reviewsBottom: Review[] = [
  {
    id: "mbb",
    name: "_mbb.",
    handle: "@_mbb.",
    avatar: "/reviews/mbb.webp",
    rating: 5,
    text: "خدمة فوق التقييم وجهازي صار أسرع بنسبة 85%. فريماتي صارت 190-230 بجرافيكس v17. يعطيك العافية @Triple.",
    mentions: ["@Triple"],
  },
  {
    id: "abo9a8r",
    name: "α𝕻σ 9α8R 👑",
    handle: "@Abo9a8r",
    avatar: "/reviews/abo9a8r.webp",
    rating: 5,
    text: "فرمت لي الجهاز وبرمجه وصار غير. الفايف ام كانت تجيني دروبات، الحين الفريمات فوق 100 بالراحة مع الجرافيكس الأسطوري.",
  },
  {
    id: "mrzero",
    name: "Mr. Zero",
    handle: "@s8r_x1",
    avatar: "/reviews/mrzero.webp",
    rating: 5,
    text: "الخدمة: 10. الأسلوب: 1000000. الخدمة احترافية ودقيقة، أقسم بالله أحس جهازي صار أفضل. ألعب فايف ام على أفضل إعدادات.",
  },
  {
    id: "abdallh",
    name: "! Abdallh",
    handle: "@w_wh",
    avatar: "/reviews/abdallh.webp",
    rating: 5,
    text: "أقسم بالله تغيير وفرق واضح جداً، فريماتي كانت كحد أقصى 90 والحين 170 بالراحة. والنتيجة هاي بدون فورمات!",
  },
];
