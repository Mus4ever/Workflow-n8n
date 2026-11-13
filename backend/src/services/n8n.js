import crypto from 'crypto';

const N8N_INSTANCE_URL = process.env.N8N_INSTANCE_URL || 'https://mustrain.app.n8n.cloud';
const N8N_SALLE_WEBHOOK = process.env.N8N_SALLE_WEBHOOK || '/webhook/salle';
const N8N_STATE_WEBHOOK = process.env.N8N_STATE_WEBHOOK || '/webhook/salle-etat';

/**
 * Forward request directly to n8n salle webhook
 */
export async function forwardToN8n(body) {
  const url = `${N8N_INSTANCE_URL}${N8N_SALLE_WEBHOOK}`;
  const started = performance.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    const duration_ms = Math.round(performance.now() - started);

    return {
      ok: res.ok,
      status: res.status,
      duration_ms,
      data,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      duration_ms: Math.round(performance.now() - started),
      data: { message: `Erreur de connexion à n8n: ${err.message}` },
    };
  }
}

/**
 * Fetch state directly from n8n salle-etat webhook
 */
export async function fetchN8nState(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${N8N_INSTANCE_URL}${N8N_STATE_WEBHOOK}${query ? '?' + query : ''}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

