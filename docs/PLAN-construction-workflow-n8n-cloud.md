# Algeria 2.0 | Atelier n8n Production

# Plan complet : Automatiser un Vrai Processus Métier avec n8n, Webhooks et APIs

> **Événement :** Algeria 2.0  
> **Titre de l'atelier :** Automatiser un Vrai Processus Métier avec n8n, Webhooks et APIs  
> **Outil :** n8n Cloud & APIs prêtes à l'emploi (OpenRouter / NVIDIA / LangChain, DummyJSON, Google Sheets, Slack).  
> **Description officielle de la session :**  
> Découvrez comment transformer une simple automatisation en un véritable processus métier fiable, sécurisé et opérationnel grâce à n8n, aux Webhooks et aux APIs. À travers un cas concret de traitement automatisé des demandes clients, vous apprendrez à concevoir une architecture d'automatisation complète, depuis la réception sécurisée des requêtes jusqu'au traitement, à la validation et à l'enrichissement des données via des APIs. Vous découvrirez également comment intégrer l'intelligence artificielle dans un processus métier de manière contrôlée, en maintenant une supervision humaine pour les décisions sensibles, et comment mettre en place des mécanismes de surveillance et d'alerte pour détecter rapidement les erreurs et garantir la continuité du processus. À travers une approche pratique, vous explorerez les principes essentiels de la conception d'automatisations fiables : sécurité, intégration, gestion des erreurs, supervision et intervention humaine. À l'issue de cette session, vous disposerez d'un workflow fonctionnel et réutilisable, ainsi que d'une checklist pour faire évoluer vos propres automatisations du stade de prototype vers des solutions robustes, adaptées aux besoins réels des entreprises.

---

## 0. Architecture du Workflow de Référence (Production-Ready)

```text
Appelant (portail, CRM, formulaire) ── POST signé (HMAC) ──►
 [Webhook - Customer Intake] (rawBody: true)
      │
 [01a - Read raw body] (Buffer octets bruts)
      │
 [01b - Compute HMAC] (Crypto SHA256 HEX avec secret partagé)
      │
 [01c - Check signature] (Comparaison en temps constant anti-timing attacks + Correlation ID)
      │
 [01d - Signature ok ?]
      ├── Faux ──► [Respond 401 - Invalid Signature] (Rejet 401 immédiat)
      └── Vrai ──► [02 - Validate Customer Data] (Validation email, nom, message requis)
                       │
                       ├── Faux ──► [Respond 400 - Invalid Data] (400 Bad Request immédiat)
                       └── Vrai ──► [03 - Normalize Customer Data]
                                        │
                                   [04 - Generate Ticket ID & Metadata] (Format SUP-YYYYMMDD-HHmmss-ID)
                                        │
                                   [05 - Deduplicate Request] (Mémoire d'idempotence 24h)
                                        │
                                   [05b - Is Duplicate ?]
                                        ├── Vrai ──► [Respond 200 - Duplicate] (200 OK: doublon acquitté)
                                        └── Faux ──► [Respond 202 - Accepted]  (202 Accepted: libère l'appelant en <50ms !)
                                                          │
                                   [06 - Fetch Product Information API] (DummyJSON avec retry et continueRegularOutput)
                                        │
                                   [07 - Mask PII & Prepare Context] (Anonymisation [EMAIL], [PHONE], [URL])
                                        │
                                   [08 - AI Customer Request Analysis] (LangChain LLM + Structured Output Parser)
                                        │
                                   [09 - Merge AI & Ticket]
                                        │
                                   [09b - AI Analysis Ok ?]
                                        ├── Vrai ───────────────────────────────┐
                                        └── Faux ──► [09c - Rules Fallback] ────┤ (Secours déterministe sans IA)
                                                                                │
                                   [10 - Business Rules & Priority Gate] ◄──────┘ (Urgence / Doute < 0.7 / Fallback)
                                        │
                                        ├── Si Human Requis / Urgent / Doute
                                        │        │
                                        │   [11 - Human Approval Request] (Slack sendAndWait interactif)
                                        │        │
                                        │   [12 - Approval Decision Routing]
                                        │        ├── Approuvé ─► [Set Status Approved] ────┐
                                        │        └── Rejeté   ─► [Set Status Rejected] ────┤
                                        │                                                  │
                                        └── Si Décision Automatique                        │
                                                 │                                         │
                                            [Set Status Auto-Approved] ────────────────────┤
                                                                                           │
                                   [13 - Log Ticket to Google Sheets] ◄────────────────────┘ (Table n8n_support_tickets)
                                        │
                                   [15 - Execution Logging & Tracking] (Table Execution_Logs)

En cas d'incident critique système (panne n8n/réseau) :
 [Error Trigger] ──► [Format Error] ──► [Log to DLQ sheet] ──► [Slack Emergency Alert]
```

### Les 5 Piliers Métier Transmis aux Participants

1. **Sécurité Zero-Trust :** Ne faire confiance qu'à un appelant signé (HMAC-SHA256 sur corps brut, rejet 401).
2. **Idempotence & Performance :** Libérer le client immédiatement (202 Accepted) sans l'obliger à attendre l'IA, et neutraliser les doublons (200 Duplicate).
3. **IA Maîtrisée & Défense en Profondeur :** Données personnelles anonymisées (PII masking), validation JSON stricte et filet de secours par règles sans IA (Rules Fallback).
4. **Supervision Humaine (HITL) :** L'IA ne valide jamais seule les cas sensibles ; un humain arbitre directement dans Slack via `sendAndWait`.
5. **Observabilité & Tolérance aux Pannes :** Double journalisation (Audit métier + Logs techniques) et Dead Letter Queue (DLQ) connectée via `settings.errorWorkflow`.

---

## 1. Préparation & Environnement de l'Atelier

- [x] **n8n Cloud** : Instance active (`mustrain.app.n8n.cloud`), fuseau horaire `Africa/Algiers`, conservation des exécutions activée.
- [x] **Google Sheets** : Classeur connecté avec deux onglets dédiés :
  - `Feuille 1` / `n8n_support_tickets` : `ticket_id, customer_name, customer_email, message, product, intent, priority, ai_summary, recommended_action, approval_status, approval_date, confidence`
  - `Execution_Logs` : `execution_id, ticket_id, event, status, priority, intent, logged_at`
- [x] **Slack** : Espace configuré avec bot interactif et canal `leads`.
- [x] **Modèle d'IA** : Intégration OpenRouter (`nvidia/nemotron-3.5-super-vl:free` ou équivalent) avec Schéma JSON structuré.
- [x] **Credentials n8n configurés** :
  - [x] _Crypto_ : `Lead Webhook HMAC Secret` (`PvZsTUNGI7vHRdjK`)
  - [x] _Slack OAuth2_ : `Slack account` (`hsE01x6Cwr9dQh0X`)
  - [x] _Google Sheets OAuth2_ : `Google Sheets account` (`ot5nf3Z7DTo4Jr0i`)
  - [x] _OpenRouter API_ : `OpenRouter account` (`kmtbT7IghLBuDSDO`)
- [x] **Scripts de test automatisés** :
  - [x] `test-customer-support.ps1` (Batterie de tests complète pour le support client et HMAC).
  - [x] `test-webhook.ps1` (Tests rapides de signature HMAC et gestion des erreurs).

---

## 2. Construction Phase par Phase (Guide de Présentation)

### Phase 1 : Ingestion Sécurisée (HMAC-SHA256)

- **Nœuds :** `Webhook - Customer Intake` (rawBody: ON), `01a - Read raw body`, `01b - Compute HMAC`, `01c - Check signature`, `01d - Signature ok?`, `Respond 401 - Invalid Signature`.
- **Concept clé :** Protection cryptographique standard Stripe/GitHub. La comparaison est effectuée en temps constant pour empêcher les attaques temporelles (timing attacks).
- **Statut :** [x] Construit, testé et validé (rejet 401 vérifié).

### Phase 2 : Validation du Payload & Réponse 400

- **Nœuds :** `02 - Validate Customer Data`, `Respond 400 - Invalid Data`, `03 - Normalize Customer Data`.
- **Concept clé :** Ne jamais laisser un webhook sans réponse en cas de données corrompues. Validation stricte du format email et présence des champs obligatoires.
- **Statut :** [x] Construit, testé et validé (rejet 400 vérifié).

### Phase 3 : Idempotence & Réponse Asynchrone 202

- **Nœuds :** `04 - Generate Ticket ID & Metadata`, `05 - Deduplicate Request`, `05b - Is Duplicate?`, `Respond 200 - Duplicate`, `Respond 202 - Accepted`.
- **Concept clé :** Génération d'un Ticket ID traçable (`SUP-YYYYMMDD-HHmmss-ID`). Mémoire tournante 24h (`$getWorkflowStaticData`). Libération immédiate du client en 202 Accepted.
- **Statut :** [x] Construit, testé et validé.

### Phase 4 : Enrichissement API Résilient

- **Nœuds :** `06 - Fetch Product Information API`.
- **Concept clé :** Récupération dynamique du catalogue produit (`dummyjson.com/products/`) avec 3 tentatives automatiques (`retryOnFail`) et reprise sur erreur (`onError: continueRegularOutput`). Une API tierce en panne ne bloque pas la demande.
- **Statut :** [x] Construit, testé et validé.

### Phase 5 : Confidentialité & Protection de la Vie Privée (PII)

- **Nœuds :** `07 - Mask PII & Prepare Context`.
- **Concept clé :** Anonymisation obligatoire avant envoi à une IA hébergée à l'étranger. Remplacement des e-mails par `[EMAIL]`, des téléphones par `[PHONE]` et des URLs par `[URL]`.
- **Statut :** [x] Construit, testé et validé.

### Phase 6 : IA Contrôlée & Secours sans IA (Rules Fallback)

- **Nœuds :** `08 - AI Customer Request Analysis` (Chain LLM + OpenRouter), `Structured Output Parser`, `09 - Merge AI & Ticket`, `09b - AI Analysis Ok?`, `09c - Rules Fallback`.
- **Concept clé :** L'IA extrait un JSON strict (intention, priorité, sentiment, confiance). Si l'IA échoue ou que les quotas sont épuisés, bascule déterministe immédiate sur des règles par mots-clés trilingues (français, arabe, anglais).
- **Statut :** [x] Construit, testé et validé.

### Phase 7 : Supervision Humaine (Human-in-the-Loop)

- **Nœuds :** `10 - Business Rules & Priority Gate`, `11 - Human Approval Request` (Slack `sendAndWait`), `12 - Approval Decision Routing`, `Set Status Approved`, `Set Status Rejected`, `Set Status Auto-Approved`.
- **Concept clé :** Détection automatique des cas sensibles (urgence, doute statistique < 0.7, recours au fallback). Slack met en pause le workflow et attend l'action du responsable.
- **Statut :** [x] Construit, testé et validé.

### Phase 8 : Journalisation Double & Clôture

- **Nœuds :** `13 - Log Ticket to Google Sheets`, `15 - Execution Logging & Tracking`.
- **Concept clé :** Enregistrement universel de tous les états (`APPROVED`, `REJECTED`, `AUTO_APPROVED`) avec identifiant d'exécution et horodatage.
- **Statut :** [x] Construit, testé et validé.

### Phase 9 : Gestion des Pannes Système (Dead Letter Queue)

- **Workflow externe :** `Error handler: DLQ + Slack alert` (`ZACFhOBLD5Dug2FZ`).
- **Concept clé :** Relié via `settings.errorWorkflow`. Si une coupure réseau ou une exception fatale survient, l'échec est tracé dans la feuille `DLQ` et une alerte Slack d'urgence est déclenchée.
- **Statut :** [x] Publié et relié dans les paramètres du workflow principal.

---

## 3. Matrice de Validation Finale

| Test                               | Comportement Attendu                               |   Statut   |
| ---------------------------------- | -------------------------------------------------- | :--------: |
| **Requête sans signature**         | Rejet HTTP 401 Unauthorized                        | [x] Validé |
| **Signature HMAC fausse/altérée**  | Rejet HTTP 401 Unauthorized                        | [x] Validé |
| **Données invalides / manquantes** | Rejet HTTP 400 Bad Request avec détail             | [x] Validé |
| **Demande valide et signée**       | Réponse HTTP 202 Accepted en < 50ms                | [x] Validé |
| **Renvoi identique (idempotence)** | Réponse HTTP 200 OK (`duplicate: true`)            | [x] Validé |
| **Panne API enrichissement**       | Continuité du flux grâce à `continueRegularOutput` | [x] Validé |
| **Panne ou timeout de l'IA**       | Bascule automatique sur `Rules Fallback`           | [x] Validé |
| **Ticket urgent / incertain**      | Notification Slack et attente de décision          | [x] Validé |
| **Ticket standard sans doute**     | Traitement automatique `AUTO_APPROVED`             | [x] Validé |
| **Traçabilité Google Sheets**      | 100% des demandes enregistrées avec correlationId  | [x] Validé |
| **Panne critique inattendue**      | Capture par la Dead Letter Queue (DLQ)             | [x] Validé |

---

## 4. Workflows Opérationnels sur n8n Cloud

1. **Workflow Principal Support Client :**  
   👉 [https://mustrain.app.n8n.cloud/workflow/TrcL9tV4yRclNPNi](https://mustrain.app.n8n.cloud/workflow/TrcL9tV4yRclNPNi) _(Workflow: `Train test`)_
2. **Workflow Principal Pipeline Leads :**  
   👉 [https://mustrain.app.n8n.cloud/workflow/lpKFjNtEY9Fu92XJ](https://mustrain.app.n8n.cloud/workflow/lpKFjNtEY9Fu92XJ) _(Workflow: `Lead pipeline (n8n Cloud version)`)_
3. **Workflow Dead Letter Queue (DLQ) :**  
   👉 [https://mustrain.app.n8n.cloud/workflow/ZACFhOBLD5Dug2FZ](https://mustrain.app.n8n.cloud/workflow/ZACFhOBLD5Dug2FZ) _(Workflow: `Error handler: DLQ + Slack alert`)_
