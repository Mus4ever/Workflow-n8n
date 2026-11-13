# Algeria 2.0 | Guide de Démarrage Rapide (Setup)

## Workshop : Automatiser un Vrai Processus Métier avec n8n, Webhooks et APIs

Ce guide résume la configuration rapide pour déployer et animer l'atelier lors de **Algeria 2.0**.  
Pour la documentation complète et l'architecture détaillée, consultez le fichier principal [README.md](./README.md).

---

## 1. Fichiers Inclus dans ce Pack

- `train-test-corrected.json` : Le workflow de support client complet et corrigé (36 nœuds, HMAC, PII, IA, Slack sendAndWait, Google Sheets, Fallback).
- `n8n-error-handler-workflow.json` : Le workflow de gestion d'erreur Dead Letter Queue (DLQ).
- `n8n-lead-pipeline-cloud.json` : Le workflow alternatif de qualification de leads.
- `PLAN-construction-workflow-n8n-cloud.md` : Le plan pédagogique de construction pas à pas.
- `CHECKLIST-production-ready.md` : La checklist d'industrialisation (12 piliers) pour les participants.
- `test-customer-support.ps1` : Le script PowerShell de test automatisé de bout en bout.

---

## 2. Configuration sur n8n Cloud

### Étape 1 : Importer les Workflows

1. Dans votre instance n8n : **Workflows** → **Import from File**.
2. Importer `n8n-error-handler-workflow.json` et le nommer `Error handler: DLQ + Slack alert`. Activez-le.
3. Importer `train-test-corrected.json` et le nommer `Train test`. Activez-le.

### Étape 2 : Configurer les 4 Credentials Requis

1. **Crypto (HMAC) :** Créer un credential _Crypto_ nommé `Lead Webhook HMAC Secret` avec votre clé secrète partagée.
2. **Slack :** Connecter votre compte Slack via OAuth2 (`Slack account`) avec accès aux canaux et messages interactifs.
3. **Google Sheets :** Connecter votre compte Google via OAuth2 (`Google Sheets account`) avec accès en écriture.
4. **OpenRouter / IA :** Connecter votre compte OpenRouter via clé API (`OpenRouter account`).

### Étape 3 : Lier le Workflow d'Erreur

Dans les paramètres du workflow principal (`Train test`) :

- Allez dans **Settings** (icône d'engrenage en haut à gauche du canvas).
- Dans le champ **Error workflow**, sélectionnez `Error handler: DLQ + Slack alert`.
- Fuseau horaire : `Africa/Algiers`.

---

## 3. Démonstration des Tests en Direct

Ouvrez un terminal PowerShell :

```powershell
# 1. Vérifier le rejet immédiat sans signature (401)
.\test-customer-support.ps1

# 2. Exécuter la suite complète (401, 400, 202, 200, IA, Slack, Sheets)
.\test-customer-support.ps1 -Secret "VOTRE_SECRET_HMAC"
```

Consultez les résultats en direct dans votre onglet **Executions** sur n8n Cloud !
