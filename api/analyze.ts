import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  // 1. Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. API Key Fetching (Vercel ke liye)
  const apiKey = (process.env.API_KEY || '').trim().replace(/^["']|["']$/g, '');

  if (!apiKey) {
    return res.status(500).json({ error: 'Sir, API_KEY Vercel settings mein nahi mili. Please check variables.' });
  }

  try {
    const { image, lang } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Image data is missing' });
    }

    // Base64 clean up
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

    // 3. AI Setup
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = lang === 'hi' 
      ? "Analyze this person's character from their face. Be bold and edgy. Return ONLY a JSON object in Roman Urdu with these keys: title, description, reportDescription, darkLine, traits (array), weaknesses (array)."
      : "Analyze this person's character from their face. Return ONLY a JSON object with these keys: title, description, reportDescription, darkLine, traits (array), weaknesses (array).";

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      },
      { text: prompt }
    ]);

    const response = await result.response;
    let text = response.text();
    
    // 4. JSON Extraction (Zaruri hai kyunki AI kabhi kabhi ```json ... ``` likh deta hai)
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);

    return res.status(200).json(JSON.parse(jsonString));

  } catch (error: any) {
    console.error("Server Error:", error);
    return res.status(500).json({ 
      error: "AI Response error: " + (error.message || "Unknown error")
    });
  }
}
