/**
 * The home page's "Beyond TypeScript" and "Run anywhere" sections
 * (src/data/beyond.ts, src/data/targets.ts): every docs link lands on a page
 * and a heading it has, the code markers are well formed, and the islands
 * server-render their default selection with tab semantics.
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToString } from '@sigx/server-renderer/server';
import { defineApp } from 'sigx';
import { AREAS, beyondCounts, indexItems, ticks } from '../data/beyond';
import { DEFAULT_TARGET, TARGETS } from '../data/targets';
import { BeyondExplorer } from '../islands/BeyondExplorer';
import { TargetSwitcher } from '../islands/TargetSwitcher';

const DOCS = join(import.meta.dirname, '../pages/docs');

/** Links written in src/pages/index.tsx for these sections. */
const PAGE_LINKS = [
    '/docs/book/ts-developers/',
    '/docs/tooling/webassembly/#the-playground',
    '/docs/tooling/webassembly/#what-works',
    '/docs/tooling/webassembly/#setup',
];

/** github-slugger's slug of a Markdown heading. */
const slug = (heading: string) =>
    heading
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/`/g, '')
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '')
        .replace(/ /g, '-');

/** The heading ids of an MDX page (outside code fences), numbered as the slugger numbers repeats. */
function anchors(file: string): Set<string> {
    const seen = new Map<string, number>();
    const out = new Set<string>();
    let fence = false;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        if (/^\s*(`{3,}[^`]*|~{3,}.*)$/.test(line)) fence = !fence; // an info string has no backticks
        const m = !fence && line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
        if (!m) continue;
        const base = slug(m[1]);
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        out.add(n ? `${base}-${n}` : base);
    }
    return out;
}

function resolve(href: string): { file: string | null; hash: string } {
    const [path, hash = ''] = href.split('#');
    const rel = path.replace(/^\/docs\//, '').replace(/\/$/, '');
    const file = [join(DOCS, `${rel}.mdx`), join(DOCS, rel, 'index.mdx')].find(existsSync) ?? null;
    return { file, hash };
}

const links = [
    ...AREAS.flatMap((a) => indexItems(a).map((i) => [`${a.id}: ${i.name}`, i.href])),
    ...TARGETS.map((t) => [`target ${t.id}`, t.href]),
    ...PAGE_LINKS.map((l) => ['index.tsx', l]),
];

describe('home page docs links', () => {
    for (const [what, href] of links) {
        it(`${what} → ${href}`, () => {
            expect(href).toMatch(/^\/docs\/.+\/(#[\w-]+)?$/);
            const { file, hash } = resolve(href);
            expect(file, `no page for ${href}`).not.toBeNull();
            if (hash) expect([...anchors(file!)], `no heading #${hash} in ${file}`).toContain(hash);
        });
    }
});

describe('beyond and targets data', () => {
    const MARK = /\[\[([kstfnc]):([\s\S]*?)\]\]/g;
    const codes = [...AREAS.flatMap((a) => a.features.map((f) => f.code)), ...TARGETS.flatMap((t) => t.cards.map((c) => c.code))];

    it('has unique ids and names', () => {
        expect(new Set(AREAS.map((a) => a.id)).size).toBe(AREAS.length);
        expect(new Set(TARGETS.map((t) => t.id)).size).toBe(TARGETS.length);
        for (const a of AREAS) expect(new Set(indexItems(a).map((i) => i.name)).size).toBe(indexItems(a).length);
        expect(TARGETS.some((t) => t.id === DEFAULT_TARGET)).toBe(true);
    });

    it('counts areas, features and new ones from the data', () => {
        const all = AREAS.flatMap(indexItems);
        expect(beyondCounts()).toEqual({ areas: AREAS.length, features: all.length, isNew: all.filter((i) => i.isNew).length });
        expect(beyondCounts().isNew).toBeGreaterThan(0);
    });

    it('writes code markers whole', () => {
        for (const c of codes) expect(c.replace(MARK, '')).not.toMatch(/\[\[[kstfnc]:/);
    });

    it('pairs the backticks of inline code', () => {
        const prose = [...AREAS.flatMap((a) => a.features.flatMap((f) => [f.what, f.ts])), ...TARGETS.flatMap((t) => [t.body, ...t.facts])];
        for (const p of prose) expect((p.match(/`/g) ?? []).length % 2, p).toBe(0);
        expect(ticks('a `b` c')).toEqual([{ code: false, text: 'a ' }, { code: true, text: 'b' }, { code: false, text: ' c' }]);
    });
});

describe('islands render their default selection', () => {
    it('BeyondExplorer: the first area and its first feature, as tabs', async () => {
        const html = await renderToString(defineApp(<BeyondExplorer areas={AREAS} />));
        expect(html).toContain('role="tablist"');
        expect(html.match(/role="tab"/g)?.length).toBe(AREAS.length);
        expect(html).toMatch(new RegExp(`id="beyond-tab-${AREAS[0].id}"[^>]*aria-selected="true"`));
        expect(html).toContain(`aria-labelledby="beyond-tab-${AREAS[0].id}"`);
        expect(html).toContain(AREAS[0].pitch);
        expect(html).toContain(`href="${AREAS[0].features[0].href}"`);
    });

    it('TargetSwitcher: the default target', async () => {
        const html = await renderToString(defineApp(<TargetSwitcher targets={TARGETS} initial={DEFAULT_TARGET} />));
        const t = TARGETS.find((x) => x.id === DEFAULT_TARGET)!;
        expect(html.match(/role="tab"/g)?.length).toBe(TARGETS.length);
        expect(html).toMatch(new RegExp(`id="target-tab-${t.id}"[^>]*aria-selected="true"`));
        expect(html).toContain(t.headline);
        expect(html).toContain(`href="${t.href}"`);
        expect(html).toContain('unchanged');
    });
});
