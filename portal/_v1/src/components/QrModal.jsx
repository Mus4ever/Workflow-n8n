import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Copy, Check } from 'lucide-react';
import TiltedCard from './reactbits/TiltedCard';
import Magnet from './reactbits/Magnet';

export default function QrModal({ isOpen, onClose, qrUrl, roomUrl }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-sm w-full p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-center space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Scanner pour Participer
              </h3>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-400 font-light">
            Ouvrez l'appareil photo de votre smartphone pour rejoindre le défi en direct dans la salle.
          </p>

          <TiltedCard maxTilt={12} scale={1.03} className="inline-block mx-auto cursor-pointer">
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl ring-1 ring-white/5">
              {qrUrl ? (
                <img src={qrUrl} alt="QR Code Atelier" className="w-56 h-56 mx-auto rounded-xl select-none pointer-events-none" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs font-mono text-zinc-500">
                  Génération...
                </div>
              )}
            </div>
          </TiltedCard>

          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[200px]">
              {roomUrl}
            </span>
            <Magnet strength={0.3}>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 transition flex items-center gap-1 border border-zinc-700/60"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </button>
            </Magnet>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
