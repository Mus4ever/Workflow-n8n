import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Key, Globe, Shield, Check } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) {
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || '');
  const [hmacSecret, setHmacSecret] = useState(config.hmacSecret || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig({
      webhookUrl: webhookUrl.trim(),
      hmacSecret: hmacSecret.trim()
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-red-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Paramètres de Connexion
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 font-mono mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              URL Webhook n8n Cloud
            </label>
            <input
              type="url"
              required
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://mustrain.app.n8n.cloud/webhook/customer-support-intake"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-red-500 transition"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-mono mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Secret partagé HMAC-SHA256
            </label>
            <input
              type="text"
              value={hmacSecret}
              onChange={(e) => setHmacSecret(e.target.value)}
              placeholder="Secret crypto configuré dans n8n..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500 transition"
            />
            <p className="mt-1 text-[11px] text-zinc-500 font-light">
              Credential <code>Lead Webhook HMAC Secret</code> du nœud <code>01b - Compute HMAC</code>.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Enregistré avec succès !</span>
              </>
            ) : (
              <span>Enregistrer la configuration</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

