/**
 * Every docs page carries the frontmatter the sidebar, search, sitemap and
 * llms.txt are built from (AGENTS.md, "Writing docs pages").
 */
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { GROUPS } from '../lib/docs-groups';

const ROOT = join(import.meta.dirname, '../pages/docs');
const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
        const f = join(dir, n);
        return statSync(f).isDirectory() ? walk(f) : n.endsWith('.mdx') ? [f] : [];
    });

function frontmatter(src: string): Record<string, string> {
    const block = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    return Object.fromEntries(
        block.split('\n').map((l) => {
            const i = l.indexOf(':');
            return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"(.*)"$/, '$1')];
        }),
    );
}

const pages = walk(ROOT).map((file) => ({ file: relative(ROOT, file), src: readFileSync(file, 'utf8') }));
const categories = new Set<string>([...GROUPS.map((g) => g.title), 'Overview']);

describe('docs pages', () => {
    it('exist', () => {
        expect(pages.length).toBeGreaterThan(50);
    });

    for (const { file, src } of pages) {
        it(`${file} has complete frontmatter`, () => {
            const fm = frontmatter(src);
            expect(fm.title, 'title').toBeTruthy();
            expect(fm.description, 'description').toBeTruthy();
            expect(fm.description.length, 'description ≤ 200 chars').toBeLessThanOrEqual(200);
            expect(fm.layout).toBe('docs');
            expect(categories.has(fm.category), `category "${fm.category}" is a sidebar group`).toBe(true);
            expect(Number.isFinite(Number(fm.order)), 'order is a number').toBe(true);
            expect(src, 'has an H1').toMatch(/^# .+/m);
        });
    }

    it('orders are unique within a group', () => {
        const seen = new Map<string, string>();
        for (const { file, src } of pages) {
            const fm = frontmatter(src);
            const key = `${fm.category}:${fm.order}`;
            expect(seen.get(key), `${file} shares order ${fm.order} with ${seen.get(key)}`).toBeUndefined();
            seen.set(key, file);
        }
    });
});
