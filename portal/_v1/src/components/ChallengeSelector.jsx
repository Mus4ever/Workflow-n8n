import React from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Repeat, Flame, Bot, EyeOff, 
  AlertTriangle, Lock, CheckCircle2 
} from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';
import DecryptedText from './reactbits/DecryptedText';

const ICON_MAP = {
  Send,
  Repeat,
  Flame,
  Bot,
  EyeOff,
  AlertTriangle,
  Lock
};

export default function ChallengeSelector({ 
  challenges, 
  activeChallengeId, 
  attempted, 
  onSelectChallenge 
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
          <span>Sélectionnez votre mission d'attaque :</span>
        </h3>
        <span className="text-xs font-mono text-zinc-500">
          {attempted.length}/{challenges.length} neutralisées
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {challenges.map((ch) => {
          const Icon = ICON_MAP[ch.icon] || Send;
          const isSelected = ch.id === activeChallengeId;
          const isBlocked = attempted.includes(ch.id);

          return (
            <motion.div
              key={ch.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectChallenge(ch)}
              className="cursor-pointer"
            >
              {/* React Bits: SpotlightCard with cursor-following glow */}
              <SpotlightCard
                spotlightColor={isSelected ? "rgba(239, 68, 68, 0.25)" : "rgba(255, 255, 255, 0.08)"}
                className={`p-3.5 h-full flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-red-500 shadow-lg shadow-red-500/10 ring-1 ring-red-500/40 bg-zinc-900'
                    : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg border ${
                      isSelected 
                        ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                        : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {isBlocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Bloqué
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">
                        {ch.act.split('·')[0].trim()}
                      </span>
                    )}
                  </div>

                  {/* React Bits: DecryptedText scrambler effect */}
                  <div className="text-xs font-bold text-white mb-0.5 line-clamp-1">
                    <DecryptedText text={ch.title} animateOn="hover" speed={25} />
                  </div>

                  <div className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-light">
                    {ch.subtitle}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Attendu</span>
                  <span className={isSelected ? 'text-red-400 font-semibold' : 'text-zinc-400'}>
                    {ch.expect.split('—')[0].trim()}
                  </span>
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
