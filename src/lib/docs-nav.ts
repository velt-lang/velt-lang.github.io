/**
 * The docs sidebar, built from page frontmatter (`category`, `order`,
 * `navTitle`) through the SSG navigation for the `docs` collection.
 *
 * Scaling rule: a group lists every page, except groups in COMPACT, which
 * show their `featured` pages plus the current one, and fold the rest into an
 * "All modules" disclosure. Add a group here when a section outgrows a list.
 */
import { getSidebar } from 'virtual:ssg-navigation';
import routes from 'virtual:ssg-routes';
import { GROUPS } from './docs-groups';

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
    /** For compact groups: the items always shown. */
    featured?: DocLink[];
}

export { GROUPS };

const COMPACT: Record<string, string[]> = {
    std: ['/docs/std/http/', '/docs/std/fs/', '/docs/std/fetch/', '/docs/std/json/', '/docs/std/crypto/', '/docs/std/postgres/', '/docs/std/redis/'],
};

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
                return { title, href, mono: title.startsWith('velt:') };
            });
        const featured = COMPACT[g.id]?.map((h) => items.find((i) => i.href === h)).filter((i): i is DocLink => !!i);
        return { ...g, items, featured };
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
