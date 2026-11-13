import { createClient } from '@supabase/supabase-js';
import { load, save } from './storage.js';

// Default credentials provided for Algeria 2.0 Workshop
const DEFAULT_SUPABASE_URL = 'https://vsbcjedkiapmgkvnytvz.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_EGLvmsOUISS1xxXRzXAKSg_-3l48aJQ';

// Get Supabase credentials from Vite environment, localStorage override, or default
const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_KEY;

const storedUrl = load('supabase_url', '');
const storedKey = load('supabase_anon_key', '');

export const SUPABASE_URL = storedUrl.trim() || envUrl.trim() || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = storedKey.trim() || envKey.trim() || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export const DEFAULT_SESSION_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Save manual Supabase credentials from the Admin Dashboard
 */
export function setSupabaseCredentials(url, key) {
  save('supabase_url', url.trim());
  save('supabase_anon_key', key.trim());
  window.location.reload();
}

/**
 * Register or update an active participant
 */
export async function syncParticipant({ device_id, pseudo, missions_completed = 0 }) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('participants')
      .upsert(
        {
          device_id,
          pseudo,
          missions_completed,
          session_id: DEFAULT_SESSION_ID,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'device_id,session_id' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] syncParticipant failed:', err.message);
    return null;
  }
}

/**
 * Record an attack into Supabase Realtime
 */
export async function logAttackToSupabase({
  device_id,
  pseudo,
  mission_id,
  mode,
  http_status,
  outcome,
  ticket_id,
  duration_ms,
  payload,
  response_data,
}) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('attacks').insert({
      session_id: DEFAULT_SESSION_ID,
      device_id,
      pseudo,
      mission_id,
      mode: mode || 'signed',
      http_status: Number(http_status) || 200,
      outcome,
      ticket_id: ticket_id || null,
      duration_ms: duration_ms || 0,
      payload: payload || {},
      response_data: response_data || {},
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] logAttack failed:', err.message);
    return null;
  }
}

/**
 * Record an audience vote into Supabase Realtime
 */
export async function logVoteToSupabase({ device_id, pseudo, choice }) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('votes').upsert(
      {
        session_id: DEFAULT_SESSION_ID,
        device_id,
        pseudo,
        choice,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'device_id,session_id' }
    );
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] logVote failed:', err.message);
    return null;
  }
}

/**
 * Fetch all registered participants from Supabase
 */
export async function fetchParticipants() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', DEFAULT_SESSION_ID)
      .order('last_seen_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase] fetchParticipants error:', err.message);
    return [];
  }
}

/**
 * Fetch initial counts and events from Supabase
 */
export async function fetchInitialStats() {
  if (!supabase) return null;
  try {
    const { data: attacks, error } = await supabase
      .from('attacks')
      .select('*')
      .eq('session_id', DEFAULT_SESSION_ID)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;

    const counts = { accepte: 0, doublon: 0, donnees: 0, signature: 0, limite: 0, erreur: 0 };
    (attacks || []).forEach((a) => {
      const o = a.outcome || 'erreur';
      if (o in counts) counts[o] = (counts[o] || 0) + 1;
    });

    const events = (attacks || []).map((a) => ({
      at: new Date(a.created_at).getTime(),
      pseudo: a.pseudo,
      mission: a.mission_id,
      outcome: a.outcome,
      http_status: a.http_status,
      payload: a.payload,
      response_data: a.response_data,
      id: a.id,
    }));

    return {
      total: (attacks || []).length,
      counts,
      events,
    };
  } catch (err) {
    console.warn('[Supabase] fetchInitialStats error:', err.message);
    return null;
  }
}

/**
 * Realtime Subscriptions helper
 */
export function subscribeToRealtime({ onAttack, onVote, onSession, onTicket, onParticipant }) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('workshop-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'attacks' },
      (payload) => onAttack && onAttack(payload.new)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'participants' },
      (payload) => onParticipant && onParticipant(payload.new || payload.old)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'votes' },
      (payload) => onVote && onVote(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'workshop_sessions' },
      (payload) => onSession && onSession(payload.new)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tickets' },
      (payload) => onTicket && onTicket(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

