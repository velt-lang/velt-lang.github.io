#!/usr/bin/env node
/**
 * Responsive check: loads every page of the built site (dist/) in Chromium at
 * phone, tablet and desktop widths and fails when a page scrolls sideways or
 * throws. Run `pnpm build` first.
 *
 *   pnpm check:responsive                         every page, every width
 *   pnpm check:responsive -- --pages /,/docs/     only these paths
 *   pnpm check:responsive -- --widths 390,1440    only these widths
 *   pnpm check:responsive -- --screenshots shots  full-page PNGs per page and width
 *   pnpm check:responsive -- --tabs 4             pages loaded at once per width (default 6)
 *
 * What counts as a failure:
 * - the page is wider than the window (document scrollWidth > window width): it
 *   scrolls sideways on a phone. The report names the elements that stick out,
 *   skipping ones inside a box that scrolls on purpose (overflow-x: auto/scroll,
 *   like code blocks and wide tables) or clips (overflow: hidden/clip);
 * - an uncaught error in the page's JavaScript.
 *
 * Needs Playwright's Chromium: `pnpm exec playwright install chromium` once.
 * CHROMIUM_PATH points it at another Chromium binary.
 */
import { createServer } from 'node:http';
import { readFile, readdir, stat, mkdir } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const DIST = resolve('dist');
const WIDTHS = [360, 390, 768, 1024, 1280, 1440];
const TYPES = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.md': 'text/markdown; charset=utf-8',
};

function arg(name) {
    const i = process.argv.indexOf(`--${name}`);
    return i > 0 ? process.argv[i + 1] : undefined;
}

/** Every page in dist: each index.html, as its route (redirect stubs left out). */
async function pages(dir = DIST) {
    const out = [];
    for (const name of await readdir(dir)) {
        const full = join(dir, name);
        if ((await stat(full)).isDirectory()) out.push(...(await pages(full)));
        // Old URLs are redirect stubs (meta refresh): not pages to check.
        else if (name === 'index.html' && !/http-equiv="refresh"/i.test(await readFile(full, 'utf8')))
            out.push(`/${full.slice(DIST.length + 1, -'index.html'.length).split(sep).join('/')}`);
    }
    return out.sort();
}

/** A static server for dist/, with directory routes to their index.html. */
function serve() {
    const server = createServer(async (req, res) => {
        let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        if (path.endsWith('/')) path += 'index.html';
        const file = resolve(DIST, `.${path}`);
        if (!file.startsWith(DIST)) return res.writeHead(403).end();
        try {
            const body = await readFile(file);
            res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
        } catch {
            try {
                const body = await readFile(join(file, 'index.html'));
                res.writeHead(200, { 'content-type': TYPES['.html'] }).end(body);
            } catch {
                res.writeHead(404).end();
            }
        }
    });
    return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

/** Runs in the page: the elements that stick out past the window, if it scrolls sideways. */
function overflow() {
    const width = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth <= width + 1) return null;
    // A box that scrolls or clips contains an element only if it is the element's containing
    // block or an ancestor of it: an absolutely positioned child of an unpositioned scroller
    // escapes it (and widens the page).
    const inScroller = (el) => {
        const start = getComputedStyle(el).position === 'absolute' ? el.offsetParent : el.parentElement;
        for (let p = start; p && p !== document.body; p = p.parentElement) {
            const s = getComputedStyle(p);
            if (['auto', 'scroll', 'hidden', 'clip'].includes(s.overflowX)) return true;
        }
        return false;
    };
    const describe = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : '';
        const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
        return `<${el.tagName.toLowerCase()}${id}${cls}>${text ? ` "${text}"` : ''}`;
    };
    const culprits = [];
    for (const el of document.body.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.right <= width + 1 || getComputedStyle(el).position === 'fixed' || inScroller(el)) continue;
        // Report the outermost offender, not every descendant of it.
        if (culprits.some((c) => c.el.contains(el))) continue;
        culprits.push({ el, right: Math.round(r.right) });
    }
    return {
        scrollWidth: document.documentElement.scrollWidth,
        culprits: culprits.slice(0, 5).map((c) => `${describe(c.el)} ends at ${c.right}px`),
    };
}

const only = arg('pages')?.split(',');
const widths = arg('widths')?.split(',').map(Number) ?? WIDTHS;
const shots = arg('screenshots');
if (shots) await mkdir(shots, { recursive: true });

const routes = only ?? (await pages());
const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const failures = [];

// Pages load in parallel, a few tabs per width.
const TABS = Number(arg('tabs') ?? 6);
for (const width of widths) {
    const queue = [...routes];
    const worker = async () => {
        const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        for (let route = queue.shift(); route !== undefined; route = queue.shift()) {
            errors.length = 0;
            let over;
            try {
                await page.goto(base + route, { waitUntil: 'load' });
                // Fonts change text widths; islands hydrate on load.
                await page.evaluate(() => document.fonts.ready);
                await page.waitForTimeout(150);
                over = await page.evaluate(overflow);
            } catch (e) {
                failures.push(`${route} at ${width}px: could not check: ${String(e.message ?? e).split('\n')[0]}`);
                continue;
            }
            if (over) failures.push(`${route} at ${width}px: page is ${over.scrollWidth}px wide\n      ${over.culprits.join('\n      ')}`);
            for (const e of errors) failures.push(`${route} at ${width}px: page error: ${e}`);
            if (shots) await page.screenshot({ path: join(shots, `${route.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home'}-${width}.png`), fullPage: true });
        }
        await page.close();
    };
    await Promise.all(Array.from({ length: TABS }, worker));
    console.log(`${width}px: ${routes.length} pages checked`);
}

await browser.close();
server.close();

if (failures.length) {
    console.error(`\n✗ ${failures.length} responsive problem(s):\n  ${failures.join('\n  ')}`);
    process.exit(1);
}
console.log(`\n✓ ${routes.length} pages fit every width (${widths.join(', ')} px)`);
