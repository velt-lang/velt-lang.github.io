/**
 * The docs sidebar, built from page frontmatter (`category`, `order`,
 * `navTitle`) through the SSG navigation for the `docs` collection.
 *
 * Scaling rule: a group lists every page. A group too long for one list
 * (the standard library) is split into labelled sections: std's follow the
 * catalog's categories (src/data/std-catalog.ts), so every module stays in view.
 */
import { getSidebar } from 'virtual:ssg-navigation';
import routes from 'virtual:ssg-routes';
import { GROUPS, isModuleName } from './docs-groups';
import { CATEGORIES } from '../data/std-catalog';

export interface DocLink {
    title: string;
    href: string;
    mono: boolean;
}

export interface DocGroup {
    id: string;
    title: string;
    href: string;
    items: DocLink[];
    /** For a long group: its items in labelled sections (pages in no section come first). */
    sections?: { title: string; items: DocLink[] }[];
}

export { GROUPS };

/** The std pages in the catalog's categories, in the catalog's order. */
function stdSections(items: DocLink[]): { title: string; items: DocLink[] }[] {
    const byHref = new Map(items.map((i) => [i.href, i]));
    return CATEGORIES.map((c) => ({
        title: c.title,
        items: c.modules.map(([page]) => byHref.get(`/docs/std/${page}/`)).filter((i): i is DocLink => !!i),
    })).filter((s) => s.items.length > 0);
}

const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`);

// Built on first use: a page that imports this module is itself imported by
// virtual:ssg-routes, so `routes` isn't initialized yet when this module loads.
let metaByPath: Map<string, Record<string, unknown>> | undefined;

export function pageMeta(path: string): Record<string, unknown> {
    metaByPath ??= new Map(
        (routes as { path: string; meta?: Record<string, unknown> }[]).map((r) => [norm(r.path), r.meta ?? {}]),
    );
    return metaByPath.get(norm(path)) ?? {};
}

let cache: DocGroup[] | undefined;

export function docGroups(): DocGroup[] {
    if (cache) return cache;
    const sections = getSidebar('docs');
    cache = GROUPS.map((g) => {
        const section = sections.find((s) => s.title === g.title);
        const items: DocLink[] = (section?.items ?? [])
            .filter((i) => i.href)
            .map((i) => {
                const href = norm(i.href!);
                const meta = pageMeta(href);
                const title = String(meta.navTitle ?? i.title);
                return { title, href, mono: isModuleName(title) };
            });
        return { ...g, items, sections: g.id === 'std' ? stdSections(items) : undefined };
    });
    return cache;
}

/** Every page in sidebar order: the prev/next sequence. */
export function docSequence(): DocLink[] {
    return docGroups().flatMap((g) => g.items);
}

export function groupOf(path: string): DocGroup | undefined {
    const p = norm(path);
    return docGroups().find((g) => p.startsWith(g.href));
}
