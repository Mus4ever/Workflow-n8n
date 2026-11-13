import React, { useEffect, useMemo, useState } from 'react';
import { getDevice } from './lib/identity';
import { load, save } from './lib/storage';
import { MISSIONS } from './lib/missions';
import { syncParticipant } from './lib/supabase';
import Join from './screens/Join';
import Missions from './screens/Missions';
import Mission from './screens/Mission';
import Scene from './screens/Scene';
import HackerIntroLoader from './components/HackerIntroLoader';
import DynamicBackground from './components/reactbits/DynamicBackground';

function Participant() {
  const device = useMemo(getDevice, []);
  const [pseudo, setPseudo] = useState(() => load('salle_pseudo', ''));
  const [progress, setProgress] = useState(() => load('salle_progress', {}));
  const [missionId, setMissionId] = useState(null);

  // Sync with Supabase on mount if pseudo exists
  useEffect(() => {
    if (pseudo) {
      const completedCount = Object.values(progress).filter((p) => p.state === 'proved').length;
      syncParticipant({ device_id: device, pseudo, missions_completed: completedCount });
    }
  }, [pseudo, device]);

  if (!pseudo) {
    return (
      <Join
        onJoin={(name) => {
          setPseudo(name);
          save('salle_pseudo', name);
          syncParticipant({ device_id: device, pseudo: name, missions_completed: 0 });
        }}
      />
    );
  }

  const who = { device, pseudo };

  function report(id, state) {
    setProgress((current) => {
      const next = { ...current, [id]: { state } };
      save('salle_progress', next);
      const completedCount = Object.values(next).filter((p) => p.state === 'proved').length;
      syncParticipant({ device_id: device, pseudo, missions_completed: completedCount });
      return next;
    });
  }

  function open(id) {
    setMissionId(id);
    window.scrollTo(0, 0);
  }

  const index = MISSIONS.findIndex((m) => m.id === missionId);
  const nextMission = index >= 0 ? MISSIONS[index + 1] : null;

  return (
    <>
      {missionId ? (
        <Mission
          key={missionId}
          missionId={missionId}
          who={who}
          saved={progress[missionId]}
          onReport={report}
          onBack={() => setMissionId(null)}
          onNext={nextMission ? () => open(nextMission.id) : null}
        />
      ) : (
        <Missions pseudo={pseudo} progress={progress} onOpen={open} />
      )}

      {/* Clean Participant Footer without admin or scene links */}
      <footer className="text-center py-6 text-xs text-soft font-mono">
        <span>Atelier Sécurité n8n en Production • Cassez mon workflow</span>
      </footer>
    </>
  );
}

export default function App() {
  const getActiveView = () => {
    const params = new URLSearchParams(window.location.search);
    const vue = params.get('vue');
    const hash = window.location.hash;
    // Host / Admin view is accessed exclusively via ?vue=admin or #admin (or ?vue=scene / #scene)
    if (vue === 'admin' || hash === '#admin' || vue === 'scene' || hash === '#scene') {
      return 'admin';
    }
    return 'participant';
  };

  const [view, setView] = useState(getActiveView);

  // Hacker entrance loader: runs once on entry for 3.2 seconds
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return sessionStorage.getItem('seen_hacker_intro') !== 'true';
    } catch {
      return true;
    }
  });

  const handleCompleteIntro = () => {
    try {
      sessionStorage.setItem('seen_hacker_intro', 'true');
    } catch {
      // ignore
    }
    setShowIntro(false);
  };

  useEffect(() => {
    const handleHash = () => setView(getActiveView());
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, []);

  return (
    <div className="relative min-h-dvh antialiased text-ink font-sans selection:bg-blue selection:text-white">
      {/* Dynamic Background with interactive glow */}
      <DynamicBackground />

      {/* 3-Second Hacker Entrance Loader (Participant mode only) */}
      {showIntro && view === 'participant' && (
        <HackerIntroLoader onComplete={handleCompleteIntro} />
      )}

      {/* Dedicated View: Admin / Projector vs Participant */}
      {view === 'admin' ? <Scene /> : <Participant />}
    </div>
  );
}
