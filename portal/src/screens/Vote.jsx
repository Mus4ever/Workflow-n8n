import React, { useState } from 'react';
import { sendVote } from '../lib/api';
import { load, save } from '../lib/storage';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import { ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Vote as VoteIcon, Sparkles } from 'lucide-react';

const CHOICES = [
  {
    value: 'approve',
    label: 'Approuver',
    desc: 'Valider le ticket et autoriser le remboursement',
    icon: ThumbsUp,
    active: 'border-green bg-green text-white shadow-lg shadow-green/25',
    inactive: 'border-line bg-card/90 text-ink hover:border-green/50',
  },
  {
    value: 'reject',
    label: 'Refuser',
    desc: 'Rejeter l’ordre pirate et clore le ticket',
    icon: ThumbsDown,
    active: 'border-red bg-red text-white shadow-lg shadow-red/25',
    inactive: 'border-line bg-card/90 text-ink hover:border-red/50',
  },
];

export default function Vote({ who }) {
  const [choice, setChoice] = useState(() => load('salle_vote', ''));
  const [sending, setSending] = useState('');
  const [error, setError] = useState('');

  async function vote(value) {
    setSending(value);
    setError('');
    const reply = await sendVote({ device: who.device, pseudo: who.pseudo, choice: value });
    setSending('');
    if (!reply.ok) {
      setError(reply.data?.message || 'Le vote n’est pas parti. Réessayez.');
      return;
    }
    setChoice(value);
    save('salle_vote', value);
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-8">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-blue/10 px-3 py-1 text-xs font-bold text-blue">
        <VoteIcon className="h-3.5 w-3.5" />
        <span>Sondage de la salle en direct</span>
      </div>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink font-display">À vous de décider</h1>

      <SpotlightCard className="mt-4 p-4 border border-line bg-card/85">
        <p className="text-sm font-semibold text-ink leading-relaxed">
          Une demande de remboursement sensible attend dans Slack. Le nœud n8n s’est mis en pause automatique :{' '}
          <strong className="text-blue">aucune action sans un arbitrage humain</strong>.
        </p>
        <p className="mt-2 text-xs text-soft">
          Votez quand l’animateur ouvre le scrutin. La salle donne son verdict, l’animateur clique dans Slack !
        </p>
      </SpotlightCard>

      <div className="mt-6 grid gap-3.5">
        {CHOICES.map((c) => {
          const Icon = c.icon;
          const isSelected = choice === c.value;
          return (
            <button
              key={c.value}
              aria-pressed={isSelected}
              disabled={Boolean(sending)}
              onClick={() => vote(c.value)}
              className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.99] ${
                isSelected ? c.active : c.inactive
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-paper text-soft'
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <span className="block font-display text-xl font-extrabold">{c.label}</span>
                <span className={`block text-xs ${isSelected ? 'text-white/80' : 'text-soft'}`}>{c.desc}</span>
              </div>
              {isSelected && <CheckCircle2 className="h-6 w-6 shrink-0 text-white" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 min-h-[2rem] text-center" aria-live="polite">
        {error ? (
          <span className="text-xs font-bold text-red">{error}</span>
        ) : choice ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green bg-green/10 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="h-4 w-4" />
            <span>Vote comptabilisé ({choice === 'approve' ? 'Approuver' : 'Refuser'}). Vous pouvez changer à tout moment.</span>
          </span>
        ) : (
          <span className="text-xs text-soft">Sélectionnez une option pour transmettre votre vote au projecteur.</span>
        )}
      </div>
    </main>
  );
}
