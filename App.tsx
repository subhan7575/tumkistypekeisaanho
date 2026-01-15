
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, PersonalityResult, Language } from './types';
import AnalysisAnimation from './components/AnalysisAnimation';
import ResultCard from './components/ResultCard';
import AdUnit from './components/AdUnit';
import { GoogleGenAI, Type } from "@google/genai";

const STORAGE_KEY = 'sachi_baat_personality_v16'; 

export const LogoIcon = ({ className = "w-24 h-24 mb-6", showGlow = true }) => (
  <div className={`${className} relative animate-slow-fade`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M50 5L12 26v48l38 21 38-21V26L50 5z" stroke="url(#logo-grad)" strokeWidth="2" fill="rgba(147, 51, 234, 0.1)"/>
      <circle cx="50" cy="50" r="18" stroke="url(#logo-grad)" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]"/>
      <circle cx="50" cy="50" r="8" fill="url(#logo-grad)" />
      <path d="M35 50h6M59 50h6M50 35v6M50 59v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    {showGlow && <div className="absolute inset-0 bg-purple-500/20 blur-3xl -z-10 animate-pulse"></div>}
  </div>
);

export default function App() {
  const [state, setState] = useState<AppState>(AppState.INITIAL);
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [lang, setLang] = useState<Language>('hi');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Refs to track async sync
  const apiDataRef = useRef<PersonalityResult | null>(null);
  const animationFinishedRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setResult(JSON.parse(saved));
        setState(AppState.RESULT);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleStart = () => {
    setResult(null);
    setErrorMessage(null);
    apiDataRef.current = null;
    animationFinishedRef.current = false;
    setState(AppState.ANALYZING);
  };

  const tryTransitionToResult = () => {
    if (apiDataRef.current && animationFinishedRef.current) {
      setResult(apiDataRef.current);
      setState(AppState.RESULT);
    }
  };

  const performAnalysis = async (base64: string) => {
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === 'undefined') {
      console.error("Critical: API_KEY is missing in process.env");
      setErrorMessage(lang === 'hi' ? "System Error: API Key nahi mil rahi. Vercel Dashboard mein 'API_KEY' add karein." : "System Error: API Key not found. Please add it to Vercel environment variables.");
      setState(AppState.ERROR);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const instructions = lang === 'hi' 
      ? `You are the 'Sachi Baat' Personality Engine. 
         Analyze the face in the image with extreme detail.
         STRICT RULE: Do not be overly nice. Be raw, honest, and slightly witty.
         
         OUTPUT MUST BE VALID JSON:
         - title: Catchy Roman Urdu title (e.g. 'Azeem Lead' or 'Masoom Shaitan').
         - description: Paragraph in Roman Urdu addressing the user as 'Aap'.
         - reportDescription: Formal 3rd person personality summary.
         - darkLine: One raw viral signature line.
         - traits: Array of 3 key strengths.
         - weaknesses: Array of 2 actual human flaws.`
      : `Analyze the face deeply and be honest. Provide JSON with title, description, reportDescription, darkLine, traits, and weaknesses.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: 'image/jpeg' } },
            { text: "Analyze this person's face and provide a raw, honest personality profile." }
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

      const data = JSON.parse(response.text || "{}");
      const finalResult: PersonalityResult = {
        id: `TRUTH-${Math.floor(Math.random() * 90000) + 10000}`,
        ...data,
        color: "#9333ea",
        shareHook: "Mera asli aur kadwa sach dekho!"
      };

      apiDataRef.current = finalResult;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalResult));
      tryTransitionToResult();
    } catch (err: any) {
      console.error("AI Analysis Failed:", err);
      setErrorMessage(err.message || "Neural link interrupted. Please try again.");
      setState(AppState.ERROR);
    }
  };

  const handleCapture = (base64: string) => {
    performAnalysis(base64);
  };

  const handleAnimationComplete = useCallback(() => {
    animationFinishedRef.current = true;
    tryTransitionToResult();
  }, []);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setResult(null);
    setErrorMessage(null);
    apiDataRef.current = null;
    animationFinishedRef.current = false;
    setState(AppState.INITIAL);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center z-10 bg-neural-gradient selection:bg-purple-600 selection:text-white">
      <AdUnit position="SIDE_LEFT" />
      <AdUnit position="SIDE_RIGHT" />

      <nav className="w-full flex justify-between items-center px-8 py-6 max-w-7xl animate-slow-fade">
        <div className="flex items-center gap-3">
           <LogoIcon className="w-8 h-8" showGlow={false} />
           <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Truth Lab v3.1</span>
        </div>
        <div className="flex bg-white/5 rounded-xl border border-white/5 p-1 backdrop-blur-md">
          <button onClick={() => setLang('hi')} className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest transition-all ${lang === 'hi' ? 'bg-purple-600 text-white' : 'text-white/30 hover:text-white'}`}>URDU</button>
          <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest transition-all ${lang === 'en' ? 'bg-purple-600 text-white' : 'text-white/30 hover:text-white'}`}>ENGLISH</button>
        </div>
      </nav>

      <AdUnit position="HEADER" />

      <main className="flex-1 w-full flex flex-col items-center justify-center py-6 px-6">
        {state === AppState.INITIAL && (
          <div className="flex flex-col items-center text-center space-y-8 animate-slide-up max-w-4xl">
            <LogoIcon />
            <div className="space-y-4">
              <h1 className="text-6xl md:text-9xl font-bebas tracking-tighter text-white uppercase leading-none">
                {lang === 'hi' ? 'SACHI' : 'PURE'} <span className="text-purple-500">{lang === 'hi' ? 'BAAT' : 'TRUTH'}</span>
              </h1>
              <p className="text-white/50 text-xs md:text-lg font-light tracking-[0.5em] uppercase px-4">Direct Biometric Disclosure — No Filter</p>
            </div>
            <button onClick={handleStart} className="px-14 py-6 bg-white text-black font-bold tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl border border-white/10">
              {lang === 'hi' ? 'KADWA SACH JAANEIN' : 'REVEAL PURE TRUTH'}
            </button>
          </div>
        )}

        {state === AppState.ANALYZING && (
          <div className="w-full flex flex-col items-center gap-6">
            <AnalysisAnimation onCapture={handleCapture} onComplete={handleAnimationComplete} lang={lang} />
            {animationFinishedRef.current && !apiDataRef.current && (
              <div className="text-purple-400 font-bold animate-pulse text-xs tracking-widest uppercase">
                {lang === 'hi' ? 'Server Response Ka Intezar...' : 'Awaiting Final Neural Signature...'}
              </div>
            )}
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="flex flex-col items-center text-center space-y-6 animate-slide-up bg-red-500/10 p-10 rounded-3xl border border-red-500/20 max-w-md">
            <div className="text-red-500 text-5xl font-bold">!</div>
            <h2 className="text-2xl font-bebas text-white tracking-widest uppercase">Analysis Failed</h2>
            <p className="text-white/60 text-sm leading-relaxed">{errorMessage}</p>
            <div className="pt-4 flex flex-col gap-2 w-full">
               <button onClick={handleReset} className="w-full py-4 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest">Retry Process</button>
               <p className="text-[9px] text-white/20 uppercase">Check if camera and internet are working</p>
            </div>
          </div>
        )}

        {state === AppState.RESULT && result && (
          <div className="w-full max-w-5xl animate-slide-up">
            <ResultCard result={result} onShare={() => {}} lang={lang} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="w-full py-12 flex flex-col items-center gap-2 border-t border-white/5 bg-black/20 backdrop-blur-xl">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold">Proprietary Algorithm by Subhan Ahmad</p>
        <p className="text-[8px] text-white/10 uppercase tracking-[0.6em]">Biometric Processing © 2025</p>
      </footer>
    </div>
  );
}
