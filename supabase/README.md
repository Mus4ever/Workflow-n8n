# 🗄️ Guide de Configuration Supabase Realtime

Ce dossier contient le schéma complet et les instructions pour connecter votre base de données Supabase temps réel à l'application du workshop **Algeria 2.0**.

---

### 1. Créer un projet Supabase gratuit (1 minute)

1. Rendez-vous sur **[supabase.com](https://supabase.com)** et connectez-vous.
2. Cliquez sur **« New Project »** :
   * Nom : `algeria20-n8n-workshop`
   * Mot de passe de la base : *(choisissez un mot de passe sécurisé)*
   * Région : Francfort (`eu-central-1`) ou la plus proche.
   * Plan : **Gratuit (Free)**.

---

### 2. Exécuter le script de base de données (1 clic)

1. Dans votre tableau de bord Supabase, ouvrez l'onglet **SQL Editor** (dans la barre latérale gauche).
2. Cliquez sur **« New query »**.
3. Copiez l'intégralité du fichier [`schema.sql`](./schema.sql) et collez-le.
4. Cliquez sur **« Run »** (ou `Ctrl + Enter`).
5. ✅ Toutes les tables (`workshop_sessions`, `participants`, `attacks`, `votes`, `tickets`) sont créées avec leurs index et la réplication **Realtime** activée !

---

### 3. Récupérer vos clés d'API Supabase

1. Dans Supabase, allez dans **Project Settings** (icône roue crantée en bas à gauche) > **API**.
2. Copiez deux valeurs :
   * **Project URL** (ex: `https://xyzcompany.supabase.co`)
   * **Project API Keys (`anon public`)** (ex: `eyJhbGciOi...`)

---

### 4. Configurer les variables d'environnement

Dans le dossier `portal/` et dans `backend/`, renseignez votre fichier `.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

*Note : Si Supabase n'est pas encore configuré ou que les variables sont vides, l'application bascule automatiquement et en toute transparence sur les webhooks n8n directs sans interruption de service !*

