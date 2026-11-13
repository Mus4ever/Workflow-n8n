import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Clock, CheckCircle2, AlertTriangle, Zap, ShieldAlert, Trash2 } from 'lucide-react';

export default function RoomFeed({ feed, onClearFeed }) {
  if (feed.length === 0) return null;

  const getStatusBadge = (code) => {
    switch (code) {
      case 202:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 200:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 429:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 401:
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 400:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <section className="py-12 border-t border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Flux d'Activité en Direct de la Salle ({feed.length})
            </h3>
          </div>

          <button
            onClick={onClearFeed}
            className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Effacer</span>
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {feed.map((entry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(entry.status)}`}>
                    HTTP {entry.status}
                  </span>
                  <span className="font-semibold text-white font-sans truncate max-w-[140px] sm:max-w-xs">
                    {entry.name}
                  </span>
                  <span className="text-zinc-500 text-[11px] hidden sm:inline">
                    ({entry.category})
                  </span>
                </div>

                <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
                  {entry.ticket && (
                    <span className="text-indigo-400 hidden sm:inline">{entry.ticket}</span>
                  )}
                  <span className="text-emerald-400 font-semibold">{entry.latency} ms</span>
                  <span className="text-zinc-600">{entry.time}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

