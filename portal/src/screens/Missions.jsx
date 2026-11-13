import React from 'react';
import { MISSIONS } from '../lib/missions';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import {
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  Copy,
  Flame,
  Bot,
  Terminal,
  CheckCircle2,
  ChevronRight,
  Trophy,
} from 'lucide-react';

const MISSION_ICONS = {
  normale: ShieldCheck,
  signature: KeyRound,
  donnees: AlertTriangle,
  doublon: Copy,
  rafale: Flame,
  ia: Bot,
  injection: Terminal,
};

const STATE_LABEL = {
  proved: { text: 'Prouvée', className: 'text-green bg-green/10 border-green/30' },
  sent: { text: 'Envoyée', className: 'text-blue bg-blue/10 border-blue/30' },
  tried: { text: 'À refaire', className: 'text-ochre bg-amber-500/10 border-ochre/30' },
};

export default function Missions({ pseudo, progress, onOpen }) {
  const proved = MISSIONS.filter((m) => progress[m.id]?.state === 'proved').length;
  const next = MISSIONS.find((m) => !progress[m.id]);
  const isComplete = proved === MISSIONS.length;

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-8">
      {/* Participant Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-soft">
          Agent <span className="font-bold text-ink">{pseudo}</span>
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card/80 px-2.5 py-0.5 text-xs font-bold text-soft backdrop-blur-sm">
          <Trophy className="h-3.5 w-3.5 text-ochre" />
          <span>{proved} / {MISSIONS.length}</span>
        </div>
      </div>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight font-display text-ink">
        {isComplete
          ? '🎉 Félicitations ! Toutes les règles sont prouvées !'
          : proved === 0
          ? 'Sept missions d’attaque'
          : `${proved} règle${proved > 1 ? 's' : ''} prouvée${proved > 1 ? 's' : ''} sur ${MISSIONS.length}`}
      </h1>

      {/* Progress Bar with glowing segments */}
      <div className="mt-4 flex gap-1.5" role="img" aria-label={`${proved} missions prouvées sur ${MISSIONS.length}`}>
        {MISSIONS.map((m) => {
          const state = progress[m.id]?.state;
          return (
            <div
              key={m.id}
              className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${
                state === 'proved'
                  ? 'bg-green shadow-[0_0_8px_rgba(18,128,92,0.5)]'
                  : state
                  ? 'bg-blue'
                  : 'bg-line/70'
              }`}
            />
          );
        })}
      </div>

      {/* Mission Cards List */}
      <ol className="mt-6 space-y-3">
        {MISSIONS.map((m, i) => {
          const state = progress[m.id]?.state;
          const label = STATE_LABEL[state];
          const isNext = next?.id === m.id;
          const Icon = MISSION_ICONS[m.id] || ShieldCheck;

          return (
            <li key={m.id}>
              <SpotlightCard
                onClick={() => onOpen(m.id)}
                className={`cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                  isNext
                    ? 'border-2 border-blue ring-2 ring-blue/15 shadow-md shadow-blue/5'
                    : state === 'proved'
                    ? 'border-green/40 bg-emerald-500/[0.02]'
                    : ''
                }`}
              >
                <div className="flex w-full items-center gap-3.5 p-4 text-left">
                  {/* Left Icon Badge */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-extrabold transition-colors ${
                      state === 'proved'
                        ? 'bg-green text-white shadow-sm shadow-green/30'
                        : isNext
                        ? 'bg-blue text-white shadow-sm shadow-blue/30'
                        : 'bg-paper text-soft'
                    }`}
                  >
                    {state === 'proved' ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Middle Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-soft">Mission {i + 1}</span>
                      {label && (
                        <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${label.className}`}>
                          {label.text}
                        </span>
                      )}
                      {isNext && (
                        <span className="rounded-md bg-blue/10 px-1.5 py-0.5 text-[10px] font-bold text-blue animate-pulse">
                          À faire
                        </span>
                      )}
                    </div>
                    <span className="mt-0.5 block font-bold text-ink leading-snug truncate">
                      {m.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-soft line-clamp-1">
                      {m.brief}
                    </span>
                  </div>

                  {/* Right Chevron */}
                  <ChevronRight className="h-5 w-5 shrink-0 text-soft/70 transition-transform group-hover:translate-x-0.5" />
                </div>
              </SpotlightCard>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
