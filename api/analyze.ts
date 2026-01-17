import { GoogleGenAI, Type } from '@google/genai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API_KEY is missing on the server. Please set it in Vercel Dashboard and REDEPLOY.' }), { status: 500 });
  }

  try {
    const { image, lang } = await req.json();
    const ai = new GoogleGenAI({ apiKey });

    const instructions = lang === 'hi'
      ? `You are the 'Sachi Baat' Personality Engine. Analyze facial features from the photo for true character traits. 
         Be extremely honest, bold, and slightly edgy (Kadwi Baat style). 
         ALL TEXT OUTPUT MUST BE IN ROMAN URDU (Urdu written in English script).
         JSON structure:
         - title: Catchy Roman Urdu title.
         - description: 1-line sharp summary.
         - reportDescription: 3 sentences of deep, unfiltered analysis.
         - darkLine: A poetic Sher or deep quote in Roman Urdu.
         - traits: 5 unique strengths.
         - weaknesses: 4 honest flaws.`
      : `Analyze facial features for deep personality traits. Be unfiltered and scientific.
         JSON structure:
         - title: Bold title.
         - description: 1-line summary.
         - reportDescription: 3 sentences of analysis.
         - darkLine: Philosophical quote.
         - traits: 5 strengths.
         - weaknesses: 4 flaws.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: image, mimeType: 'image/jpeg' } },
          { text: "Analyze this person's character based on biometric facial markers." }
        ]
      },
      config: {
        systemInstruction: instructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            reportDescription: { type: Type.STRING },
            darkLine: { type: Type.STRING },
            traits: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "reportDescription", "darkLine", "traits", "weaknesses"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
