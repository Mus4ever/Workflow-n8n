import React from 'react';
import { GATES, OUTCOMES } from '../lib/missions';

// Montre où la demande s'est arrêtée : les portes franchies, celle qui a refusé, celles jamais atteintes.
export default function GateTrack({ outcome }) {
  const o = OUTCOMES[outcome] || OUTCOMES.erreur;
  if (o.stopAt < 0) return null;

  return (
    <ol className="space-y-2" aria-label="Trajet de la demande dans le workflow">
      {GATES.map((gate, i) => {
        const state = i < o.stopAt ? 'passed' : i === o.stopAt ? 'stopped' : 'unreached';
        const stopTone = o.tone === 'ochre' ? 'text-ochre' : 'text-red';
        return (
          <li
            key={gate.id}
            className={`gate flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
              state === 'stopped' ? 'border-current bg-card ' + stopTone
              : state === 'passed' ? 'border-line bg-card'
              : 'border-dashed border-line bg-transparent'
            }`}
            style={{ '--i': Math.min(i, o.stopAt) }}
          >
            <span
              className={`gate-mark flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                state === 'passed' ? 'bg-green text-white'
                : state === 'stopped' ? 'bg-current'
                : 'border-2 border-line'
              }`}
              style={{ '--i': Math.min(i, o.stopAt) }}
              aria-hidden="true"
            >
              {state === 'passed' && '✓'}
              {state === 'stopped' && <span className="text-white">✕</span>}
            </span>
            <span className="min-w-0">
              <span className={`block font-bold ${state === 'unreached' ? 'text-soft' : 'text-ink'}`}>{gate.name}</span>
              <span className={`block text-sm ${state === 'stopped' ? '' : 'text-soft'}`}>
                {state === 'passed' && gate.pass}
                {state === 'stopped' && `Arrêt ici : ${o.stop.toLowerCase()}`}
                {state === 'unreached' && 'Jamais atteinte'}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
