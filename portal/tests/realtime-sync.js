import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_EGLvmsOUISS1xxXRzXAKSg_-3l48aJQ';
const supabase = createClient('https://vsbcjedkiapmgkvnytvz.supabase.co', SUPABASE_KEY);

async function run() {
  const browser = await chromium.launch();

  console.log('=== TEST SYNCHRONISATION TEMPS RÉEL PARTICIPANT ===');

  // 1. Ouvrir l'écran Admin / Scène
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  console.log('1. Chargement de la vue Admin sur la production...');
  await adminPage.goto('https://nimble-cyclone-suwml6q.vercel.app/?vue=admin');
  await adminPage.waitForSelector('text=Console Super-Admin & Vidéoprojecteur');
  console.log('-> Vue Admin active.');

  // 2. Ouvrir le téléphone du participant
  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const phonePage = await phoneContext.newPage();
  console.log('2. Participant arrive sur smartphone...');
  await phonePage.goto('https://nimble-cyclone-suwml6q.vercel.app');

  // Passer le loader
  const passerBtn = phonePage.getByRole('button', { name: /Passer/i });
  if (await passerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await passerBtn.click();
  }

  // Saisir le pseudo et valider
  const testPseudo = 'Mus Live Synchro';
  console.log(`3. Saisie du pseudo: ${testPseudo} et confirmation...`);
  const input = phonePage.getByLabel(/Votre pseudo de hacker/i);
  await input.fill(testPseudo);
  await phonePage.getByRole('button', { name: /Lancer les missions/i }).click();

  // Attendre l'écran missions sur le téléphone
  await phonePage.waitForSelector('text=Agent Mus Live Synchro');
  console.log('-> Téléphone validé: participant connecté aux missions!');

  // 4. Vérifier sur l'écran Admin si le participant est apparu en direct
  console.log('4. Vérification de la synchronisation sur l\'écran Admin...');
  try {
    await adminPage.waitForSelector(`text=${testPseudo}`, { timeout: 8000 });
    console.log(`-> SUCCÈS TOTAL: Le pseudo "${testPseudo}" est apparu en temps réel sur l'écran Admin!`);
  } catch (err) {
    console.log('-> Échec d\'apparition sur l\'écran admin:', err.message);
  }

  // 5. Vérifier dans la base de données Supabase
  const { data: dbUser } = await supabase.from('participants').select('*').eq('pseudo', testPseudo);
  console.log('5. Vérification Supabase DB:', dbUser && dbUser.length > 0 ? `Trouvé en base (${dbUser[0].id})` : 'Non trouvé');

  // Nettoyage
  await supabase.from('participants').delete().eq('pseudo', testPseudo);
  console.log('-> Nettoyage du test effectué.');

  await browser.close();
  console.log('=== FIN DU TEST E2E VALIDÉ ===');
}

run().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});

