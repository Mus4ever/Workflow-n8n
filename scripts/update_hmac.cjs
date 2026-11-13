const https = require('https');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjQyZjE3YS1hZjRkLTRjYTAtYWRhYy05OGMzYzEzZDM4YTMiLCJpc3MiOiJuOG4iLCJqdGkiOiIzNjYxODc3MS03Y2ZiLTQ1ZjItODZkMi1mNGM3YzNkNzllNGEiLCJpYXQiOjE3OTQ1NzQzMTUsImF1ZCI6Im1jcC1zZXJ2ZXItYXBpIn0.et0yBdKVm_p_EsC_oMqp6CNmX5f2gEZZtSZq4dJcpJc';

function callTool(name, args={}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name, arguments: args }
    });

    const req = https.request('https://mustrain.app.n8n.cloud/mcp-server/http', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const lines = d.split('\n');
        for (const l of lines) {
          if (l.startsWith('data: ')) {
            try {
              resolve(JSON.parse(l.slice(6)));
            } catch(e) { resolve(l); }
          }
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const jsCode = `const item = $input.first().json;
const headers = item.headers || {};

const refuse = (statusCode, error, message, details) => [{
  json: {
    valid: false,
    accepted: false,
    row_status: '',
    statusCode,
    response: { success: false, error, message, details: details || [] }
  }
}];

function sha256(ascii) {
  function rightRotate(v, a) { return (v >>> a) | (v << (32 - a)); }
  const mathPow = Math.pow, maxWord = mathPow(2, 32);
  let i, j, result = '';
  const words = [];
  const asciiBitLength = ascii.length * 8;
  let hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
    }
  }
  ascii += '\\x80';
  while (ascii.length % 64 - 56) ascii += '\\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i % 4) * 8);
  }
  words[words.length] = ((asciiBitLength / maxWord) | 0);
  words[words.length] = (asciiBitLength) | 0;
  for (j = 0; j < words.length;) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0, a, hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

function hmacSha256(message, key) {
  const blockSize = 64;
  if (key.length > blockSize) {
    key = sha256(key);
    let hex = '';
    for(let i=0; i<key.length; i+=2) hex += String.fromCharCode(parseInt(key.substr(i,2), 16));
    key = hex;
  }
  while (key.length < blockSize) key += '\\x00';
  let oKeyPad = '', iKeyPad = '';
  for (let i = 0; i < blockSize; i++) {
    oKeyPad += String.fromCharCode(key.charCodeAt(i) ^ 0x5c);
    iKeyPad += String.fromCharCode(key.charCodeAt(i) ^ 0x36);
  }
  const innerHex = sha256(iKeyPad + message);
  let inner = '';
  for (let i = 0; i < innerHex.length; i += 2) inner += String.fromCharCode(parseInt(innerHex.substr(i, 2), 16));
  return sha256(oKeyPad + inner);
}

// 1) Securite : comparaison de la signature en temps constant
const received = String(headers['x-signature'] || '');

let rawText = '';
try {
  const rawBuf = await this.helpers.getBinaryDataBuffer(0, 'data');
  rawText = rawBuf.toString('utf8');
} catch (e) {
  rawText = JSON.stringify(item.body || {});
}

const computedWithMus = 'sha256=' + hmacSha256(rawText, 'mus');
const expectedCred = 'sha256=' + String(item.computedSignature || '');

function matchSig(target, cand) {
  if (!cand || cand === 'sha256=') return false;
  let diff = target.length ^ cand.length;
  for (let i = 0; i < cand.length; i++) {
    diff |= (target.charCodeAt(i) || 0) ^ cand.charCodeAt(i);
  }
  return diff === 0;
}

const isSigOk = matchSig(received, computedWithMus) || matchSig(received, expectedCred);

if (!isSigOk) {
  return refuse(401, 'UNAUTHORIZED', 'Signature HMAC-SHA256 invalide ou absente (en-tete x-signature).');
}

// 2) Validation stricte : types, champs obligatoires, tailles maximales
const body = (item.body && typeof item.body === 'object' && !Array.isArray(item.body)) ? item.body : null;
if (!body) {
  return refuse(400, 'INVALID_BODY', 'Le corps de la requete doit etre un objet JSON.');
}
const customer = (body.customer && typeof body.customer === 'object' && !Array.isArray(body.customer)) ? body.customer : {};
const text = (v) => (typeof v === 'string' || typeof v === 'number') ? String(v).trim() : '';
const oneLine = (s) => Array.from(s).map((c) => (c.charCodeAt(0) < 32 ? ' ' : c)).join('');

const name = oneLine(text(customer.name));
const email = text(customer.email).toLowerCase();
const message = text(body.message);
const requestId = oneLine(text(body.request_id));

const errors = [];
if (!name) errors.push('customer.name est obligatoire');
else if (name.length > 120) errors.push('customer.name depasse 120 caracteres');
if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}$/.test(email) || email.length > 254) errors.push('customer.email est invalide');
if (!message) errors.push('message est obligatoire');
else if (message.length > 5000) errors.push('message depasse 5000 caracteres');
if (requestId.length > 100) errors.push('request_id depasse 100 caracteres');
if (errors.length > 0) {
  return refuse(400, 'VALIDATION_FAILED', 'Donnees invalides ou incompletes.', errors);
}

// 3) Normalisation + masquage des donnees personnelles avant envoi a l IA
const safe_message = message
  .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}/g, '[EMAIL]')
  .replace(/https?:[/][/][^ ]+/g, '[URL]')
  .replace(/[+]?[0-9][0-9 ().-]{7,}[0-9]/g, '[TELEPHONE]')
  .slice(0, 800);

return [{ json: {
  valid: true,
  idempotency_key: requestId ? ('rid:' + requestId) : ('msg:' + email + '|' + message.slice(0, 200)),
  has_request_id: Boolean(requestId),
  ticket: {
    ticket_id: 'SUP-' + $now.toFormat('yyyyMMdd') + '-' + $execution.id,
    created_at: $now.toISO(),
    customer_name: name,
    customer_email: email,
    customer_phone: oneLine(text(customer.phone)).slice(0, 40),
    message,
    safe_message,
    category: oneLine(text(body.category)).slice(0, 60) || 'general',
    language: oneLine(text(body.language)).slice(0, 10) || 'fr',
    order_id: oneLine(text(body.order_id)).slice(0, 60),
    product_id: Math.min(100000, Math.max(1, parseInt(body.product_id, 10) || 1))
  }
} }];`;

async function run() {
  console.log('Updating node "Vérifier et valider la demande"...');
  const res = await callTool('update_workflow', {
    workflowId: 'EISwM0hAnHDlXPVF',
    versionName: 'Support mus secret',
    versionDescription: 'Added support for secret mus in HMAC validation',
    operations: [
      {
        type: 'updateNodeParameters',
        nodeName: 'Vérifier et valider la demande',
        parameters: {
          jsCode: jsCode
        }
      }
    ]
  });
  console.log('Update result:', JSON.stringify(res, null, 2));

  console.log('Publishing workflow...');
  const pub = await callTool('publish_workflow', { workflowId: 'EISwM0hAnHDlXPVF' });
  console.log('Publish result:', JSON.stringify(pub, null, 2));
}

run();

