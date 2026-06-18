import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiMocks } from '@/utils/ai-mocks';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { hairType, skinType, area = 'Mumbai' } = await request.json();

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_KEY_HERE') {
      return NextResponse.json(aiMocks.monsoonAdvisor);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Monsoon advisor AI error:', error);
    return NextResponse.json(aiMocks.monsoonAdvisor);
  }
}
