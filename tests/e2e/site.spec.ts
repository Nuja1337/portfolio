import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
}

test.describe('home', () => {
  test('renders every section without script errors', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');
    await expect(page).toHaveTitle(/Alexander Shaham/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('games and web apps');
    for (const id of ['featured', 'experience', 'projects', 'skills', 'about', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
    expect(errors).toEqual([]);
  });

  test('serves the hero art as static SVG', async ({ request }) => {
    for (const name of [
      'night',
      'night-tall',
      'night-twinkle',
      'night-twinkle-tall',
      'moon',
      'ink',
      'ink-tall',
      'enso',
    ]) {
      const res = await request.get(`/art/${name}.svg`);
      expect(res.ok()).toBe(true);
      expect(res.headers()['content-type']).toContain('image/svg+xml');
      expect(await res.text()).toMatch(/^<svg /);
    }
  });

  test('keeps the Rune Forge sealed, here and in the breakdown', async ({ page }) => {
    await page.goto('/breakdowns/runefall');
    await expect(page.locator('#forge')).toContainText('Coming soon');
    for (const path of ['/', '/breakdowns/runefall']) {
      await page.goto(path);
      const text = (await page.locator('body').innerText()).toLowerCase();
      for (const secret of ['paradox', 'powerscore', 'meta-magic', '130 rune'])
        expect(text, path).not.toContain(secret);
    }
  });

  test('every featured project links a breakdown that loads, or its public code', async ({ page, request }) => {
    await page.goto('/');
    const links = page.locator('#featured a', { hasText: 'Breakdown' });
    await expect(links).toHaveCount(2);
    for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''))) {
      expect(href).toMatch(/^\/breakdowns\/[a-z-]+$/);
      expect((await request.get(href)).ok(), href).toBe(true);
    }
    const code = page.locator('#featured a', { hasText: 'Code' });
    expect(await code.evaluateAll((els) => els.map((e) => e.getAttribute('href')))).toEqual([
      'https://github.com/Nuja1337/tally',
      'https://github.com/Nuja1337/drafts',
    ]);
  });

  test('scrolls the projects inside their own panel', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('[data-board-scroll]');
    expect(await panel.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    await expect(page.locator('#projects [data-card]', { hasText: 'Easy Waiver' })).toHaveCount(1);
  });

  test('starts from the system color scheme', async ({ browser }) => {
    for (const colorScheme of ['dark', 'light'] as const) {
      const context = await browser.newContext({ colorScheme });
      const page = await context.newPage();
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-skin', colorScheme);
      await expect(
        page.getByRole('button', { name: colorScheme === 'dark' ? 'Dark mode' : 'Light mode' }),
      ).toHaveAttribute('aria-pressed', 'true');
      await context.close();
    }
  });

  test('switches modes and remembers the choice over the system setting', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'dark');
    await page.getByRole('button', { name: 'Light mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'light');
    await expect(page.getByText('Tale recorded').first()).toBeVisible();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'light');
    await expect(page.getByRole('button', { name: 'Light mode' })).toHaveAttribute('aria-pressed', 'true');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'light');
  });

  test('asks Dark Reader to leave the page alone', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="darkreader-lock"]')).toHaveCount(1);
  });

  test('filters the board and hides empty decks', async ({ page }) => {
    await page.goto('/');
    const board = page.locator('#projects');
    const total = await board.locator('[data-card]').count();
    await board.getByRole('button', { name: 'Games', exact: true }).click();
    const games = board.locator('[data-card]:not([hidden])');
    await expect(games.first()).toBeVisible();
    for (const tags of await games.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.tags ?? ''))) {
      expect(tags.split(' ')).toContain('game');
    }
    await expect(board.locator('[data-deck="web"]')).toBeHidden();
    await expect(board.locator('[data-filter-count]')).toHaveText(`${await games.count()} of ${total} cards`);
    await board.getByRole('button', { name: 'All', exact: true }).click();
    await expect(board.locator('[data-filter-count]')).toHaveText(`${total} cards`);
  });

  test('number keys press the action bar', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard shortcuts are a desktop affordance');
    await page.goto('/');
    await page.keyboard.press('4');
    await expect(page).toHaveURL(/#projects$/);
    await page.keyboard.press('7');
    await expect(page).toHaveURL(/#contact$/);
  });

  test('the console slot opens the console, and every slot fits on screen', async ({ page }) => {
    await page.goto('/');
    const bar = page.locator('.actionbar');
    expect(await bar.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    const slot = bar.getByRole('button', { name: 'Console' });
    await slot.click();
    await expect(page.locator('#console')).toBeVisible();
    await expect(slot).toHaveAttribute('aria-expanded', 'true');
    // The open console covers the bar, so it closes from its own button (or Escape, or the tilde key).
    await page.locator('#con-close').click();
    await expect(page.locator('#console')).toBeHidden();
    await expect(slot).toHaveAttribute('aria-expanded', 'false');
  });

  test('the console runs commands', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the console opens from the keyboard');
    await page.goto('/');
    await page.keyboard.press('`');
    const input = page.getByRole('textbox', { name: 'Console command' });
    await expect(input).toBeFocused();
    await input.fill('help');
    await input.press('Enter');
    await expect(page.locator('#con-out')).toContainText('whoami');
    await input.fill('skin light');
    await input.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'light');
    await input.press('Escape');
    await expect(page.locator('#console')).toBeHidden();
  });

  test('ends the nav with Blog, which opens the blog page instead of a home section', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('nav.nav-links a');
    await expect(links).toHaveText(['Featured', 'Experience', 'Projects', 'About', 'Contact', 'Blog']);
    await expect(links.last()).toHaveAttribute('href', '/blog');
    await expect(page.locator('#blog')).toHaveCount(0);
  });

  test('links both résumé PDFs from the hero', async ({ page, request }) => {
    await page.goto('/');
    for (const name of ['Game dev résumé', 'Software résumé']) {
      const href = await page.locator('.hero .actions a', { hasText: name }).getAttribute('href');
      expect(href).toMatch(/^\/AlexanderShahamResume-(GameDev|Software)\.pdf$/);
      const res = await request.get(href!);
      expect(res.ok()).toBe(true);
      expect(res.headers()['content-type']).toContain('pdf');
    }
  });

  test('opens files and other sites in a new tab, and keeps site links in place', async ({ page }) => {
    await page.goto('/');
    for (const a of await page.locator('a[href$=".pdf"], a[href$=".xml"], a[href^="http"]').all()) {
      await expect(a).toHaveAttribute('target', '_blank');
      await expect(a).toHaveAttribute('rel', /noopener/);
    }
    for (const a of await page.locator('a[href^="#"], a[href^="/blog"]').all()) {
      await expect(a).not.toHaveAttribute('target', '_blank');
    }
  });
});

test.describe('blog', () => {
  test('is open and marked as under construction', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/blog');
    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
    await expect(page.getByText('Under construction.')).toBeVisible();
    for (const name of ['Devlogs', 'Game design', 'Engineering', 'Opinions', 'Stories']) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test('serves an RSS feed', async ({ request }) => {
    const res = await request.get('/rss.xml');
    expect(res.ok()).toBe(true);
    expect(await res.text()).toContain('<rss');
  });
});

test('unknown pages get the 404', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('fog');
});

for (const skin of ['dark', 'light'] as const) {
  test(`has no serious accessibility violations (${skin})`, async ({ page }) => {
    await page.addInitScript((s) => localStorage.setItem('skin', s), skin);
    for (const path of ['/', '/blog', '/breakdowns/runefall', '/breakdowns/logs']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(
        serious.map(
          (v) =>
            `${path} ${v.id}: ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(' '))
              .join(' | ')}`,
        ),
      ).toEqual([]);
    }
  });
}
