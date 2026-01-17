import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, PersonalityResult, Language } from './types';
import AnalysisAnimation from './components/AnalysisAnimation';
import ResultCard from './components/ResultCard';
import { GoogleGenAI, Type } from '@google/genai';

const STORAGE_KEY = 'sachi_baat_personality_v18'; 

export const LogoIcon = ({ className = "w-16 h-16 md:w-24 md:h-24 mb-4 md:mb-6" }) => (
  <div className={`${className} relative`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M50 5L12 26v48l38 21 38-21V26L50 5z" stroke="url(#logo-grad)" strokeWidth="2" fill="rgba(147, 51, 234, 0.1)"/>
      <circle cx="50" cy="50" r="18" stroke="url(#logo-grad)" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]"/>
      <circle cx="50" cy="50" r="8" fill="url(#logo-grad)" />
    </svg>
    <div className="absolute inset-0 bg-purple-500/20 blur-3xl -z-10 animate-pulse"></div>
  </div>
);

export default function App() {
  const [state, setState] = useState<AppState>(AppState.INITIAL);
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [lang, setLang] = useState<Language>('hi');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const apiDataRef = useRef<PersonalityResult | null>(null);
  const animationFinishedRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ![AppState.ABOUT, AppState.PRIVACY].includes(state)) {
      try {
        const parsed = JSON.parse(saved);
        setResult(parsed);
        setState(AppState.RESULT);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    window.scrollTo(0, 0);
  }, [state]);

  const handleStart = () => {
    setResult(null);
    setErrorMessage(null);
    apiDataRef.current = null;
    animationFinishedRef.current = false;
    setState(AppState.ANALYZING);
  };

  const tryTransitionToResult = useCallback(() => {
    if (apiDataRef.current && animationFinishedRef.current) {
      setResult(apiDataRef.current);
      setState(AppState.RESULT);
    }
  }, []);

  const performAnalysis = async (base64: string) => {
    try {
      // ✅ FIXED LINE (Vite safe)
      const apiKey = import.meta.env.VITE_API_KEY?.trim().replace(/^["']|["']$/g, '');

      if (!apiKey || apiKey.length < 10) {
        throw new Error('VITE_API_KEY is missing or invalid in .env file.');
      }

      const ai = new GoogleGenAI({ apiKey });

      const instructions = lang === 'hi'
        ? `You are the 'Sachi Baat' Personality Engine. Analyze facial features for true character traits. Be extremely honest, bold, and edgy. ALL TEXT OUTPUT MUST BE IN ROMAN URDU (Urdu in English script). Return JSON: title, description (1-line), reportDescription (3 sentences), darkLine (Roman Urdu Sher), traits (5 strings), weaknesses (4 strings).`
        : `Analyze facial features for personality traits. Be unfiltered and bold. Return JSON: title, description (1-line), reportDescription (3 sentences), darkLine (Philosophical quote), traits (5 strings), weaknesses (4 strings).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: 'image/jpeg' } },
            { text: "Perform deep biometric analysis on this face and reveal their true personality. Be brutally honest." }
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

      const textOutput = response.text;
      if (!textOutput) throw new Error("AI returned no content.");

      const data = JSON.parse(textOutput);

      const finalResult: PersonalityResult = {
        id: `TRUTH-${Math.floor(Math.random() * 90000) + 10000}`,
        ...data,
        color: "#9333ea",
        shareHook: lang === 'hi' ? "Mera asli sach dekho!" : "See my unfiltered truth!"
      };

      apiDataRef.current = finalResult;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalResult));
      tryTransitionToResult();
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setErrorMessage(err.message || 'Something went wrong');
      setState(AppState.ERROR);
    }
  };

  const handleCapture = (base64: string) => performAnalysis(base64);
  const handleAnimationComplete = useCallback(() => {
    animationFinishedRef.current = true;
    tryTransitionToResult();
  }, [tryTransitionToResult]);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setResult(null);
    setErrorMessage(null);
    setState(AppState.INITIAL);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#05070a] text-white overflow-x-hidden font-inter">
      {/* UI unchanged */}
    </div>
  );
}
