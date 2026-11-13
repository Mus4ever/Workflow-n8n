import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Terminal, Cpu, Zap, ArrowRight, SkipForward, Radio } from 'lucide-react';
import ShinyText from './reactbits/ShinyText';
import DecryptedText from './reactbits/DecryptedText';

export default function IntroSplash({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { text: "CONNEXION SÉCURISÉE AU CLOUD n8n...", icon: <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> },
    { text: "VÉRIFICATION DU GATEWAY HMAC-SHA256...", icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { text: "INITIALISATION DU MOTEUR IA & FALLBACK...", icon: <Cpu className="w-4 h-4 text-amber-400" /> },
    { text: "CALIBRATION DU PROTOCOLE ZERO-TRUST...", icon: <Terminal className="w-4 h-4 text-rose-400" /> },
    { text: "ACCÈS AUTORISÉ : L'ARÈNE EST PRÊTE.", icon: <Zap className="w-4 h-4 text-red-500 animate-bounce" /> }
  ];

  // 6.5s total progress animation (0 to 100%)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 6000; // 6.0 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 25) setCurrentStep(0);
      else if (pct < 50) setCurrentStep(1);
      else if (pct < 75) setCurrentStep(2);
      else if (pct < 95) setCurrentStep(3);
      else setCurrentStep(4);

      if (elapsed >= duration) {
        clearInterval(timer);
        // Small delay at 100% to savor the completed state
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-zinc-950 text-white font-sans overflow-hidden select-none"
    >
      {/* Background ambient radial glow & grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-2">
            <span>Algeria 2.0</span>
            <span className="text-zinc-600">/</span>
            <span className="text-red-400">Production Lab</span>
          </span>
        </div>

        {/* Skip button */}
        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition text-xs font-mono backdrop-blur-md cursor-pointer"
        >
          <span>Passer</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Cinematic Block */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-8 my-auto">
        
        {/* Animated Central Emblem */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          {/* Outer rotating dashed ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-red-500/30 animate-[spin_10s_linear_infinite]" />
          {/* Middle pulsing ring */}
          <div className="absolute inset-2 rounded-full border border-red-500/20 animate-ping opacity-25" />
          {/* Glowing core badge */}
          <div className="relative w-20 h-20 rounded-2xl bg-zinc-900 border border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.25)] flex flex-col items-center justify-center gap-1">
            <ShieldCheck className="w-8 h-8 text-red-400 animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">
              36 Nœuds
            </span>
          </div>
        </div>

        {/* Title Reveal */}
        <div className="space-y-3">
          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
            Atelier Technique n8n & IA
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            « Essayez de casser <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">
              mon workflow. »
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
            Votre téléphone vient de se synchroniser avec l'arène de test d'Algeria 2.0.
          </p>
        </div>

        {/* Loading Progress & Terminal Sequence */}
        <div className="space-y-4 max-w-md mx-auto pt-2">
          
          {/* Modern Progress Bar */}
          <div className="relative w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          {/* Progress Percent & Step Status */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <div className="flex items-center gap-2 truncate">
              {steps[currentStep].icon}
              <span className="truncate text-zinc-300">
                {steps[currentStep].text}
              </span>
            </div>
            <span className="font-bold text-white ml-2 text-sm">
              {progress}%
            </span>
          </div>

        </div>

        {/* Direct Entry Button (appears or pulses when near 100%) */}
        {progress >= 85 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-[0_0_25px_rgba(239,68,68,0.4)] cursor-pointer transform hover:scale-105 active:scale-95"
            >
              <span>Entrer dans l'Arène</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-zinc-500 border-t border-zinc-900 pt-4">
        <span>SESSION EN DIRECT · SALLE ALGERIA 2.0</span>
        <span className="text-zinc-600">ZERO-TRUST · ASYNC 202 · RESILIENCE</span>
      </div>

    </motion.div>
  );
}

