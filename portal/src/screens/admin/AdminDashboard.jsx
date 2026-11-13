import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Vote as VoteIcon,
  RotateCcw,
  Sparkles,
  Download,
  Settings,
  Tv,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Database,
  Search,
  Bot,
  Zap,
} from 'lucide-react';
import SpotlightCard from '../../components/reactbits/SpotlightCard';
import ShinyButton from '../../components/reactbits/ShinyButton';
import Stamp from '../../components/Stamp';
import {
  isSupabaseConfigured,
  setSupabaseCredentials,
  subscribeToRealtime,
  SUPABASE_URL,
  DEFAULT_SESSION_ID,
  supabase,
} from '../../lib/supabase';
import { GATES, MISSIONS } from '../../lib/missions';

export default function AdminDashboard({ onSwitchToScene, onSwitchToParticipant }) {
  const [activeTab, setActiveTab] = useState('attacks'); // 'attacks' | 'participants' | 'tickets' | 'settings'
  const [realtimeConnected, setRealtimeConnected] = useState(isSupabaseConfigured());
  const [attacks, setAttacks] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [pollOpen, setPollOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAttack, setExpandedAttack] = useState(null);

  // Settings modal
  const [sbUrl, setSbUrl] = useState(SUPABASE_URL || '');
  const [sbKey, setSbKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Fallback stats from n8n
  const [n8nState, setN8nState] = useState(null);

  // 1. Initial Data Fetch via Supabase
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured() && supabase) {
        const { data: dbAttacks } = await supabase
          .from('attacks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (dbAttacks) setAttacks(dbAttacks);

        const { data: dbParticipants } = await supabase
          .from('participants')
          .select('*')
          .order('last_seen_at', { ascending: false });
        if (dbParticipants) setParticipants(dbParticipants);

        const { data: dbSession } = await supabase
          .from('workshop_sessions')
          .select('*')
          .eq('id', DEFAULT_SESSION_ID)
          .single();
        if (dbSession) setPollOpen(dbSession.poll_open);
      }
    }

    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  // 2. Realtime WebSocket Subscriptions via Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const unsubscribe = subscribeToRealtime({
      onAttack: (newAttack) => {
        setAttacks((prev) => [newAttack, ...prev.slice(0, 99)]);
      },
      onVote: () => {},
      onSession: (updatedSession) => {
        setPollOpen(updatedSession.poll_open);
      },
      onTicket: (ticketUpdate) => {
        setTickets((prev) => {
          const index = prev.findIndex((t) => t.ticket_id === ticketUpdate.ticket_id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = ticketUpdate;
            return next;
          }
          return [ticketUpdate, ...prev];
        });
      },
    });

    return unsubscribe;
  }, []);

  const totalAttacks = attacks.length || n8nState?.total || 0;
  const blockedAttacks = attacks.filter((a) => a.outcome !== 'accepte').length ||
    (n8nState?.counts?.signature + n8nState?.counts?.donnees + n8nState?.counts?.doublon + n8nState?.counts?.limite) || 0;
  const activeParticipantsCount = participants.length || n8nState?.participants || 0;

  const filteredAttacks = attacks.filter(
    (a) =>
      a.pseudo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.mission_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.outcome?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePoll = async () => {
    const nextState = !pollOpen;
    setPollOpen(nextState);
    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('workshop_sessions')
        .update({ poll_open: nextState })
        .eq('id', DEFAULT_SESSION_ID);
    }
  };

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(attacks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `algeria20-workshop-attacks-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue selection:text-white pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/20 text-blue border border-blue/40">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                  Console Administrateur
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    realtimeConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <Database className="h-3 w-3" />
                  <span>{realtimeConnected ? 'Supabase Realtime Actif' : 'Mode n8n Direct'}</span>
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-white font-display">
                Centre de Commande Workshop
              </h1>
            </div>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Config Supabase</span>
            </button>

            {onSwitchToScene && (
              <button
                onClick={onSwitchToScene}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue/40 bg-blue/15 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-blue/25 transition-colors"
              >
                <Tv className="h-3.5 w-3.5" />
                <span>Écran Scène (Projecteur)</span>
              </button>
            )}

            {onSwitchToParticipant && (
              <button
                onClick={onSwitchToParticipant}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Tester comme participant</span>
              </button>
            )}

            <button
              onClick={exportLogs}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exporter Logs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Supabase Config Drawer */}
      {showSettings && (
        <div className="border-b border-slate-800 bg-slate-900/90 p-6 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              <span>Connexion Base de Données Supabase (Temps Réel)</span>
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Renseignez les clés de votre projet Supabase pour activer la synchronisation bidirectionnelle par WebSockets entre l'admin et tous les téléphones.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1" htmlFor="sb-url">
                  Supabase Project URL :
                </label>
                <input
                  id="sb-url"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:border-blue focus:outline-none"
                  placeholder="https://xyzcompany.supabase.co"
                  value={sbUrl}
                  onChange={(e) => setSbUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1" htmlFor="sb-key">
                  Supabase Anon Public Key :
                </label>
                <input
                  id="sb-key"
                  type="password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:border-blue focus:outline-none"
                  placeholder="eyJhbGciOiJIUzI1Ni..."
                  value={sbKey}
                  onChange={(e) => setSbKey(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="rounded-lg bg-blue px-4 py-1.5 text-xs font-bold text-white hover:bg-blue/90"
                onClick={() => setSupabaseCredentials(sbUrl, sbKey)}
              >
                Enregistrer & Activer Realtime
              </button>
              <button
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white"
                onClick={() => setShowSettings(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Dashboard */}
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid gap-4 sm:grid-cols-4">
          <SpotlightCard className="p-5 border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Participants Actifs</span>
              <Users className="h-4 w-4 text-blue" />
            </div>
            <p className="mt-2 font-display text-4xl font-extrabold text-white">
              {activeParticipantsCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">Connectés sur smartphone</p>
          </SpotlightCard>

          <SpotlightCard className="p-5 border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Attaques</span>
              <Zap className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="mt-2 font-display text-4xl font-extrabold text-cyan-300">
              {totalAttacks}
            </p>
            <p className="mt-1 text-xs text-slate-500">Toutes missions confondues</p>
          </SpotlightCard>

          <SpotlightCard className="p-5 border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attaques Neutralisées</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 font-display text-4xl font-extrabold text-emerald-400">
              {blockedAttacks}
            </p>
            <p className="mt-1 text-xs text-emerald-500/80 font-mono">
              {totalAttacks > 0 ? Math.round((blockedAttacks / totalAttacks) * 100) : 0}% de taux de défense
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-5 border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Contrôle du Vote</span>
              <VoteIcon className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-sm font-bold ${pollOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                {pollOpen ? '🟢 Scrutin Ouvert' : '⚪ Scrutin Fermé'}
              </span>
              <button
                onClick={togglePoll}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                  pollOpen
                    ? 'bg-red/20 text-red border border-red/40 hover:bg-red/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {pollOpen ? 'Clôturer' : 'Ouvrir'}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Diffuse l'ordre de vote à la salle</p>
          </SpotlightCard>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('attacks')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'attacks' ? 'border-blue text-blue' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Journal des Attaques ({attacks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'participants' ? 'border-blue text-blue' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Participants ({participants.length || activeParticipantsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'tickets' ? 'border-blue text-blue' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Tickets & Décisions Slack ({tickets.length})</span>
          </button>
        </div>

        {/* Tab 1: Detailed Attacks Stream */}
        {activeTab === 'attacks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue focus:outline-none"
                  placeholder="Rechercher par pseudo, mission, ou issue (accepte, doublon...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {filteredAttacks.length} attaque(s) affichée(s)
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-mono text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Heure</th>
                      <th className="py-3 px-4">Participant</th>
                      <th className="py-3 px-4">Mission d’attaque</th>
                      <th className="py-3 px-4">Verdict HTTP</th>
                      <th className="py-3 px-4">Résultat</th>
                      <th className="py-3 px-4 text-right">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredAttacks.length > 0 ? (
                      filteredAttacks.map((att) => {
                        const isExpanded = expandedAttack === att.id;
                        return (
                          <React.Fragment key={att.id}>
                            <tr className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 font-mono text-slate-500">
                                {new Date(att.created_at).toLocaleTimeString('fr-FR')}
                              </td>
                              <td className="py-3 px-4 font-bold text-white">
                                {att.pseudo}
                              </td>
                              <td className="py-3 px-4 text-slate-300">
                                <span className="font-mono text-cyan-400 mr-1.5">[{att.mission_id}]</span>
                                {MISSIONS.find((m) => m.id === att.mission_id)?.title || att.mission_id}
                              </td>
                              <td className="py-3 px-4 font-mono">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    att.http_status === 202
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : att.http_status === 200
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-red/20 text-red'
                                  }`}
                                >
                                  {att.http_status || 200}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <Stamp outcome={att.outcome} small />
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => setExpandedAttack(isExpanded ? null : att.id)}
                                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                                >
                                  <span>{isExpanded ? 'Masquer' : 'Payload'}</span>
                                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-slate-950/80">
                                <td colSpan="6" className="p-4 border-t border-slate-800">
                                  <div className="grid gap-3 sm:grid-cols-2 text-xs font-mono">
                                    <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
                                      <span className="text-slate-400 font-bold block mb-1">Payload JSON envoyé :</span>
                                      <pre className="text-cyan-300 overflow-x-auto text-[11px]">
                                        {JSON.stringify(att.payload || {}, null, 2)}
                                      </pre>
                                    </div>
                                    <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
                                      <span className="text-slate-400 font-bold block mb-1">Réponse du Workflow n8n :</span>
                                      <pre className="text-emerald-300 overflow-x-auto text-[11px]">
                                        {JSON.stringify(att.response_data || {}, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-500 italic">
                          Aucune attaque enregistrée pour l'instant. Les tentatives apparaîtront en temps réel.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Participants List */}
        {activeTab === 'participants' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue" />
              <span>Liste des participants connectés ({participants.length})</span>
            </h3>

            {participants.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {participants.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-base">{p.pseudo}</span>
                      <span className="text-[10px] font-mono bg-blue/10 text-cyan-400 px-2 py-0.5 rounded">
                        Agent actif
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 font-mono truncate">
                      Device ID: {p.device_id}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Missions validées :</span>
                      <span className="font-bold text-emerald-400 font-mono">{p.missions_completed} / {MISSIONS.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic text-center py-8">
                Les participants apparaîtront dès qu'ils saisiront leur pseudo sur mobile.
              </p>
            )}
          </div>
        )}

        {/* Tab 3: Tickets & Slack Human-in-the-Loop */}
        {activeTab === 'tickets' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="h-5 w-5 text-cyan-400" />
                <span>Tickets n8n & Arbitrage Slack Human-in-the-Loop</span>
              </h3>
              <span className="text-xs text-slate-400">
                Synchronisé avec n8n Data Tables
              </span>
            </div>

            {tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((t) => {
                  const isWaiting = !t.approval_status || t.status === 'awaiting_human';
                  return (
                    <div
                      key={t.ticket_id}
                      className={`rounded-xl border p-4 transition-all ${
                        isWaiting
                          ? 'border-blue/50 bg-blue/[0.04] shadow-md shadow-blue/5'
                          : t.approval_status === 'APPROVED'
                          ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                          : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-400">{t.ticket_id}</span>
                            <span className="text-xs font-bold text-white">[{t.intent || 'support'}]</span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                t.analysis_source === 'regles'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-blue/20 text-cyan-400'
                              }`}
                            >
                              {t.analysis_source === 'regles' ? 'Secours' : 'IA Classifiée'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            <strong>Motifs de révision :</strong> {t.review_reasons || 'Aucun'}
                          </p>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              isWaiting
                                ? 'bg-blue/20 text-cyan-300 animate-pulse border border-blue/40'
                                : t.approval_status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-red/20 text-red border border-red/40'
                            }`}
                          >
                            {isWaiting
                              ? '⏳ En attente validation Slack'
                              : t.approval_status === 'APPROVED'
                              ? '✓ Approuvé par un humain'
                              : '✕ Refusé par un humain'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic text-center py-8">
                Aucun ticket traité pour le moment.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

