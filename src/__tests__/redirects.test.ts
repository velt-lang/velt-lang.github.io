/**
 * The redirects for old URLs (src/data/redirects.ts): each leads to a page,
 * none shadows one, and no page still links to an old URL (the build's link
 * check accepts a redirect, so it wouldn't catch a stale link).
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { REDIRECTS } from '../data/redirects';
import { apiModule, guideFile } from '../lib/std-api';

const SRC = join(import.meta.dirname, '..');
const DOCS = join(SRC, 'pages/docs');

/** Whether a docs path is a page this site renders. */
function isPage(path: string): boolean {
    const slug = (root: string) => path.slice(root.length).replace(/\/$/, '');
    if (path.startsWith('/docs/api/')) return !!apiModule(slug('/docs/api/'));
    if (path.startsWith('/docs/std/')) return !!guideFile(slug('/docs/std/'));
    const rel = slug('/docs/');
    return existsSync(join(DOCS, `${rel}.mdx`)) || existsSync(join(DOCS, rel, 'index.mdx'));
}

const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
        const f = join(dir, n);
        return statSync(f).isDirectory() ? walk(f) : /\.(mdx|tsx?)$/.test(n) ? [f] : [];
    });

describe('redirects', () => {
    it('cover the old std pages that moved', () => {
        for (const old of ['json', 'fetch', 'http', 'http_server', 'sqlite', 'postgres', 'redis', 'regex', 'timers', 'uuid']) {
            expect(REDIRECTS[`/docs/std/${old}/`], old).toBeTruthy();
        }
    });

    for (const [from, to] of Object.entries(REDIRECTS)) {
        it(`${from} → ${to}`, () => {
            expect(from).toMatch(/^\/docs\/.+\/$/);
            expect(isPage(from), `${from} is a page: drop the redirect`).toBe(false);
            expect(isPage(to), `${to} is not a page`).toBe(true);
        });
    }

    it('are not linked from any page', () => {
        const old = Object.keys(REDIRECTS);
        const stale: string[] = [];
        for (const file of walk(SRC)) {
            if (file.includes('__tests__') || file.endsWith('redirects.ts')) continue;
            const text = readFileSync(file, 'utf8');
            for (const url of old) {
                const re = new RegExp(`[("'\`]${url.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}(#|[)"'\`])`);
                if (re.test(text)) stale.push(`${relative(SRC, file)}: ${url}`);
            }
        }
        expect(stale, 'links to old URLs: link to the new page').toEqual([]);
    });
});
