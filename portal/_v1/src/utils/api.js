/**
 * Compute HMAC-SHA256 hex using browser's native SubtleCrypto.
 * Returns empty string if no secret provided.
 */
export async function hmac(message, secret) {
  if (!secret) return '';
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// In-memory sliding window for rate-limiting simulation (Anti-DDoS rule)
const requestTimestamps = [];
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15000;

export function checkClientRateLimit() {
  const now = Date.now();
  // Filter timestamps within the sliding window
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT_MAX) {
    return true; // Limit exceeded!
  }
  requestTimestamps.push(now);
  return false;
}

export function resetRateLimit() {
  requestTimestamps.length = 0;
}

/**
 * Send a request to the n8n webhook.
 * Returns { status, data, latency }.
 */
export async function fireWebhook(url, payload, secret, hmacMode = 'valid', forceAiFail = false) {
  // Check rate limit (Attack mission 3)
  if (checkClientRateLimit()) {
    return {
      status: 429,
      data: {
        success: false,
        error: "RATE_LIMIT_EXCEEDED",
        message: "Trop de requêtes ! 6ème appel bloqué par la protection anti-DDoS (max 5 requêtes par 15s).",
        retryAfter: 15,
        quota_preserved: true
      },
      latency: 14
    };
  }

  // If simulation of AI failure is toggled for Phase 4
  const finalPayload = { ...payload };
  if (forceAiFail) {
    finalPayload.force_ai_error = true;
  }

  const body = JSON.stringify(finalPayload);
  const headers = { 'Content-Type': 'application/json' };

  if (hmacMode === 'valid' && secret) {
    headers['x-signature'] = 'sha256=' + await hmac(body, secret);
  } else if (hmacMode === 'invalid') {
    headers['x-signature'] = 'sha256=tampered_invalid_hash_000000000000';
  }
  // hmacMode === 'none' → no header at all

  const t0 = performance.now();

  try {
    const res = await fetch(url, { method: 'POST', headers, body });
    const latency = Math.round(performance.now() - t0);
    let data;
    const text = await res.text();
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    // If AI was simulated as down, annotate the response
    if (forceAiFail && data) {
      data.fallback_used = true;
      data.ai_status = 'OFFLINE_SIMULATED';
      data.resolution = '09c - Rules Fallback déterministe activé avec succès';
    }

    return { status: res.status, data, latency };
  } catch (err) {
    return { 
      status: 0, 
      data: { error: err.message }, 
      latency: Math.round(performance.now() - t0) 
    };
  }
}
