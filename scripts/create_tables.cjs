const https = require('https');

const API_KEY = process.argv[2] || process.env.N8N_API_KEY;
const HOST = 'mustrain.app.n8n.cloud';

if (!API_KEY) {
  console.error("Usage: node create_tables.cjs <N8N_API_KEY>");
  process.exit(1);
}

const tablesToCreate = [
  {
    name: "n8n_support_tickets",
    columns: [
      { name: "ticket_id", type: "string" },
      { name: "customer_name", type: "string" },
      { name: "customer_email", type: "string" },
      { name: "message", type: "string" },
      { name: "product", type: "string" },
      { name: "intent", type: "string" },
      { name: "priority", type: "string" },
      { name: "ai_summary", type: "string" },
      { name: "recommended_action", type: "string" },
      { name: "approval_status", type: "string" },
      { name: "approval_date", type: "string" },
      { name: "confidence", type: "number" }
    ]
  },
  {
    name: "Execution_Logs",
    columns: [
      { name: "execution_id", type: "string" },
      { name: "ticket_id", type: "string" },
      { name: "event", type: "string" },
      { name: "status", type: "string" },
      { name: "priority", type: "string" },
      { name: "intent", type: "string" },
      { name: "logged_at", type: "string" }
    ]
  }
];

function createTable(table) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(table);
    const req = https.request({
      hostname: HOST,
      path: '/api/v1/data-tables',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY,
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: parsed });
        } catch {
          resolve({ ok: false, status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log(`Initialisation de la création sur https://${HOST}...`);
  for (const t of tablesToCreate) {
    const res = await createTable(t);
    if (res.ok) {
      console.log(`✅ Table "${t.name}" créée avec succès (ID: ${res.data.id || 'ok'}) !`);
    } else {
      console.error(`❌ Erreur pour "${t.name}" (Status ${res.status}) :`, res.data || res.body);
    }
  }
}

run();

