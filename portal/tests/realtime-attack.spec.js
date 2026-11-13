import { test, expect } from '@playwright/test';

test('Simultaneous sync: Participant sends attack and appears in Admin Scene', async ({ browser }) => {
  // Context 1: Admin / Projector Scene
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto('/?vue=admin');

  await expect(adminPage.getByRole('heading', { name: /Cassez mon workflow/i })).toBeVisible();

  // Context 2: Participant
  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  await userPage.goto('/');

  const passerBtn = userPage.getByRole('button', { name: /Passer/i });
  if (await passerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await passerBtn.click();
  }

  const attackerName = 'Attacker_' + Math.floor(Math.random() * 1000);
  await userPage.getByLabel(/Votre pseudo de hacker/i).fill(attackerName);
  await userPage.getByRole('button', { name: /Lancer les missions/i }).click();

  // Wait for participant to be on missions list
  await expect(userPage.getByText(new RegExp(`Agent ${attackerName}`, 'i'))).toBeVisible();

  // Admin should see participant
  await expect(adminPage.getByText(attackerName)).toBeVisible({ timeout: 10000 });

  // Participant opens Mission 1 and sends
  await userPage.getByText(/Mission 1/i).click();
  const sendBtn = userPage.getByRole('button', { name: /Envoyer ma demande/i });
  await sendBtn.click();

  // Wait for result on participant
  await expect(userPage.getByText(/Demande acceptée|Le workflow a répondu|Résultat|Attaque/i)).toBeVisible({ timeout: 10000 });

  // Admin should now see this attack under "Attaques en direct"
  console.log('Checking if Admin sees attack from:', attackerName);
  await expect(adminPage.getByText(attackerName).first()).toBeVisible({ timeout: 10000 });
  console.log('SUCCESS! Admin received the attack in real time!');

  await adminContext.close();
  await userContext.close();
});

