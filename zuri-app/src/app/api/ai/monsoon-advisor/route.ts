import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiMocks } from '@/utils/ai-mocks';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ─── Model fallback order (try lite first → full flash on 503) ────────────────
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

export async function POST(request: Request) {
  try {
    const { hairType, skinType, area = 'Mumbai' } = await request.json();

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_KEY_HERE') {
      return NextResponse.json(aiMocks.monsoonAdvisor);
    }

    // Get current month to infer season
    const month = new Date().getMonth(); // 0-indexed
    const isMonsoon = month >= 5 && month <= 9; // June-October
    const season = isMonsoon ? 'Mumbai monsoon season (heavy rain, 80-95% humidity)' : 'post-monsoon / dry season';

    const prompt = `You are the Zuri Monsoon Beauty Advisor — a hyper-local AI for Mumbai salons.

User profile:
- Hair type: ${hairType || 'wavy'}
- Skin type: ${skinType || 'combination'}
- Location: ${area}, Mumbai
- Current weather: ${season}

Respond in VALID JSON only (no markdown):
{
  "currentWeather": {
    "condition": "string",
    "humidity": number,
    "temp": number
  },
  "recommendationText": "string (2-3 sentence personalized advice for Mumbai weather + their hair/skin type)",
  "quickLinks": [
    { "treatment": "Treatment Name", "salonId": "salon_1" },
    { "treatment": "Treatment Name", "salonId": "salon_2" }
  ]
}

Be specific to Mumbai's climate. Reference local neighborhoods (Bandra, Juhu, Colaba etc.).`;

    let lastError: unknown = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonText);
        console.log(`Monsoon advisor: success with model ${modelName}`);
        return NextResponse.json(parsed);
      } catch (err: unknown) {
        const e = err as { status?: number };
        lastError = err;
        if (e?.status === 503 || e?.status === 429) {
          console.warn(`${modelName} returned ${e?.status}, trying next model...`);
          continue;
        }
        throw err;
      }
    }

    throw lastError;
  } catch (error) {
    console.error('Monsoon advisor AI error:', error);
    // Always fall back to mock data — home page should never break
    return NextResponse.json(aiMocks.monsoonAdvisor);
  }
}
