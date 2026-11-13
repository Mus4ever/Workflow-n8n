const https = require('https');

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const startTime = Date.now();
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          latency: Date.now() - startTime
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('  VERIFICATION SYSTEME & WORKFLOW - ALGERIA 2.0');
  console.log('====================================================\n');

  const vercelUrl = 'https://nimble-cyclone-suwml6q.tmp.now';
  const n8nWebhookUrl = 'https://mustrain.app.n8n.cloud/webhook/customer-support-intake';

  let passCount = 0;
  let failCount = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
      failCount++;
    }
  }

  // --- TEST 1: VERCEL SITE HTML ---
  console.log('1. Verification du site deployee sur Vercel:');
  try {
    const resHtml = await fetchUrl(vercelUrl);
    assert(resHtml.status === 200, 'Page d\'accueil Vercel HTTP 200 OK', `${resHtml.latency}ms`);
    assert(resHtml.data.includes('id="root"'), 'Element racine React #root present');
    assert(resHtml.data.includes('Algeria 2.0') || resHtml.data.includes('portal'), 'Contenu HTML detecte');

    // Extract JS and CSS bundle paths
    const jsMatches = [...resHtml.data.matchAll(/src="(\/assets\/[^"]+\.js)"/g)].map(m => m[1]);
    const cssMatches = [...resHtml.data.matchAll(/href="(\/assets\/[^"]+\.css)"/g)].map(m => m[1]);

    for (const js of jsMatches) {
      const jsRes = await fetchUrl(vercelUrl + js);
      assert(jsRes.status === 200, `Bundle JS Charge: ${js}`, `${jsRes.data.length} bytes, ${jsRes.latency}ms`);
    }

    for (const css of cssMatches) {
      const cssRes = await fetchUrl(vercelUrl + css);
      assert(cssRes.status === 200, `Style CSS Charge: ${css}`, `${cssRes.data.length} bytes, ${cssRes.latency}ms`);
    }
  } catch (err) {
    assert(false, 'Connexion au site Vercel', err.message);
  }

  console.log('\n2. Verification du Webhook n8n Cloud (Backend):');
  // --- TEST 2: CORS OPTIONS ---
  try {
    const corsRes = await fetchUrl(n8nWebhookUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': vercelUrl,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-signature'
      }
    });
    const allowOrigin = corsRes.headers['access-control-allow-origin'];
    assert(corsRes.status === 200 || corsRes.status === 204, 'CORS Preflight OPTIONS', `Status: ${corsRes.status}`);
    assert(allowOrigin === '*' || allowOrigin === vercelUrl, 'En-tete Access-Control-Allow-Origin autorise', allowOrigin);
  } catch (err) {
    assert(false, 'CORS Preflight', err.message);
  }

  // --- TEST 3: REAL TICKET INTAKE (Acte 1) ---
  console.log('\n3. Test Ticket Reel (Acte 1 - Client Nominal):');
  const nominalPayload = {
    customer: {
      name: 'Mohamed Benali (Test Verification)',
      email: 'mohamed.benali.test@gmail.com',
      phone: '+213 555 12 34 56'
    },
    category: 'Livraison',
    language: 'fr',
    message: 'Bonjour, je souhaite suivre l\'etat d\'acheminement de ma commande passee hier. Merci pour votre aide rapide.',
    product_id: 1,
    order_id: 'CMD-ALG-2026-99',
    request_id: 'REQ-VERIF-' + Date.now(),
    source: 'algeria20-portal'
  };

  try {
    const postRes = await fetchUrl(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nominalPayload)
    });

    let bodyData = {};
    try { bodyData = JSON.parse(postRes.data); } catch {}

    assert(postRes.status === 202, 'Code de reponse 202 Accepted (Fast Ingestion < 50ms target)', `Status: ${postRes.status}, Latency: ${postRes.latency}ms`);
    assert(bodyData.success === true, 'Payload contient success: true', JSON.stringify(bodyData));
    assert(!!bodyData.ticket_id, 'Ticket ID genere avec succes', `Ticket: ${bodyData.ticket_id}`);
    assert(bodyData.duplicate === false, 'Non-duplique detecte (duplicate: false)');
  } catch (err) {
    assert(false, 'Envoi Ticket Nominal', err.message);
  }

  // --- TEST 4: IDEMPOTENCE / REPLAY ATTACK (Acte 2 - Doublon) ---
  console.log('\n4. Test Attaque Doublon / Idempotence (Acte 2):');
  const duplicateReqId = 'REQ-DUP-' + Math.floor(Math.random() * 1000000);
  const dupPayload = {
    customer: { name: 'Amine Duplicate', email: 'amine.dup@test.dz', phone: '' },
    category: 'Général',
    language: 'fr',
    message: 'Test de double envoi simultane pour verifier l\'idempotence',
    product_id: 1,
    order_id: 'CMD-DUP',
    request_id: duplicateReqId,
    source: 'algeria20-portal'
  };

  try {
    // 1st call
    const firstRes = await fetchUrl(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dupPayload)
    });
    
    // 2nd call with identical request_id
    const secondRes = await fetchUrl(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dupPayload)
    });

    let secondData = {};
    try { secondData = JSON.parse(secondRes.data); } catch {}

    assert(secondRes.status === 200 || secondRes.status === 202, 'Reponse au doublon recue', `Status: ${secondRes.status}`);
    const isIdempotent = secondData.duplicate === true || secondData.message?.includes('duplicate') || secondData.status === 'duplicate';
    assert(isIdempotent, 'Detection automatique du doublon par le workflow n8n', JSON.stringify(secondData));
  } catch (err) {
    assert(false, 'Test Doublon', err.message);
  }

  // --- SUMMARY ---
  console.log('\n====================================================');
  console.log(`  BILAN DES TESTS : ${passCount} REUSSIS, ${failCount} ECHECS`);
  console.log('====================================================');
  if (failCount === 0) {
    console.log('>>> TOUS LES TESTS SONT AU VERT : LE SYSTEME EST 100% OPERATIONNEL ! <<<');
  }
}

runTests().catch(console.error);

