/**
 * Blog posts: every page under /blog/ (src/pages/blog/*.mdx), read from the
 * routes' frontmatter. A post with `draft: true` is left out of production
 * builds by the SSG, and out of these lists; `pnpm dev` shows it.
 */
import routes from 'virtual:ssg-routes';

/**
 * `pnpm dev` shows drafts and unreleased notes, and so does a preview build
 * (`VITE_SHOW_UNPUBLISHED=1 pnpm build --drafts`); a normal build doesn't. (import.meta.env.DEV is
 * true while the SSG renders pages, so the build is told apart by its mode.)
 */
const SHOW_UNPUBLISHED = import.meta.env.MODE !== 'production' || import.meta.env.VITE_SHOW_UNPUBLISHED === '1';

export const BLOG_PATH = '/blog/';

/** The pinned "what to expect" post the home page links to once it is published. */
export const EXPECTATIONS_POST = '/blog/pre-1-0/';

export const TOPICS = {
    news: { label: 'News', cls: 'border-[#1D3A2E] bg-[#0C1512] text-green' },
    progress: { label: 'Progress', cls: 'border-[#1E3346] bg-[#0F1420] text-cyan' },
    why: { label: 'Why', cls: 'border-[#2E2A5C] bg-[#12101F] text-violet' },
    behind: { label: 'Behind the scenes', cls: 'border-[#3F2A1A] bg-[#17110C] text-peach' },
} as const;

export type Topic = keyof typeof TOPICS;

export interface Post {
    href: string;
    title: string;
    description: string;
    /** ISO date (YYYY-MM-DD); a draft may have none yet. */
    date?: string;
    topic: Topic;
    author: string;
    /** Shown first on the blog and linked from the home page. */
    pinned: boolean;
    draft: boolean;
}

const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`);

let cache: Post[] | undefined;

/** Published posts (and drafts in dev): pinned first, then newest first. */
export function posts(): Post[] {
    if (cache) return cache;
    const all = (routes as { path: string; meta?: Record<string, unknown> }[])
        .filter((r) => r.path.startsWith(BLOG_PATH) && norm(r.path) !== BLOG_PATH)
        .map((r): Post => {
            const m = r.meta ?? {};
            const topic = String(m.topic ?? 'news');
            return {
                href: norm(r.path),
                title: String(m.title ?? ''),
                description: String(m.description ?? ''),
                date: m.date ? String(m.date).slice(0, 10) : undefined,
                topic: (topic in TOPICS ? topic : 'news') as Topic,
                author: String(m.author ?? 'Andreas Ekdahl'),
                pinned: m.pinned === true,
                draft: m.draft === true,
            };
        })
        .filter((p) => !p.draft || SHOW_UNPUBLISHED);
    cache = all.sort((a, b) => Number(b.pinned) - Number(a.pinned) || (b.date ?? '9999').localeCompare(a.date ?? '9999'));
    return cache;
}

/** The post at `href`, if it is published (or this is dev). */
export function post(href: string): Post | undefined {
    return posts().find((p) => p.href === norm(href));
}

/** "7 November 2026". */
export function formatDate(iso: string | undefined): string {
    if (!iso) return 'Not published yet';
    const [y, m, d] = iso.split('-').map(Number);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${d} ${months[m - 1]} ${y}`;
}
