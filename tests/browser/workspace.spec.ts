import { test, expect } from '@playwright/test';
test('task approval, credit spend, result download, and reload persistence', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/workspace');
  await expect(
    page.getByRole('heading', { name: 'Good work starts with a prompt.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Research a market' }).click();
  await page.getByRole('button', { name: 'Build my team' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('A good plan comes first.')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Approve & run · 19 credits' })).toBeVisible();
  await page.screenshot({ path: 'research/plan-desktop.png', fullPage: true });
  await dialog.getByRole('button', { name: 'Approve & run · 19 credits' }).click();
  await expect(page.getByRole('heading', { name: 'Consider it brought together.' })).toBeVisible();
  await expect(page.getByText('sample deliverable', { exact: false })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download result' }).click();
  expect((await download).suggestedFilename()).toMatch(/promptly-.*\.md/);
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.reload();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('promptly.workspace.v1') || '{}'),
  );
  expect(stored.balance).toBe(226);
  expect(stored.runs).toHaveLength(4);
  expect(errors).toEqual([]);
});
test('marketplace filtering, saving, and agent selection', async ({ page }) => {
  await page.goto('/agents');
  await page.getByRole('textbox', { name: 'Search agents' }).fill('code');
  await expect(page.getByRole('button', { name: 'Code Architect', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Deep Research', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Unsave Code Architect' }).click();
  await page.getByRole('button', { name: 'Saved agents' }).click();
  await expect(page.getByText('No specialists found')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByRole('button', { name: 'Editorial', exact: true }).click();
  await page.getByRole('link', { name: 'Start a task with Editorial' }).click();
  await expect(page).toHaveURL(/agent=writer/);
  await expect(page.getByText('Editorial', { exact: true })).toBeVisible();
});
test('developer publishing and custom agent pricing', async ({ page }) => {
  await page.goto('/developer');
  await page.getByRole('button', { name: 'Publish an agent' }).click();
  await page.getByLabel('Agent name').fill('Proposal Partner');
  await page.getByLabel('One-line introduction').fill('Proposals with a clear purpose.');
  await page
    .getByLabel('Description', { exact: true })
    .fill('A focused proposal writer for independent design studios and creative teams.');
  await page
    .getByLabel('Specialist instructions')
    .fill(
      'You are a careful proposal writer. Create practical proposals with clear scope, assumptions, milestones, and next steps.',
    );
  await page.getByLabel('Capabilities', { exact: false }).fill('Proposals, Editing');
  await page.getByLabel('Price per run (credits)').fill('12');
  await page.getByRole('button', { name: 'Publish demo agent' }).click();
  await expect(page.getByText('Proposal Partner', { exact: true })).toBeVisible();
  await page.goto('/agents');
  await page.getByRole('button', { name: 'Proposal Partner', exact: true }).click();
  await page.getByRole('link', { name: 'Start a task with Proposal Partner' }).click();
  await page
    .getByRole('textbox', { name: 'Describe your task' })
    .fill('Draft a proposal for a new website for an independent design studio.');
  await page.getByRole('button', { name: 'Build my team' }).click();
  await expect(page.getByRole('button', { name: 'Approve & run · 16 credits' })).toBeVisible();
});
test('wallet top-up and explicit reset', async ({ page }) => {
  await page.goto('/billing');
  await page.getByRole('button', { name: 'Add demo credits', exact: true }).first().click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Add demo credits', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('100 demo credits added');
  await page.goto('/settings');
  await page.getByLabel('Workspace name').fill('Studio North');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.reload();
  await expect(page.getByLabel('Workspace name')).toHaveValue('Studio North');
  await page.getByRole('button', { name: 'Reset demo workspace' }).click();
  await page.getByRole('button', { name: 'Keep my workspace' }).click();
  await expect(page.getByLabel('Workspace name')).toHaveValue('Studio North');
  await page.getByRole('button', { name: 'Reset demo workspace' }).click();
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await expect(page.getByLabel('Workspace name')).toHaveValue('My workspace');
});
test('desktop visual, mobile navigation and overflow', async ({ page }) => {
  await page.goto('/workspace');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'research/workspace-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'research/workspace-mobile.png', fullPage: true });
  for (const route of [
    '/workspace',
    '/agents',
    '/runs',
    '/billing',
    '/developer',
    '/settings',
    '/guide',
    '/',
    '/login',
  ]) {
    await page.goto(route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow, `horizontal overflow at ${route}`).toBe(false);
  }
  await page.goto('/workspace');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'Agent marketplace' }).click();
  await expect(page.getByRole('heading', { name: 'Find your kind of brilliant.' })).toBeVisible();
});
test('protected endpoints reject anonymous calls', async ({ request }) => {
  for (const path of [
    '/api/plans',
    '/api/runs/execute',
    '/api/agents',
    '/api/settings',
    '/api/billing/checkout',
  ]) {
    const response = await request.post(path, { data: {} });
    expect(response.status()).toBe(401);
  }
  expect((await request.get('/api/workspace')).status()).toBe(401);
  expect((await request.get('/api/health')).status()).toBe(200);
});
