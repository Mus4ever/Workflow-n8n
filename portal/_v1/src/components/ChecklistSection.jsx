import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Download, Award } from 'lucide-react';
import { CHALLENGES } from '../utils/challenges';
import SpotlightCard from './reactbits/SpotlightCard';
import CountUp from './reactbits/CountUp';
import Magnet from './reactbits/Magnet';

export default function ChecklistSection({ attempted }) {
  const total = CHALLENGES.length;
  const verifiedCount = attempted.length;
  const pct = Math.round((verifiedCount / total) * 100);

  return (
    <section className="py-16 border-t border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold mb-2">
              Livrable Officiel · Algeria 2.0
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              La Checklist de Production (12 Piliers)
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl font-light">
              Chaque attaque déjouée par le workflow valide une règle indispensable à la mise en production.
            </p>
          </div>

          <Magnet strength={0.25} className="self-start sm:self-auto">
            <a
              href="/CHECKLIST-production-ready.md"
              download
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 text-xs font-mono font-medium transition flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Télécharger (.MD)</span>
            </a>
          </Magnet>
        </div>

        {/* Progress Score Bar with SpotlightCard */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.15)"
          className="p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-zinc-400">Règles éprouvées en direct :</span>
              <span className="font-bold text-white">
                <CountUp to={verifiedCount} duration={0.8} /> / {total} (<CountUp to={pct} duration={0.8} suffix="%" />)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-300">
              {verifiedCount >= 5 ? 'Niveau 3 : Processus Entreprise ⭐' : 'Niveau 2 : En cours d\'audit'}
            </span>
          </div>
        </SpotlightCard>

        {/* Checklist Rows */}
        <div className="space-y-2.5">
          {CHALLENGES.map((ch) => {
            const isDone = attempted.includes(ch.id);

            return (
              <motion.div
                key={ch.id}
                layout
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  isDone
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-zinc-900/50 border-zinc-800/80 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">
                      {ch.checklistPillar}
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-light">
                      Éprouvé par l'attaque : <span className="font-mono text-zinc-300">{ch.title}</span> ({ch.expect})
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex-shrink-0 ${
                  isDone 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {isDone ? 'VALIDÉ' : 'À TESTER'}
                </span>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
