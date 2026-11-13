import { test, expect } from '@playwright/test';

test.describe('Workshop Algeria 2.0 - E2E Tests', () => {

  test('1. Participant Entrance: Loader skips and displays Join screen', async ({ page }) => {
    await page.goto('/');

    // Check loader elements and click passer
    const passerBtn = page.getByRole('button', { name: /Passer/i });
    if (await passerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passerBtn.click();
    }

    // After loader, Join screen should be visible with unique h1
    await expect(page.getByRole('heading', { level: 1, name: /Cassez mon workflow/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/Votre pseudo de hacker/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Lancer les missions/i })).toBeVisible();

    // Verify NO admin or scene buttons exist on the participant view
    await expect(page.getByRole('button', { name: /Vue Scène/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Admin/i })).not.toBeVisible();
    await expect(page.getByText(/Revoir l'intro/i)).not.toBeVisible();

    // Verify NO vote or rules tabs exist
    await expect(page.getByText(/Vote de la salle/i)).not.toBeVisible();
    await expect(page.getByText(/Règles/i)).not.toBeVisible();
  });

  test('2. Participant Journey: Enter nickname, view 7 missions, and open Mission 1', async ({ page }) => {
    await page.goto('/');

    // Skip loader
    const passerBtn = page.getByRole('button', { name: /Passer/i });
    if (await passerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passerBtn.click();
    }

    // Fill nickname
    const pseudoInput = page.getByLabel(/Votre pseudo de hacker/i);
    await pseudoInput.fill('PlaywrightAgent');
    await page.getByRole('button', { name: /Lancer les missions/i }).click();

    // Should now see the missions list
    await expect(page.getByText(/Agent PlaywrightAgent/i)).toBeVisible();
    await expect(page.getByText(/Sept missions d’attaque/i)).toBeVisible();

    // Check that Mission 1 is listed
    const mission1 = page.getByText(/Mission 1/i);
    await expect(mission1).toBeVisible();

    // Open Mission 1
    await mission1.click();

    // Verify Mission 1 detail view
    await expect(page.getByText(/Envoyer une vraie demande/i)).toBeVisible();
    const sendBtn = page.getByRole('button', { name: /Envoyer ma demande/i });
    await expect(sendBtn).toBeVisible();

    // Test going back to missions list
    await page.getByRole('button', { name: /Missions/i }).click();
    await expect(page.getByText(/Sept missions d’attaque/i)).toBeVisible();
  });

  test('3. Mobile Viewport: No horizontal overflow or layout glitch', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const passerBtn = page.getByRole('button', { name: /Passer/i });
    if (await passerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passerBtn.click();
    }

    // Verify no scroll width greater than client width
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('4. Admin / Projector View (?vue=admin): Displays gates, QR code and live feeds without vote column', async ({ page }) => {
    await page.goto('/?vue=admin');

    // Should show the host/projector scene immediately
    await expect(page.getByRole('heading', { level: 1, name: /Cassez mon workflow/i })).toBeVisible();
    await expect(page.getByText(/Console Super-Admin & Vidéoprojecteur/i)).toBeVisible();

    // Verify the 4 defense gates are visible
    await expect(page.getByText('Signature', { exact: true })).toBeVisible();
    await expect(page.getByText('Données', { exact: true })).toBeVisible();
    await expect(page.getByText('Doublon et débit', { exact: true })).toBeVisible();
    await expect(page.getByText('Prise en charge', { exact: true })).toBeVisible();

    // Verify the 2 clean sections
    await expect(page.getByText(/Attaques en direct/i)).toBeVisible();
    await expect(page.getByText(/Workflow n8n & Slack/i)).toBeVisible();

    // Verify Vote section is completely removed
    await expect(page.getByText(/Vote de la salle/i)).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Ouvrir un vote/i })).not.toBeVisible();
  });

  test('5. Mission Action Execution: Attack sending triggers result without visual crash', async ({ page }) => {
    await page.goto('/');

    const passerBtn = page.getByRole('button', { name: /Passer/i });
    if (await passerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passerBtn.click();
    }

    const pseudoInput = page.getByLabel(/Votre pseudo de hacker/i);
    await pseudoInput.fill('HackerBot');
    await page.getByRole('button', { name: /Lancer les missions/i }).click();

    await page.getByText(/Mission 1/i).click();

    // Send request
    const sendBtn = page.getByRole('button', { name: /Envoyer ma demande/i });
    await sendBtn.click();

    // Check that we see the outcome container (either envoi, réponse, ou stamp)
    await expect(page.getByText(/Envoi en cours|Le workflow a répondu|Résultat|Erreur/i)).toBeVisible({ timeout: 8000 });
  });

});
