import React from 'react';
import { OUTCOMES } from '../lib/missions';

const TONES = {
  green: 'text-green',
  red: 'text-red',
  ochre: 'text-ochre',
  soft: 'text-soft',
};

// Le tampon posé sur une demande : le verdict du workflow, tel qu'il l'a renvoyé.
export default function Stamp({ outcome, small = false, delay = 0 }) {
  const o = OUTCOMES[outcome] || OUTCOMES.erreur;
  return (
    <span
      className={`stamp ${small ? 'stamp-sm' : 'text-3xl'} ${TONES[o.tone]}`}
      style={{ '--delay': `${delay}ms` }}
    >
      {o.stamp}
      {o.code ? <span className="ml-2 opacity-70">{o.code}</span> : null}
    </span>
  );
}
