
import React, { useState, useEffect, useRef } from 'react';
import { DRAMATIC_MESSAGES } from '../constants';
import { Language } from '../types';

interface AnalysisAnimationProps {
  onCapture: (base64Image: string) => void;
  onComplete: () => void;
  lang: Language;
}

const AnalysisAnimation: React.FC<AnalysisAnimationProps> = ({ onCapture, onComplete, lang }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState(false);
  const capturedRef = useRef(false);

  const messages = DRAMATIC_MESSAGES[lang];

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraError(true);
      }
    };

    startCamera();

    const duration = 10000; 
    const interval = 50;
    const step = 100 / (duration / interval);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 70 && !capturedRef.current && videoRef.current && canvasRef.current) {
          capturedRef.current = true;
          const canvas = canvasRef.current;
          const video = videoRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            onCapture(base64);
          }
        }
        return next >= 100 ? 100 : next;
      });
    }, interval);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1100);

    const completionTimer = setTimeout(() => {
      onComplete();
    }, duration + 500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
      clearTimeout(completionTimer);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [onCapture, onComplete, messages.length]);

  return (
    <div className="flex flex-col items-center justify-center space-y-10 w-full max-w-4xl px-6 animate-slide-up">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(147,51,234,0.1)]">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_20px_#9333ea]" style={{ top: `${progress}%`, transition: 'top 0.1s linear' }} />
          <div className="absolute inset-0 border-[20px] border-black/20"></div>
          <div className="absolute top-10 left-10 w-12 h-12 border-t-2 border-l-2 border-purple-500/50"></div>
          <div className="absolute top-10 right-10 w-12 h-12 border-t-2 border-r-2 border-purple-500/50"></div>
          <div className="absolute bottom-10 left-10 w-12 h-12 border-b-2 border-l-2 border-purple-500/50"></div>
          <div className="absolute bottom-10 right-10 w-12 h-12 border-b-2 border-r-2 border-purple-500/50"></div>
        </div>

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-40 p-10 text-center">
            <p className="text-red-400 font-bold tracking-widest uppercase text-sm">
              {lang === 'hi' ? 'कैमरा परमिशन जरूरी है' : 'Camera Access Required'}
            </p>
          </div>
        )}
      </div>
      
      <div className="text-center space-y-6">
        <h2 className="text-white font-bebas text-5xl md:text-8xl tracking-widest drop-shadow-2xl">
          {messages[messageIndex]}
        </h2>
        <div className="flex flex-col items-center gap-3">
           <div className="w-64 h-[2px] bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
           </div>
           <span className="text-[10px] text-white/40 font-mono tracking-[0.5em] uppercase">
             {lang === 'hi' ? 'न्यूरल स्कैन' : 'Neural Scan'}: {Math.floor(progress)}%
           </span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisAnimation;
