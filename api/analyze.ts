import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  // CORS aur Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Environment Variable fetching with fallback
  const rawKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.length < 10) {
    return res.status(500).json({ 
      error: 'Vercel API_KEY detect nahi ho rahi. Sir, please check karein ke environment variable ka naam bilkul API_KEY hi hai aur value sahi hai.' 
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { image, lang } = body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is missing' });
    }

    // Clean base64 string (remove data:image/jpeg;base64, if exists)
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

    // Google AI initialization
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: lang === 'hi'
          ? `You are the 'Sachi Baat' Personality Engine. Analyze facial features for true character traits. Be extremely honest, bold, and edgy. ALL TEXT OUTPUT MUST BE IN ROMAN URDU (Urdu in English script). JSON structure: { "title": "...", "description": "...", "reportDescription": "...", "darkLine": "...", "traits": ["...", "..."], "weaknesses": ["...", "..."] }`
          : `Analyze facial features for personality traits. Be unfiltered. JSON structure: { "title": "...", "description": "...", "reportDescription": "...", "darkLine": "...", "traits": ["...", "..."], "weaknesses": ["...", "..."] }`
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      },
      { text: "Analyze this person's character based on biometric markers and return JSON only." }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (sometimes Gemini adds markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const finalJson = jsonMatch ? jsonMatch[0] : text;

    return res.status(200).json(JSON.parse(finalJson));

  } catch (error: any) {
    console.error('Full API Error:', error);
    let message = error.message || 'Something went wrong';
    
    if (message.includes('API key not valid')) {
      message = "Google says your API Key is NOT VALID. Sir, key copy karne mein koi ghalti hui hai.";
    }

    return res.status(500).json({ error: message });
  }
}
