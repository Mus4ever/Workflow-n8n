import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vsbcjedkiapmgkvnytvz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    })
  : null;

export const DEFAULT_SESSION_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Log attack in Supabase
 */
export async function recordAttack({
  sessionId = DEFAULT_SESSION_ID,
  deviceId,
  pseudo,
  missionId,
  mode,
  httpStatus,
  outcome,
  ticketId,
  durationMs,
  payload,
  responseData,
}) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('attacks').insert({
      session_id: sessionId,
      device_id: deviceId,
      pseudo,
      mission_id: missionId,
      mode: mode || 'signed',
      http_status: httpStatus,
      outcome,
      ticket_id: ticketId || null,
      duration_ms: durationMs || 0,
      payload: payload || {},
      response_data: responseData || {},
    }).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Backend Supabase] recordAttack error:', err.message);
    return null;
  }
}

/**
 * Record vote in Supabase
 */
export async function recordVote({ sessionId = DEFAULT_SESSION_ID, deviceId, pseudo, choice }) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('votes').upsert(
      {
        session_id: sessionId,
        device_id: deviceId,
        pseudo,
        choice,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'device_id,session_id' }
    ).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Backend Supabase] recordVote error:', err.message);
    return null;
  }
}

/**
 * Register or update participant in Supabase
 */
export async function recordParticipant({
  sessionId = DEFAULT_SESSION_ID,
  deviceId,
  pseudo,
  missionsCompleted = 0,
}) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('participants')
      .upsert(
        {
          session_id: sessionId,
          device_id: deviceId,
          pseudo,
          missions_completed: missionsCompleted,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'device_id,session_id' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Backend Supabase] recordParticipant error:', err.message);
    return null;
  }
}

