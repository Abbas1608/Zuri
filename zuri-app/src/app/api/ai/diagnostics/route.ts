import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ─── Model fallback order (try lite first → full flash on 503) ────────────────
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

// ─── Prompts returning structured JSON ───────────────────────────────────────
const MAKEUP_PROMPT = `Analyse this portrait and return ONLY a valid JSON object (no markdown fences, no explanation, just raw JSON):
{
  "undertone": {
    "type": "e.g. Warm Golden / Cool Rosy / Neutral Olive / Warm Peach",
    "description": "2 sentences on visible undertone cues",
    "hex": "#RRGGBB realistic skin-tone hex"
  },
  "skinCondition": "brief e.g. Clear and even-toned with natural flush",
  "overallStyle": "e.g. Natural Glow / Soft Glam / Editorial Bold",
  "foundation": [
    { "name": "e.g. Light Medium", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" }
  ],
  "lipColors": [
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" }
  ],
  "eyeshadow": [
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" }
  ],
  "blush": [
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" }
  ],
  "eyeliner": [
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" }
  ],
  "highlight": [
    { "name": "shade", "hex": "#RRGGBB" },
    { "name": "shade", "hex": "#RRGGBB" }
  ],
  "avoid": [
    { "name": "e.g. Icy Blue Shadow", "hex": "#RRGGBB", "reason": "e.g. Washes out" },
    { "name": "avoid item", "hex": "#RRGGBB", "reason": "reason" },
    { "name": "avoid item", "hex": "#RRGGBB", "reason": "reason" }
  ],
  "tip": "Single most important actionable beauty tip for this person",
  "looks": [
    { "name": "e.g. Natural Glow", "description": "1-sentence description" },
    { "name": "e.g. Soft Glam", "description": "1-sentence description" },
    { "name": "e.g. Evening Glam", "description": "1-sentence description" }
  ]
}
Use realistic hex values that actually flatter this person's features. Foundation shades progress light to deep.`;

const COLOR_PROMPT = `Analyse this portrait for personal colour analysis. Return ONLY a valid JSON object (no markdown, no explanation, raw JSON):
{
  "season": "e.g. Warm Autumn / Cool Winter / Light Spring / Deep Autumn",
  "seasonDescription": "2-3 sentences explaining the season and style implications",
  "undertone": {
    "type": "e.g. Warm Golden / Cool Rosy / Neutral",
    "description": "1 sentence",
    "hex": "#RRGGBB"
  },
  "bestColors": [
    { "name": "color name", "hex": "#RRGGBB", "category": "Primary" },
    { "name": "color name", "hex": "#RRGGBB", "category": "Accent" },
    { "name": "color name", "hex": "#RRGGBB", "category": "Primary" },
    { "name": "color name", "hex": "#RRGGBB", "category": "Accent" },
    { "name": "color name", "hex": "#RRGGBB", "category": "Primary" },
    { "name": "color name", "hex": "#RRGGBB", "category": "Neutral" },
    { "name": "color name", "hex": "#RRGGBB", "category": "Accent" },
    { "name": "color name", "hex": "#RRGGBB", "category": "Primary" }
  ],
  "avoidColors": [
    { "name": "color name", "hex": "#RRGGBB" },
    { "name": "color name", "hex": "#RRGGBB" },
    { "name": "color name", "hex": "#RRGGBB" }
  ],
  "metals": ["Gold", "Copper"],
  "neutrals": [
    { "name": "neutral name", "hex": "#RRGGBB" },
    { "name": "neutral name", "hex": "#RRGGBB" },
    { "name": "neutral name", "hex": "#RRGGBB" },
    { "name": "neutral name", "hex": "#RRGGBB" }
  ],
  "tip": "Single most actionable style tip for this color season"
}`;

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType = 'image/jpeg', mode = 'makeup' } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PASTE_YOUR_GEMINI_KEY_HERE') {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Add GEMINI_API_KEY to .env.local' },
        { status: 503 }
      );
    }

    const prompt = mode === 'color' ? COLOR_PROMPT : MAKEUP_PROMPT;
    let lastError: unknown = null;

    // Try each model in order — fall back on 503 overload
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          prompt,
          { inlineData: { mimeType, data: imageBase64 } },
        ]);
        const rawText = result.response.text().trim();

        // Strip markdown fences if present
        const jsonText = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        const report = JSON.parse(jsonText);
        console.log(`Diagnostics: success with model ${modelName}`);
        return NextResponse.json({ report, mode });
      } catch (err: unknown) {
        const e = err as { status?: number };
        lastError = err;
        if (e?.status === 503) {
          console.warn(`${modelName} returned 503, trying next model...`);
          continue;
        }
        throw err;
      }
    }

    throw lastError;

  } catch (error: unknown) {
    console.error('Diagnostics AI error:', error);

    const err = error as { status?: number; message?: string };

    if (err?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment and try again.', code: 'RATE_LIMIT' },
        { status: 429 }
      );
    }
    if (err?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid Gemini API key. Check your .env.local file.', code: 'AUTH_ERROR' },
        { status: 401 }
      );
    }
    if (err?.status === 503) {
      return NextResponse.json(
        { error: 'Gemini AI is temporarily overloaded. Please try again in 30 seconds.', code: 'OVERLOADED' },
        { status: 503 }
      );
    }
    // JSON parse error
    if (err?.message?.includes('JSON')) {
      return NextResponse.json(
        { error: 'Could not parse AI response. Please try again.', code: 'PARSE_ERROR' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.', code: 'UNKNOWN' },
      { status: 500 }
    );
  }
}
