import React, { useEffect, useState } from 'react';
import { Terminal, ShieldAlert, Zap, Skull, ChevronRight } from 'lucide-react';

/**
 * HackerIntroLoader - Clean, high-impact cyber intro loader.
 * Simulates connecting to the target n8n workflow and preparing the hacking arsenal.
 * Runs once on entry (3.2 seconds) or skips immediately on tap.
 */
export default function HackerIntroLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const LOGS = [
    { text: 'Initialisation de la console d\'assaut...', status: 'OK' },
    { text: 'Cible verrouillée : mustrain.app.n8n.cloud', status: 'OK' },
    { text: 'Détection des 4 barrières de sécurité...', status: 'ARMÉ' },
    { text: 'Chargement des 7 missions d\'attaque...', status: 'PRÊT' },
  ];

  useEffect(() => {
    // Progress increment timer
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          finish();
          return 100;
        }
        return prev + 2.5;
      });
    }, 75);

    // Terminal log line timers
    const t1 = setTimeout(() => setLogIndex(1), 700);
    const t2 = setTimeout(() => setLogIndex(2), 1500);
    const t3 = setTimeout(() => setLogIndex(3), 2300);
    const t4 = setTimeout(() => finish(), 3200);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        finish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const finish = () => {
    onComplete();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#070B14] text-white transition-all duration-500 ${
        isFading ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Cyber Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(43, 75, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(43, 75, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Radial Blue Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[90px] pointer-events-none" />

      {/* Skip Button */}
      <button
        onClick={finish}
        className="absolute top-5 right-5 z-20 flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-mono font-bold text-slate-400 hover:text-white hover:border-slate-700 transition-colors backdrop-blur"
      >
        <span>Passer</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      {/* Main Terminal Loader Card */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-[11px] text-slate-400 font-bold tracking-wider">
              TERMINAL // D'INFILTRATION N8N
            </span>
          </div>
          <span className="font-mono text-xs text-blue-400 font-bold">
            {Math.min(100, Math.round(progress))}%
          </span>
        </div>

        {/* Center Punchline */}
        <div className="text-center my-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.25)] mb-3">
            <ShieldAlert className="h-7 w-7 text-blue-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Cassez mon workflow
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
            Infiltrez le serveur de production et testez les 4 barrières de défense.
          </p>
        </div>

        {/* Terminal Log Lines */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3.5 font-mono text-xs text-slate-300 space-y-2 mb-6">
          {LOGS.slice(0, logIndex + 1).map((log, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-cyan-400 font-bold">&gt;</span>
                <span className="truncate">{log.text}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                [{log.status}]
              </span>
            </div>
          ))}
        </div>

        {/* Cyber Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 transition-all duration-100 ease-out"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>PORTAIL D'ATTAQUE V2.0</span>
            <span className="text-slate-400">CONNEXION IMMINENTE...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
