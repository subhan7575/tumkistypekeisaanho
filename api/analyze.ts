import { GoogleGenAI, Type } from '@google/genai';

// Switching to default nodejs runtime as it's often more stable for environment variables than edge in some regions
export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Sanitize the API key: remove whitespace and potential quotes accidental paste
  let apiKey = process.env.API_KEY || '';
  apiKey = apiKey.trim().replace(/^["']|["']$/g, '');

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(500).json({ 
      error: 'API_KEY is missing or not set in Vercel. Please add it to "Environment Variables" in Vercel Dashboard, then go to "Deployments" and click "Redeploy".' 
    });
  }

  // Basic check for Gemini key format (usually starts with AIza)
  if (!apiKey.startsWith('AIza')) {
    return res.status(400).json({ 
      error: 'Invalid Key Format. Gemini API keys usually start with "AIza". Please check your key in Google AI Studio.' 
    });
  }

  try {
    const { image, lang } = req.body;
    
    // Use the latest recommended model for multimodal tasks
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
    if (!text) throw new Error("Google AI returned an empty response.");

    return res.status(200).json(JSON.parse(text));

  } catch (error: any) {
    console.error('API Error Details:', error);
    
    // Extract a cleaner error message if it's a JSON string from the API
    let cleanMessage = error.message || 'Internal Server Error';
    try {
      if (cleanMessage.includes('{')) {
        const parsed = JSON.parse(cleanMessage.substring(cleanMessage.indexOf('{')));
        if (parsed.error?.message) cleanMessage = parsed.error.message;
      }
    } catch (e) {}

    return res.status(500).json({ error: cleanMessage });
  }
}
