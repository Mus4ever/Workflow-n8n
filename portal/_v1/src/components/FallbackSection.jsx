import React from 'react';
import { RefreshCw } from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';
import Magnet from './reactbits/Magnet';
import DecryptedText from './reactbits/DecryptedText';

export default function FallbackSection({ onTriggerFallbackTest }) {
  return (
    <section className="py-16 border-t border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-2">
            Acte 4 · Minute 40 · Le Grand Final
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Le Crash-Test : Panne de l'IA
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl font-light">
            Que se passe-t-il si OpenRouter subit une panne mondiale 503 ou si vos quotas sont épuisés ?
            Votre processus d'entreprise ne crashe jamais grâce au disjoncteur déterministe.
          </p>
        </div>

        {/* The Circuit Breaker Visualizer with SpotlightCard */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.15)"
          className="p-6 shadow-2xl space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Step 1: Nominal Failure */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-red-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-red-400 font-bold">Panne Détectée</span>
                  <span className="text-zinc-500">
                    <DecryptedText text="Nœud 08" animateOn="hover" speed={20} />
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  OpenRouter 503 / Timeout
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                  Le fournisseur LLM ne répond pas. Le nœud n8n est configuré avec <code>continueRegularOutput</code> : l'exécution ne s'interrompt pas.
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-zinc-800 text-[10px] font-mono text-red-400">
                Crash évité ✔
              </div>
            </div>

            {/* Step 2: Detection Gate */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-amber-400 font-bold">Aiguillage Secours</span>
                  <span className="text-zinc-500">
                    <DecryptedText text="Nœud 09b" animateOn="hover" speed={20} />
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  aiOk = false
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                  Le nœud de fusion détecte l'absence de réponse IA valide et oriente instantanément le flux vers la branche de secours.
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-zinc-800 text-[10px] font-mono text-amber-400">
                Redirection &lt; 2ms ✔
              </div>
            </div>

            {/* Step 3: Rules Fallback */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-emerald-400 font-bold">Secours Déterministe</span>
                  <span className="text-zinc-500">
                    <DecryptedText text="Nœud 09c" animateOn="hover" speed={20} />
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  Rules Fallback FR / AR
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                  Mots-clés regex (rembours, panne, urgent, prix...). Le ticket est classifié, flagué <code>fallback_used: true</code> et archivé.
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-zinc-800 text-[10px] font-mono text-emerald-400">
                Continuité 100% garantie ✔
              </div>
            </div>

          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-300 font-light">
              <span className="font-bold text-white font-mono">Testez la panne en direct :</span> Activez la panne IA dans la console ci-dessus et envoyez un message.
            </div>

            <Magnet strength={0.25}>
              <button
                onClick={onTriggerFallbackTest}
                className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Charger le test Crash IA</span>
              </button>
            </Magnet>
          </div>

        </SpotlightCard>

      </div>
    </section>
  );
}
