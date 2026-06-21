// ============================================================
// Zuri Hair Care Scanner — Hardcoded Decision Matrix
// Zero-cost, zero-latency local logic engine
// ============================================================

export type WaterType = 'Soft' | 'Moderate' | 'Hard';
export type HairType = 'straight' | 'wavy' | 'curly';
export type Thickness = 'fine' | 'thick';
export type Length = 'short' | 'long';

export interface TDSProfile {
  tdsLevel: number;
  waterType: WaterType;
  zone: string;
  riskLabel: 'Low Risk' | 'Medium Risk' | 'High Risk';
}

export interface HairCareTip {
  headline: string;
  detail: string;
  urgency: 'low' | 'medium' | 'high';
  treatmentTag: string; // used for /discover filter
}

// ----------------------------------------------------------------
// A. Mumbai Pincode → TDS Map
// ----------------------------------------------------------------
const PINCODE_MAP: Record<string, TDSProfile> = {
  // South Mumbai — Soft Water (~80–100 TDS)
  '400001': { tdsLevel: 88,  waterType: 'Soft',     zone: 'Colaba',           riskLabel: 'Low Risk' },
  '400002': { tdsLevel: 92,  waterType: 'Soft',     zone: 'Mandvi / Masjid',  riskLabel: 'Low Risk' },
  '400003': { tdsLevel: 85,  waterType: 'Soft',     zone: 'Dongri',           riskLabel: 'Low Risk' },
  '400004': { tdsLevel: 90,  waterType: 'Soft',     zone: 'Girgaon',          riskLabel: 'Low Risk' },
  '400005': { tdsLevel: 95,  waterType: 'Soft',     zone: 'Churchgate',       riskLabel: 'Low Risk' },
  '400006': { tdsLevel: 98,  waterType: 'Soft',     zone: 'Malabar Hill',     riskLabel: 'Low Risk' },
  '400007': { tdsLevel: 94,  waterType: 'Soft',     zone: 'Grant Road',       riskLabel: 'Low Risk' },
  '400008': { tdsLevel: 96,  waterType: 'Soft',     zone: 'Mumbai Central',   riskLabel: 'Low Risk' },
  '400009': { tdsLevel: 100, waterType: 'Soft',     zone: 'Masjid Bunder',    riskLabel: 'Low Risk' },
  '400010': { tdsLevel: 102, waterType: 'Soft',     zone: 'Mazgaon',          riskLabel: 'Low Risk' },
  '400011': { tdsLevel: 105, waterType: 'Soft',     zone: 'Parel',            riskLabel: 'Low Risk' },
  '400012': { tdsLevel: 108, waterType: 'Soft',     zone: 'Dadar (East)',     riskLabel: 'Low Risk' },
  '400013': { tdsLevel: 110, waterType: 'Soft',     zone: 'Prabhadevi',       riskLabel: 'Low Risk' },
  '400014': { tdsLevel: 115, waterType: 'Soft',     zone: 'Dadar (West)',     riskLabel: 'Low Risk' },

  // Bandra / Andheri / Juhu — Moderate Water (~190–230 TDS)
  '400050': { tdsLevel: 210, waterType: 'Moderate', zone: 'Bandra (West)',    riskLabel: 'Medium Risk' },
  '400051': { tdsLevel: 205, waterType: 'Moderate', zone: 'Bandra (East)',    riskLabel: 'Medium Risk' },
  '400053': { tdsLevel: 220, waterType: 'Moderate', zone: 'Andheri (West)',   riskLabel: 'Medium Risk' },
  '400058': { tdsLevel: 215, waterType: 'Moderate', zone: 'Andheri (East)',   riskLabel: 'Medium Risk' },
  '400049': { tdsLevel: 195, waterType: 'Moderate', zone: 'Juhu',             riskLabel: 'Medium Risk' },
  '400054': { tdsLevel: 200, waterType: 'Moderate', zone: 'Versova',          riskLabel: 'Medium Risk' },
  '400056': { tdsLevel: 225, waterType: 'Moderate', zone: 'Malad (West)',     riskLabel: 'Medium Risk' },
  '400064': { tdsLevel: 218, waterType: 'Moderate', zone: 'Malad (East)',     riskLabel: 'Medium Risk' },
  '400061': { tdsLevel: 208, waterType: 'Moderate', zone: 'Kandivali (West)', riskLabel: 'Medium Risk' },
  '400067': { tdsLevel: 212, waterType: 'Moderate', zone: 'Kandivali (East)', riskLabel: 'Medium Risk' },
  '400066': { tdsLevel: 230, waterType: 'Moderate', zone: 'Borivali (West)',  riskLabel: 'Medium Risk' },
  '400092': { tdsLevel: 235, waterType: 'Moderate', zone: 'Powai',            riskLabel: 'Medium Risk' },
  '400076': { tdsLevel: 240, waterType: 'Moderate', zone: 'Vikhroli',         riskLabel: 'Medium Risk' },
  '400086': { tdsLevel: 228, waterType: 'Moderate', zone: 'Ghatkopar (West)', riskLabel: 'Medium Risk' },
  '400077': { tdsLevel: 232, waterType: 'Moderate', zone: 'Ghatkopar (East)', riskLabel: 'Medium Risk' },

  // Thane / Navi Mumbai — Hard Water (~380–460 TDS)
  '400601': { tdsLevel: 420, waterType: 'Hard',     zone: 'Thane (West)',     riskLabel: 'High Risk' },
  '400602': { tdsLevel: 410, waterType: 'Hard',     zone: 'Thane (East)',     riskLabel: 'High Risk' },
  '400604': { tdsLevel: 435, waterType: 'Hard',     zone: 'Kalwa',            riskLabel: 'High Risk' },
  '400612': { tdsLevel: 445, waterType: 'Hard',     zone: 'Bhiwandi',         riskLabel: 'High Risk' },
  '400703': { tdsLevel: 460, waterType: 'Hard',     zone: 'Navi Mumbai (CBD)', riskLabel: 'High Risk' },
  '400706': { tdsLevel: 430, waterType: 'Hard',     zone: 'Nerul',            riskLabel: 'High Risk' },
  '400708': { tdsLevel: 415, waterType: 'Hard',     zone: 'Kharghar',         riskLabel: 'High Risk' },
  '400709': { tdsLevel: 440, waterType: 'Hard',     zone: 'Panvel',           riskLabel: 'High Risk' },
  '400710': { tdsLevel: 450, waterType: 'Hard',     zone: 'Airoli',           riskLabel: 'High Risk' },
  '400614': { tdsLevel: 385, waterType: 'Hard',     zone: 'Dombivli',         riskLabel: 'High Risk' },
  '400615': { tdsLevel: 390, waterType: 'Hard',     zone: 'Kalyan',           riskLabel: 'High Risk' },
  '400701': { tdsLevel: 400, waterType: 'Hard',     zone: 'Vashi',            riskLabel: 'High Risk' },
};

/**
 * Resolve a 6-digit Mumbai pincode to its TDS profile.
 * Falls back to Moderate (~180 TDS) for valid unmapped 400xxx pincodes.
 */
export function getTDSProfile(pincode: string): TDSProfile | null {
  const trimmed = pincode.trim();
  if (!/^\d{6}$/.test(trimmed)) return null;

  if (PINCODE_MAP[trimmed]) return PINCODE_MAP[trimmed];

  // Valid Mumbai prefix fallback
  if (trimmed.startsWith('400')) {
    return {
      tdsLevel: 180,
      waterType: 'Moderate',
      zone: 'Mumbai',
      riskLabel: 'Medium Risk',
    };
  }

  return null; // Non-Mumbai pincode
}

// ----------------------------------------------------------------
// B. Hair Care Tip Generator Engine (12 explicit combinations)
// ----------------------------------------------------------------
type MatrixKey = `${WaterType}|${HairType}|${Thickness}|${Length}`;

const HAIR_TIP_MATRIX: Partial<Record<MatrixKey, HairCareTip>> = {

  // ── HARD WATER ─────────────────────────────────────────────────
  'Hard|curly|thick|long': {
    headline: 'Severe Mineral Build-up on Long Thick Curls',
    detail:
      'High-TDS hard water (400+ ppm) heavily deposits calcium and magnesium onto thick, long curls, creating a dense mineral crust that blocks moisture from penetrating the cortex. This causes severe coil deformation, chronic breakage mid-shaft, and dull, lifeless texture. Action: Use a professional chelating shampoo (EDTA-based) once a week, strictly avoid silicone-heavy leave-ins that trap minerals further, deep condition with a bond-building mask every wash day, and book an in-salon keratin-chelation detox + intensive moisture infusion treatment immediately.',
    urgency: 'high',
    treatmentTag: 'Keratin Detox + Moisture Infusion',
  },

  'Hard|curly|fine|long': {
    headline: 'Fragile Fine Curls Drowning in Mineral Deposits',
    detail:
      'Fine curly hair has the smallest diameter strand, making it the most vulnerable to hard water mineral encrustation. At 400+ TDS, deposits accumulate faster than a fine cortex can shed them, leading to extreme brittleness, tangles, and rapid shedding. Action: Clarify every 5 days with a gentle chelating shampoo, use leave-in conditioner only on mid-lengths to ends, and book a lightweight Olaplex or Bond-Repair treatment to restore elasticity before further breakage occurs.',
    urgency: 'high',
    treatmentTag: 'Bond Repair + Curl Rescue',
  },

  'Hard|wavy|thick|long': {
    headline: 'Hard Water Flattening & Stiffening Long Waves',
    detail:
      'Thick, long wavy hair accumulates heavy mineral scale from hard water, causing the waves to lose their natural S-pattern and become stiff, crunchy, and dull. Colour-treated waves will fade significantly faster. Action: Install a showerhead filter, use a clarifying shampoo every 8–10 days, seal with a lightweight argan oil after washing, and book a hydration spa treatment with scalp exfoliation to remove mineral buildup.',
    urgency: 'high',
    treatmentTag: 'Hydration Spa + Scalp Exfoliation',
  },

  'Hard|wavy|fine|short': {
    headline: 'Hard Water Making Fine Waves Brittle & Flat',
    detail:
      'Fine short waves are prone to mineral coating from hard water, which weighs down the natural wave pattern and causes premature breakage near the roots. Although short hair shows damage faster, it also responds to treatment fastest. Action: Use an apple cider vinegar rinse after every wash to dissolve surface minerals, apply a rice water spray as a lightweight protein treatment weekly, and book a fast 45-minute scalp detox + volume treatment at your nearest salon.',
    urgency: 'medium',
    treatmentTag: 'Scalp Detox + Volume Treatment',
  },

  'Hard|straight|thick|long': {
    headline: 'Long Thick Straight Hair Losing Shine to Hard Water',
    detail:
      'Thick straight strands appear deceptively resilient but mineral scale from hard water causes significant loss of natural shine, increases porosity unevenly, and creates a rough, chalky texture down the length. Action: Use a clarifying shampoo bi-weekly, apply a high-gloss serum after drying, and book a professional smoothing + high-gloss treatment to restore that mirror-like shine and seal the cuticle layer.',
    urgency: 'medium',
    treatmentTag: 'Smoothing + High-Gloss Treatment',
  },

  'Hard|straight|fine|short': {
    headline: 'Hard Water Stripping Oils from Fine Short Straight Hair',
    detail:
      'Fine short straight hair has limited natural oil coating across its length, meaning hard water minerals strip it quickly causing an itchy, flaky scalp and dull, lifeless ends. The result is hair that looks greasy at the root but feels dry and snapping at the tip. Action: Shampoo only the scalp with a chelating formula, condition only the ends, and book a scalp microbiome reset treatment to restore natural sebum balance.',
    urgency: 'medium',
    treatmentTag: 'Scalp Microbiome Reset',
  },

  // ── MODERATE WATER ──────────────────────────────────────────────
  'Moderate|curly|thick|long': {
    headline: 'Moderate TDS Building Up on Thick Long Curls Over Time',
    detail:
      'Moderate water (180–240 TDS) causes slow but consistent mineral accumulation on thick long curls, especially noticeable after a few weeks as increased frizz, reduced definition, and dull colour. The damage is preventable. Action: Use a light clarifying shampoo every 3 weeks, maintain weekly deep conditioning with a moisture-protein balance formula, seal curls with a castor-argan blend, and book a quarterly curl revival treatment for definition restoration.',
    urgency: 'medium',
    treatmentTag: 'Curl Revival + Deep Conditioning',
  },

  'Moderate|wavy|thick|short': {
    headline: 'Short Thick Waves Staying Healthy with Minimal Intervention',
    detail:
      'Short thick wavy hair handles moderate water quality reasonably well due to its natural resilience and shorter exposure length. Minor mineral deposition at 200–220 TDS can slightly dull the waves. Action: Use a hydrating shampoo with panthenol, apply a light wave-enhancing cream after washing, and book an optional bi-monthly moisture boost + texture spray treatment to keep waves bouncy and defined.',
    urgency: 'low',
    treatmentTag: 'Moisture Boost + Texture Treatment',
  },

  'Moderate|straight|fine|long': {
    headline: 'Moderate Water Gradually Weighing Down Fine Long Straight Hair',
    detail:
      'Fine long straight hair is sensitive to the gradual accumulation of minerals in moderate water. Over time, the hair looks flat, loses its natural movement, and feels heavy despite being fine. Action: Use a volumizing shampoo with salicylic acid to gently exfoliate the scalp, avoid silicone-heavy serums, and book a keratin-lite volume enhancement treatment every 8 weeks to maintain lift and lightness.',
    urgency: 'low',
    treatmentTag: 'Volume Enhancement + Keratin Lite',
  },

  // ── SOFT WATER ─────────────────────────────────────────────────
  'Soft|straight|fine|short': {
    headline: 'Soft Water Making Fine Short Hair Limp & Flat',
    detail:
      'Soft water (under 100 TDS) is excellent for preventing mineral damage but tends to over-soften fine short straight hair, leaving it flat, limp, and unable to hold any style. Natural oils spread too easily, making roots look greasy within hours. Action: Avoid heavy moisture-rich conditioners entirely at the roots, use a dry shampoo powder at the roots for volume, apply only a dime-sized amount of lightweight leave-in on ends, and book a professional texturizing volume spa treatment with scalp toning.',
    urgency: 'low',
    treatmentTag: 'Texturizing Volume Spa + Scalp Toning',
  },

  'Soft|curly|thick|long': {
    headline: 'Soft Water — Ideal Environment for Long Thick Curls',
    detail:
      'Soft water is the gold standard for thick long curly hair. Curls hydrate deeply and define beautifully without mineral interference. The main risk is over-conditioning and hygral fatigue from too much moisture entering the hair shaft repeatedly. Action: Balance moisture with protein treatments every 3 weeks, use a medium-hold curl cream to prevent over-softening, and book a preventative protein-moisture balance treatment to keep curls strong, defined, and resilient long-term.',
    urgency: 'low',
    treatmentTag: 'Protein-Moisture Balance Treatment',
  },

  'Soft|wavy|fine|long': {
    headline: 'Soft Water Causing Fine Long Waves to Lose Structure',
    detail:
      'Soft water keeps fine long wavy hair clean and mineral-free, but the lack of natural mineral friction causes the cuticle to open too freely, leading to frizz in high humidity and loss of wave definition. Action: Use a lightweight protein-enriched conditioner on mid-lengths, apply a humidity-blocking anti-humidity serum before styling, and book a wave-setting treatment with light keratin to add just enough structure without weighing down the fine strands.',
    urgency: 'low',
    treatmentTag: 'Wave-Setting + Humidity Shield',
  },
};

/**
 * Retrieve the highly specific hair care tip from the decision matrix.
 * Falls back to a safe generic tip if the exact combination isn't mapped.
 */
export function getHairCareTip(
  waterType: WaterType,
  hairType: HairType,
  thickness: Thickness,
  length: Length
): HairCareTip {
  const key: MatrixKey = `${waterType}|${hairType}|${thickness}|${length}`;
  if (HAIR_TIP_MATRIX[key]) return HAIR_TIP_MATRIX[key];

  // Generic fallback for any unmapped combination
  const urgencyMap: Record<WaterType, HairCareTip['urgency']> = {
    Hard: 'high',
    Moderate: 'medium',
    Soft: 'low',
  };

  return {
    headline: `${waterType} Water Profile — General Hair Care Guidance`,
    detail: `Your ${waterType.toLowerCase()} water supply has a TDS level that requires ${waterType === 'Hard' ? 'immediate protective action with chelating shampoos and mineral-blocking treatments' : waterType === 'Moderate' ? 'regular maintenance with clarifying washes every 3 weeks and monthly deep conditioning' : 'a balanced protein-moisture routine to prevent over-softening and maintain hair structure'}. Book a consultation at a Zuri partner salon for a personalised in-depth analysis.`,
    urgency: urgencyMap[waterType],
    treatmentTag: 'Hair Care Consultation',
  };
}

// ----------------------------------------------------------------
// C. Detailed Hair Profile Guide (12 combos — independent of water)
// ----------------------------------------------------------------
export interface HairProfileGuide {
  combo: string;          // e.g. "Straight + Fine + Short"
  whyItHappens: string;
  solution: string;
  routine: string;
  products: string;
  wasteTip: string;
  managementTip: string;
  diet: string;
}

type ProfileKey = `${HairType}|${Thickness}|${Length}`;

const HAIR_PROFILE_GUIDE: Record<ProfileKey, HairProfileGuide> = {

  'straight|fine|short': {
    combo: 'Straight + Fine + Short',
    whyItHappens: 'Straight, fine hair lacks structural volume. Because the strand is completely straight, sebum (natural scalp oil) travels down the short hair shaft rapidly, making it look greasy and flat within 24 hours.',
    solution: 'Focus on balancing scalp oil production while artificially creating root lift without using heavy, sticky products.',
    routine: 'Wash every 1–2 days using a gentle, clear, sulfate-free volumizing shampoo. Avoid creamy or pearlescent shampoos.',
    products: 'Use a lightweight texturizing powder at the roots. Skip heavy creams completely. If using conditioner, apply a dime-sized amount strictly to the very ends.',
    wasteTip: 'Stop wasting money on heavy hair masks or expensive hair oils. They will instantly weigh your hair down and make it look unwashed.',
    managementTip: 'Blow-dry your hair upside down using medium heat to force the roots to stand up, creating natural volume.',
    diet: 'Eat Biotin-rich foods (eggs, almonds, sweet potatoes) to help thicken the actual diameter of the growing hair follicles.',
  },

  'straight|fine|long': {
    combo: 'Straight + Fine + Long',
    whyItHappens: 'You deal with a dual-zone problem: greasy, flat roots but dry, brittle, static-prone ends. The sebum cannot travel all the way down the long shaft, leaving the ends unprotected.',
    solution: 'Treat your scalp and your ends as two completely different hair types during your wash routine.',
    routine: 'Concentrate your shampoo only on the scalp. Let the suds wash over the ends as you rinse. Apply conditioner only to the bottom 4 inches of your hair.',
    products: 'Dry shampoo for the roots on day two. A lightweight, water-based leave-in detangling spray for the lengths.',
    wasteTip: 'Stop wasting money on heavy deep-conditioning tubs. Instead, invest in a high-quality, flexible-bristle detangling brush to prevent mechanical breakage.',
    managementTip: 'Sleep with your hair in a loose, low braid tied with a silk scrunchie to prevent the fine, long strands from tangling and snapping at night.',
    diet: 'Focus on Omega-3 fatty acids (salmon, chia seeds, walnuts) to provide internal hydration to the dry ends.',
  },

  'straight|thick|short': {
    combo: 'Straight + Thick + Short',
    whyItHappens: 'The "Helmet Head" effect. Because the hair is thick, straight, and cut short, it is incredibly rigid. It tends to stick straight out and refuses to lay flat or hold a curve.',
    solution: 'Weightless smoothing and regular strategic haircuts to remove internal bulk.',
    routine: 'Wash 2–3 times a week with a smoothing or keratin-infused shampoo to soften the rigid hair cuticles.',
    products: 'Matte styling clays or pomades to give the hair direction. Use a smoothing serum to add shine without making it look wet.',
    wasteTip: 'Wasting time with curling irons or rollers. Short, thick, straight hair will drop a heat-curl within an hour. Embrace the straight texture.',
    managementTip: 'Ask your salon stylist for internal texturizing or "thinning" cuts. This removes the bulk from the inside so the hair lays flatter against your head.',
    diet: 'Iron-rich foods (spinach, lentils) to maintain the strength and health of your dense follicles.',
  },

  'straight|thick|long': {
    combo: 'Straight + Thick + Long',
    whyItHappens: 'Extreme weight. The sheer density and length pull down heavily on your scalp, often causing tension headaches and making the hair take hours to dry.',
    solution: 'Moisture balance, mechanical care, and reducing friction to manage the massive bulk of hair.',
    routine: 'Wash 1–2 times a week. Incorporate a clarifying shampoo once a month to strip away the buildup of hard water and products.',
    products: 'Argan oil applied to mid-lengths and ends while damp. Use thermal smoothing creams before blow-drying.',
    wasteTip: 'Stop wasting money on volumizing products — you already have the volume. Focus your budget on high-end smoothing and heat-protectant lines.',
    managementTip: 'Use a microfiber towel to wrap your hair after washing. Rubbing thick, long hair with a standard cotton towel causes severe friction and cuticle damage.',
    diet: 'Vitamin E-heavy foods (avocados, sunflower seeds) to naturally boost the shine and elasticity of the heavy strands.',
  },

  'wavy|fine|short': {
    combo: 'Wavy + Fine + Short',
    whyItHappens: 'Frizz and pattern loss. Fine wavy hair is highly susceptible to humidity. The waves easily drop flat or turn into a puffy cloud if touched too much while drying.',
    solution: 'Enhance the natural texture using weightless hold and strict hands-off drying methods.',
    routine: 'Wash 2–3 times a week. Scrunch your conditioner into the hair while in the shower to encourage the wave pattern.',
    products: 'Lightweight curl-enhancing mousses or sea salt sprays. Avoid heavy gels that will make the hair look crunchy and thin.',
    wasteTip: 'Stop wasting time flat-ironing it daily. Fine hair burns and breaks very quickly under daily high heat.',
    managementTip: 'Never, ever brush your hair when it is dry. Only detangle it in the shower with a wide-tooth comb while it is soaked in conditioner.',
    diet: 'Zinc-rich foods (pumpkin seeds, chickpeas) to support rapid tissue repair and follicle health.',
  },

  'wavy|fine|long': {
    combo: 'Wavy + Fine + Long',
    whyItHappens: 'The waves stretch out and look stringy. The long length pulls down on the fine strands, stretching the "S" shape of the wave until it looks messy and unkempt.',
    solution: 'Introduce protein to build internal strand structure, combined with gravity-defying drying techniques.',
    routine: 'Alternate between moisture-rich and protein-balanced shampoos to keep the hair strong enough to hold its wave.',
    products: 'Protein-infused leave-in sprays and light-hold liquid gels.',
    wasteTip: 'Heavy curl creams and thick butters are a complete waste. They will instantly flatten your waves and make your hair look greasy.',
    managementTip: 'Start "Plopping." After applying products to wet hair, wrap it on top of your head in a cotton t-shirt for 20 minutes to let the waves set against gravity.',
    diet: 'Bone broth or collagen supplements to build structural strength and elasticity in the long strands.',
  },

  'wavy|thick|short': {
    combo: 'Wavy + Thick + Short',
    whyItHappens: 'The dreaded "Triangle" shape. Because the hair is thick, the waves push outward horizontally rather than falling downward, making the hair look overly poofy.',
    solution: 'Deep hydration to weigh the hair down slightly, combined with strategic salon layering.',
    routine: 'Try "Co-washing" (washing with a cleansing conditioner instead of shampoo) every other wash to keep the thick waves highly moisturized and controlled.',
    products: 'Hydrating wave creams and anti-frizz silicone serums to lock out humidity.',
    wasteTip: 'Avoid texturizing sea salt sprays. They contain alcohol and salt, which will make thick waves immediately dry, coarse, and frizzy.',
    managementTip: 'Tell your stylist you need "long layers" cut into your short hair to remove the blunt edges and prevent the triangular poof.',
    diet: 'Vitamin A (sweet potatoes, carrots) to encourage the scalp to produce more natural sebum to coat the thick strands.',
  },

  'wavy|thick|long': {
    combo: 'Wavy + Thick + Long',
    whyItHappens: 'Extreme tangling and severe humidity reactions. The cuticle of wavy hair naturally sits slightly raised; when long and thick, it absorbs moisture from the air, swelling the shaft and causing massive frizz.',
    solution: 'Intense moisture sealing and friction reduction.',
    routine: 'Deep condition with a thick hair mask every single week. Detangle thoroughly in the shower, never when dry.',
    products: 'Heavy leave-in conditioners followed by sealing oils (like Jojoba or Almond oil) to lock the cuticles down.',
    wasteTip: 'Stop using standard terrycloth body towels on your hair. The rough loops catch the wavy cuticles, causing instant frizz before you even step out of the bathroom.',
    managementTip: 'You must sleep on a silk or satin pillowcase. Cotton pillowcases suck the moisture out of thick hair and cause severe bed-head friction.',
    diet: 'Hydration-heavy foods (cucumber, watermelon) and healthy fats (walnuts, olive oil) to keep the hair hydrated from the inside out.',
  },

  'curly|fine|short': {
    combo: 'Curly + Fine + Short',
    whyItHappens: '"Cotton candy" frizz and extreme shrinkage. Fine curls lack the physical weight to pull themselves down, so they spring up tightly to the scalp but lose their distinct ringlet shape easily.',
    solution: 'Provide hydration without weight, and use gentle, low-manipulation drying techniques.',
    routine: 'Wash 1–2 times a week with a highly moisturizing, 100% sulfate-free shampoo.',
    products: 'Aloe vera-based gels or light curl-defining jellies. Apply products to soaking wet hair.',
    wasteTip: "Don't waste money on thick butters like raw shea or coconut oil. They are too heavy for fine hair and will make your curls look limp and greasy.",
    managementTip: 'Use a diffuser attachment on your blow dryer. Set it to low heat and low speed, and do not touch the curls with your hands while drying to prevent frizz.',
    diet: 'Vitamin C-dense foods (oranges, bell peppers) to boost collagen production, giving the fine curls better elasticity and bounce.',
  },

  'curly|fine|long': {
    combo: 'Curly + Fine + Long',
    whyItHappens: 'Breakage and "fairy knots" (single-strand knots). The fine, curly strands constantly loop around each other, tying microscopic knots that snap under the slightest tension.',
    solution: 'Maximum slip during the wash routine and strict protective styling at night.',
    routine: 'Always "Pre-Poo" (apply a cheap conditioner or light oil to the hair for 20 minutes before shampooing) to protect the fragile lengths from the friction of washing.',
    products: 'Conditioners with high "slip" (marshmallow root or slippery elm extract), followed by lightweight defining lotions.',
    wasteTip: 'Wasting time trying to dry-detangle. Never run a brush through dry, curly, fine hair — it will rip the hair directly out of the follicle.',
    managementTip: 'Get regular "dusting" trims every 8 weeks. Keeping the ends perfectly clean prevents tangles from traveling up the hair shaft.',
    diet: 'Iron and protein pairings (like spinach with a squeeze of lemon juice) for maximum absorption to build tensile strength in fragile hair.',
  },

  'curly|thick|short': {
    combo: 'Curly + Thick + Short',
    whyItHappens: 'Extreme dryness and dense packing. Natural scalp oils simply cannot travel down the thick, winding, spiral path of the curl, leaving the hair parched and brittle.',
    solution: 'Layered moisture techniques and manual curl definition to create uniform, hydrated ringlets.',
    routine: 'Implement the LOC method immediately after washing: Liquid (water/leave-in), Oil (to seal), and Cream (to style).',
    products: 'Heavy curl custards, raw shea butter, and Jamaican Black Castor oil.',
    wasteTip: 'Clarifying shampoos should be used extremely sparingly. Overusing them is a waste of your natural oils and will lead to immediate breakage.',
    managementTip: '"Finger-coil" your hair. While the hair is wet and loaded with product, twist small sections around your index finger to train the curls to clump together smoothly.',
    diet: 'Vitamin D and healthy fats (mackerel, fortified mushrooms) for robust follicle health and natural shine.',
  },

  'curly|thick|long': {
    combo: 'Curly + Thick + Long',
    whyItHappens: 'Exhausting wash days and heavy matting. The sheer density, length, and winding texture mean the hair requires massive, consistent amounts of moisture and physical structure to survive.',
    solution: 'Sectioning strategies, protective styling, and heavy-duty moisture sealing.',
    routine: 'Never wash your hair in one giant mass. Clip your hair into 4–6 distinct sections before washing and detangling to manage the density. Use a heated deep-conditioning cap every wash day.',
    products: 'Ultra-rich deep conditioning masks, thick styling butters, and heavy sealing oils applied generously.',
    wasteTip: 'Stop buying standard-sized 250ml conditioner bottles — you will use half the bottle in one wash. Invest in 1-liter salon-sized tubs. Throw away all fine-tooth combs.',
    managementTip: 'Utilize protective styles. Keep your hair in braids, twists, or buns for several days at a time to give your ends a break from daily physical manipulation and environmental damage.',
    diet: 'Complete proteins (quinoa, chicken, tofu) and a heavily hydration-focused diet (drinking 3+ liters of water daily) to support the massive cellular production required to grow thick, long hair.',
  },
};

/** Retrieve the detailed 7-section hair profile guide for a given hair combo. */
export function getHairProfileGuide(
  hairType: HairType,
  thickness: Thickness,
  length: Length
): HairProfileGuide {
  return HAIR_PROFILE_GUIDE[`${hairType}|${thickness}|${length}`];
}

