import { GoogleGenAI, Type } from '@google/genai';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 🛡️ Safe Key Retrieval
  // Using process.env.API_KEY allows Vercel to "auto-detect" the key from its dashboard.
  // This keeps the key out of the source code and safe from GitHub scanners.
  let apiKey = process.env.API_KEY || '';
  
  // Clean potential whitespace or accidental quotes
  apiKey = apiKey.trim().replace(/^["']|["']$/g, '').replace(/[\r\n]/gm, '');

  if (!apiKey || apiKey.length < 10) {
    return res.status(500).json({ 
      error: 'API_KEY is missing. Please add it to your Vercel Environment Variables.' 
    });
  }

  try {
    const { image, lang } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data. Please capture a photo.' });
    }
    
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = lang === 'hi'
      ? `You are the 'Sachi Baat' Personality AI. Analyze face for character. 
         Be brutally honest, unfiltered, and cinematic. 
         ALL TEXT MUST BE IN ROMAN URDU (English script).
         JSON: {title, description, reportDescription, darkLine (Roman Urdu Sher), traits[], weaknesses[]}`
      : `Deep biometric personality analysis. Be unfiltered and sharp. 
         JSON: {title, description, reportDescription, darkLine, traits[], weaknesses[]}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: image, mimeType: 'image/jpeg' } },
          { text: "Reveal the truth of this person based on their facial features. Be sharp and edgy." }
        ]
      },
      config: {
        systemInstruction,
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

    const output = response.text;
    if (!output) throw new Error("AI returned no response.");

    return res.status(200).json(JSON.parse(output));

  } catch (error: any) {
    console.error('API ERROR:', error.message);
    let msg = error.message || 'Analysis failed.';
    if (msg.includes('API key not valid')) msg = "Invalid API Key in Vercel settings.";
    return res.status(500).json({ error: msg });
  }
}
