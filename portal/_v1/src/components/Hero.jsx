import React from 'react';
import { QrCode, ArrowDown, Sparkles } from 'lucide-react';
import SplitText from './reactbits/SplitText';
import ShinyText from './reactbits/ShinyText';
import BlurText from './reactbits/BlurText';
import Magnet from './reactbits/Magnet';
import StarBorder from './reactbits/StarBorder';
import ParticlesBackground from './reactbits/ParticlesBackground';

export default function Hero({ onOpenQr, onScrollToArena }) {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-12 pb-16 overflow-hidden">
      
      {/* React Bits: Particles Ambient Canvas Background */}
      <ParticlesBackground quantity={30} color="#EF4444" className="opacity-40" />

      {/* Background soft flare */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* React Bits: ShinyText in top badge */}
      <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm mb-8 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        <ShinyText text="Algeria 2.0" className="font-semibold" />
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-400">Atelier Technique n8n Production</span>
      </div>

      {/* React Bits: SplitText for bold animated headline */}
      <h1 className="relative z-10 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
        <SplitText 
          text="« Essayez de casser" 
          splitType="words" 
          delay={40} 
          className="block" 
        />
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">
          <SplitText 
            text="mon workflow. »" 
            splitType="words" 
            delay={60} 
            className="inline-block" 
          />
        </span>
      </h1>

      {/* React Bits: BlurText for smooth subtitle blur-in */}
      <div className="relative z-10 max-w-2xl mx-auto mb-10 text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
        <BlurText 
          text="Connecté en direct à une architecture d'entreprise de 36 nœuds en production. Chaque attaque tentée depuis votre téléphone qui échoue prouve une règle de mise en production."
          delay={25}
        />
      </div>

      {/* React Bits: Magnet & StarBorder for action buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center">
        
        <Magnet strength={0.25} className="w-full sm:w-auto">
          <StarBorder
            as="button"
            onClick={onScrollToArena}
            color="#EF4444"
            className="w-full sm:w-auto cursor-pointer shadow-lg shadow-red-500/20"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-white font-sans">Lancer les attaques</span>
          </StarBorder>
        </Magnet>

        <Magnet strength={0.25} className="w-full sm:w-auto">
          <button
            onClick={onOpenQr}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 text-sm font-medium transition-all flex items-center justify-center gap-2 backdrop-blur-sm shadow-md"
          >
            <QrCode className="w-4 h-4 text-red-400" />
            <span>QR Code Salle</span>
          </button>
        </Magnet>

      </div>

      {/* Scroll indicator */}
      <div 
        onClick={onScrollToArena}
        className="relative z-10 mt-16 cursor-pointer text-zinc-600 hover:text-zinc-400 transition flex flex-col items-center gap-2 text-xs font-mono animate-bounce"
      >
        <span>Découvrir le déroulé & les défis</span>
        <ArrowDown className="w-4 h-4 text-zinc-500" />
      </div>
    </section>
  );
}
