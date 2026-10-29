import type { Language } from "./i18n";

/**
 * Explanation content for every component produced by `calculateTnb`.
 *
 * This module contains NO calculation logic and NO amounts: it only describes
 * the rules implemented by `lib/tnb.ts` and `lib/rates.ts`. The report builder
 * injects the real values and worked examples so the PDF and the in-app
 * "Comprendre le calcul" section can never drift apart.
 */
export interface TnbExplanationText {
  key: TnbExplanationKey;
  /** i18n key of the label when the app already defines one. */
  labelKey?: string;
  label: Record<Language, string>;
  /** What the component represents, in plain language. */
  definition: Record<Language, string>;
  /** Why it appears in the breakdown. */
  why: Record<Language, string>;
  /** When it applies, is zeroed or is excluded. */
  when: Record<Language, string>;
  /** Formula used by the calculation engine. */
  formula: Record<Language, string>;
  /** Rule that still needs an official/legal cross-check. */
  legalNote?: Record<Language, string>;
}

export type TnbExplanationKey =
  | "surface"
  | "tariff"
  | "zone"
  | "declaration"
  | "principal"
  | "def"
  | "maj10"
  | "maj5"
  | "monthsLate"
  | "maj05"
  | "annual"
  | "grand";

export const TNB_EXPLANATIONS: readonly TnbExplanationText[] = [
  {
    key: "surface",
    labelKey: "tnb.surfaceCol",
    label: { fr: "Surface du terrain", ar: "مساحة الأرض" },
    definition: {
      fr: "La superficie du terrain non bâti, exprimée en mètres carrés (m²). C'est la quantité de terrain retenue pour le calcul.",
      ar: "مساحة الأرض غير المبنية بالمتر المربع (م²). وهي الكمية المعتمدة في الحساب.",
    },
    why: {
      fr: "La taxe est calculée au mètre carré : la surface multiplie le tarif applicable pour obtenir le montant principal.",
      ar: "تُحتسب الضريبة بالمتر المربع: تُضرب المساحة في المعدل المطبق للحصول على المبلغ الأصلي.",
    },
    when: {
      fr: "Elle est obligatoire et doit être strictement supérieure à 0. Une surface vide, nulle, négative ou non numérique bloque le calcul.",
      ar: "المساحة إلزامية ويجب أن تكون أكبر من 0. المساحة الفارغة أو الصفرية أو السلبية أو غير الرقمية توقف الحساب.",
    },
    formula: {
      fr: "Surface retenue = superficie saisie (en m²).",
      ar: "المساحة المعتمدة = المساحة المدخلة (بالمتر المربع).",
    },
  },
  {
    key: "zone",
    labelKey: "tnb.zoneCol",
    label: { fr: "Zone du terrain", ar: "منطقة الأرض" },
    definition: {
      fr: "La zone détermine le tarif au mètre carré. Daribati utilise les zones R3, R5 et R7 pour 2021–2025, puis les zones A et B à partir de 2026.",
      ar: "تحدد المنطقة معدل المتر المربع. يستعمل Daribati مناطق R3 وR5 وR7 من 2021 إلى 2025، ثم المنطقتين A وB ابتداءً من 2026.",
    },
    why: {
      fr: "Deux terrains de même surface peuvent avoir des montants différents selon leur zone : le tarif n'est pas le même partout.",
      ar: "قد تختلف مبالغ أرضين لهما نفس المساحة حسب المنطقة، لأن المعدل ليس واحداً في كل المناطق.",
    },
    when: {
      fr: "La zone est requise pour les années 2021 et suivantes. Avant 2021, le tarif est le même pour toutes les zones et aucune zone n'est demandée.",
      ar: "تُطلب المنطقة لسنوات 2021 وما بعدها. قبل 2021، المعدل موحد لكل المناطق ولا تُطلب أي منطقة.",
    },
    formula: {
      fr: "Zone → tarif de la période correspondante (voir « Tarif applicable »).",
      ar: "المنطقة ← معدل الفترة المعنية (انظر «المعدل المطبق»).",
    },
  },
  {
    key: "tariff",
    labelKey: "tnb.tariffCol",
    label: { fr: "Tarif applicable", ar: "المعدل المطبق" },
    definition: {
      fr: "Le montant de taxe par mètre carré (DH/m²) appliqué à une année donnée. Chaque année utilise le tarif de sa propre période.",
      ar: "مبلغ الضريبة لكل متر مربع (درهم/م²) المطبق في سنة معينة. كل سنة تستعمل معدل فترتها.",
    },
    why: {
      fr: "Le tarif transforme la surface en montant en dirhams. Il change selon la période historique et, depuis 2021, selon la zone.",
      ar: "يحوّل المعدل المساحة إلى مبلغ بالدرهم. ويتغير حسب الفترة التاريخية، ومنذ 2021 حسب المنطقة.",
    },
    when: {
      fr: "Un tarif est résolu indépendamment pour chaque année sélectionnée. Si aucun tarif n'est configuré pour une année, cette année n'est pas calculée et le total est signalé comme partiel.",
      ar: "يُحدد معدل مستقل لكل سنة مختارة. وإذا لم تكن هناك تعريفة مضبوطة لسنة ما، فلا تُحسب تلك السنة ويُشار إلى المجموع كجزئي.",
    },
    formula: {
      fr: "Avant 2018 : 2 DH/m² · 2018–2020 : 4 DH/m² · 2021–2025 : 6, 8 ou 10 DH/m² selon la zone R · depuis 2026 : 15 ou 20 DH/m² (zone A), 6 ou 10 DH/m² (zone B).",
      ar: "قبل 2018: 2 درهم/م² · 2018–2020: 4 دراهم/م² · 2021–2025: 6 أو 8 أو 10 دراهم/م² حسب منطقة R · منذ 2026: 15 أو 20 درهماً/م² (المنطقة A)، 6 أو 10 دراهم/م² (المنطقة B).",
    },
    legalNote: {
      fr: "Les barèmes 2021–2025 et 2026+ sont configurés dans Daribati et restent à confirmer auprès du service compétent.",
      ar: "معدلات 2021–2025 و2026+ مضبوطة في Daribati وتنتظر التأكيد من المصلحة المختصة.",
    },
  },
  {
    key: "declaration",
    labelKey: "tnb.declarationCol",
    label: { fr: "Statut de déclaration", ar: "حالة الإقرار" },
    definition: {
      fr: "Indique si le terrain a été déclaré pour cette année fiscale. Le statut est enregistré séparément pour chaque année sélectionnée.",
      ar: "يشير إلى ما إذا كانت الأرض قد صُرّح بها في تلك السنة الضريبية. تُسجل الحالة لكل سنة مختارة على حدة.",
    },
    why: {
      fr: "Le statut de déclaration ne change pas le montant principal, mais il détermine si la DEF (charge liée à l'absence de déclaration) est appliquée.",
      ar: "لا تغيّر حالة الإقرار المبلغ الأصلي، لكنها تحدد ما إذا كانت DEF (الشحنة المرتبطة بعدم الإقرار) تُطبق.",
    },
    when: {
      fr: "Un statut est requis pour chaque année : aucune valeur par défaut n'est supposée. « Déclarée » ne signifie pas « payée ».",
      ar: "تُطلب حالة لكل سنة: لا تُفترض أي قيمة تلقائياً. «مصرَّح بها» لا تعني «مدفوعة».",
    },
    formula: {
      fr: "Déclarée → DEF = 0 · Non déclarée → DEF = max(Principal × 15 % ; 500,00 DH).",
      ar: "مصرَّح بها ← DEF = 0 · غير مصرَّح بها ← DEF = الحد الأقصى(الأصل × 15٪ ؛ 500,00 درهم).",
    },
  },
  {
    key: "principal",
    labelKey: "tnb.principal",
    label: { fr: "Montant principal", ar: "المبلغ الأصلي" },
    definition: {
      fr: "La taxe de base, obtenue en multipliant la surface du terrain par le tarif au mètre carré de l'année concernée.",
      ar: "الضريبة الأساسية، وتُحصل بضرب مساحة الأرض في معدل المتر المربع للسنة المعنية.",
    },
    why: {
      fr: "C'est le socle du calcul : toutes les autres charges et majorations sont calculées à partir de ce montant.",
      ar: "هو أساس الحساب: تُحتسب كل الشحنات والزيادات الأخرى انطلاقاً من هذا المبلغ.",
    },
    when: {
      fr: "Toujours calculé dès que la surface est valide et que l'année a un tarif résolu. Il n'est jamais nul sauf surface nulle (calcul bloqué).",
      ar: "يُحتسب دائماً عندما تكون المساحة صحيحة وللسنة تعريفة محددة. لا يكون صفراً إلا إذا كانت المساحة صفراً (يتوقف الحساب).",
    },
    formula: {
      fr: "Principal = Surface × Tarif applicable, arrondi à 2 décimales.",
      ar: "الأصل = المساحة × المعدل المطبق، مع التقريب إلى منزلتين عشريتين.",
    },
  },
  {
    key: "def",
    labelKey: "tnb.def",
    label: { fr: "DEF — charge liée à la déclaration", ar: "DEF — الشحنة المرتبطة بالإقرار" },
    definition: {
      fr: "Une charge ajoutée lorsque le terrain n'a pas été déclaré pour l'année concernée. DEF signifie « déclaration » dans le libellé utilisé par Daribati.",
      ar: "شحنة تُضاف عندما لا تكون الأرض قد صُرّح بها في السنة المعنية. DEF تعني «الإقرار» في التسمية المستعملة في Daribati.",
    },
    why: {
      fr: "Elle matérialise la conséquence du défaut de déclaration dans la simulation et s'ajoute au total de l'année.",
      ar: "تُجسد نتيجة عدم الإقرار في المحاكاة وتُضاف إلى مجموع السنة.",
    },
    when: {
      fr: "Uniquement pour les années marquées « Non déclarée ». Elle est exactement de 0 pour une année « Déclarée ». Le montant est le plus élevé entre 15 % du principal et 500 DH.",
      ar: "تطبق فقط على السنوات المحددة بـ«غير مصرَّح بها». وتكون 0 تماماً في السنة «المصرَّح بها». والمبلغ هو الأكبر بين 15٪ من الأصل و500 درهم.",
    },
    formula: {
      fr: "DEF = 0 si déclarée ; sinon DEF = max(Principal × 15 % ; 500,00 DH), chaque terme arrondi à 2 décimales.",
      ar: "DEF = 0 إذا كانت مصرَّحاً بها؛ وإلا DEF = الحد الأقصى(الأصل × 15٪ ؛ 500,00 درهم)، مع تقريب كل حد إلى منزلتين عشريتين.",
    },
    legalNote: {
      fr: "Le taux de 15 % et le minimum de 500 DH sont les valeurs configurées dans Daribati ; ils doivent être vérifiés sur le texte officiel applicable.",
      ar: "نسبة 15٪ والحد الأدنى 500 درهم هما القيمتان المضبوطتان في Daribati، ويجب التحقق منهما في النص الرسمي المطبق.",
    },
  },
  {
    key: "maj10",
    labelKey: "tnb.maj10",
    label: { fr: "Majoration 10 %", ar: "زيادة 10٪" },
    definition: {
      fr: "Une majoration égale à 10 % du montant principal, affichée séparément dans le tableau.",
      ar: "زيادة تعادل 10٪ من المبلغ الأصلي، تظهر بشكل منفصل في الجدول.",
    },
    why: {
      fr: "Elle s'ajoute au principal pour former le total annuel ; elle est présentée à part pour rester lisible.",
      ar: "تُضاف إلى الأصل لتكوين المجموع السنوي، وتُعرض منفصلة لتبقى واضحة.",
    },
    when: {
      fr: "Appliquée à chaque année calculée, quel que soit le statut de déclaration. Son montant est toujours calculé sur le principal de la même année.",
      ar: "تُطبق على كل سنة محسوبة، أياً كانت حالة الإقرار. ويُحتسب مبلغها دائماً على أصل نفس السنة.",
    },
    formula: {
      fr: "Majoration 10 % = Principal × 10 %, arrondie à 2 décimales.",
      ar: "زيادة 10٪ = الأصل × 10٪، مع التقريب إلى منزلتين عشريتين.",
    },
    legalNote: {
      fr: "Le taux de 10 % est une règle configurée dans Daribati ; sa base légale et ses conditions d'application restent à confirmer.",
      ar: "نسبة 10٪ قاعدة مضبوطة في Daribati، ويبقى أساسها القانوني وشروط تطبيقها بحاجة إلى تأكيد.",
    },
  },
  {
    key: "maj5",
    labelKey: "tnb.maj5",
    label: { fr: "Majoration 5 %", ar: "زيادة 5٪" },
    definition: {
      fr: "Une seconde majoration, égale à 5 % du montant principal, distincte de la majoration de 10 %.",
      ar: "زيادة ثانية تعادل 5٪ من المبلغ الأصلي، مستقلة عن زيادة 10٪.",
    },
    why: {
      fr: "Elle apparaît comme une ligne séparée du tableau et du total annuel : les deux majorations ne sont pas fusionnées.",
      ar: "تظهر كسطر منفصل في الجدول وفي المجموع السنوي: الزيادتان لا تُدمجان.",
    },
    when: {
      fr: "Appliquée à chaque année calculée, indépendamment du statut de déclaration et du nombre de mois de retard.",
      ar: "تُطبق على كل سنة محسوبة، بغض النظر عن حالة الإقرار وعدد أشهر التأخير.",
    },
    formula: {
      fr: "Majoration 5 % = Principal × 5 %, arrondie à 2 décimales.",
      ar: "زيادة 5٪ = الأصل × 5٪، مع التقريب إلى منزلتين عشريتين.",
    },
    legalNote: {
      fr: "Le taux de 5 % est une règle configurée dans Daribati ; sa base légale et ses conditions d'application restent à confirmer.",
      ar: "نسبة 5٪ قاعدة مضبوطة في Daribati، ويبقى أساسها القانوني وشروط تطبيقها بحاجة إلى تأكيد.",
    },
  },
  {
    key: "monthsLate",
    labelKey: "tnb.monthsLate",
    label: { fr: "Mois de retard", ar: "أشهر التأخير" },
    definition: {
      fr: "Le nombre de mois écoulés entre le mois de référence (mars de l'année fiscale) et la date de calcul choisie.",
      ar: "عدد الأشهر المنقضية بين الشهر المرجعي (مارس من السنة الضريبية) وتاريخ الحساب المختار.",
    },
    why: {
      fr: "Ce compteur sert uniquement à calculer la majoration mensuelle de 0,5 %. Il n'est pas un montant en dirhams.",
      ar: "يُستعمل هذا العداد فقط لحساب الزيادة الشهرية 0,5٪. وهو ليس مبلغاً بالدرهم.",
    },
    when: {
      fr: "Jamais négatif : si la date de calcul est antérieure à mars de l'année fiscale, le nombre de mois est ramené à 0 et la majoration mensuelle est nulle.",
      ar: "لا يكون سالباً أبداً: إذا كان تاريخ الحساب قبل مارس من السنة الضريبية، يُعاد عدد الأشهر إلى 0 وتكون الزيادة الشهرية صفراً.",
    },
    formula: {
      fr: "Mois de retard = max(0 ; (Année de calcul − Année fiscale) × 12 + (Mois de calcul − 3)).",
      ar: "أشهر التأخير = الحد الأقصى(0 ؛ (سنة الحساب − السنة الضريبية) × 12 + (شهر الحساب − 3)).",
    },
    legalNote: {
      fr: "Le mois de référence (mars) et la date de calcul sont des paramètres de Daribati ; leur conformité réglementaire doit être vérifiée.",
      ar: "الشهر المرجعي (مارس) وتاريخ الحساب معلمتان في Daribati، ويجب التحقق من مطابقتهما التنظيمية.",
    },
  },
  {
    key: "maj05",
    labelKey: "tnb.maj05",
    label: { fr: "Majoration 0,5 % par mois", ar: "زيادة 0,5٪ شهرياً" },
    definition: {
      fr: "Une majoration de retard proportionnelle au nombre de mois écoulés, calculée sur le montant principal.",
      ar: "زيادة تأخير تتناسب مع عدد الأشهر المنقضية، وتُحتسب على المبلغ الأصلي.",
    },
    why: {
      fr: "Elle traduit le retard accumulé depuis la date de référence et s'ajoute au total de chaque année.",
      ar: "تُعبّر عن التأخير المتراكم منذ التاريخ المرجعي وتُضاف إلى مجموع كل سنة.",
    },
    when: {
      fr: "Nulle lorsque le nombre de mois de retard est 0. Son montant augmente avec chaque mois supplémentaire et avec le principal de l'année.",
      ar: "تكون صفراً عندما يكون عدد أشهر التأخير 0. ويزداد مبلغها مع كل شهر إضافي ومع أصل السنة.",
    },
    formula: {
      fr: "Majoration 0,5 % = Principal × 0,5 % × Mois de retard, arrondie à 2 décimales.",
      ar: "زيادة 0,5٪ = الأصل × 0,5٪ × أشهر التأخير، مع التقريب إلى منزلتين عشريتين.",
    },
    legalNote: {
      fr: "Le taux mensuel de 0,5 % est configuré dans Daribati ; il n'est pas présenté ici comme un taux légal confirmé.",
      ar: "النسبة الشهرية 0,5٪ مضبوطة في Daribati وليست مقدمة هنا كنسبة قانونية مؤكدة.",
    },
  },
  {
    key: "annual",
    labelKey: "tnb.annualTotal",
    label: { fr: "Total annuel", ar: "المجموع السنوي" },
    definition: {
      fr: "La somme, pour une année donnée, du principal, de la DEF et des trois majorations.",
      ar: "مجموع الأصل وDEF والزيادات الثلاث لسنة معينة.",
    },
    why: {
      fr: "Il permet de lire le coût complet d'une année fiscale sans mélanger les années entre elles.",
      ar: "يتيح قراءة التكلفة الكاملة لسنة ضريبية دون خلط السنوات.",
    },
    when: {
      fr: "Calculé uniquement pour les années dont le tarif est résolu et dont le statut de déclaration est connu. Une année non résolue n'est jamais comptée comme 0.",
      ar: "يُحتسب فقط للسنوات ذات التعريفة المحددة وحالة الإقرار المعروفة. السنة غير المحسوبة لا تُحسب أبداً كصفر.",
    },
    formula: {
      fr: "Total annuel = Principal + DEF + Majoration 10 % + Majoration 5 % + Majoration 0,5 %, chaque ligne étant déjà arrondie.",
      ar: "المجموع السنوي = الأصل + DEF + زيادة 10٪ + زيادة 5٪ + زيادة 0,5٪، مع كون كل سطر مقرباً مسبقاً.",
    },
  },
  {
    key: "grand",
    labelKey: "tnb.grandTotal",
    label: { fr: "Total général", ar: "المجموع العام" },
    definition: {
      fr: "La somme des totaux annuels de toutes les années calculées dans la simulation.",
      ar: "مجموع المجاميع السنوية لكل السنوات المحسوبة في المحاكاة.",
    },
    why: {
      fr: "C'est le montant global des arriérés estimés affiché en haut des résultats.",
      ar: "هو المبلغ الإجمالي للمتأخرات التقديرية المعروض أعلى النتائج.",
    },
    when: {
      fr: "Il est qualifié de « partiel » si au moins une année n'a pas pu être calculée : les années non résolues sont alors exclues au lieu d'être comptées comme zéro.",
      ar: "يُوصف بأنه «جزئي» إذا تعذر حساب سنة واحدة على الأقل: تُستبعد السنوات غير المحسوبة بدل احتسابها صفراً.",
    },
    formula: {
      fr: "Total général = Σ Totaux annuels des années calculées.",
      ar: "المجموع العام = Σ المجاميع السنوية للسنوات المحسوبة.",
    },
  },
];

/** Rules that must be cross-checked before any official use of the report. */
export const TNB_RULES_TO_VERIFY: Record<Language, string[]> = {
  fr: [
    "Barème 2021–2025 : zones R3 = 6, R5 = 8, R7 = 10 DH/m².",
    "Barème 2026+ : zone A = 15 ou 20 DH/m² ; zone B = 6 ou 10 DH/m².",
    "DEF : 15 % du principal avec un minimum de 500 DH.",
    "Majorations fixes de 10 % et de 5 % appliquées au principal.",
    "Majoration de retard de 0,5 % par mois, avec mars comme mois de référence.",
  ],
  ar: [
    "معدلات 2021–2025: المناطق R3 = 6، R5 = 8، R7 = 10 دراهم/م².",
    "معدلات 2026+: المنطقة A = 15 أو 20 درهماً/م²؛ المنطقة B = 6 أو 10 دراهم/م².",
    "DEF: 15٪ من الأصل بحد أدنى 500 درهم.",
    "زيادتان ثابتتان 10٪ و5٪ مطبقتان على الأصل.",
    "زيادة تأخير 0,5٪ شهرياً، مع مارس كشهر مرجعي.",
  ],
};

export function findTnbExplanation(
  key: TnbExplanationKey,
): TnbExplanationText {
  const found = TNB_EXPLANATIONS.find((entry) => entry.key === key);
  if (!found) throw new Error(`Unknown TNB explanation: ${key}`);
  return found;
}
