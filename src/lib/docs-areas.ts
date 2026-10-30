/**
 * The docs areas (design/Api.dc.html): the header's area switcher picks one,
 * and the sidebar lists that area's pages. One color per kind of content,
 * the same everywhere (search tiles, catalog, sidebar).
 */
export type AreaId = 'learn' | 'language' | 'std' | 'tooling' | 'errors';

export interface Area {
    id: AreaId;
    label: string;
    /** One line under the label in the switcher menu. */
    meta: string;
    glyph: string;
    /** The section color (a `@theme` color, as hex for inline tints). */
    color: string;
    href: string;
    /** The sidebar group (docs-groups.ts) the area lists. */
    group: 'book' | 'reference' | 'std' | 'tooling';
}

export const DIAGNOSTICS_PATH = '/docs/reference/diagnostics/';
/** The std API tab. A placeholder until the API pages are generated from `velt doc --format json`. */
export const API_PATH = '/docs/api/';
/** The std module catalog (design/Std.dc.html). */
export const CATALOG_PATH = '/docs/std/modules/';

export const AREAS: Area[] = [
    { id: 'learn', label: 'Learn', meta: 'The book: getting started, tour, guides', glyph: '→', color: '#5FE1F7', href: '/docs/book/', group: 'book' },
    { id: 'language', label: 'Language', meta: 'Reference: types, classes, memory, TSX', glyph: '§', color: '#A592FF', href: '/docs/reference/', group: 'reference' },
    { id: 'std', label: 'Standard library', meta: 'guides and API', glyph: '{}', color: '#FF9F5A', href: '/docs/std/', group: 'std' },
    { id: 'tooling', label: 'Tooling', meta: 'CLI, packages, manifest, editors, debugging', glyph: '$', color: '#3DDC97', href: '/docs/tooling/', group: 'tooling' },
    { id: 'errors', label: 'Errors', meta: 'Every compiler diagnostic, explained', glyph: '!', color: '#FFC93C', href: DIAGNOSTICS_PATH, group: 'reference' },
];

const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`);

/** The area a docs path belongs to. The docs home counts as Learn. */
export function areaOf(path: string): Area {
    const p = norm(path);
    if (p.startsWith(DIAGNOSTICS_PATH)) return AREAS[4];
    if (p.startsWith(API_PATH)) return AREAS[2];
    return AREAS.find((a) => a.id !== 'errors' && p.startsWith(a.href)) ?? AREAS[0];
}

/** `#FF9F5A` → `rgba(255,159,90,0.1)`, for the tinted tiles. */
export function tint(hex: string, alpha: number): string {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** Std module guides get Guide | API tabs; the std overview and the catalog don't. */
export const hasApiTabs = (path: string) => {
    const p = norm(path);
    return p === API_PATH || (p.startsWith('/docs/std/') && p !== '/docs/std/' && p !== CATALOG_PATH);
};
