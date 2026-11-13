import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { CHALLENGES } from './utils/challenges';
import { fireWebhook, resetRateLimit } from './utils/api';

import Hero from './components/Hero';
import TimelineActs from './components/TimelineActs';
import ChallengeSelector from './components/ChallengeSelector';
import WeaponForm from './components/WeaponForm';
import TerminalResult from './components/TerminalResult';
import SlackVoteSection from './components/SlackVoteSection';
import FallbackSection from './components/FallbackSection';
import ChecklistSection from './components/ChecklistSection';
import RoomFeed from './components/RoomFeed';
import QrModal from './components/QrModal';
import SettingsModal from './components/SettingsModal';
import IntroSplash from './components/IntroSplash';

import ShinyText from './components/reactbits/ShinyText';
import Magnet from './components/reactbits/Magnet';
import AnimatedTabs from './components/reactbits/AnimatedTabs';

import { QrCode, Settings, ShieldCheck, Terminal, Award, Flame, Radio, CheckSquare, Play } from 'lucide-react';
import './index.css';

export default function App() {
  /* ─── cinematic intro splash (5-7s) ─── */
  const [showIntro, setShowIntro] = useState(true);

  /* ─── config ─── */
  const [config, setConfig] = useState(() => {
    try {
      const s = localStorage.getItem('alg20_cfg');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  const webhookUrl = config.webhookUrl || 'https://mustrain.app.n8n.cloud/webhook/customer-support-intake';
  const hmacSecret = config.hmacSecret || '';

  useEffect(() => {
    try { localStorage.setItem('alg20_cfg', JSON.stringify(config)); } catch {}
  }, [config]);

  /* ─── form & challenge state ─── */
  const [activeChallengeId, setActiveChallengeId] = useState(CHALLENGES[0].id);
  const currentChallenge = CHALLENGES.find(c => c.id === activeChallengeId) || CHALLENGES[0];

  const [form, setForm] = useState({
    name: CHALLENGES[0].prefill.name,
    email: CHALLENGES[0].prefill.email,
    phone: CHALLENGES[0].prefill.phone,
    category: CHALLENGES[0].prefill.category,
    language: CHALLENGES[0].prefill.language || 'fr',
    product_id: CHALLENGES[0].prefill.product_id || 1,
    order_id: CHALLENGES[0].prefill.order_id || '',
    message: CHALLENGES[0].prefill.message,
  });

  const [hmacMode, setHmacMode] = useState('valid');
  const [forceAiFail, setForceAiFail] = useState(false);
  const reqIdRef = useRef('REQ-' + Math.floor(100000 + Math.random() * 900000));

  /* ─── results, feed & attempted checklist ─── */
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [feed, setFeed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('alg20_feed') || '[]'); } catch { return []; }
  });
  const [attempted, setAttempted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('alg20_att') || '[]'); } catch { return []; }
  });

  /* ─── navigation tab ─── */
  const [activeNavTab, setActiveNavTab] = useState('defi');

  useEffect(() => {
    try {
      localStorage.setItem('alg20_feed', JSON.stringify(feed.slice(0, 60)));
      localStorage.setItem('alg20_att', JSON.stringify(attempted));
    } catch {}
  }, [feed, attempted]);

  /* ─── QR code & modals ─── */
  const [showQr, setShowQr] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const roomUrl = typeof window !== 'undefined' ? window.location.origin : 'https://algeria20-n8n.app';

  useEffect(() => {
    if (roomUrl) {
      QRCode.toDataURL(roomUrl, {
        width: 320,
        margin: 1,
        color: { dark: '#FFFFFF', light: '#09090B' }
      }).then(setQrUrl).catch(() => {});
    }
  }, [roomUrl]);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  /* ─── select challenge ─── */
  const handleSelectChallenge = (ch) => {
    setActiveChallengeId(ch.id);
    setForm({ ...ch.prefill });
    setHmacMode(ch.hmac);
    setResult(null);
    reqIdRef.current = 'REQ-' + Math.floor(100000 + Math.random() * 900000);
    
    // Smooth scroll down to the form
    document.getElementById('form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* ─── execute standard send ─── */
  const handleSend = async () => {
    setLoading(true);
    setResult(null);

    const payload = {
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
      },
      category: form.category,
      language: form.language,
      message: form.message,
      product_id: Number(form.product_id) || 1,
      order_id: form.order_id,
      request_id: reqIdRef.current,
      source: 'algeria20-portal',
    };

    const res = await fireWebhook(webhookUrl, payload, hmacSecret, hmacMode, forceAiFail);
    setResult(res);
    setLoading(false);

    if (activeChallengeId && !attempted.includes(activeChallengeId)) {
      setAttempted(prev => [...prev, activeChallengeId]);
    }

    setFeed(prev => [{
      name: payload.customer.name || 'Anonyme',
      category: payload.category,
      status: res.status,
      latency: res.latency,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ticket: res.data?.ticket_id || null,
    }, ...prev.slice(0, 59)]);

    if (res.status === 202) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.75 }, colors: ['#EF4444', '#10B981', '#38BDF8'] });
    }

    reqIdRef.current = 'REQ-' + Math.floor(100000 + Math.random() * 900000);
  };

  /* ─── double shot (Test Idempotence) ─── */
  const handleDoubleShot = async () => {
    setLoading(true);
    setResult(null);
    const fixedId = 'REQ-' + Math.floor(100000 + Math.random() * 900000);
    reqIdRef.current = fixedId;

    const payload = {
      customer: { name: form.name, email: form.email, phone: form.phone },
      category: form.category,
      language: form.language,
      message: form.message,
      product_id: Number(form.product_id) || 1,
      order_id: form.order_id || 'CMD-DUP',
      request_id: fixedId,
      source: 'algeria20-portal',
    };

    await fireWebhook(webhookUrl, payload, hmacSecret, hmacMode, forceAiFail);

    setTimeout(async () => {
      const res2 = await fireWebhook(webhookUrl, payload, hmacSecret, hmacMode, forceAiFail);
      setResult(res2);
      setLoading(false);

      if (!attempted.includes('duplicate')) {
        setAttempted(prev => [...prev, 'duplicate']);
      }

      setFeed(prev => [{
        name: payload.customer.name + ' (Doublon)',
        category: payload.category,
        status: res2.status,
        latency: res2.latency,
        time: new Date().toLocaleTimeString('fr-FR'),
        ticket: res2.data?.ticket_id || null,
      }, ...prev.slice(0, 59)]);
    }, 450);
  };

  /* ─── flood attack (Test 429 Rate Limit) ─── */
  const handleSpamFlood = async () => {
    resetRateLimit();
    setLoading(true);
    setResult(null);
    let lastRes = null;

    for (let i = 1; i <= 6; i++) {
      const floodPayload = {
        customer: { name: `Spam #${i}`, email: 'spam@flood.net', phone: '' },
        category: 'Général',
        language: 'en',
        message: `Attaque Flood #${i} pour tester le seuil anti-DDoS`,
        product_id: 1,
        order_id: `SPAM-${i}`,
        request_id: `SPAM-${Date.now()}-${i}`,
        source: 'algeria20-portal',
      };

      lastRes = await fireWebhook(webhookUrl, floodPayload, hmacSecret, hmacMode, forceAiFail);

      setFeed(prev => [{
        name: `Bot Spammeur (#${i})`,
        category: 'Spam Attack',
        status: lastRes.status,
        latency: lastRes.latency,
        time: new Date().toLocaleTimeString('fr-FR'),
        ticket: null,
      }, ...prev.slice(0, 59)]);

      if (lastRes.status === 429) {
        break;
      }
    }

    setResult(lastRes);
    setLoading(false);
    if (!attempted.includes('spam_rate_limit')) {
      setAttempted(prev => [...prev, 'spam_rate_limit']);
    }
  };

  const handleScrollToArena = () => {
    document.getElementById('arena-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTriggerFallbackTest = () => {
    setForceAiFail(true);
    setForm(prev => ({
      ...prev,
      category: 'Support Technique',
      message: 'Panne critique : notre système de paiement ne répond plus. Veuillez intervenir d\'urgence.'
    }));
    document.getElementById('form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const navTabs = [
    { id: 'defi', label: 'Le Défi', icon: <Flame className="w-3.5 h-3.5 text-red-400" /> },
    { 
      id: 'checklist', 
      label: 'Checklist', 
      icon: <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />,
      badge: `${attempted.length}/${CHALLENGES.length}` 
    },
    { id: 'feed', label: 'Activité', icon: <Radio className="w-3.5 h-3.5 text-cyan-400" /> }
  ];

  const handleNavChange = (id) => {
    setActiveNavTab(id);
    if (id === 'defi') {
      document.getElementById('arena-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'checklist') {
      document.getElementById('checklist-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'feed') {
      document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 font-sans selection:bg-red-500 selection:text-white">
      
      {/* ─── 0. CINEMATIC INTRO SPLASH PRESENTATION (5-6s) ─── */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <IntroSplash onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* ─── STICKY NAVBAR with React Bits AnimatedTabs & ShinyText ─── */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
              <ShinyText text="Algeria 2.0" className="font-extrabold" />
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-500/10 text-red-400 border border-red-500/20 hidden sm:inline">
              Live Challenge
            </span>
          </div>

          {/* React Bits: AnimatedTabs */}
          <div className="hidden md:block">
            <AnimatedTabs
              tabs={navTabs}
              activeTab={activeNavTab}
              onChange={handleNavChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <Magnet strength={0.2}>
              <button
                onClick={() => setShowIntro(true)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition border border-transparent hover:border-zinc-800"
                title="Revoir l'animation d'introduction"
              >
                <Play className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400" />
              </button>
            </Magnet>

            <Magnet strength={0.2}>
              <button
                onClick={() => setShowQr(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 border border-zinc-800 transition"
                title="Afficher le QR code pour la salle"
              >
                <QrCode className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">QR Salle</span>
              </button>
            </Magnet>

            <Magnet strength={0.2}>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition border border-transparent hover:border-zinc-800"
                title="Paramètres webhook n8n"
              >
                <Settings className="w-4 h-4" />
              </button>
            </Magnet>
          </div>

        </div>
      </header>

      {/* ─── 1. HERO (with SplitText, BlurText, ShinyText, Magnet, StarBorder & Particles) ─── */}
      <Hero
        onOpenQr={() => setShowQr(true)}
        onScrollToArena={handleScrollToArena}
      />

      {/* ─── 2. TIMELINE ACTS (GSAP ScrollTrigger + React Bits SpotlightCard & DecryptedText) ─── */}
      <TimelineActs />

      {/* ─── 3. INTERACTIVE ARENA (with SpotlightCards & DecryptedText) ─── */}
      <section id="arena-section" className="py-16 border-t border-zinc-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red-400 font-semibold mb-2">
              Acte 2 · Le Défi
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              L'Arène d'Attaque
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl font-light">
              Sélectionnez une mission ci-dessous, puis déclenchez l'attaque vers le workflow n8n en direct.
            </p>
          </div>

          {/* Missions selector (React Bits SpotlightCards) */}
          <ChallengeSelector
            challenges={CHALLENGES}
            activeChallengeId={activeChallengeId}
            attempted={attempted}
            onSelectChallenge={handleSelectChallenge}
          />

          {/* Form & Terminal (React Bits SpotlightCard, StarBorder, CountUp) */}
          <div id="form-card" className="space-y-6 pt-4">
            <WeaponForm
              form={form}
              setField={setField}
              currentChallenge={currentChallenge}
              hmacMode={hmacMode}
              setHmacMode={setHmacMode}
              forceAiFail={forceAiFail}
              setForceAiFail={setForceAiFail}
              loading={loading}
              onSend={handleSend}
              onDoubleShot={handleDoubleShot}
              onSpamFlood={handleSpamFlood}
              reqId={reqIdRef.current}
              hmacSecret={hmacSecret}
              onOpenSettings={() => setShowSettings(true)}
            />

            {/* Terminal response */}
            {result && (
              <TerminalResult
                result={result}
                currentChallenge={currentChallenge}
                onClose={() => setResult(null)}
              />
            )}
          </div>

        </div>
      </section>

      {/* ─── 4. ACTE 3: SLACK SUPERVISION (with SpotlightCard, Magnet & CountUp) ─── */}
      <SlackVoteSection />

      {/* ─── 5. ACTE 4: FALLBACK CRASH TEST (with SpotlightCard & Magnet) ─── */}
      <FallbackSection onTriggerFallbackTest={handleTriggerFallbackTest} />

      {/* ─── 6. CHECKLIST PRODUCTION-READY (with SpotlightCard, CountUp & Magnet) ─── */}
      <div id="checklist-section">
        <ChecklistSection attempted={attempted} />
      </div>

      {/* ─── 7. LIVE ROOM FEED (with Framer Motion live stream) ─── */}
      <div id="feed-section">
        <RoomFeed
          feed={feed}
          onClearFeed={() => {
            setFeed([]);
            localStorage.removeItem('alg20_feed');
          }}
        />
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-zinc-800/80 py-8 px-4 sm:px-6 text-xs text-zinc-500 bg-zinc-950">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-zinc-300">Algeria 2.0</span> · Masterclass Industrialisation de Processus Métier n8n
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <a href="https://mustrain.app.n8n.cloud" target="_blank" rel="noreferrer" className="hover:text-red-400 transition">
              mustrain.app.n8n.cloud
            </a>
            <a href="/CHECKLIST-production-ready.md" download className="hover:text-white transition">
              Checklist (.MD)
            </a>
          </div>
        </div>
      </footer>

      {/* ─── MODALS ─── */}
      <QrModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        qrUrl={qrUrl}
        roomUrl={roomUrl}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onSaveConfig={setConfig}
      />

    </div>
  );
}
