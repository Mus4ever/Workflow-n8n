import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Unlock, Cpu, Zap, Radio, ArrowRight, CheckCircle2 } from 'lucide-react';
import DecryptedText from './reactbits/DecryptedText';
import ShinyButton from './reactbits/ShinyButton';

/**
 * OpenDoorIntro - 5-10 second cinematic "Open Door" entrance experience.
 * Simulates passing through the high-security n8n workflow gate before entering the arena.
 */
export default function OpenDoorIntro({ onComplete }) {
  const TOTAL_SECONDS = 8;
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [step, setStep] = useState(1); // 1: Scan, 2: Verification, 3: Open Door
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerOpen();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Sequence stages
    const t1 = setTimeout(() => setStep(2), 2200);
    const t2 = setTimeout(() => setStep(3), 5200);
    const t3 = setTimeout(() => triggerOpen(), 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const triggerOpen = () => {
    setIsOpening(true);
    setTimeout(() => {
      onComplete();
    }, 900);
  };

  const progressPct = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0A0F1D] text-white transition-opacity duration-700 ${
        isOpening ? 'pointer-events-none opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* High-tech background grid & particle effects */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(43, 75, 255, 0.35) 0%, transparent 70%),
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
        }}
      />

      {/* Cyber energy circles in center */}
      <div className="pointer-events-none absolute flex items-center justify-center overflow-hidden">
        <div className="h-[360px] w-[360px] sm:h-[500px] sm:w-[500px] rounded-full border border-blue/20 animate-ping opacity-20" />
        <div className="absolute h-[280px] w-[280px] sm:h-[380px] sm:w-[380px] rounded-full border border-cyan-400/25 animate-pulse" />
        <div className="absolute h-[200px] w-[200px] sm:h-[260px] sm:w-[260px] rounded-full border border-blue/40" />
      </div>

      {/* Main Content Modal */}
      <div className="relative z-20 mx-3 sm:mx-4 max-w-lg w-full text-center max-h-[95dvh] overflow-y-auto py-4">
        {/* Top Live Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-blue/30 bg-blue/10 px-3 py-1 text-[11px] sm:text-xs font-mono tracking-wider text-cyan-300 backdrop-blur-md">
          <Radio className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse text-cyan-400" />
          <span>PORTAIL SÉCURISÉ • ALGERIA 2.0</span>
        </div>

        {/* Lock / Unlock Icon Visual */}
        <div className="mt-4 sm:mt-6 flex justify-center">
          <div
            className={`relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 transition-all duration-700 ${
              step === 3
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.45)]'
                : 'border-blue/50 bg-blue/15 text-blue shadow-[0_0_30px_rgba(43,75,255,0.35)]'
            }`}
          >
            {step === 3 ? (
              <Unlock className="h-8 w-8 sm:h-10 sm:w-10 animate-bounce" />
            ) : (
              <Lock className="h-8 w-8 sm:h-10 sm:w-10" />
            )}
            <div className="absolute -inset-1 rounded-2xl border border-white/20 animate-pulse" />
          </div>
        </div>

        {/* Main Title with Scrambler */}
        <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight">
          <DecryptedText
            text="SAS D'ACCÈS DU WORKFLOW"
            speed={25}
            maxIterations={12}
            className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-display"
          />
        </h1>

        <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-md mx-auto px-2">
          Initialisation de la passerelle n8n en production. Vérification des 4 barrières de défense en direct.
        </p>

        {/* Security Gates Checklist */}
        <div className="mt-5 space-y-2 text-left rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-[11px] sm:text-xs gap-2">
            <span className="flex items-center gap-1.5 sm:gap-2 font-medium text-slate-300 truncate">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
              <span className="truncate">1. Signature HMAC SHA-256 (Secret validé)</span>
            </span>
            <span className="font-mono text-emerald-400 shrink-0">ACTIF</span>
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs gap-2">
            <span className="flex items-center gap-1.5 sm:gap-2 font-medium text-slate-300 truncate">
              <Cpu className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400 shrink-0" />
              <span className="truncate">2. Schéma & Données validées</span>
            </span>
            <span className={`font-mono shrink-0 ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {step >= 2 ? 'VÉRIFIÉ' : 'CONTRÔLE...'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs gap-2">
            <span className="flex items-center gap-1.5 sm:gap-2 font-medium text-slate-300 truncate">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
              <span className="truncate">3. Filtre Anti-Doublon & Anti-Spam</span>
            </span>
            <span className={`font-mono shrink-0 ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {step >= 2 ? 'ARMÉ' : 'ATTENTE'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs gap-2">
            <span className="flex items-center gap-1.5 sm:gap-2 font-medium text-slate-300 truncate">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400 shrink-0" />
              <span className="truncate">4. Passerelle Slack Human-in-the-Loop</span>
            </span>
            <span className={`font-mono shrink-0 ${step === 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {step === 3 ? 'CONNECTÉ' : 'SYNCHRO...'}
            </span>
          </div>
        </div>

        {/* Countdown & Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Ouverture automatique dans</span>
            <span className="font-bold text-cyan-300">{secondsLeft} seconde{secondsLeft > 1 ? 's' : ''}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue via-cyan-400 to-emerald-400 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* CTA Button to skip/open immediately */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <ShinyButton
            onClick={triggerOpen}
            className="w-full sm:w-auto text-sm py-2.5 px-6"
            variant="primary"
          >
            <span>Franchir la porte maintenant</span>
            <ArrowRight className="h-4 w-4" />
          </ShinyButton>
        </div>
      </div>
    </div>
  );
}

