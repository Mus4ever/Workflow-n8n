import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { WORKSHOP_ACTS } from '../utils/challenges';
import { Users, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';
import DecryptedText from './reactbits/DecryptedText';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function TimelineActs() {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from('.act-card-wrapper', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
    });
  }, { scope: containerRef });

  const getActIcon = (actNum) => {
    switch (actNum) {
      case 1: return <Users className="w-4 h-4 text-emerald-400" />;
      case 2: return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 3: return <CheckCircle2 className="w-4 h-4 text-indigo-400" />;
      case 4: return <RefreshCw className="w-4 h-4 text-amber-400" />;
      default: return null;
    }
  };

  return (
    <section ref={containerRef} className="py-16 border-t border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red-500 font-semibold mb-2">
            Chronologie de l'Atelier
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Le Déroulé en 4 Actes
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl font-light">
            Une mise en scène où la théorie laisse place à l'expérimentation en direct.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {WORKSHOP_ACTS.map((act) => (
            <div key={act.act} className="act-card-wrapper">
              <SpotlightCard
                spotlightColor="rgba(239, 68, 68, 0.18)"
                className="p-5 h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                    <span className="text-xs font-mono font-bold text-zinc-400">{act.time}</span>
                    <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60">
                      {getActIcon(act.act)}
                    </div>
                  </div>

                  {/* React Bits: DecryptedText scrambler on hover */}
                  <div className="text-[11px] font-mono uppercase font-semibold text-red-400 tracking-wider mb-1">
                    <DecryptedText 
                      text={`Acte ${act.act} · ${act.tag}`} 
                      animateOn="hover" 
                      speed={30} 
                    />
                  </div>
                  
                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                    {act.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {act.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Phase {act.act}/4</span>
                  <span className="text-zinc-400">Interactif</span>
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
