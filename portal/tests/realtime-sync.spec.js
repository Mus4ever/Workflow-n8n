import { test, expect } from '@playwright/test';

test('Simultaneous sync: Participant joins and appears in Admin Scene', async ({ browser }) => {
  // Context 1: Admin / Projector Scene
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto('/?vue=admin');

  // Verify Admin is loaded
  await expect(adminPage.getByRole('heading', { name: /Cassez mon workflow/i })).toBeVisible();

  // Context 2: Participant on mobile
  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  await userPage.goto('/');

  // Skip loader if visible
  const passerBtn = userPage.getByRole('button', { name: /Passer/i });
  if (await passerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await passerBtn.click();
  }

  // Fill pseudo
  const uniqueName = 'Karim_' + Math.floor(Math.random() * 1000);
  console.log('Testing with pseudo:', uniqueName);
  await userPage.getByLabel(/Votre pseudo de hacker/i).fill(uniqueName);
  await userPage.getByRole('button', { name: /Lancer les missions/i }).click();

  // Wait for missions screen on participant
  await expect(userPage.getByText(new RegExp(`Agent ${uniqueName}`, 'i'))).toBeVisible({ timeout: 5000 });

  // Now verify that Admin Page shows this participant in real time!
  console.log('Checking if Admin page displays:', uniqueName);
  await expect(adminPage.getByText(uniqueName)).toBeVisible({ timeout: 10000 });
  console.log('SUCCESS! Admin displayed participant in real time!');

  await adminContext.close();
  await userContext.close();
});
