
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, PersonalityResult, Language } from './types';
import { PERSONALITIES } from './constants';
import AnalysisAnimation from './components/AnalysisAnimation';
import ResultCard from './components/ResultCard';
import AdUnit from './components/AdUnit';
import { GoogleGenAI, Type } from "@google/genai";

const STORAGE_KEY = 'user_sachi_baat_original_v12'; 

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
    {showGlow && <div className="absolute inset-0 bg-purple-500/20 blur-3xl -z-10"></div>}
  </div>
);

export default function App() {
  const [state, setState] = useState<AppState>(AppState.INITIAL);
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [lang, setLang] = useState<Language>('hi');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleStart = () => {
    setState(AppState.ANALYZING);
  };

  const performAnalysis = async (base64: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const instructions = lang === 'hi' 
      ? `You are 'Tum Kis Type Ke Insaan Ho' system. Analyze the face and provide:
         1. "title": A catchy Roman Urdu title (e.g., "Anmol Heera", "Shant Magar Khatarnak", "Aala Zehen").
         2. "description": A LONG and detailed truth in casual Roman Urdu/Urdu-English mix (Latin script). Make it at least 4-5 sentences long. Talk about their nature, how they treat others, and their hidden vibe. Use "Bhai/Dost" and daily chat words.
         3. "reportDescription": A simple but slightly detailed summary in Roman Urdu.
         STRICT RULE: Avoid "pure" bookish Hindi/Urdu. Use daily spoken Roman Urdu. Use words like 'Vibe', 'Mindset', 'Nature', 'Asliyat'.
         Be funny, unfiltered, and detailed. Do not mention being an AI. Max 150 words total.`
      : `You are 'The Truth Analyst'. Provide:
         1. "title": A catchy title in English.
         2. "description": A detailed analysis to the user in English.
         3. "reportDescription": A simple, direct summary in English.
         Do not mention being an AI or Gemini. Max 100 words per field.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: 'image/jpeg' } },
            { text: lang === 'hi' ? "Meri asliyat batayein, thora detail mein Roman Urdu mein." : "Reveal my truth in detail." }
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
              reportDescription: { type: Type.STRING }
            },
            required: ["title", "description", "reportDescription"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      const finalResult: PersonalityResult = {
        id: `SB-${Math.floor(Math.random() * 90000) + 10000}`,
        title: data.title || (lang === 'hi' ? "Anmol Shaks" : "The Hidden Persona"),
        description: data.description || (lang === 'hi' ? "Aapka nature bohot hatke hai, sabse alag vibe hai aapki. Aap logon ki madad karte hain magar apne raaz kisi ko nahi batate." : "Analysis reveals a character that defies common definitions."),
        reportDescription: data.reportDescription || (lang === 'hi' ? "Scan se pata chala ke aapka dimaag bohot tez chalta hai aur aapki vibe ekdam asli hai." : "The subject displays a unique biometric signature indicating a complex character profile."),
        darkLine: "",
        color: "#9333ea",
        shareHook: lang === 'hi' ? "Mera result bohot zabardast aaya hai!" : "My 'The Truth' result is shocking!"
      };

      setResult(finalResult);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalResult));
    } catch (err) {
      setResult({ ...PERSONALITIES[0], reportDescription: lang === 'hi' ? "Analysis fail ho gaya, magar aapki vibe mashallah mast hai!" : PERSONALITIES[0].description });
    }
  };

  const handleCapture = (base64: string) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      performAnalysis(base64);
    }
  };

  const handleAnalysisComplete = useCallback(() => {
    setState(AppState.RESULT);
  }, []);

  const t = {
    navTitle: lang === 'hi' ? 'Neural Sach v11' : 'Neural Truth v11',
    heroTitle: lang === 'hi' ? 'SACHI' : 'THE',
    heroSub: lang === 'hi' ? 'BAAT' : 'TRUTH',
    tagline: lang === 'hi' ? 'Neural Mapping Se Asli Chehra Pehchaniye' : 'Uncovering Your True Vibe via Neural Biometrics',
    startBtn: lang === 'hi' ? 'SACH JAANEIN' : 'REVEAL THE TRUTH',
    unfiltered: lang === 'hi' ? '100% ASLI SYSTEM' : '100% UNFILTERED SYSTEM',
    owner: 'Developed & Owned by Subhan Ahmad',
    footerLab: 'Sachi Baat Laboratory © 2025',
    hiBtn: 'URDU',
    enBtn: 'ENGLISH'
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center z-10 selection:bg-purple-600 selection:text-white">
      {/* Side Ads */}
      <AdUnit position="SIDE_LEFT" />
      <AdUnit position="SIDE_RIGHT" />

      <nav className="w-full flex justify-between items-center px-8 py-6 max-w-7xl animate-slow-fade">
        <div className="flex items-center gap-3">
           <LogoIcon className="w-8 h-8" showGlow={false} />
           <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">
             {t.navTitle}
           </span>
        </div>
        <div className="flex bg-white/5 rounded-xl border border-white/5 p-1 backdrop-blur-xl">
          <button 
            onClick={() => setLang('hi')} 
            className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest transition-all ${lang === 'hi' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-white/30 hover:text-white'}`}
          >
            {t.hiBtn}
          </button>
          <button 
            onClick={() => setLang('en')} 
            className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest transition-all ${lang === 'en' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-white/30 hover:text-white'}`}
          >
            {t.enBtn}
          </button>
        </div>
      </nav>

      {/* Header Ad */}
      <AdUnit position="HEADER" />

      <main className="flex-1 w-full flex flex-col items-center justify-center py-6 px-6">
        {state === AppState.INITIAL && (
          <div className="flex flex-col items-center text-center space-y-8 animate-slide-up max-w-4xl">
            <LogoIcon />
            <div className="space-y-4">
              <h1 className="text-6xl md:text-9xl font-bebas tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 uppercase">
                {t.heroTitle} <span className="text-purple-500">{t.heroSub}</span>
              </h1>
              <p className="text-white/50 text-xs md:text-lg font-light tracking-[0.5em] uppercase">
                {t.tagline}
              </p>
            </div>
            
            <button 
              onClick={handleStart} 
              className="group relative px-14 py-5 bg-white text-black font-bold tracking-widest rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
            >
              <span className="relative z-10">{t.startBtn}</span>
            </button>
            
            <div className="pt-16 flex flex-col items-center gap-3 opacity-20">
               <div className="w-12 h-[1px] bg-white"></div>
               <span className="text-[9px] tracking-[0.8em] font-bold">
                 {t.unfiltered}
               </span>
            </div>
          </div>
        )}

        {state === AppState.ANALYZING && (
          <AnalysisAnimation 
            onCapture={handleCapture} 
            onComplete={handleAnalysisComplete} 
            lang={lang} 
          />
        )}

        {state === AppState.RESULT && result && (
          <div className="w-full max-w-5xl animate-slide-up">
            <ResultCard result={result} onShare={() => {}} lang={lang} />
          </div>
        )}
      </main>

      {/* Bottom Ad */}
      <AdUnit position="BOTTOM" />

      <footer className="w-full py-10 px-8 flex flex-col items-center gap-2 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-bold text-center">
          {t.owner}
        </p>
        <p className="text-[9px] text-white/20 uppercase tracking-[0.6em] font-bold">
          {t.footerLab}
        </p>
      </footer>
    </div>
  );
}
