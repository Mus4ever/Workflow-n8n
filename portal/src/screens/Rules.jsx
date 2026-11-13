import React from 'react';
import { MISSIONS } from '../lib/missions';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, Download, BookOpen } from 'lucide-react';

export default function Rules({ progress, onOpen }) {
  const proved = MISSIONS.filter((m) => progress[m.id]?.state === 'proved').length;

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-8">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-green/10 px-3 py-1 text-xs font-bold text-green">
        <BookOpen className="h-3.5 w-3.5" />
        <span>Bonnes Pratiques n8n en Production</span>
      </div>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink font-display">Vos règles de production</h1>
      <p className="mt-2 text-sm text-soft leading-relaxed">
        {proved === 0
          ? 'Chaque attaque bloquée débloque une règle fondamentale. Rien n’est encore prouvé : lancez vos premières missions !'
          : `Vous avez prouvé ${proved} règle${proved > 1 ? 's' : ''} sur ${MISSIONS.length} en direct sur un vrai workflow n8n.`}
      </p>

      <ul className="mt-6 space-y-3">
        {MISSIONS.map((m) => {
          const done = progress[m.id]?.state === 'proved';
          return (
            <li key={m.id}>
              <SpotlightCard
                className={`p-4 border transition-all ${
                  done
                    ? 'border-green/40 bg-emerald-500/[0.03] shadow-sm'
                    : 'border-line bg-card/85'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      done ? 'bg-green/15 text-green' : 'bg-paper text-soft'
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${done ? 'text-ink' : 'text-soft'}`}>
                      {m.rule}
                    </p>
                    {done ? (
                      <p className="mt-1 text-xs text-green font-medium">
                        ✓ Prouvée par la mission « {m.title} »
                      </p>
                    ) : (
                      <button
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue hover:underline"
                        onClick={() => onOpen(m.id)}
                      >
                        <span>{m.onScreen ? 'Preuve sur l’écran projeté' : `Attaquer avec la mission « ${m.title} »`}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            </li>
          );
        })}
      </ul>

      <a
        className="btn-quiet mt-6 w-full flex items-center justify-center gap-2 text-sm py-3"
        href="/CHECKLIST-production-ready.md"
        download
      >
        <Download className="h-4 w-4" />
        <span>Télécharger la checklist de production (Markdown)</span>
      </a>
    </main>
  );
}
