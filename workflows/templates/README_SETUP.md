# Algeria 2.0 n8n Workshop — Starter pack

## Included
- `01_main_lead_pipeline.json`: webhook intake, header-secret check, validation, normalization, disposable-domain check, PII masking before the local model, deterministic lead score, simple workflow-static-data deduplication, Ollama call, strict AI-output validation, deterministic rules fallback, audit object, webhook response.
- `02_error_handler.json`: workflow-level Error Trigger and normalized error/audit record.

## Import
In n8n: Workflows → Import from File → select each JSON file.

## Main workflow setup
1. Open `Validate + Normalize + PII Mask + Idempotency`.
2. Replace `DEMO_CHANGE_ME` with a long random secret. For a real deployment, use Webhook Header Auth credentials / a secret manager rather than a literal in Code.
3. Install Ollama on the host and pull a model, e.g. `ollama pull qwen2.5:3b`.
4. If n8n runs in Docker on Windows, `http://host.docker.internal:11434` is commonly the host bridge URL. If n8n is not in Docker, use `http://localhost:11434`. If Ollama is in another container, use its service/container DNS name.
5. Ensure Ollama listens on an address reachable from n8n. Do not expose Ollama publicly without access controls.
6. Save and activate the main workflow. Use the production webhook URL.

## Test request
```bash
curl -X POST "https://YOUR_N8N_HOST/webhook/workshop-lead-intake" ^
  -H "Content-Type: application/json" ^
  -H "X-Workshop-Secret: YOUR_REPLACED_SECRET" ^
  -d "{\"name\":\"Ahmed Benali\",\"email\":\"ahmed@example.com\",\"company\":\"Startup DZ\",\"message\":\"We need a demo and pricing for sales automation.\",\"source\":\"website\",\"idempotency_key\":\"demo-ahmed-001\"}"
```
For a second test, send the same `idempotency_key` again. It should be treated as a duplicate while the workflow static data is retained.

## Error workflow setup
1. Import `02_error_handler.json` and activate it.
2. In the main workflow Settings, select `Algeria 2.0 - Production Error Handler` as its Error Workflow.
3. Add your preferred notification node (Slack, email, or Teams) after `Build Error Audit Record`, and configure its credential.
4. Test Error Trigger using an automatic production execution that fails. Manual editor runs do not trigger Error Trigger.

## Important limitations — this is a training baseline, not a certified production system
- The sample shared-static-data idempotency check is for a single-instance demo. For production/multiple workers, use a database unique constraint or durable data store. The check-and-set is not an atomic distributed lock.
- The AI path uses local Ollama and deterministic rules fallback. It does not include a remote-provider fallback yet; add one only after the local path and fallback are stable.
- PII masking is deliberately simple regex masking, not a complete DLP/Guardrails system. It does not guarantee that all personal/sensitive data is removed. Never send real customer data in this demo.
- The workflow returns an audit object in the webhook response. It does not persist an audit trail to Google Sheets/Postgres yet. Add a durable audit store before production.
- Human approval is represented by `nextStep: human_review_then_contact`; this starter does not pause for a Slack approval. Implement that as a separate Wait/resume or Slack Send and Wait for Response workflow after the base pipeline works.
- `aiLatencyMs` is an approximate placeholder measurement, not a reliable end-to-end model latency metric.
- Replace demo values, test validation failures, wrong secrets, duplicate IDs, Ollama unavailable, malformed model JSON, and network failures before presenting.

## Suggested workshop progression
1. Import and inspect the Webhook node.
2. Send the sample request.
3. Explain the validation and normalization Code node.
4. Demonstrate PII masking and why it is not a complete DLP control.
5. Stop Ollama and show the rules fallback.
6. Send the same idempotency key twice.
7. Trigger an automatic failure and show the Error Workflow.
8. Discuss what must be added before production: durable DB idempotency, audit persistence, real secrets, human approval, remote model fallback, monitoring and backups.
