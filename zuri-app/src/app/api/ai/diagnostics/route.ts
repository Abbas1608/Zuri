import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ─── Exact prompts from the user spec ────────────────────────────────────────
const MAKEUP_PROMPT = `Provide a makeup analysis and skin undertone assessment based on this portrait in a structured text format. Describe theoretical comparisons to determine which makeup styles and shades best suit the subject. Structure the response using concise labels, clear headings, and bullet points, avoiding long paragraphs. Do not generate an image.`;

const COLOR_PROMPT = `Provide a personal color analysis based on this portrait in a structured text format. Describe clothing color comparisons to highlight which palettes suit the subject best. Use a clean, scannable layout utilizing tables or short bullet points, clear headings, and concise labels. Avoid long paragraphs and do not generate an image.`;

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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = mode === 'color' ? COLOR_PROMPT : MAKEUP_PROMPT;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: imageBase64 } },
    ]);

    const text = result.response.text().trim();
    return NextResponse.json({ text, mode });

  } catch (error: unknown) {
    console.error('Diagnostics AI error:', error);

    // Surface quota / auth errors clearly to the frontend
    const err = error as { status?: number; statusText?: string; message?: string };
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
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.', code: 'UNKNOWN' },
      { status: 500 }
    );
  }
}
