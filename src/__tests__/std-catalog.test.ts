/** The std catalog lists every std docs page, each once, and nothing else. */
import { describe, expect, it } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { CATEGORIES } from '../data/std-catalog';

const ROOT = join(import.meta.dirname, '../pages/docs/std');
const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
        const f = join(dir, n);
        return statSync(f).isDirectory() ? walk(f) : n.endsWith('.mdx') ? [f] : [];
    });
const pages = walk(ROOT)
    .map((f) => relative(ROOT, f).replace(/\\/g, '/').replace(/\.mdx$/, ''))
    .filter((p) => p !== 'index');
const listed = CATEGORIES.flatMap((c) => c.modules.map(([page]) => page));

describe('std catalog', () => {
    it('gives every std page a category', () => {
        expect(pages.filter((p) => !listed.includes(p)), 'add these to src/data/std-catalog.ts').toEqual([]);
    });
    it('lists only pages that exist, once each', () => {
        expect(listed.filter((p) => !pages.includes(p))).toEqual([]);
        expect(new Set(listed).size).toBe(listed.length);
    });
});
