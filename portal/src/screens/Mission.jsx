import React, { useState } from 'react';
import { MISSIONS, OUTCOMES } from '../lib/missions';
import { sendRequest, fetchTicket } from '../lib/api';
import { fireCelebration } from '../lib/confetti';
import GateTrack from '../components/GateTrack';
import Stamp from '../components/Stamp';
import ShinyButton from '../components/reactbits/ShinyButton';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import {
  ArrowLeft,
  Send,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Bot,
  Zap,
} from 'lucide-react';

const FIELD_LABEL = { name: 'Nom du client', email: 'Adresse email', message: 'Message' };

const INTENT_LABEL = {
  technical_issue: 'problème technique',
  account_access: 'accès au compte',
  order_status: 'suivi de commande',
  refund_request: 'demande de remboursement',
  billing_issue: 'problème de facturation',
  product_question: 'question sur un produit',
  complaint: 'réclamation',
  other: 'autre demande',
};

const DECISION_LABEL = {
  APPROVED: '✓ Un humain a approuvé la demande dans Slack.',
  REJECTED: '✕ Un humain a refusé la demande dans Slack.',
  EXPIRED: '⚠️ Personne n’a répondu en 30 minutes : le ticket est à reprendre.',
};

// Ce que le workflow a répondu, en une phrase.
function explain(result) {
  const data = result.data || {};
  switch (result.outcome) {
    case 'accepte':
      return `Le workflow a créé le ticket ${data.ticket_id || ''} et poursuit le traitement en arrière-plan.`;
    case 'doublon':
      return `Le workflow a reconnu la signature et le hash : demande déjà reçue. Ticket réutilisé : ${data.ticket_id || 'inconnu'}.`;
    case 'donnees':
      return 'Le workflow a refusé la demande avant tout traitement IA :';
    case 'signature':
      return 'Le workflow a refusé la demande dès la première porte (signature absente ou invalide).';
    case 'limite':
      return 'Plus de cinq demandes en dix minutes pour ce client (Rate limit actif).';
    default:
      return data.message || 'Le workflow n’a pas répondu.';
  }
}

function TicketStatus({ ticket }) {
  if (ticket === undefined)
    return <p className="text-sm text-soft">Impossible de lire le ticket. Vérifiez la connexion, puis réessayez.</p>;
  if (ticket === null)
    return <p className="text-sm text-soft">Ticket introuvable pour l’instant. Réessayez dans quelques secondes.</p>;
  if (!ticket.review_reasons && ticket.approval_status !== 'AUTO_APPROVED') {
    return (
      <div className="flex items-center gap-2 text-blue">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <p className="text-sm font-bold">L’analyse IA est en cours dans n8n... Patientez quelques secondes.</p>
      </div>
    );
  }
  if (ticket.approval_status === 'AUTO_APPROVED') {
    return (
      <p className="text-sm text-soft">
        Le ticket a été traité sans humain : l’IA n’a pas jugé la demande sensible. Reformulez votre ordre, puis renvoyez.
      </p>
    );
  }

  const isWaiting = !ticket.approval_status || ticket.status === 'awaiting_human';

  return (
    <>
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-blue" />
        <p className="font-bold text-ink">
          L’IA a classé votre message comme « {INTENT_LABEL[ticket.intent] || ticket.intent} » et a bloqué toute décision automatique.
        </p>
      </div>
      <p className="mt-2 text-xs text-soft rounded bg-paper p-2 font-mono">
        <strong>Motifs de révision :</strong> {ticket.review_reasons}.
      </p>
      <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between">
        <span className="text-sm font-semibold">Décision humaine :</span>
        <span
          className={`text-sm font-bold ${
            isWaiting
              ? 'text-blue animate-pulse'
              : ticket.approval_status === 'APPROVED'
              ? 'text-green font-extrabold'
              : 'text-red font-extrabold'
          }`}
        >
          {isWaiting ? '⏳ En attente du clic dans Slack' : DECISION_LABEL[ticket.approval_status] || 'Décision enregistrée'}
        </span>
      </div>
    </>
  );
}

export default function Mission({ missionId, who, saved, onReport, onBack, onNext }) {
  const index = MISSIONS.findIndex((m) => m.id === missionId);
  const mission = MISSIONS[index];
  const [draft, setDraft] = useState(mission.defaults);
  const [mode, setMode] = useState(mission.modes?.[0].value || 'signed');
  const [phase, setPhase] = useState('idle');
  const [step, setStep] = useState(0);
  const [results, setResults] = useState([]);
  const [ticket, setTicket] = useState();
  const [following, setFollowing] = useState(false);
  const [followed, setFollowed] = useState(false);

  const sends = mission.build(who, draft, mode);
  const canSend = mission.fields.includes('message') ? Boolean(draft.message?.trim()) : true;

  async function run() {
    setPhase('sending');
    setTicket(undefined);
    setFollowed(false);
    const out = [];
    for (const [i, send] of sends.entries()) {
      setStep(i + 1);
      const result = await sendRequest({ device: who.device, pseudo: who.pseudo, mission: mission.id, ...send });
      out.push(result);
      if (result.outcome === 'erreur' || result.outcome === 'limite') break;
    }
    setResults(out);
    setPhase('done');
    report(out, undefined);
  }

  function report(out, followedTicket) {
    const last = out.at(-1);
    const isProved = mission.proves(out, followedTicket);
    const state = isProved
      ? 'proved'
      : (mission.followUp || mission.onScreen) && last?.outcome === 'accepte'
      ? 'sent'
      : 'tried';

    if (isProved && saved?.state !== 'proved') {
      fireCelebration();
    }

    onReport(mission.id, saved?.state === 'proved' ? 'proved' : state);
    return state;
  }

  async function follow() {
    setFollowing(true);
    const found = await fetchTicket(results.at(-1).data.ticket_id);
    setTicket(found);
    setFollowed(true);
    setFollowing(false);
    report(results, found);
  }

  const last = results.at(-1);
  const proved = phase === 'done' && mission.proves(results, ticket);
  const pending = phase === 'done' && !proved && (mission.followUp || mission.onScreen) && last?.outcome === 'accepte';
  const stopAt = last ? (OUTCOMES[last.outcome] || OUTCOMES.erreur).stopAt : -1;
  const settle = stopAt < 0 ? 0 : Math.min(stopAt, 3) * 300 + 450;
  const headline = !last
    ? ''
    : proved || pending
    ? mission.success
    : last.outcome === 'erreur'
    ? 'Pas de réponse'
    : 'Résultat inattendu';

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-6">
      {/* Back button */}
      <button
        className="-ml-2 inline-flex min-h-[2.5rem] items-center gap-1.5 px-2 text-sm font-bold text-blue hover:text-blue/80 transition-colors"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Toutes les missions</span>
      </button>

      {/* Mission title badge */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-soft uppercase tracking-wider">
          Mission {index + 1} / {MISSIONS.length}
        </span>
        {saved?.state === 'proved' && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-green bg-green/10 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Déjà validée</span>
          </span>
        )}
      </div>

      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink font-display">{mission.title}</h1>

      {phase !== 'done' && (
        <>
          <p className="mt-2.5 text-base text-soft leading-relaxed">{mission.brief}</p>

          <div className="mt-6 space-y-4">
            {mission.modes && (
              <fieldset>
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-soft">
                  Type d’appel HTTP
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {mission.modes.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      aria-pressed={mode === m.value}
                      onClick={() => setMode(m.value)}
                      className={`min-h-[3rem] rounded-xl border-2 px-3 text-sm font-bold transition-all ${
                        mode === m.value
                          ? 'border-ink bg-ink text-white shadow-sm'
                          : 'border-line bg-card/90 text-ink hover:border-ink/50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {mission.fields.map((name) => (
              <div key={name}>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-soft" htmlFor={`f-${name}`}>
                  {FIELD_LABEL[name]}
                </label>
                {name === 'message' ? (
                  <textarea
                    id="f-message"
                    className="field shadow-sm"
                    rows={4}
                    maxLength={2000}
                    value={draft.message}
                    onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                  />
                ) : (
                  <input
                    id={`f-${name}`}
                    className="field shadow-sm"
                    value={draft[name]}
                    maxLength={200}
                    autoComplete="off"
                    autoCapitalize="off"
                    placeholder={name === 'name' ? 'Vide : le workflow doit refuser' : ''}
                    onChange={(e) => setDraft({ ...draft, [name]: e.target.value })}
                  />
                )}
              </div>
            ))}

            <ShinyButton
              onClick={run}
              disabled={!canSend || phase === 'sending'}
              variant="primary"
              className="w-full text-base py-3"
            >
              {phase === 'sending' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{sends.length > 1 ? `Envoi ${step} sur ${sends.length}…` : 'Attaque en cours…'}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{mission.sendLabel}</span>
                </>
              )}
            </ShinyButton>
          </div>
        </>
      )}

      {phase === 'done' && last && (
        <section className="mt-6" aria-live="polite">
          {/* Multi-request stamps bar */}
          {results.length > 1 && (
            <ol className="mb-5 flex flex-wrap gap-x-3 gap-y-3">
              {results.map((r, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-soft font-mono">
                  <span className="tabular-nums">#{i + 1}</span>
                  <Stamp outcome={r.outcome} small />
                </li>
              ))}
            </ol>
          )}

          {/* Security Gate Visualizer */}
          <GateTrack outcome={last.outcome} />

          {/* Headline & Stamp */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="rise text-xl sm:text-2xl font-extrabold tracking-tight" style={{ '--delay': `${settle}ms` }}>
              {headline}
            </h2>
            <Stamp outcome={last.outcome} delay={settle + 100} />
          </div>

          <div className="rise mt-5 space-y-4" style={{ '--delay': `${settle + 300}ms` }}>
            <p className="text-sm font-medium text-ink leading-relaxed">{explain(last)}</p>

            {last.outcome === 'donnees' && Array.isArray(last.data?.details) && (
              <ul className="list-disc space-y-1 pl-5 text-xs font-mono text-red bg-red/5 p-3 rounded-xl border border-red/20">
                {last.data.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}

            {results.length === 1 && last.ms ? (
              <p className="text-xs text-soft flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3" />
                <span>Réponse reçue en {(last.ms / 1000).toFixed(1).replace('.', ',')} s.</span>
              </p>
            ) : null}

            {/* Proved rule card with glowing border */}
            {(proved || pending) && (
              <SpotlightCard className="rounded-xl border-2 border-green/50 bg-emerald-500/[0.04] p-4">
                <div className="flex items-center gap-2 text-green font-bold text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Règle validée : {mission.rule}</span>
                </div>
                <p className="mt-1 text-xs text-soft leading-relaxed">{mission.learned}</p>
              </SpotlightCard>
            )}

            {!proved && !pending && last.outcome !== 'erreur' && (
              <div className="rounded-xl border-2 border-ochre/40 bg-amber-500/[0.06] p-4 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-ochre">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Conseil d'attaque</span>
                </div>
                <p className="mt-1 text-soft">
                  {last.outcome === 'limite'
                    ? 'Vous avez atteint la limite de cinq demandes en dix minutes. Attendez un peu, puis renvoyez.'
                    : mission.retry || `Ce n’est pas le résultat attendu. Le workflow a répondu code ${OUTCOMES[last.outcome]?.code}.`}
                </p>
              </div>
            )}

            {/* AI Prompt Injection & Slack follow-up */}
            {mission.followUp && last.outcome === 'accepte' && (
              <div className="space-y-3">
                {followed && (
                  <div className="rounded-xl border border-line bg-card/90 p-4 shadow-sm">
                    <TicketStatus ticket={ticket} />
                  </div>
                )}
                {(!ticket || !ticket.approval_status || ticket.status === 'awaiting_human') && (
                  <ShinyButton
                    onClick={follow}
                    disabled={following}
                    variant="primary"
                    className="w-full text-sm py-2.5"
                  >
                    {following ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Lecture du ticket dans n8n…</span>
                      </>
                    ) : followed ? (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Rafraîchir le statut Slack</span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        <span>Suivre la décision humaine dans Slack</span>
                      </>
                    )}
                  </ShinyButton>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-6 grid gap-2.5">
              {onNext && (proved || pending) && !(mission.followUp && !proved) && (
                <ShinyButton onClick={onNext} variant="primary" className="w-full py-3">
                  <span>Mission suivante</span>
                  <ArrowRight className="h-4 w-4" />
                </ShinyButton>
              )}
              <button className="btn-quiet text-sm py-2.5" onClick={() => setPhase('idle')}>
                Modifier et réattaquer
              </button>
              {onNext && !(proved || pending) && (
                <button className="btn-quiet text-xs text-soft py-2" onClick={onNext}>
                  Passer à la mission suivante
                </button>
              )}
              {onNext && mission.followUp && pending && (
                <button className="btn-quiet text-xs text-soft py-2" onClick={onNext}>
                  Passer à la mission suivante
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
