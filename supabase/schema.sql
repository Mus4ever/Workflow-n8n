-- =============================================================================
-- ALGERIA 2.0 WORKSHOP - SCHEMA DE BASE DE DONNÉES SUPABASE (REALTIME)
-- =============================================================================
-- Ce script SQL initialise l'ensemble des tables, contraintes, index,
-- politiques de sécurité (RLS) et active la réplication temps réel (Realtime)
-- pour synchroniser instantanément l'admin et tous les participants du workshop.
-- =============================================================================

-- 1. Nettoyage préliminaire (optionnel en cas de réinitialisation)
-- DROP TABLE IF EXISTS votes CASCADE;
-- DROP TABLE IF EXISTS attacks CASCADE;
-- DROP TABLE IF EXISTS tickets CASCADE;
-- DROP TABLE IF EXISTS participants CASCADE;
-- DROP TABLE IF EXISTS workshop_sessions CASCADE;

-- 2. Table des Sessions du Workshop
CREATE TABLE IF NOT EXISTS workshop_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Session Algeria 2.0',
    is_active BOOLEAN NOT NULL DEFAULT true,
    poll_open BOOLEAN NOT NULL DEFAULT false,
    poll_question TEXT NOT NULL DEFAULT 'Faut-il approuver le remboursement de 500 000 DA ?',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insertion de la session initiale si vide
INSERT INTO workshop_sessions (id, name, is_active, poll_open)
VALUES ('00000000-0000-0000-0000-000000000001', 'Atelier Live n8n Production', true, false)
ON CONFLICT (id) DO NOTHING;

-- 3. Table des Participants
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    device_id TEXT NOT NULL,
    pseudo TEXT NOT NULL,
    missions_completed INT NOT NULL DEFAULT 0,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_participant_device_session UNIQUE (device_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_session ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_last_seen ON participants(last_seen_at DESC);

-- 4. Table des Attaques / Tests en direct
CREATE TABLE IF NOT EXISTS attacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    device_id TEXT,
    pseudo TEXT NOT NULL,
    mission_id TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'signed',
    http_status INT NOT NULL,
    outcome TEXT NOT NULL, -- 'accepte', 'signature', 'donnees', 'doublon', 'limite', 'erreur'
    ticket_id TEXT,
    duration_ms INT DEFAULT 0,
    payload JSONB,
    response_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_attacks_session ON attacks(session_id);
CREATE INDEX IF NOT EXISTS idx_attacks_created_at ON attacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attacks_outcome ON attacks(outcome);

-- 5. Table des Votes de la salle
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    device_id TEXT NOT NULL,
    pseudo TEXT NOT NULL,
    choice TEXT NOT NULL, -- 'approve' | 'reject'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_vote_device_session UNIQUE (device_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_session ON votes(session_id);

-- 6. Table des Tickets Support & Escalade Slack
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    ticket_id TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    message TEXT,
    intent TEXT,
    priority TEXT,
    review_reasons TEXT,
    approval_status TEXT, -- 'AUTO_APPROVED', 'APPROVED', 'REJECTED', ''
    analysis_source TEXT DEFAULT 'ia', -- 'ia' | 'regles'
    status TEXT DEFAULT 'processing', -- 'processing', 'awaiting_human', 'processed'
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- 7. Activer Row Level Security (RLS) avec accès public en lecture/écriture pour l'atelier
ALTER TABLE workshop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE attacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Politiques RLS permissives (Public / Anon pour l'atelier sans friction d'auth)
DROP POLICY IF EXISTS "Public can read sessions" ON workshop_sessions;
CREATE POLICY "Public can read sessions" ON workshop_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can update sessions" ON workshop_sessions;
CREATE POLICY "Public can update sessions" ON workshop_sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage participants" ON participants;
CREATE POLICY "Public can manage participants" ON participants FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage attacks" ON attacks;
CREATE POLICY "Public can manage attacks" ON attacks FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage votes" ON votes;
CREATE POLICY "Public can manage votes" ON votes FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage tickets" ON tickets;
CREATE POLICY "Public can manage tickets" ON tickets FOR ALL USING (true);

-- 8. Activation de Supabase Realtime pour la diffusion instantanée WebSockets
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE workshop_sessions, participants, attacks, votes, tickets;
COMMIT;

