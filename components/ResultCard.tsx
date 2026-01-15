
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PersonalityResult, Language } from '../types';
import AdUnit from './AdUnit';

interface ResultCardProps {
  result: PersonalityResult;
  onShare: (platform: string) => void;
  lang: Language;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onShare, lang }) => {
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); 
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const serialNumber = useMemo(() => result.id || `SB-${Math.floor(Math.random() * 90000) + 10000}`, [result.id]);

  const ui = {
    asliResult: lang === 'hi' ? 'AAPKI MUKAMMAL REPORT' : 'YOUR UNFILTERED TRUTH',
    placeholder: lang === 'hi' ? 'Apna naam likhein...' : 'NAME FOR REPORT...',
    dlBtn: isGenerating ? '...' : (lang === 'hi' ? 'REPORT DOWNLOAD KAREIN' : 'DOWNLOAD OFFICIAL REPORT'),
    shareWa: lang === 'hi' ? 'WhatsApp' : 'WhatsApp',
    copyBtn: copied ? (lang === 'hi' ? 'COPIED' : 'COPIED') : (lang === 'hi' ? 'LINK COPY KAREIN' : 'COPY LINK'),
    footerOwner: 'Developed & Owned by Subhan Ahmad',
    footerLab: 'Sachi Baat Laboratory © 2025',
    interTitle: lang === 'hi' ? 'Aapki report taiyaar ho rahi hai' : 'Generating Formal Report'
  };

  const copyToClipboard = () => {
    const text = lang === 'hi' 
      ? `🔥 Mera result: ${result.title}! \nCheck karein: ${window.location.href}`
      : `🔥 My 'The Truth' Result: ${result.title}! \nCheck it out: ${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    let timer: number;
    if (showInterstitial && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (showInterstitial && timeLeft === 0) {
      executeDownload();
      setShowInterstitial(false);
    }
    return () => clearInterval(timer);
  }, [showInterstitial, timeLeft]);

  const handleDownloadClick = () => {
    const trimmedName = userName.trim();
    if (!trimmedName) {
      alert(lang === 'hi' ? "Pehle apna naam toh likhein!" : "Please enter your name.");
      return;
    }

    const normalized = trimmedName.toLowerCase().replace(/\s+/g, '');
    if (normalized.includes('subhan')) {
      alert(lang === 'hi' ? "Bhai, Subhan Ahmad wala naam sirf owner use kar sakta hai! Kuch aur likho." : "Sorry, the name 'Subhan' is reserved for the owner only.");
      return;
    }

    setTimeLeft(10);
    setShowInterstitial(true);
  };

  const executeDownload = () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    canvas.width = 2400;
    canvas.height = 1680; 
    const centerX = canvas.width / 2;
    const gold = '#c5a059';
    const darkGrey = '#374151';

    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = Math.PI / 2 * 3;
      let x_pos = x;
      let y_pos = y;
      let step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(x, y - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x_pos = x + Math.cos(rot) * outerRadius;
        y_pos = y + Math.sin(rot) * outerRadius;
        ctx.lineTo(x_pos, y_pos);
        rot += step;
        x_pos = x + Math.cos(rot) * innerRadius;
        y_pos = y + Math.sin(rot) * innerRadius;
        ctx.lineTo(x_pos, y_pos);
        rot += step;
      }
      ctx.lineTo(x, y - outerRadius);
      ctx.closePath();
      ctx.fill();
    };

    ctx.fillStyle = '#f9f7f2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawOrnamentalBorders = () => {
      ctx.save();
      ctx.strokeStyle = gold;
      ctx.fillStyle = gold;
      const motif = "✧ ꕤ ✧";
      ctx.font = 'bold 35px serif';
      ctx.textAlign = 'center';
      for (let x = 300; x < canvas.width - 300; x += 150) {
        ctx.fillText(motif, x, 140);
        ctx.fillText(motif, x, canvas.height - 130);
      }
      const drawCorner = (x: number, y: number, r: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(r);
        ctx.font = '160px serif';
        ctx.fillText('❧', 0, 0);
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(20, -50); ctx.lineTo(150, -50); ctx.moveTo(20, -50); ctx.lineTo(20, -180); ctx.stroke();
        ctx.restore();
      };
      drawCorner(150, 220, 0); drawCorner(canvas.width - 150, 220, Math.PI / 2); drawCorner(150, canvas.height - 220, -Math.PI / 2); drawCorner(canvas.width - 150, canvas.height - 220, Math.PI); 
      ctx.restore();
    };
    drawOrnamentalBorders();

    ctx.save();
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - 120, 170, 240, 50);
    ctx.fillStyle = darkGrey;
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`SL#${serialNumber}`, centerX, 203);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = gold;
    ctx.textAlign = 'center';
    ctx.font = 'bold 140px serif'; 
    ctx.fillText('OFFICIAL REPORT CARD', centerX, 380);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = darkGrey;
    ctx.textAlign = 'center';
    ctx.font = 'bold 30px Inter';
    ctx.letterSpacing = '8px';
    ctx.fillText(lang === 'hi' ? 'ASLI BIOMETRIC VIBE CHECK:' : 'BIOMETRIC SUBJECT PROFILE:', centerX, 480);
    ctx.font = '900 160px serif';
    ctx.fillText(userName.toUpperCase(), centerX, 680);
    ctx.restore();

    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(centerX - 650, 750); ctx.lineTo(centerX + 650, 750); ctx.stroke();

    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, fontSize: number) => {
      const words = text.split(' ');
      let line = '';
      ctx.fillStyle = '#4b5563';
      ctx.font = `italic ${fontSize}px serif`;
      ctx.textAlign = 'center';
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
    };
    wrapText(result.reportDescription || result.description, centerX, 840, 1400, 60, 36);

    const footerY = canvas.height - 350;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = darkGrey;
    ctx.font = 'bold 32px serif';
    ctx.fillText(dateStr, 500, footerY);
    ctx.strokeStyle = '#d1d5db';
    ctx.beginPath(); ctx.moveTo(350, footerY + 20); ctx.lineTo(650, footerY + 20); ctx.stroke();
    ctx.font = 'bold 24px Inter';
    ctx.fillText(lang === 'hi' ? 'Report Date:' : 'Issue Date:', 500, footerY + 65);
    ctx.restore();

    const drawSeal = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      const points = 40;
      for (let i = 0; i <= points * 2; i++) {
        const rad = i % 2 === 0 ? 110 : 90;
        const angle = (i * Math.PI) / points;
        ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
      }
      ctx.fillStyle = gold; ctx.fill();
      ctx.strokeStyle = '#a67c00'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'white'; ctx.font = 'bold 16px Inter'; ctx.textAlign = 'center';
      ctx.fillText('CERTIFIED', 0, -10);
      ctx.font = 'bold 18px serif'; ctx.fillText('REPORT', 0, 15);
      ctx.restore();
    };
    drawSeal(centerX, footerY + 20);

    const drawRedStamp = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.05); 
      const stampRed = 'rgba(239, 68, 68, 0.9)';
      ctx.strokeStyle = stampRed;
      ctx.fillStyle = stampRed;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, 160, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 125, 0, Math.PI * 2); ctx.stroke();
      const starCount = 36;
      for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2;
        const starX = Math.cos(angle) * 142;
        const starY = Math.sin(angle) * 142;
        drawStar(ctx, starX, starY, 5, 10, 5);
      }
      ctx.save();
      ctx.font = 'bold 38px serif';
      ctx.textAlign = 'center';
      const text = "CERTIFICATE";
      const startAngle = -Math.PI / 1.5;
      const endAngle = -Math.PI / 3;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const angle = startAngle + (i / (text.length - 1)) * (endAngle - startAngle);
        ctx.save();
        ctx.rotate(angle + Math.PI / 2);
        ctx.translate(0, -95);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }
      ctx.restore();
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px Inter';
      ctx.fillText('Approved by', 0, -15);
      ctx.font = '900 32px Inter';
      ctx.fillText('Tum Kis Type Ke', 0, 25);
      ctx.fillText('Insaan Ho', 0, 60);
      ctx.restore();
    };
    drawRedStamp(canvas.width - 500, footerY - 20);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = darkGrey;
    ctx.font = 'bold 28px Inter';
    ctx.fillText('Subhan Ahmad', canvas.width - 500, footerY + 65);
    ctx.restore();

    const link = document.createElement('a');
    link.download = `SachiBaat_Report_${userName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    setIsGenerating(false);
  };

  return (
    <div className="w-full space-y-12 animate-slide-up pb-20 overflow-x-hidden">
      {showInterstitial && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center p-4 md:p-8 text-center animate-slow-fade">
          <div className="max-w-md w-full space-y-12">
            <div className="w-16 h-16 md:w-20 md:h-20 border-[3px] border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-lg md:text-2xl tracking-[0.5em] uppercase text-white/50 font-light px-2">{ui.interTitle}</h2>
            <AdUnit position="INTERSTITIAL" />
            <div className="text-4xl md:text-6xl font-serif text-purple-500 italic animate-pulse">{timeLeft}s</div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-[2rem] md:rounded-[3rem] overflow-hidden p-6 md:p-24 space-y-12 text-center shadow-2xl mx-auto w-full max-w-7xl">
        <div className="space-y-6">
          <p className="text-purple-400 text-[9px] md:text-[11px] font-bold uppercase tracking-[1em]">{ui.asliResult}</p>
          <h1 className="text-5xl md:text-9xl font-bebas tracking-tighter text-white drop-shadow-lg break-words">{result.title}</h1>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <p className="text-white/50 text-base md:text-2xl leading-relaxed italic border-l-4 border-purple-600/40 pl-4 md:pl-8 text-left font-light whitespace-pre-line">
            "{result.description}"
          </p>
        </div>

        {/* MIDDLE AD UNIT inside the Result Card */}
        <AdUnit position="MIDDLE" />

        <div className="max-w-md mx-auto space-y-8 pt-10">
          <div className="space-y-4">
             <input 
              type="text" 
              placeholder={ui.placeholder} 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl md:rounded-2xl px-6 md:px-8 py-4 md:py-5 text-white text-center font-medium tracking-[0.1em] focus:border-purple-500 outline-none transition-all placeholder:text-white/20 text-sm md:text-base"
            />
            <button 
              onClick={handleDownloadClick}
              disabled={isGenerating}
              className="w-full py-5 md:py-6 bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] rounded-xl md:rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xs md:text-sm"
            >
              {ui.dlBtn}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button onClick={() => onShare('whatsapp')} className="flex-1 bg-white/[0.05] border border-white/5 py-4 rounded-xl md:rounded-2xl text-[10px] font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase hover:bg-white/10 transition-all">{ui.shareWa}</button>
            <button onClick={copyToClipboard} className="flex-1 bg-white/[0.05] border border-white/5 py-4 rounded-xl md:rounded-2xl text-[10px] font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase hover:bg-white/10 transition-all">{ui.copyBtn}</button>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="text-center space-y-2 px-4">
        <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-[0.2em] md:tracking-[0.4em] font-bold">
          {ui.footerOwner}
        </p>
        <p className="text-[8px] md:text-[10px] text-white/10 uppercase tracking-[0.4em] md:tracking-[0.8em] font-medium">{ui.footerLab}</p>
      </div>
    </div>
  );
};

export default ResultCard;
