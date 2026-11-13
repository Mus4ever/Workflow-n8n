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

async function verifyAll() {
  console.log('================================================================');
  console.log('   RAPPORT DE VERIFICATION TECHNIQUE - ALGERIA 2.0 WORKSHOP    ');
  console.log('================================================================\n');

  const vercelUrl = 'https://speedy-emerald-48faldn.tmp.now';
  const n8nWebhook = 'https://mustrain.app.n8n.cloud/webhook/customer-support-intake';
  
  const results = [];

  function record(category, testName, passed, details) {
    results.push({ category, testName, passed, details });
    const mark = passed ? '[OK]' : '[WARN]';
    console.log(`${mark} [${category}] ${testName} -> ${details}`);
  }

  // 1. FRONTEND DEPLOYMENT
  try {
    const htmlRes = await fetchUrl(vercelUrl);
    record('Vercel Deploy', 'Disponibilite URL publique', htmlRes.status === 200, `Status HTTP ${htmlRes.status} (${htmlRes.latency}ms)`);
    record('Vercel Deploy', 'Rendu Single Page Application', htmlRes.data.includes('id="root"'), 'Point de montage React present');
    record('Vercel Deploy', 'Presence du titre du Workshop', htmlRes.data.includes('Algeria 2.0') || htmlRes.data.includes('Casser'), 'Contenu HTML verifie');

    // Check JS & CSS chunks
    const jsMatches = [...htmlRes.data.matchAll(/src="(\/assets\/[^"]+\.js)"/g)].map(m => m[1]);
    const cssMatches = [...htmlRes.data.matchAll(/href="(\/assets\/[^"]+\.css)"/g)].map(m => m[1]);

    for (const js of jsMatches) {
      const r = await fetchUrl(vercelUrl + js);
      record('Vercel Assets', `Asset JS (${js.split('/').pop()})`, r.status === 200, `${r.data.length} bytes, ${r.latency}ms`);
    }

    for (const css of cssMatches) {
      const r = await fetchUrl(vercelUrl + css);
      record('Vercel Assets', `Asset CSS (${css.split('/').pop()})`, r.status === 200, `${r.data.length} bytes, ${r.latency}ms`);
    }
  } catch (err) {
    record('Vercel Deploy', 'Erreur de connexion frontend', false, err.message);
  }

  // 2. BACKEND N8N WEBHOOK
  try {
    const preflight = await fetchUrl(n8nWebhook, {
      method: 'OPTIONS',
      headers: {
        'Origin': vercelUrl,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-signature'
      }
    });
    record('n8n Backend', 'CORS Preflight (Cross-Origin)', preflight.status === 204 || preflight.status === 200, `Status: ${preflight.status}, Allow-Origin: ${preflight.headers['access-control-allow-origin']}`);

    // Test rejection without signature (Security Gate)
    const unsignedRes = await fetchUrl(n8nWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Test intrusion sans signature" })
    });
    record('n8n Backend', 'Protection Zero-Trust HMAC (Rejet 401 sans signature)', unsignedRes.status === 401, `Status attendu 401 obtenu (${unsignedRes.latency}ms)`);
  } catch (err) {
    record('n8n Backend', 'Erreur de connexion n8n', false, err.message);
  }

  // 3. SUMMARY
  console.log('\n----------------------------------------------------------------');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  console.log(`TOTAL : ${passed}/${total} verifications avec succes.`);
  console.log('----------------------------------------------------------------');
}

verifyAll().catch(console.error);

