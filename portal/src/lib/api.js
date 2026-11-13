import { N8N_WEBHOOK_URL, DEFAULT_SECRET } from '../config.js';
import { logAttackToSupabase, logVoteToSupabase } from './supabase.js';

/**
 * Calcul de la signature HMAC-SHA256 en utilisant l'API native Web Crypto du navigateur
 */
export async function hmacSha256(message, secret) {
  if (!secret) return '';
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Vérification de l'accessibilité du webhook n8n
 */
export async function checkN8nHealth() {
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ping: true }),
    });
    // 401 ou 200/202 prouve que le webhook n8n est actif et valide les signatures
    return res.status === 401 || res.status === 200 || res.status === 202;
  } catch {
    return false;
  }
}

/**
 * Envoie une demande directe au workflow n8n (support-intake-v2) et synchronise avec Supabase
 */
export async function sendRequest({ device, pseudo, mission, mode = 'signed', payload }) {
  const started = performance.now();
  const bodyText = JSON.stringify(payload);

  const headers = {
    'Content-Type': 'application/json',
  };

  if (mode === 'signed') {
    const sig = await hmacSha256(bodyText, DEFAULT_SECRET);
    headers['x-signature'] = `sha256=${sig}`;
  } else if (mode === 'tampered') {
    headers['x-signature'] = 'sha256=0000000000000000000000000000000000000000000000000000000000000000';
  } // mode 'unsigned' : pas d'en-tête x-signature

  let res;
  let data = {};
  let status = 0;

  try {
    res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: bodyText,
    });
    status = res.status;
    data = await res.json().catch(() => ({}));
  } catch (err) {
    status = 0;
    data = { message: 'Impossible de joindre le workflow n8n. Vérifiez votre connexion.' };
  }

  const duration_ms = Math.round(performance.now() - started);

  // Mappage de la réponse du workflow avec les portes de défense
  let outcome = 'erreur';
  if (status === 202 || (data && data.accepted)) {
    outcome = 'accepte';
  } else if (status === 401 || (data && data.error === 'UNAUTHORIZED')) {
    outcome = 'signature';
  } else if (status === 400 || (data && data.error === 'VALIDATION_FAILED')) {
    outcome = 'donnees';
  } else if (status === 200 && data && (data.duplicate || data.error === 'DUPLICATE')) {
    outcome = 'doublon';
  } else if (status === 429 || (data && data.error === 'RATE_LIMIT')) {
    outcome = 'limite';
  } else if (status === 200) {
    outcome = 'doublon';
  }

  const reply = {
    ok: status >= 200 && status < 300,
    status,
    outcome,
    data,
    ms: duration_ms,
  };

  // Synchronisation en direct avec Supabase pour la vue vidéoprojecteur / admin
  logAttackToSupabase({
    device_id: device,
    pseudo,
    mission_id: mission,
    mode,
    http_status: status,
    outcome,
    ticket_id: data?.ticket_id,
    duration_ms,
    payload,
    response_data: data,
  }).catch(() => {});

  return reply;
}

export async function sendVote({ device, pseudo, choice }) {
  logVoteToSupabase({
    device_id: device,
    pseudo,
    choice,
  }).catch(() => {});
  return { ok: true };
}

export async function fetchTicket(ticketId) {
  return null;
}
