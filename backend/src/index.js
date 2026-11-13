import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { forwardToN8n, fetchN8nState } from './services/n8n.js';
import { supabase, recordAttack, recordVote, recordParticipant, DEFAULT_SESSION_ID, isConfigured } from './services/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabaseConnected: isConfigured,
  });
});

// 2. Participant Attacks route (Missions)
app.post('/api/attacks', async (req, res) => {
  const { device, pseudo, mission, mode = 'signed', payload } = req.body;

  // Forward to n8n workflow
  const n8nResult = await forwardToN8n({
    action: 'send',
    device,
    pseudo,
    mission,
    mode,
    payload,
  });

  const reply = n8nResult.data || {};
  const httpStatus = n8nResult.status || (n8nResult.ok ? 202 : 400);
  const outcome = reply.outcome || (n8nResult.ok ? 'accepte' : 'erreur');
  const ticketId = reply.data?.ticket_id || null;

  // Log to Supabase Realtime in parallel
  if (isConfigured) {
    recordAttack({
      sessionId: DEFAULT_SESSION_ID,
      deviceId: device,
      pseudo,
      missionId: mission,
      mode,
      httpStatus,
      outcome,
      ticketId,
      durationMs: n8nResult.duration_ms,
      payload,
      responseData: reply,
    }).catch(() => {});
  }

  res.status(n8nResult.ok ? 200 : httpStatus || 500).json({
    ...reply,
    ms: n8nResult.duration_ms,
  });
});

// 2b. Register or Sync Participant (called when user enters their name)
app.post('/api/participants', async (req, res) => {
  const { device_id, pseudo, missions_completed = 0 } = req.body;
  if (!device_id || !pseudo) {
    return res.status(400).json({ error: 'device_id et pseudo sont obligatoires' });
  }

  const participant = await recordParticipant({
    deviceId: device_id,
    pseudo: String(pseudo).trim(),
    missionsCompleted: Number(missions_completed) || 0,
  });

  res.json({ success: true, participant });
});

// 3. Participant Vote route
app.post('/api/votes', async (req, res) => {
  const { device, pseudo, choice } = req.body;

  // Forward to n8n
  const n8nResult = await forwardToN8n({
    action: 'vote',
    device,
    pseudo,
    choice,
  });

  // Log to Supabase Realtime
  if (isConfigured) {
    recordVote({
      sessionId: DEFAULT_SESSION_ID,
      deviceId: device,
      pseudo,
      choice,
    }).catch(() => {});
  }

  res.json(n8nResult.data || { ok: true, voted: choice });
});

// 4. Session & State Route (used by Admin and Scene)
app.get('/api/session', async (req, res) => {
  const { since = 0, voteSince = 0, ticket } = req.query;
  const params = { since: String(since), voteSince: String(voteSince) };
  if (ticket) params.ticket = String(ticket);

  // Fallback to n8n state
  const state = await fetchN8nState(params);
  if (state) {
    return res.json(state);
  }

  res.status(503).json({ error: 'Passerelle n8n temporairement inaccessible' });
});

// 5. Admin Control: Open/Close Poll
app.post('/api/admin/poll', async (req, res) => {
  const { open = true, question = 'Approuver ou Refuser ?' } = req.body;

  if (isConfigured) {
    await supabase
      .from('workshop_sessions')
      .update({ poll_open: open, poll_question: question })
      .eq('id', DEFAULT_SESSION_ID);
  }

  res.json({ success: true, poll_open: open, poll_question: question });
});

// 6. Admin Control: Fetch detailed attack history
app.get('/api/admin/attacks', async (req, res) => {
  if (!isConfigured) {
    return res.json({ attacks: [], message: 'Supabase non configuré' });
  }

  const { data, error } = await supabase
    .from('attacks')
    .select('*')
    .eq('session_id', DEFAULT_SESSION_ID)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ attacks: data });
});

// 7. Admin Control: Fetch participants list
app.get('/api/admin/participants', async (req, res) => {
  if (!isConfigured) {
    return res.json({ participants: [] });
  }

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('session_id', DEFAULT_SESSION_ID)
    .order('last_seen_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ participants: data });
});

app.listen(PORT, () => {
  console.log(`[Backend] Serveur Algeria 2.0 actif sur le port ${PORT}`);
  console.log(`[Backend] Connexion Supabase : ${isConfigured ? 'Active (Realtime ON)' : 'En attente de clés'}`);
});
