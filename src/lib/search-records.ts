/**
 * The search palette's records and ranking (design/Search.dc.html). Pure, so
 * it is unit-tested; the island (src/islands/DocsSearch.tsx) loads the data.
 */
import type { SearchIndexEntry } from '@sigx/ssg/client';
import type { ErrorRecord } from './errors-index';

export type Kind = 'book' | 'ref' | 'std' | 'tool' | 'err';

/** Section colors, glyphs and labels: the same as the area switcher. */
export const KINDS: Record<Kind, { label: string; group: string; color: string; glyph: string }> = {
    std: { label: 'Std', group: 'Standard library', color: '#FF9F5A', glyph: '{}' },
    book: { label: 'Book', group: 'Guides', color: '#5FE1F7', glyph: '→' },
    ref: { label: 'Reference', group: 'Reference', color: '#A592FF', glyph: '§' },
    tool: { label: 'Tooling', group: 'Tooling', color: '#3DDC97', glyph: '$' },
    err: { label: 'Errors', group: 'Errors', color: '#FFC93C', glyph: '!' },
};
/** Group order in the results. */
export const ORDER: Kind[] = ['std', 'book', 'ref', 'tool', 'err'];

export const DIAGNOSTICS = '/docs/reference/diagnostics/';

export interface SearchRecord {
    kind: Kind;
    title: string;
    meta: string;
    href: string;
    /** Code names (modules, messages) set in mono. */
    mono: boolean;
    /** A page rather than a section of one. */
    page: boolean;
}

const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`);

export function kindOf(path: string): Kind {
    const p = norm(path);
    if (p.startsWith(DIAGNOSTICS)) return 'err';
    if (p.startsWith('/docs/reference/')) return 'ref';
    if (p.startsWith('/docs/std/') || p.startsWith('/docs/api/')) return 'std';
    if (p.startsWith('/docs/tooling/')) return 'tool';
    return 'book';
}

const SECTION: Record<Kind, string> = { book: 'The book', ref: 'Reference', std: 'Std', tool: 'Tooling', err: 'Errors' };

const clip = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const pageTitle = (t: string) => t.replace(/ — Velt( docs)?$/, '');

export function buildRecords(pages: SearchIndexEntry[], errors: ErrorRecord[]): SearchRecord[] {
    const out: SearchRecord[] = [];
    for (const p of pages) {
        if (!p.path.startsWith('/docs')) continue;
        const kind = kindOf(p.path);
        const title = pageTitle(p.title);
        const href = norm(p.path);
        out.push({ kind, title, meta: `${SECTION[kind]} · ${clip(p.description ?? '')}`, href, mono: title.startsWith('velt:'), page: true });
        for (const h of p.headings ?? []) {
            if (h.level !== 2 && h.level !== 3) continue;
            out.push({ kind, title: h.text, meta: `${SECTION[kind]} · ${title}`, href: `${href}#${h.id}`, mono: false, page: false });
        }
    }
    for (const e of errors) {
        out.push({ kind: 'err', title: e.message, meta: `Errors · ${e.situation}`, href: DIAGNOSTICS, mono: true, page: false });
    }
    return out;
}

/** Higher is better; 0 means no match. Every term must appear in the title or the meta line. */
export function score(r: SearchRecord, query: string): number {
    const q = query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    if (!terms.length) return 0;
    const title = r.title.toLowerCase();
    const hay = `${title} ${r.meta.toLowerCase()}`;
    if (!terms.every((t) => hay.includes(t))) return 0;
    let s = 1;
    if (title === q || title === `velt:${q}`) s += 100;
    else if (title.startsWith(q) || title.startsWith(`velt:${q}`)) s += 60;
    else if (new RegExp(`(^|[^a-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(title)) s += 40;
    else if (title.includes(q)) s += 25;
    else s += terms.filter((t) => title.includes(t)).length * 8;
    if (r.page) s += 6;
    return s - Math.min(r.title.length, 120) / 60;
}

export interface Hit extends SearchRecord {
    score: number;
}

/** Ranked hits grouped by kind, `limit` per group. */
export function search(records: SearchRecord[], query: string, limit = 5): { kind: Kind; hits: Hit[]; total: number }[] {
    const by = new Map<Kind, Hit[]>();
    for (const r of records) {
        const s = score(r, query);
        if (!s) continue;
        const list = by.get(r.kind) ?? [];
        list.push({ ...r, score: s });
        by.set(r.kind, list);
    }
    return ORDER.filter((k) => by.has(k)).map((kind) => {
        const all = by.get(kind)!.sort((a, b) => b.score - a.score);
        // Errors share one page: keep every message. Others: one row per href.
        const seen = new Set<string>();
        const hits = all.filter((h) => kind === 'err' || (!seen.has(h.href) && seen.add(h.href)));
        return { kind, hits: hits.slice(0, limit), total: hits.length };
    });
}

/** The title split around the first match of the query (or its first term) for underlining. */
export function highlight(title: string, query: string): [string, string, string] {
    const q = query.trim().toLowerCase();
    const lower = title.toLowerCase();
    for (const needle of [q, ...q.split(/\s+/)]) {
        const at = needle ? lower.indexOf(needle) : -1;
        if (at >= 0) return [title.slice(0, at), title.slice(at, at + needle.length), title.slice(at + needle.length)];
    }
    return [title, '', ''];
}
