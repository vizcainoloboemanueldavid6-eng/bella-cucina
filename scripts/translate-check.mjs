/**
 * Regression check: the page must survive Chrome's built-in Google Translate.
 *
 * Visitors who open this English site in Chrome with another browser language get it
 * auto-translated. Translate replaces every text node with
 * `<font style="vertical-align: inherit;"><font …>translated</font></font>` and translates any
 * text rendered later as well. React still holds the ORIGINAL text nodes, so:
 *   - removing or moving one of them throws `NotFoundError: Failed to execute 'removeChild'`
 *     (or 'insertBefore') and Next.js replaces the page with "Application error", and
 *   - updating one writes into a node that is no longer on screen, so the visitor keeps seeing
 *     the old value.
 *
 * This script drives every interactive element twice per viewport (390 px and 1440 px): once on
 * the plain page (the baseline) and once with a simulated translation that is RE-RUN after every
 * single interaction, the way Translate picks up new content. Each step asserts no page error, no
 * "Application error" screen and no `[dom-guard]` report, and records what a visitor would read;
 * the translated run must read the same as the baseline at every step.
 *
 *   npm run check:translate                 builds nothing; serves ./out on 127.0.0.1:4350
 *   npm run check:translate -- --url <url>  runs against a deployed copy instead
 *
 * Environment: CHECK_PORT (default 4350), PW_CHANNEL (default "chrome"; the branded Chrome that
 * is installed on the machine — set it to "" to use Playwright's own Chromium).
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'out');
const PORT = Number(process.env.CHECK_PORT ?? 4350);
const CHANNEL = process.env.PW_CHANNEL ?? 'chrome';

const argv = process.argv.slice(2);
const urlFlag = argv.findIndex((arg) => arg === '--url' || arg.startsWith('--url='));
const REMOTE_URL =
  urlFlag === -1
    ? null
    : argv[urlFlag].includes('=')
      ? argv[urlFlag].slice('--url='.length)
      : argv[urlFlag + 1];
/** --only <text>: run just the scenarios whose name contains <text> (handy while debugging). */
const onlyFlag = argv.indexOf('--only');
const ONLY = onlyFlag === -1 ? null : argv[onlyFlag + 1];

const VIEWPORTS = [
  {
    name: '390',
    options: {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
    mobile: true,
  },
  { name: '1440', options: { viewport: { width: 1440, height: 900 } }, mobile: false },
];

/** Settle time after an interaction, before translating and reading the page. */
const SETTLE_MS = 250;

// ---------------------------------------------------------------------------------------------
// Static server for ./out (trailingSlash export: every route is a directory with index.html).

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function serveOut() {
  if (!existsSync(join(OUT, 'index.html'))) {
    throw new Error('out/index.html is missing. Run `npm run build` first.');
  }
  return new Promise((done, fail) => {
    const server = createServer(async (request, response) => {
      try {
        const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://x').pathname);
        let file = resolve(OUT, `.${pathname}`);
        if (file !== OUT && !file.startsWith(OUT + sep)) {
          response.writeHead(403).end();
          return;
        }
        if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
        if (!existsSync(file)) {
          response.writeHead(404).end('Not found');
          return;
        }
        response.writeHead(200, {
          'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
        });
        response.end(await readFile(file));
      } catch (error) {
        response.writeHead(500).end(String(error));
      }
    });
    server.once('error', fail);
    server.listen(PORT, '127.0.0.1', () => done(server));
  });
}

// ---------------------------------------------------------------------------------------------
// What Translate does to the DOM. Runs in the page.

function simulateTranslate() {
  const own = (window.__simulatedTranslation ??= new WeakSet());
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim() || own.has(node)) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, noscript, textarea, [translate="no"]')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const original of nodes) {
    const outer = document.createElement('font');
    outer.style.verticalAlign = 'inherit';
    const inner = document.createElement('font');
    inner.style.verticalAlign = 'inherit';
    const translated = document.createTextNode(`[es] ${original.nodeValue}`);
    own.add(translated);
    inner.appendChild(translated);
    outer.appendChild(inner);
    original.parentNode.replaceChild(outer, original);
  }
  return nodes.length;
}

/** What a visitor reads: the translation marker stripped, whitespace collapsed. */
function norm(value) {
  return value == null
    ? null
    : String(value)
        .replace(/\[es\] /g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function localDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ---------------------------------------------------------------------------------------------
// Scenario harness.

function makeContext(page, translated, failures, where) {
  const pageErrors = [];
  const reactConsoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/\[dom-guard\]|Minified React error|Hydration|hydrat/i.test(text)) {
      reactConsoleErrors.push(text.slice(0, 300));
    }
  });

  const probes = [];

  const ctx = {
    page,
    translated,
    probes,
    expect(condition, message) {
      if (!condition) failures.push(`${where()} — ${message}`);
    },
    async text(selector) {
      const locator = page.locator(selector).first();
      if ((await locator.count()) === 0) return null;
      return norm(await locator.textContent());
    },
    /** Reads an attribute without Playwright's auto-wait (null when nothing matches). */
    attr(selector, name) {
      return page.evaluate(
        ([css, attribute]) => document.querySelector(css)?.getAttribute(attribute) ?? null,
        [selector, name],
      );
    },
    async texts(selector) {
      return (await page.locator(selector).allTextContents()).map(norm);
    },
    async translate() {
      if (translated) await page.evaluate(simulateTranslate);
    },
    /**
     * One interaction: perform it, let React commit, translate whatever is new, check the page is
     * alive, then record what the visitor reads.
     */
    async step(label, action, probe) {
      const stepWhere = `${where()} › ${label}`;
      try {
        await action();
      } catch (error) {
        failures.push(`${stepWhere} — interaction failed: ${error.message.split('\n')[0]}`);
      }
      await page.waitForTimeout(SETTLE_MS);
      await ctx.translate();
      await page.waitForTimeout(50);

      if (pageErrors.length) {
        failures.push(`${stepWhere} — page error: ${pageErrors.splice(0).join(' | ')}`);
      }
      if (reactConsoleErrors.length) {
        failures.push(`${stepWhere} — console: ${reactConsoleErrors.splice(0).join(' | ')}`);
      }
      const crashed = await page
        .evaluate(
          () =>
            /application error/i.test(document.body.innerText) ||
            document.getElementById('main') === null,
        )
        .catch(() => true);
      if (crashed) failures.push(`${stepWhere} — "Application error" screen / page unmounted`);

      if (probe) {
        let value;
        try {
          value = await probe();
        } catch (error) {
          value = `probe failed: ${error.message.split('\n')[0]}`;
          failures.push(`${stepWhere} — ${value}`);
        }
        probes.push({ label, value: JSON.stringify(value) });
      }
    },
  };
  return ctx;
}

async function pollFor(read, expected, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  let value = await read();
  while (value !== expected && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 100));
    value = await read();
  }
  return value;
}

// ---------------------------------------------------------------------------------------------
// Scenarios. Every interactive element on the page is exercised by one of them.

const scenarios = [
  {
    // The safety net from src/lib/domGuard.ts: installed, harmless for normal calls, and it turns
    // the two NotFoundErrors into a logged `[dom-guard]` report. Its own console output is captured
    // here so it does not trip the harness, which fails on any other `[dom-guard]` message.
    name: 'dom guard',
    async run(ctx) {
      await ctx.step(
        'guard behaviour',
        async () => {},
        async () => {
          const result = await ctx.page.evaluate(() => {
            const reports = [];
            const originalError = console.error;
            console.error = (message) => reports.push(String(message));
            const outcome = {
              installed: !/\[native code\]/.test(Node.prototype.removeChild.toString()),
            };
            try {
              const parent = document.createElement('div');
              const own = parent.appendChild(document.createElement('em'));
              const before = parent.insertBefore(document.createElement('b'), own);
              outcome.normalInsert = parent.firstChild === before;
              parent.removeChild(own);
              outcome.normalRemove = own.parentNode === null && reports.length === 0;
              try {
                parent.removeChild(document.createElement('span'));
                outcome.foreignRemove = 'skipped';
              } catch (error) {
                outcome.foreignRemove = `threw ${error.name}`;
              }
              const late = document.createElement('i');
              try {
                parent.insertBefore(late, document.createElement('u'));
                outcome.foreignInsert = late.parentNode === parent ? 'appended' : 'dropped';
              } catch (error) {
                outcome.foreignInsert = `threw ${error.name}`;
              }
            } finally {
              console.error = originalError;
            }
            outcome.reports = reports.filter((message) => message.startsWith('[dom-guard]')).length;
            return outcome;
          });
          ctx.expect(result.installed, 'DOM guard is not installed');
          ctx.expect(result.normalInsert && result.normalRemove, 'DOM guard broke ordinary calls');
          ctx.expect(
            result.foreignRemove === 'skipped',
            `foreign removeChild ${result.foreignRemove}`,
          );
          ctx.expect(
            result.foreignInsert === 'appended',
            `foreign insertBefore ${result.foreignInsert}`,
          );
          ctx.expect(result.reports === 2, `guard logged ${result.reports} reports, expected 2`);
          return result;
        },
      );
    },
  },

  {
    name: 'static text and copyright year',
    async run(ctx) {
      await ctx.step(
        'loaded',
        async () => {},
        async () => {
          const year = await ctx.text('footer p:has-text("All rights reserved")');
          ctx.expect(
            year?.includes(String(new Date().getFullYear())),
            `footer year reads "${year}"`,
          );
          return year;
        },
      );
    },
  },

  {
    name: 'about counters',
    async run(ctx) {
      const read = () => ctx.texts('#about dl dd > span[aria-hidden="true"]');
      await ctx.step(
        'scrolled into view (translated mid-count)',
        async () => {
          await ctx.page.locator('#about dl').scrollIntoViewIfNeeded();
          await ctx.page.waitForTimeout(350);
        },
        null,
      );
      await ctx.step(
        'count finished',
        async () => ctx.page.waitForTimeout(2200),
        async () => {
          const values = await read();
          ctx.expect(
            values.join('|') === '25+|40+|12k+',
            `counters read "${values.join(' · ')}", expected "25+ · 40+ · 12k+"`,
          );
          return values;
        },
      );
    },
  },

  {
    name: 'mobile navigation drawer',
    only: 'mobile',
    async run(ctx) {
      const { page } = ctx;
      const toggle = page.locator('button[aria-controls="mobile-menu"]');
      const state = async () => ({
        open: await page.locator('#mobile-menu').isVisible(),
        expanded: await toggle.getAttribute('aria-expanded'),
        label: await ctx.text('button[aria-controls="mobile-menu"] .sr-only'),
      });
      const expectState = (value, open) => {
        ctx.expect(value.open === open, `drawer open=${value.open}, expected ${open}`);
        ctx.expect(
          value.label === (open ? 'Close menu' : 'Open menu'),
          `toggle label "${value.label}"`,
        );
      };
      const openDrawer = async (label) =>
        ctx.step(
          label,
          () => toggle.click(),
          async () => {
            const value = await state();
            expectState(value, true);
            return value;
          },
        );
      const closedBy = async (label, action) =>
        ctx.step(label, action, async () => {
          const value = await state();
          expectState(value, false);
          return value;
        });

      await openDrawer('open with hamburger');
      await closedBy('close with X', () =>
        page.locator('#mobile-menu button', { hasText: 'Close menu' }).click(),
      );
      await openDrawer('open again');
      await closedBy('close with Escape', () => page.keyboard.press('Escape'));
      await openDrawer('open for backdrop');
      await closedBy('close with backdrop tap', () => page.mouse.click(12, 420));

      for (const href of ['#menu', '#about', '#gallery', '#reviews', '#visit']) {
        await openDrawer(`open for ${href}`);
        await closedBy(`drawer link ${href}`, () =>
          page.locator(`#mobile-menu a[href="${href}"]`).click(),
        );
        await ctx.step(
          `${href} marked current`,
          async () => {},
          async () => {
            const value = await pollFor(
              () => ctx.attr('nav[aria-label="Primary"] a[aria-current="true"]', 'href'),
              href,
            );
            ctx.expect(value === href, `aria-current on ${value}, expected ${href}`);
            return value;
          },
        );
      }
      await openDrawer('open for reserve CTA');
      await closedBy('drawer Reserve a Table', () =>
        page.locator('#mobile-menu a[href="#reserve"]').click(),
      );
      await openDrawer('open for phone link');
      // tel: is handed to the OS; only its presence is checked, it is not followed.
      await ctx.step(
        'drawer phone link present',
        async () => {},
        async () => page.locator('#mobile-menu a[href^="tel:"]').count(),
      );
      await closedBy('close after phone check', () => page.keyboard.press('Escape'));
    },
  },

  {
    name: 'desktop navigation',
    only: 'desktop',
    async run(ctx) {
      const { page } = ctx;
      const current = () => ctx.attr('header a[aria-current="true"]', 'href');
      for (const href of ['#menu', '#about', '#gallery', '#reviews', '#visit', '#reserve']) {
        await ctx.step(
          `header link ${href}`,
          () => page.locator(`header a[href="${href}"]`).first().click(),
          async () => {
            const value = await pollFor(current, href);
            ctx.expect(value === href, `aria-current on ${value}, expected ${href}`);
            return value;
          },
        );
      }
      await ctx.step(
        'brand link back to top',
        () => page.locator('header a[href="#top"]').click(),
        async () => pollFor(async () => page.evaluate(() => window.scrollY < 50), true),
      );
    },
  },

  {
    name: 'page links and external links',
    async run(ctx) {
      const { page } = ctx;
      await ctx.step(
        'skip link',
        async () => {
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
        },
        async () => page.evaluate(() => location.hash),
      );
      for (const [label, selector] of [
        ['hero View the menu', 'main a[href="#menu"]'],
        ['hero Reserve', 'main a[href="#reserve"]'],
      ]) {
        await ctx.step(
          label,
          () => page.locator(selector).first().click(),
          async () => page.evaluate(() => location.hash),
        );
      }
      const footerLinks = await page
        .locator('footer a[href^="#"]')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      for (const [index, href] of footerLinks.entries()) {
        await ctx.step(
          `footer link ${index} ${href}`,
          () => page.locator('footer a[href^="#"]').nth(index).click(),
          async () => page.evaluate(() => location.hash),
        );
      }
      const external = [
        ['floating WhatsApp button', 'a[href^="https://wa.me/"][target="_blank"]'],
        ['Visit directions', '#visit a[target="_blank"]'],
      ];
      for (const [label, selector] of external) {
        await ctx.step(
          label,
          async () => {
            const popupPromise = page.context().waitForEvent('page', { timeout: 5000 });
            await page.locator(selector).first().click();
            const popup = await popupPromise;
            await popup.close();
          },
          async () => page.locator(selector).count(),
        );
      }
    },
  },

  {
    name: 'menu tabs',
    async run(ctx) {
      const { page } = ctx;
      const tabs = page.locator('#menu [role="tab"]');
      const count = await tabs.count();
      ctx.expect(count >= 2, `found ${count} menu tabs`);
      // Expected first dish per panel, read from the hidden panels (same in both runs).
      const firstDish = await page
        .locator('#menu [role="tabpanel"]')
        .evaluateAll((panels) =>
          Object.fromEntries(
            panels.map((panel) => [panel.id, panel.querySelector('h3')?.textContent ?? '']),
          ),
        );
      for (const id of Object.keys(firstDish)) firstDish[id] = norm(firstDish[id]);

      const state = async () => {
        const selected = page.locator('#menu [role="tab"][aria-selected="true"]');
        const controls = await selected.getAttribute('aria-controls');
        const visible = page.locator('#menu [role="tabpanel"]:not([hidden])');
        const visibleIds = await visible.evaluateAll((panels) => panels.map((p) => p.id));
        const dish = await ctx.text('#menu [role="tabpanel"]:not([hidden]) h3');
        ctx.expect(
          visibleIds.length === 1 && visibleIds[0] === controls,
          `visible panels ${visibleIds.join(',')} but ${controls} is selected`,
        );
        ctx.expect(
          dish === firstDish[controls],
          `panel ${controls} shows "${dish}", expected "${firstDish[controls]}"`,
        );
        return { tab: norm(await selected.textContent()), controls, dish };
      };

      for (let index = count - 1; index >= 0; index -= 1) {
        await ctx.step(`click tab ${index}`, () => tabs.nth(index).click(), state);
      }
      await ctx.step('ArrowLeft wraps to last', () => page.keyboard.press('ArrowLeft'), state);
      await ctx.step('ArrowRight wraps to first', () => page.keyboard.press('ArrowRight'), state);
      await ctx.step('ArrowRight', () => page.keyboard.press('ArrowRight'), state);
      await ctx.step('End', () => page.keyboard.press('End'), state);
      await ctx.step('Home', () => page.keyboard.press('Home'), state);
    },
  },

  {
    name: 'gallery lightbox',
    async run(ctx) {
      const { page } = ctx;
      const buttons = page.locator('#gallery ul button');
      const captions = (
        await buttons.evaluateAll((list) => list.map((b) => b.getAttribute('aria-label')))
      ).map((label) => label.replace(/^Open photo: /, ''));
      const total = captions.length;
      ctx.expect(total >= 2, `found ${total} gallery photos`);
      const dialog = page.locator('[role="dialog"][aria-label="Gallery photo viewer"]');

      const at = (index) => async () => {
        const open = await dialog.isVisible();
        const caption = await ctx.text('#lightbox-status p');
        const counter = await ctx.text('#lightbox-status p span[aria-hidden="true"]');
        const spoken = await ctx.text('#lightbox-status .sr-only');
        const src = await dialog.locator('img').getAttribute('src');
        ctx.expect(open, 'lightbox is not open');
        ctx.expect(
          caption === captions[index],
          `caption "${caption}", expected "${captions[index]}"`,
        );
        ctx.expect(
          counter === `${index + 1} / ${total}`,
          `counter "${counter}", expected "${index + 1} / ${total}"`,
        );
        ctx.expect(spoken === `Photo ${index + 1} of ${total}`, `status "${spoken}"`);
        return { caption, counter, spoken, src };
      };
      const closed = async () => {
        const count = await dialog.count();
        ctx.expect(count === 0, 'lightbox is still open');
        return count;
      };

      await ctx.step('open photo 1', () => buttons.nth(0).click(), at(0));
      await ctx.step(
        'next',
        () => dialog.getByRole('button', { name: 'Next photo' }).click(),
        at(1),
      );
      await ctx.step(
        'next again',
        () => dialog.getByRole('button', { name: 'Next photo' }).click(),
        at(2),
      );
      await ctx.step('ArrowRight', () => page.keyboard.press('ArrowRight'), at(3));
      await ctx.step('ArrowLeft', () => page.keyboard.press('ArrowLeft'), at(2));
      await ctx.step(
        'previous',
        () => dialog.getByRole('button', { name: 'Previous photo' }).click(),
        at(1),
      );
      await ctx.step(
        'previous to first',
        () => dialog.getByRole('button', { name: 'Previous photo' }).click(),
        at(0),
      );
      await ctx.step(
        'previous wraps to last',
        () => dialog.getByRole('button', { name: 'Previous photo' }).click(),
        at(total - 1),
      );
      await ctx.step(
        'next wraps to first',
        () => dialog.getByRole('button', { name: 'Next photo' }).click(),
        at(0),
      );
      await ctx.step(
        'close button',
        () => dialog.getByRole('button', { name: 'Close photo viewer' }).click(),
        closed,
      );
      await ctx.step('open last photo', () => buttons.nth(total - 1).click(), at(total - 1));
      await ctx.step('Escape', () => page.keyboard.press('Escape'), closed);
      await ctx.step('open photo 2', () => buttons.nth(1).click(), at(1));
      await ctx.step('backdrop click', () => page.mouse.click(6, 6), closed);
    },
  },

  {
    name: 'reviews carousel',
    async run(ctx) {
      const { page } = ctx;
      const dots = page.locator('#reviews button[aria-label^="Go to review"]');
      const total = await dots.count();
      ctx.expect(total >= 2, `found ${total} review dots`);
      const names = [];
      const at = (index) => async () => {
        const name = await ctx.text('#reviews figcaption p');
        const quote = await ctx.text('#reviews blockquote');
        const current = await dots.evaluateAll((list) =>
          list.findIndex((dot) => dot.getAttribute('aria-current') === 'true'),
        );
        ctx.expect(current === index, `active dot ${current}, expected ${index}`);
        if (names[index] === undefined) names[index] = name;
        ctx.expect(
          name === names[index],
          `review ${index} shows "${name}", expected "${names[index]}"`,
        );
        ctx.expect(!!quote && !!name, 'review text missing');
        return { name, quote, current };
      };
      const next = () => page.getByRole('button', { name: 'Next review' }).click();
      const previous = () => page.getByRole('button', { name: 'Previous review' }).click();

      await ctx.step('initial', async () => {}, at(0));
      for (let index = 1; index < total; index += 1) {
        await ctx.step(`next to ${index}`, next, at(index));
      }
      await ctx.step('next wraps to 0', next, at(0));
      await ctx.step('previous wraps to last', previous, at(total - 1));
      await ctx.step('dot 2', () => dots.nth(1).click(), at(1));
      await ctx.step('ArrowRight in carousel', () => page.keyboard.press('ArrowRight'), at(2));
      await ctx.step('ArrowLeft in carousel', () => page.keyboard.press('ArrowLeft'), at(1));
      await ctx.step(
        'names are distinct',
        async () => {},
        async () => {
          ctx.expect(new Set(names).size === total, `review names ${names.join(', ')}`);
          return names;
        },
      );
    },
  },

  {
    name: 'reservation form',
    async run(ctx) {
      const { page } = ctx;
      const errors = () =>
        page
          .locator('#reserve [role="alert"]')
          .evaluateAll((list) => list.map((node) => `${node.id}: ${node.textContent}`))
          .then((list) => list.map(norm));
      const errorFor = async (field) => ctx.text(`#reserve-${field}-error`);
      const counter = () => ctx.text('#reserve-note-counter');
      const submit = () => page.locator('#reserve form button[type="submit"]').click();

      await ctx.step('submit empty form', submit, async () => {
        const list = await errors();
        ctx.expect(list.length === 5, `expected 5 errors, got ${list.length}: ${list.join(' / ')}`);
        return list;
      });
      await ctx.step(
        'name too short',
        () => page.fill('#reserve-name', 'J'),
        async () => {
          const message = await errorFor('name');
          ctx.expect(message === 'Please enter at least 2 characters.', `name error "${message}"`);
          return errors();
        },
      );
      await ctx.step(
        'name cleared',
        () => page.fill('#reserve-name', ''),
        async () => {
          const message = await errorFor('name');
          ctx.expect(
            message === 'Please tell us the name for the booking.',
            `name error "${message}"`,
          );
          return errors();
        },
      );
      await ctx.step(
        'name valid',
        () => page.fill('#reserve-name', 'Giulia Rossi'),
        async () => {
          ctx.expect((await errorFor('name')) === null, 'name error still shown');
          return errors();
        },
      );
      await ctx.step(
        'phone too short',
        () => page.fill('#reserve-phone', '12'),
        async () => {
          ctx.expect((await errorFor('phone')) !== null, 'phone error missing');
          return errors();
        },
      );
      await ctx.step(
        'phone valid',
        () => page.fill('#reserve-phone', '+1 212 555 0148'),
        async () => {
          ctx.expect((await errorFor('phone')) === null, 'phone error still shown');
          return errors();
        },
      );
      await ctx.step(
        'date in the past',
        () => page.fill('#reserve-date', localDate(-2)),
        async () => {
          const message = await errorFor('date');
          ctx.expect(/already passed/.test(message ?? ''), `date error "${message}"`);
          return errors();
        },
      );
      await ctx.step(
        'date too far ahead',
        () => page.fill('#reserve-date', localDate(400)),
        async () => {
          const message = await errorFor('date');
          ctx.expect(/up to .* ahead/.test(message ?? ''), `date error "${message}"`);
          return errors();
        },
      );
      await ctx.step(
        'date valid',
        () => page.fill('#reserve-date', localDate(3)),
        async () => {
          ctx.expect((await errorFor('date')) === null, 'date error still shown');
          return errors();
        },
      );
      await ctx.step(
        'time chosen',
        () => page.selectOption('#reserve-time', '19:00'),
        async () => {
          ctx.expect((await errorFor('time')) === null, 'time error still shown');
          return errors();
        },
      );
      await ctx.step(
        'guests chosen',
        () => page.selectOption('#reserve-guests', '4'),
        async () => {
          ctx.expect((await errorFor('guests')) === null, 'guests error still shown');
          return errors();
        },
      );
      const note = 'Window table, it is a birthday';
      await ctx.step(
        'note typed',
        () => page.fill('#reserve-note', note),
        async () => {
          const value = await counter();
          ctx.expect(value === `${note.length} / 300 characters`, `note counter "${value}"`);
          return value;
        },
      );
      await ctx.step(
        'note extended key by key',
        () => page.locator('#reserve-note').pressSequentially('!!', { delay: 30 }),
        async () => {
          const value = await counter();
          ctx.expect(value === `${note.length + 2} / 300 characters`, `note counter "${value}"`);
          return value;
        },
      );
      await ctx.step('submit valid booking', submit, async () => {
        const status = page.locator('#reserve [role="status"]');
        const summary = norm(
          await status
            .locator('dl')
            .textContent()
            .catch(() => null),
        );
        const opened = await page.evaluate(() => window.__openedUrl ?? null);
        ctx.expect(await status.isVisible(), 'confirmation is not shown');
        ctx.expect(
          !!summary &&
            summary.includes('Giulia Rossi') &&
            summary.includes('4 guests') &&
            summary.includes('7:00'),
          `confirmation reads "${summary}"`,
        );
        ctx.expect(!!opened && opened.startsWith('https://wa.me/'), `WhatsApp URL "${opened}"`);
        return summary;
      });
      await ctx.step(
        'make another booking',
        () => page.getByRole('button', { name: 'Make another booking' }).click(),
        async () => {
          const name = await page.inputValue('#reserve-name');
          const value = await counter();
          const list = await errors();
          ctx.expect(name === '', `name field kept "${name}"`);
          ctx.expect(value === '0 / 300 characters', `note counter "${value}"`);
          ctx.expect(list.length === 0, `errors after reset: ${list.join(' / ')}`);
          return { name, value, list };
        },
      );
      await ctx.step(
        'blur empty name',
        async () => {
          await page.locator('#reserve-name').focus();
          await page.keyboard.press('Tab');
        },
        async () => {
          const message = await errorFor('name');
          ctx.expect(
            message === 'Please tell us the name for the booking.',
            `name error "${message}"`,
          );
          return errors();
        },
      );
      await ctx.step(
        'fix name after blur',
        () => page.fill('#reserve-name', 'Marco'),
        async () => {
          ctx.expect((await errorFor('name')) === null, 'name error still shown');
          return errors();
        },
      );
    },
  },
];

// ---------------------------------------------------------------------------------------------

async function main() {
  let server = null;
  let base = REMOTE_URL;
  if (!base) {
    server = await serveOut();
    base = `http://127.0.0.1:${PORT}/`;
  }
  const origin = new URL(base).origin;
  const browser = await chromium.launch(CHANNEL ? { channel: CHANNEL } : {});
  const failures = [];
  let steps = 0;

  try {
    for (const viewport of VIEWPORTS) {
      for (const scenario of scenarios) {
        if (scenario.only === 'mobile' && !viewport.mobile) continue;
        if (scenario.only === 'desktop' && viewport.mobile) continue;
        if (ONLY && !scenario.name.includes(ONLY)) continue;

        const runs = {};
        const failuresBefore = failures.length;
        const startedAt = Date.now();
        for (const translated of [false, true]) {
          const mode = translated ? 'translated' : 'plain';
          const context = await browser.newContext({
            ...viewport.options,
            locale: 'en-US',
            timezoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
          // Keep the run hermetic: third-party requests (map tiles, WhatsApp) are not needed.
          await context.route('**/*', (route) =>
            new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
          );
          // The booking form opens WhatsApp; record the URL instead of leaving the page.
          await context.addInitScript(() => {
            window.open = (url) => {
              window.__openedUrl = String(url);
              return { opener: null };
            };
          });
          const page = await context.newPage();
          page.setDefaultTimeout(8000);
          let current = 'load';
          const where = () => `[${viewport.name}px ${mode}] ${scenario.name}`;
          const ctx = makeContext(page, translated, failures, where);
          try {
            await page.goto(base, { waitUntil: 'networkidle' });
            // Smooth scrolling has nothing to do with translation, and Playwright waits for every
            // animated scroll to settle before a click (about 3 s per footer link). Jump instead.
            await page.evaluate(() =>
              document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important'),
            );
            await page.waitForTimeout(300);
            if (translated) {
              const wrapped = await page.evaluate(simulateTranslate);
              ctx.expect(wrapped > 100, `only ${wrapped} text nodes translated on load`);
            }
            current = 'run';
            await scenario.run(ctx);
          } catch (error) {
            failures.push(
              `${where()} — aborted during ${current}: ${error.message.split('\n')[0]}`,
            );
          } finally {
            steps += ctx.probes.length;
            runs[mode] = ctx.probes;
            await context.close();
          }
        }

        // Correct content: the translated page must read what the plain page reads.
        const plain = runs.plain ?? [];
        const translatedRun = runs.translated ?? [];
        for (const [index, expected] of plain.entries()) {
          const actual = translatedRun[index];
          if (!actual || actual.label !== expected.label) {
            failures.push(
              `[${viewport.name}px] ${scenario.name} › ${expected.label} — step missing in translated run`,
            );
          } else if (actual.value !== expected.value) {
            failures.push(
              `[${viewport.name}px] ${scenario.name} › ${expected.label} — translated page reads ${actual.value.slice(0, 200)}, plain page reads ${expected.value.slice(0, 200)}`,
            );
          }
        }
        console.log(
          `${failures.length > failuresBefore ? 'FAIL' : 'ok  '} ${viewport.name}px ${scenario.name} (${plain.length} steps, ${((Date.now() - startedAt) / 1000).toFixed(1)} s)`,
        );
      }
    }
  } finally {
    await browser.close();
    if (server) await new Promise((done) => server.close(done));
  }

  console.log(`\nTranslation check against ${base}: ${steps} recorded steps.`);
  if (failures.length) {
    console.error(`\n${failures.length} failure(s):`);
    for (const failure of failures) console.error(`  ✗ ${failure}`);
    process.exit(1);
  }
  console.log('No page errors, no "Application error" screen, translated content matches.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
