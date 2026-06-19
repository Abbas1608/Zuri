import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiMocks } from '../../../../../utils/ai-mocks';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ─── Model fallback order ─────────────────────────────────────────────────────
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

// ─── Mock style tags fallback ─────────────────────────────────────────────────
const MOCK_STYLE_TAGS: string[] = [
  ...aiMocks.diagnosticStudio.hairstyles.flattering.map((s) =>
    s.toLowerCase()
  ),
  'caramel balayage',
  'curtain bangs',
];

const STYLE_MIRROR_PROMPT = `You are a master hairstylist and beauty director with 20 years of experience in Mumbai's luxury salon industry.
Analyse this inspiration photo and extract the key professional style techniques visible.

Return ONLY a valid JSON array of 3-5 lowercase string style tags. No markdown fences, no explanation, no extra text — raw JSON array only.

Examples of good tags: "caramel balayage", "curtain bangs", "voluminous blowout", "glass hair", "money piece highlights", "korean straight perm", "butterfly cut", "face framing layers", "goddess braids", "bold brows", "smoky eye", "dewy skin", "HD makeup", "keratin treatment", "ombre", "beachy waves".

Extract the most distinctive and specific techniques you can identify in this image. Focus on hair colour, cut, styling techniques, and any visible makeup/beauty treatments.`;

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PASTE_YOUR_GEMINI_KEY_HERE') {
      console.warn('Style Mirror: Gemini key missing — using mock data');
      return NextResponse.json({ tags: MOCK_STYLE_TAGS.slice(0, 4), isMock: true });
    }

    let lastError: unknown = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          STYLE_MIRROR_PROMPT,
          { inlineData: { mimeType, data: imageBase64 } },
        ]);
        const rawText = result.response.text().trim();

        // Strip markdown fences if present
        const jsonText = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        const tags: string[] = JSON.parse(jsonText);

        if (!Array.isArray(tags) || tags.length === 0) {
          throw new Error('AI returned an invalid tag array');
        }

        // Clamp to 3–5 tags
        const finalTags = tags.slice(0, 5).map((t) =>
          String(t).toLowerCase().trim()
        );

        console.log(`Style Mirror: success with model ${modelName}`, finalTags);
        return NextResponse.json({ tags: finalTags, isMock: false });
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
    console.error('Style Mirror AI error:', error);

    const err = error as { status?: number; message?: string };

    // Graceful fallback for any failure
    if (err?.status === 429) {
      return NextResponse.json(
        { tags: MOCK_STYLE_TAGS.slice(0, 4), isMock: true, warning: 'Rate limit — showing demo tags' },
        { status: 200 }
      );
    }

    // For all other errors, return mock data gracefully
    return NextResponse.json(
      { tags: MOCK_STYLE_TAGS.slice(0, 4), isMock: true, warning: 'AI unavailable — showing demo tags' },
      { status: 200 }
    );
  }
}
