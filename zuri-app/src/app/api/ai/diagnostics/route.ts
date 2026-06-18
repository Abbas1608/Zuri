import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiMocks } from '@/utils/ai-mocks';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_KEY_HERE') {
      // Return mock data if no API key configured
      return NextResponse.json(aiMocks.diagnosticStudio);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a professional beauty consultant AI for Zuri, a premium salon marketplace in Mumbai, India.

Analyze this selfie and provide a detailed beauty profile in VALID JSON only (no markdown, no extra text):

{
  "undertone": "string (e.g. Warm Golden, Cool Ivory, Neutral Beige, Deep Warm, Deep Cool)",
  "makeupRecommendations": {
    "foundation": ["#hex1", "#hex2", "#hex3"],
    "lipColors": ["#hex1", "#hex2", "#hex3"],
    "eyeshadows": ["#hex1", "#hex2", "#hex3"]
  },
  "hairstyles": {
    "flattering": ["style1", "style2", "style3"],
    "avoid": ["style1", "style2", "style3"]
  },
  "skinType": "string (Oily/Dry/Combination/Normal)",
  "personalityStyle": "string (1 sentence description)"
}

Be specific with hex codes that complement their actual skin tone. Focus on Indian beauty standards and trends popular in Mumbai.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const text = result.response.text().trim();
    // Strip markdown code fences if present
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Diagnostics AI error:', error);
    // Fallback to mock data on error
    return NextResponse.json(aiMocks.diagnosticStudio);
  }
}
