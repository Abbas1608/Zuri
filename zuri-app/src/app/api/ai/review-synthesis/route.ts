// import { NextResponse } from 'next/server';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { aiMocks } from '@/utils/ai-mocks';

// //const genAI = new GoogleGenerativeAI(process..GEMINI_ || '');

// export async function POST(request: Request) {
//   try {
//     const { reviews, mode = 'customer' } = await request.json();
//     // mode: 'customer' = bestFor/watchOutFor/vibe | 'owner' = topAsset/frictionPoint/growthSuggestion

//     if (!reviews || reviews.length === 0) {
//       if (mode === 'owner') return NextResponse.json(aiMocks.adminReviewAnalysis);
//       return NextResponse.json(aiMocks.customerReviewSynthesis);
//     }

//     if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_KEY_HERE') {
//       if (mode === 'owner') return NextResponse.json(aiMocks.adminReviewAnalysis);
//       return NextResponse.json(aiMocks.customerReviewSynthesis);
//     }

//     const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

//     const reviewText = reviews.map((r: { text: string; rating: number }) =>
//       `Rating: ${r.rating}/5 — "${r.text}"`
//     ).join('\n');

//     let prompt: string;

//     if (mode === 'customer') {
//       prompt = `You are a beauty salon review analyst for Zuri Mumbai marketplace.

// Analyze these customer reviews and synthesize them for potential customers:
// ${reviewText}

// Respond in VALID JSON only (no markdown):
// {
//   "bestFor": "string (what this salon excels at, based on reviews)",
//   "watchOutFor": "string (any consistent negatives or caveats)",
//   "vibe": "string (the atmosphere and experience described in reviews)"
// }`;
//     } else {
//       prompt = `You are a business intelligence AI for Zuri, a Mumbai salon marketplace.

// Analyze these reviews from a salon owner's perspective:
// ${reviewText}

// Respond in VALID JSON only (no markdown):
// {
//   "topAsset": "string (the #1 thing customers consistently love — be specific with data from reviews)",
//   "frictionPoint": "string (the most recurring complaint or pain point)",
//   "growthSuggestion": "string (a concrete, actionable recommendation to improve the business)"
// }`;
//     }

//     const result = await model.generateContent(prompt);
//     const text = result.response.text().trim();
//     const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
//     const parsed = JSON.parse(jsonText);

//     return NextResponse.json(parsed);
//   } catch (error) {
//     console.error('Review synthesis AI error:', error);
//     const mock = (await request.json().catch(() => ({ mode: 'customer' }))) as { mode?: string };
//     if (mock.mode === 'owner') return NextResponse.json(aiMocks.adminReviewAnalysis);
//     return NextResponse.json(aiMocks.customerReviewSynthesis);
//   }
// }
