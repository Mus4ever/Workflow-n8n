import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Zap, AlertTriangle, XCircle, 
  ShieldAlert, Clock, X, Copy, Check, ChevronDown 
} from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';
import CountUp from './reactbits/CountUp';
import DecryptedText from './reactbits/DecryptedText';

export default function TerminalResult({ result, currentChallenge, onClose }) {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getStatusBadge = (code) => {
    switch (code) {
      case 202:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          label: '202 Accepted',
          style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
        };
      case 200:
        return {
          icon: <Zap className="w-4 h-4 text-cyan-400" />,
          label: '200 Duplicate',
          style: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40',
        };
      case 429:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-purple-400" />,
          label: '429 Rate Limit',
          style: 'bg-purple-500/10 text-purple-300 border-purple-500/40',
        };
      case 401:
        return {
          icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
          label: '401 Unauthorized',
          style: 'bg-red-500/10 text-red-300 border-red-500/40',
        };
      case 400:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          label: '400 Bad Request',
          style: 'bg-amber-500/10 text-amber-300 border-amber-500/40',
        };
      default:
        return {
          icon: <XCircle className="w-4 h-4 text-red-400" />,
          label: `HTTP ${code || 'Error'}`,
          style: 'bg-red-500/10 text-red-300 border-red-500/40',
        };
    }
  };

  const badge = getStatusBadge(result.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <SpotlightCard
        spotlightColor="rgba(239, 68, 68, 0.15)"
        className="p-5 shadow-2xl space-y-4"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 ${badge.style}`}>
              {badge.icon}
              <span>{badge.label}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {/* React Bits: CountUp component for latency */}
              <CountUp to={result.latency} duration={0.8} suffix=" ms" className="font-bold text-white" />
              {result.latency < 50 && result.status === 202 && (
                <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 bg-emerald-500/10 rounded">
                  &lt; 50ms (Asynchrone)
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Human Explanation */}
        <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-light">
          {result.status === 202 && (
            <div>
              <span className="font-bold text-emerald-400 block mb-1">
                ✔ Requête signée & validée : libération immédiate du client en {result.latency} ms.
              </span>
              <p className="text-zinc-400 text-xs">
                L'appelant est acquitté instantanément. Le workflow n8n poursuit en tâche de fond : 
                enrichissement API DummyJSON, masquage PII par regex, analyse IA LangChain et écriture Google Sheets.
              </p>
              {result.data?.ticket_id && (
                <div className="mt-2 text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 inline-block">
                  Ticket ID : <DecryptedText text={result.data.ticket_id} animateOn="view" speed={25} className="font-bold text-white" />
                </div>
              )}
            </div>
          )}

          {result.status === 200 && (
            <div>
              <span className="font-bold text-cyan-400 block mb-1">
                ✔ Doublon détecté par le nœud d'idempotence (Mémoire 24h).
              </span>
              <p className="text-zinc-400 text-xs">
                L'empreinte de la requête a été reconnue. Acquitté sans recalculer l'IA ni réécrire dans Google Sheets.
                Économie de tokens et protection de la cohérence de vos données.
              </p>
            </div>
          )}

          {result.status === 429 && (
            <div>
              <span className="font-bold text-purple-400 block mb-1">
                ✔ Seuil anti-DDoS atteint : 6ème tir bloqué (Rate Limit).
              </span>
              <p className="text-zinc-400 text-xs">
                Protection contre les tirs en rafale et la saturation des workers n8n.
                La passerelle préserve vos quotas d'API et la disponibilité pour les autres clients.
              </p>
            </div>
          )}

          {result.status === 401 && (
            <div>
              <span className="font-bold text-red-400 block mb-1">
                ✖ Rejeté en 01d : Signature cryptographique absente ou falsifiée.
              </span>
              <p className="text-zinc-400 text-xs">
                La sécurité Zero-Trust s'est refermée net. Aucun nœud métier ni appel LLM n'a été déclenché.
              </p>
            </div>
          )}

          {result.status === 400 && (
            <div>
              <span className="font-bold text-amber-400 block mb-1">
                ✖ Rejeté en 02 : Format de données invalide (nom ou email non conforme).
              </span>
              <p className="text-zinc-400 text-xs">
                Validation par regex avant traitement : la requête corrompue est rejetée sans gaspillage de ressources IA.
              </p>
            </div>
          )}

          {result.status === 0 && (
            <div>
              <span className="font-bold text-red-400 block mb-1">
                ✖ Erreur de connexion réseau ou d'URL.
              </span>
              <p className="text-zinc-400 text-xs">
                Vérifiez votre connexion Internet et l'URL du Webhook dans les paramètres.
              </p>
            </div>
          )}
        </div>

        {/* Proved Pillar */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <span className="text-zinc-500">Règle de production validée :</span>
          <span className="text-emerald-400 font-bold">
            {currentChallenge.checklistPillar}
          </span>
        </div>

        {/* Raw JSON toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1"
          >
            <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${showJson ? 'rotate-180' : ''}`} />
            <span>{showJson ? 'Masquer' : 'Voir'} la réponse brute JSON</span>
          </button>

          {showJson && (
            <div className="mt-2 relative">
              <button
                onClick={handleCopy}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </button>
              <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

      </SpotlightCard>
    </motion.div>
  );
}
