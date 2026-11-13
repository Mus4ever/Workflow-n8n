import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import SpotlightCard from './reactbits/SpotlightCard';
import Magnet from './reactbits/Magnet';
import CountUp from './reactbits/CountUp';
import DecryptedText from './reactbits/DecryptedText';

export default function SlackVoteSection() {
  const [votes, setVotes] = useState({ approve: 24, reject: 8 });
  const [userVote, setUserVote] = useState(null);

  const total = votes.approve + votes.reject;
  const approvePct = Math.round((votes.approve / total) * 100);
  const rejectPct = 100 - approvePct;

  const handleVote = (type) => {
    if (userVote) return;
    setUserVote(type);
    setVotes(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));

    if (type === 'approve') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#38BDF8']
      });
    }
  };

  return (
    <section className="py-16 border-t border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold mb-2">
            Acte 3 · Minute 35
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            La Salle Devient le Valideur
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl font-light">
            Une demande de remboursement arrive sur Slack. Le workflow suspend son exécution via <code>sendAndWait</code>.
            Votez ci-dessous : Mustapha clique selon la majorité de la salle.
          </p>
        </div>

        {/* The Slack Mock Card with React Bits SpotlightCard */}
        <SpotlightCard
          spotlightColor="rgba(99, 102, 241, 0.15)"
          className="p-6 shadow-2xl space-y-6"
        >
          {/* Card Top */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#4A154B] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                #
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Slack Bot · Channel #leads</span>
                  <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.2 bg-emerald-500/10 rounded border border-emerald-500/20">
                    sendAndWait En Attente
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Ticket : <DecryptedText text="SUP-20261113-143000-4821" animateOn="hover" speed={20} />
                </div>
              </div>
            </div>

            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
              Nœud 11 n8n
            </span>
          </div>

          {/* Ticket Details */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs leading-relaxed font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <span className="text-zinc-500">Client :</span>
              <span className="font-bold text-white font-sans">Amina Mansouri (amina.mansouri@enterprise.dz)</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <span className="text-zinc-500">Objet de la réclamation :</span>
              <span className="text-zinc-300 font-sans">Arrêt serveur en production suite au module ID 1</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <span className="text-zinc-500">Montant réclamé :</span>
              <span className="font-mono font-bold text-red-400">500 000 DZD (Remboursement urgent)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Analyse IA LangChain :</span>
              <span className="text-xs">
                Intent: <span className="text-indigo-400 font-semibold">refund_request</span> · 
                Priorité: <span className="text-red-400 font-semibold">urgent</span> · 
                Confiance: <span className="text-emerald-400 font-semibold">0.94</span>
              </span>
            </div>
          </div>

          {/* Live Voting Bar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">
                Vote en direct de la salle (<CountUp to={total} duration={0.8} /> votes) :
              </span>
              <span className="text-zinc-300">
                <CountUp to={approvePct} duration={0.8} suffix="% Approuvent" /> · <CountUp to={rejectPct} duration={0.8} suffix="% Rejettent" />
              </span>
            </div>

            {/* Split progress bar */}
            <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden flex border border-zinc-800">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${approvePct}%` }}
              />
              <div 
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${rejectPct}%` }}
              />
            </div>

            {/* Buttons wrapped in React Bits Magnet */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Magnet strength={0.25} className="w-full">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVote('approve')}
                  className={`w-full py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    userVote === 'approve'
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Approuver ({votes.approve})</span>
                </motion.button>
              </Magnet>

              <Magnet strength={0.25} className="w-full">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVote('reject')}
                  className={`w-full py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    userVote === 'reject'
                      ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20'
                      : 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>Rejeter ({votes.reject})</span>
                </motion.button>
              </Magnet>
            </div>

            {userVote && (
              <p className="text-[11px] font-mono text-center text-zinc-400 pt-1">
                ✔ Votre vote est enregistré. Mustapha valide la décision dans son Slack projeté !
              </p>
            )}
          </div>

        </SpotlightCard>

      </div>
    </section>
  );
}
