import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { load, save } from '../lib/storage';
import { GATES, MISSIONS } from '../lib/missions';
import Stamp from '../components/Stamp';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import {
  Users,
  Play,
  Pause,
  RotateCcw,
  Radio,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  AlertTriangle,
  Zap,
  Settings,
  Database,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { isSupabaseConfigured, subscribeToRealtime, fetchParticipants, fetchInitialStats } from '../lib/supabase';

const INTENT_LABEL = {
  technical_issue: 'Problème technique',
  account_access: 'Accès au compte',
  order_status: 'Suivi de commande',
  refund_request: 'Remboursement',
  billing_issue: 'Facturation',
  product_question: 'Question produit',
  complaint: 'Réclamation',
  other: 'Demande client',
};

const DECISION = {
  AUTO_APPROVED: { text: '✓ Traité automatiquement', className: 'text-soft font-semibold' },
  APPROVED: { text: '✓ Approuvé dans Slack', className: 'font-bold text-green' },
  REJECTED: { text: '✕ Refusé dans Slack', className: 'font-bold text-red' },
  EXPIRED: { text: '⚠️ Sans réponse, expiré', className: 'font-bold text-ochre' },
};

const GATE_ICONS = [KeyRound, AlertTriangle, Zap, ShieldCheck];

const missionTitle = (id) => MISSIONS.find((m) => id === m.id || id.startsWith(m.id))?.title || 'Essai libre';

function Count({ value, className = '' }) {
  return <span key={value} className={`tick inline-block tabular-nums ${className}`}>{value}</span>;
}

export default function Scene() {
  const [state, setState] = useState(null);
  const [offline, setOffline] = useState(false);
  const [live, setLive] = useState(true);
  const [since, setSince] = useState(() => load('scene_since', 0));
  const [customJoinUrl, setCustomJoinUrl] = useState(() => load('scene_custom_url', ''));
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(customJoinUrl);
  const [qr, setQr] = useState('');
  const [expandedAttack, setExpandedAttack] = useState(null);
  const [participantsList, setParticipantsList] = useState([]);

  // Sync participants & stats from Supabase (initial + continuous polling backup)
  useEffect(() => {
    if (!isSupabaseConfigured() || !live) return;
    let cancelled = false;

    async function syncFromSupabase() {
      if (document.visibilityState !== 'visible') return;
      try {
        const [list, stats] = await Promise.all([fetchParticipants(), fetchInitialStats()]);
        if (cancelled) return;
        if (list && list.length > 0) setParticipantsList(list);
        if (stats) setState(stats);
      } catch (e) {
        console.warn('Sync error:', e);
      }
    }

    syncFromSupabase();
    const interval = setInterval(syncFromSupabase, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [live]);

  const defaultUrl = window.location.origin + window.location.pathname;
  const effectiveJoinUrl = (customJoinUrl.trim() || defaultUrl).replace(/\/+$/, '');
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  useEffect(() => {
    QRCode.toDataURL(effectiveJoinUrl, { width: 640, margin: 1, color: { dark: '#101B33', light: '#FFFFFF' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, [effectiveJoinUrl]);

  // Statut n8n (statique ou vérifié à la demande, AUCUN polling en boucle pour ne pas consommer de quota n8n)
  useEffect(() => {
    setOffline(false);
  }, []);

  // Realtime WebSocket Subscription via Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || !live) return;

    const unsubscribe = subscribeToRealtime({
      onAttack: (newAttack) => {
        setState((prev) => {
          const currentCounts = prev?.counts || { accepte: 0, doublon: 0, donnees: 0, signature: 0, limite: 0, erreur: 0 };
          const nextCounts = { ...currentCounts };
          const outcome = newAttack.outcome || 'erreur';
          if (outcome in nextCounts) nextCounts[outcome] = (nextCounts[outcome] || 0) + 1;
          const nextEvents = [
            {
              at: new Date(newAttack.created_at || Date.now()).getTime(),
              pseudo: newAttack.pseudo,
              mission: newAttack.mission_id,
              outcome: newAttack.outcome,
              http_status: newAttack.http_status,
              payload: newAttack.payload,
              response_data: newAttack.response_data,
              id: newAttack.id || String(Date.now()),
            },
            ...(prev?.events || []),
          ];
          return {
            ...prev,
            total: (prev?.total || 0) + 1,
            counts: nextCounts,
            events: nextEvents.slice(0, 50),
          };
        });
      },
      onTicket: (ticketUpdate) => {
        setState((prev) => {
          const tickets = [...(prev?.tickets || [])];
          const idx = tickets.findIndex((t) => t.ticket_id === ticketUpdate.ticket_id);
          if (idx >= 0) tickets[idx] = ticketUpdate;
          else tickets.unshift(ticketUpdate);
          return { ...prev, tickets };
        });
      },
      onParticipant: (p) => {
        if (!p?.pseudo) return;
        setParticipantsList((prev) => {
          const idx = prev.findIndex(
            (item) => (p.id && item.id === p.id) || (p.device_id && item.device_id === p.device_id)
          );
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...p };
            return next;
          }
          return [p, ...prev];
        });
      },
    });

    return unsubscribe;
  }, [live]);

  function startSession() {
    if (!window.confirm('Remettre les compteurs à zéro pour une nouvelle session ?')) return;
    const now = Date.now();
    setSince(now);
    save('scene_since', now);
    setState(null);
  }

  const counts = state?.counts || { accepte: 0, doublon: 0, donnees: 0, signature: 0, limite: 0, erreur: 0 };
  const blocked = counts.signature + counts.donnees + counts.doublon + counts.limite;
  const stoppedAt = [counts.signature, counts.donnees, counts.doublon + counts.limite];

  return (
    <main className="mx-auto max-w-[1540px] px-6 sm:px-8 py-7">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 items-center justify-center relative">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 relative" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-600 uppercase">
              Console Super-Admin & Vidéoprojecteur • Algeria 2.0
            </span>
            {isSupabaseConfigured() && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                <Database className="h-3 w-3" />
                <span>Supabase Realtime Actif</span>
              </span>
            )}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-ink font-display mt-0.5">
            Cassez mon workflow
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {offline ? (
            <span className="mr-2 inline-flex items-center gap-1.5 text-xs font-bold text-red bg-red/10 px-2.5 py-1 rounded-lg border border-red/20">
              ⚠️ n8n Inaccessible
            </span>
          ) : (
            <span className="mr-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>n8n En ligne (support-intake-v2)</span>
            </span>
          )}

          <button
            className="btn-quiet min-h-[2.5rem] px-3.5 text-xs font-bold inline-flex items-center gap-1.5"
            aria-pressed={live}
            onClick={() => setLive(!live)}
          >
            {live ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-600" />
                <span>Pause direct</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-green" />
                <span>Reprendre direct</span>
              </>
            )}
          </button>

          <button
            className="btn-quiet min-h-[2.5rem] px-3 text-xs font-bold text-soft inline-flex items-center gap-1.5 hover:text-red"
            onClick={startSession}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset session</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Left Join QR Code / Right Activity Dashboard */}
      <div className="mt-7 grid gap-6 lg:grid-cols-[22rem_1fr]">
        {/* Left Column: QR Code & Access info */}
        <SpotlightCard className="p-6 border border-line bg-card/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold tracking-wider text-soft uppercase">
                Accès Immédiat
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue bg-blue/10 px-2 py-0.5 rounded-full">
                <Radio className="h-3 w-3 animate-pulse" />
                <span>Scannez & Jouez</span>
              </span>
            </div>

            {/* Big QR Code */}
            <div className="relative mx-auto overflow-hidden rounded-2xl border-4 border-line/80 bg-white p-2.5 shadow-md">
              {qr ? (
                <img src={qr} alt={`QR code vers ${effectiveJoinUrl}`} className="w-full aspect-square rounded-xl" />
              ) : (
                <div className="aspect-square w-full rounded-xl bg-paper flex items-center justify-center text-soft text-sm">
                  Génération du QR...
                </div>
              )}
            </div>

            <p className="mt-4 text-center text-sm font-semibold text-soft">
              URL d'accès pour les téléphones :
            </p>
            <p className="mt-0.5 break-all text-center text-base font-bold text-blue font-mono">
              {effectiveJoinUrl.replace(/^https?:\/\//, '')}
            </p>

            {/* Config custom URL */}
            {isEditingUrl ? (
              <div className="mt-3 rounded-xl border border-line bg-paper p-3 text-left">
                <label className="block text-xs font-bold text-soft mb-1" htmlFor="custom-url-input">
                  URL publique (Tunnel ou nom de domaine) :
                </label>
                <input
                  id="custom-url-input"
                  className="field text-xs py-1.5 px-2.5 w-full mb-2"
                  placeholder="https://nimble-cyclone-suwml6q.vercel.app"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    className="rounded-lg bg-blue px-3 py-1 text-xs font-bold text-white hover:bg-blue/90"
                    onClick={() => {
                      const trimmed = urlInput.trim();
                      setCustomJoinUrl(trimmed);
                      save('scene_custom_url', trimmed);
                      setIsEditingUrl(false);
                    }}
                  >
                    Appliquer
                  </button>
                  <button
                    className="rounded-lg border border-line px-2 py-1 text-xs font-bold text-soft hover:text-ink"
                    onClick={() => {
                      setUrlInput('');
                      setCustomJoinUrl('');
                      save('scene_custom_url', '');
                      setIsEditingUrl(false);
                    }}
                  >
                    Défaut
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-center">
                <button
                  className="inline-flex items-center gap-1 text-xs font-bold text-soft hover:text-ink underline decoration-dotted"
                  onClick={() => {
                    setUrlInput(customJoinUrl);
                    setIsEditingUrl(true);
                  }}
                >
                  <Settings className="h-3 w-3" />
                  <span>{customJoinUrl ? 'Changer l’URL du QR code' : 'Personnaliser l’URL du QR code'}</span>
                </button>
              </div>
            )}

            {isLocalhost && !customJoinUrl && (
              <div className="mt-3 rounded-xl border border-ochre/40 bg-amber-500/10 p-2.5 text-xs text-ochre leading-tight">
                💡 <strong>Sur localhost :</strong> Pour que les smartphones scannent sur leur 4G/WiFi, lancez{' '}
                <code>start-portal-public.bat</code> ou renseignez l'URL ci-dessus.
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-soft">
                <Users className="h-4 w-4 text-blue" />
                <span>Participants en direct</span>
              </span>
              <span className="flex items-center gap-1.5 font-display text-3xl font-extrabold text-ink">
                <Count value={Math.max(participantsList.length, state?.participants ?? 0)} />
              </span>
            </div>

            {participantsList.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-line/60">
                <div className="flex items-center justify-between text-xs text-soft mb-2 font-mono">
                  <span>Connectés en direct :</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Temps réel
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {participantsList.map((p) => (
                    <span
                      key={p.id || p.device_id}
                      className="inline-flex items-center gap-1 rounded-md bg-paper px-2 py-0.5 text-xs font-mono font-bold text-ink border border-line shadow-xs"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{p.pseudo}</span>
                      {p.missions_completed > 0 && (
                        <span className="text-[10px] text-blue font-bold ml-0.5">({p.missions_completed})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SpotlightCard>

        {/* Right Dashboard: The 4 Security Gates & Activity feeds */}
        <div className="space-y-6">
          {/* Section: The 4 Defense Gates Funnel */}
          <SpotlightCard className="p-6 border border-line bg-card/90 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold font-display text-ink">
                  {state?.total ? (
                    <>
                      <Count value={blocked} /> {blocked > 1 ? 'attaques stoppées' : 'attaque stoppée'} sur{' '}
                      <Count value={state.total} /> requêtes
                    </>
                  ) : (
                    'En attente des premières attaques de la salle...'
                  )}
                </h2>
                <p className="text-xs text-soft mt-0.5">
                  Parcours séquentiel des 4 barrières de défense appliquées par n8n
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-soft bg-paper px-3 py-1 rounded-full border border-line">
                Pipeline n8n actif
              </span>
            </div>

            <ol className="mt-6 grid gap-3 sm:grid-cols-4">
              {GATES.map((gate, i) => {
                const isLast = i === GATES.length - 1;
                const value = isLast ? counts.accepte : stoppedAt[i];
                const Icon = GATE_ICONS[i] || ShieldCheck;

                return (
                  <li
                    key={gate.id}
                    className={`relative rounded-2xl border-2 p-4.5 transition-all duration-300 ${
                      isLast
                        ? 'border-green bg-emerald-500/[0.04] shadow-sm shadow-green/10'
                        : value > 0
                        ? i === 2
                          ? 'border-ochre/60 bg-amber-500/[0.03]'
                          : 'border-red/60 bg-red/[0.03]'
                        : 'border-line/70 bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-ink">{gate.name}</p>
                      <Icon
                        className={`h-4 w-4 ${
                          isLast ? 'text-green' : value > 0 ? (i === 2 ? 'text-ochre' : 'text-red') : 'text-soft/60'
                        }`}
                      />
                    </div>

                    <p
                      className={`mt-2 font-display text-5xl font-extrabold leading-none ${
                        isLast
                          ? 'text-green'
                          : value
                          ? i === 2
                            ? 'text-ochre'
                            : 'text-red'
                          : 'text-line'
                      }`}
                    >
                      <Count value={value} />
                    </p>

                    <p className="mt-2 text-xs text-soft font-medium">
                      {isLast
                        ? 'demandes acceptées'
                        : i === 2
                        ? `${counts.doublon} doublon${counts.doublon > 1 ? 's' : ''}, ${counts.limite} rate-limit`
                        : value > 1
                        ? 'attaques bloquées'
                        : 'attaque bloquée'}
                    </p>

                    {!isLast && (
                      <span
                        className="absolute -right-3.5 top-1/2 hidden -translate-y-1/2 text-2xl font-light text-soft/40 sm:block"
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </SpotlightCard>

          {/* 2 Wide Columns: Live Attacks stream & Slack Decision Stream */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 1. Live Attacks stream */}
            <SpotlightCard className="p-5 border border-line bg-card/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-extrabold font-display text-ink flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-blue" />
                    <span>Attaques en direct</span>
                  </h3>
                  <span className="flex h-2.5 w-2.5 rounded-full bg-blue animate-ping" />
                </div>

                {state?.events?.length ? (
                  <ul className="divide-y divide-line/60">
                    {state.events.slice(0, 10).map((e, i) => {
                      const attackKey = e.id || `${e.at}-${i}`;
                      const isExpanded = expandedAttack === attackKey;
                      return (
                        <li key={attackKey} className="py-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-ink">{e.pseudo}</span>
                              <span className="block truncate text-xs text-soft font-mono">
                                {missionTitle(e.mission)}
                              </span>
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <Stamp outcome={e.outcome} small />
                              {(e.payload || e.response_data) && (
                                <button
                                  onClick={() => setExpandedAttack(isExpanded ? null : attackKey)}
                                  className="text-soft hover:text-ink p-1"
                                  title="Détails techniques"
                                >
                                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </button>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-2 rounded-lg bg-paper p-2.5 text-[11px] font-mono border border-line space-y-1.5">
                              {e.payload && (
                                <div>
                                  <span className="font-bold text-soft block">Payload envoyé :</span>
                                  <pre className="text-blue overflow-x-auto">{JSON.stringify(e.payload, null, 2)}</pre>
                                </div>
                              )}
                              {e.response_data && (
                                <div>
                                  <span className="font-bold text-soft block">Réponse n8n :</span>
                                  <pre className="text-green overflow-x-auto">{JSON.stringify(e.response_data, null, 2)}</pre>
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-soft italic text-center py-8">
                    Les tentatives de la salle apparaîtront ici en temps réel.
                  </p>
                )}
              </div>
            </SpotlightCard>

            {/* 2. Tickets & Slack Decisions stream */}
            <SpotlightCard className="p-5 border border-line bg-card/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-extrabold font-display text-ink">Workflow n8n & Slack</h3>
                  <span className="text-[11px] font-mono font-bold text-soft bg-paper px-2 py-0.5 rounded border border-line">
                    Human-in-the-Loop
                  </span>
                </div>

                {state?.tickets?.length ? (
                  <ul className="divide-y divide-line/60">
                    {state.tickets.slice(0, 8).map((t) => {
                      const isWaiting = !t.approval_status || t.status === 'awaiting_human';
                      return (
                        <li key={t.ticket_id} className="py-2.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-sm font-bold text-ink truncate">
                              {INTENT_LABEL[t.intent] || t.intent || 'Demande client'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-blue/10 text-blue border border-blue/20">
                              IA n8n
                            </span>
                          </div>
                          <p className="text-[11px] text-soft font-mono mt-0.5">{t.ticket_id}</p>
                          <p
                            className={`mt-1 text-xs font-semibold ${
                              isWaiting
                                ? 'text-blue animate-pulse flex items-center gap-1'
                                : DECISION[t.approval_status]?.className || 'text-soft'
                            }`}
                          >
                            {isWaiting
                              ? '⏳ En attente validation Slack'
                              : DECISION[t.approval_status]?.text || 'Traité'}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-soft italic text-center py-8">
                    Les tickets transmis à Slack apparaîtront ici.
                  </p>
                )}
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </main>
  );
}
