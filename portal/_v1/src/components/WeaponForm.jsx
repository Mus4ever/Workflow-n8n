import React from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Repeat, Flame, Shield, Lock, 
  Terminal, Sparkles, AlertCircle, RefreshCw 
} from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';
import Magnet from './reactbits/Magnet';
import StarBorder from './reactbits/StarBorder';
import DecryptedText from './reactbits/DecryptedText';

export default function WeaponForm({
  form,
  setField,
  currentChallenge,
  hmacMode,
  setHmacMode,
  forceAiFail,
  setForceAiFail,
  loading,
  onSend,
  onDoubleShot,
  onSpamFlood,
  reqId,
  hmacSecret,
  onOpenSettings
}) {
  return (
    <SpotlightCard
      spotlightColor="rgba(239, 68, 68, 0.12)"
      className="p-6 shadow-2xl space-y-5"
    >
      {/* Header with Request ID */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Console d'Injection de Requête
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
          ID: <DecryptedText text={reqId} animateOn="hover" speed={20} />
        </span>
      </div>

      {/* Target mission instruction banner */}
      <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-3">
        <div className="p-1.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs leading-relaxed">
          <div className="font-bold text-white mb-0.5">
            Mission active : {currentChallenge.title}
          </div>
          <p className="text-zinc-400 font-light">
            {currentChallenge.instruction}
          </p>
          <div className="mt-2 text-[11px] font-mono text-emerald-400 font-semibold">
            ✔ {currentChallenge.checklistPillar}
          </div>
        </div>
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">
            Nom du client
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Nom du client (ou vide pour 400)"
            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/80 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">
            Email du client
          </label>
          <input
            type="text"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="email@entreprise.dz (ou faux pour 400)"
            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/80 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">
            Téléphone (PII)
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="+213 551 23 45 67"
            className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/80 transition font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">
            Catégorie
          </label>
          <select
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
            className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-red-500/80 transition font-mono"
          >
            <option value="Général">Général</option>
            <option value="Support Technique">Support Technique</option>
            <option value="Livraison">Livraison</option>
            <option value="Litige Financier">Litige Financier</option>
            <option value="Information Produit">Information Produit</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">
            ID Produit (API)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={form.product_id}
            onChange={(e) => setField('product_id', e.target.value)}
            className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-red-500/80 transition"
          />
        </div>
      </div>

      {/* Message textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-zinc-400 font-mono">
            Message du client (Analysé par l'IA et filtré PII)
          </label>
          <span className="text-[10px] font-mono text-zinc-500">
            {form.message.length} car.
          </span>
        </div>
        <textarea
          rows="3"
          value={form.message}
          onChange={(e) => setField('message', e.target.value)}
          placeholder="Rédigez votre demande ou tentez une injection..."
          className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-red-500/80 transition font-mono leading-relaxed resize-none"
        />
      </div>

      {/* Security & Fallback settings strip */}
      <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        
        {/* HMAC mode */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-zinc-400 font-mono text-[11px] flex items-center gap-1">
            <Lock className="w-3 h-3 text-zinc-500" />
            Signature HMAC :
          </span>
          {['valid', 'invalid', 'none'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setHmacMode(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                hmacMode === mode
                  ? mode === 'valid'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'text-zinc-500 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {mode === 'valid' ? 'Valide' : mode === 'invalid' ? 'Falsifiée (401)' : 'Absente (401)'}
            </button>
          ))}
          {!hmacSecret && (
            <button
              onClick={onOpenSettings}
              className="text-[11px] text-red-400 underline underline-offset-2 ml-1"
            >
              Clé
            </button>
          )}
        </div>

        {/* AI Failure toggle */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-mono text-[11px]">Panne IA :</span>
          <button
            type="button"
            onClick={() => setForceAiFail(!forceAiFail)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
              forceAiFail
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-zinc-500 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {forceAiFail ? 'Coupée (09c Fallback)' : 'Active (OpenRouter)'}
          </button>
        </div>

      </div>

      {/* Action buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        {currentChallenge.type === 'double' ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onDoubleShot}
            disabled={loading}
            className="w-full flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Repeat className="w-4 h-4" />}
            <span>Envoyer 2 requêtes en rafale (Test 200 Duplicate)</span>
          </motion.button>
        ) : currentChallenge.type === 'spam' ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onSpamFlood}
            disabled={loading}
            className="w-full flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
            <span>Lancer la rafale de 6 tirs (Test 429 Rate Limit)</span>
          </motion.button>
        ) : (
          <Magnet strength={0.2} className="w-full flex-1">
            <StarBorder
              as="button"
              onClick={onSend}
              disabled={loading}
              color="#EF4444"
              className="w-full cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span className="font-mono text-xs text-white">Traitement en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-xs text-white">Envoyer la requête vers le workflow n8n</span>
                </>
              )}
            </StarBorder>
          </Magnet>
        )}

        {/* Quick alternative buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onDoubleShot}
            disabled={loading}
            className="flex-1 sm:flex-initial px-4 py-3 bg-zinc-950 hover:bg-zinc-800 text-cyan-400 border border-cyan-800/40 rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5"
            title="Tester le double envoi consécutif"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>2x Envoi</span>
          </button>

          <button
            type="button"
            onClick={onSpamFlood}
            disabled={loading}
            className="flex-1 sm:flex-initial px-4 py-3 bg-zinc-950 hover:bg-zinc-800 text-purple-400 border border-purple-800/40 rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5"
            title="Tester le seuil anti-DDoS"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Spam 6x</span>
          </button>
        </div>
      </div>

    </SpotlightCard>
  );
}
