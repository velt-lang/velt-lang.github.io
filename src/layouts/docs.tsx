/**
 * Docs pages (design/Api.dc.html header, design/Docs.dc.html body): the area
 * switcher with Guide | API tabs on std modules, search, the version pill;
 * the current area's pages on the left; the article with breadcrumb, page
 * actions and pager; "On this page" on the right. From 1100px both side
 * columns stick and scroll on their own. Static except the islands.
 */
import { component } from 'sigx';
import type { LayoutProps, LayoutSlots } from '@sigx/ssg';
import { Logo } from '../components/SiteChrome';
import { ChevronDown, ChevronRight, GitHubIcon, GridIcon, MenuIcon } from '../components/Icons';
import { AreaMenu } from '../islands/AreaMenu';
import { DocsSearch } from '../islands/DocsSearch';
import { OnThisPage, type TocHeading } from '../islands/OnThisPage';
import { PageActions } from '../islands/PageActions';
import { docGroups, docSequence, type DocGroup, type DocLink } from '../lib/docs-nav';
import { API_PATH, AREAS, DIAGNOSTICS_PATH, areaOf, hasApiTabs, type Area } from '../lib/docs-areas';
import { DOCS_VERSION, EDIT_BASE, RELEASES_URL, REPO_URL } from '../lib/site';

const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`);

const label = 'font-mono text-xs uppercase tracking-[0.08em] text-muted';

const NavLink = component<{ item: DocLink; current: string }>(({ props }) => () => {
    const active = props.item.href === props.current;
    return (
        <a
            href={props.item.href}
            aria-current={active ? 'page' : undefined}
            class={`rounded-lg px-3 py-1.5 ${props.item.mono ? 'font-mono text-[13px]' : ''} ${
                active ? 'bg-[#17172A] font-semibold text-fg shadow-[inset_0_0_0_1px_#2E2A5C]' : 'text-fg-3 hover:text-cyan'
            }`}
        >
            {props.item.title}
        </a>
    );
}, { name: 'NavLink' });

/** One area's pages. Compact groups (std) show their featured pages and fold the rest. */
const NavGroup = component<{ group: DocGroup; title: string; current: string; all?: DocLink }>(({ props }) => () => {
    const g = props.group;
    const inGroup = g.items.some((i) => i.href === props.current);
    const compact = g.featured && g.featured.length > 0;
    const head = compact ? g.items.filter((i) => i.href === g.href) : [];
    const shown = compact
        ? [...head, ...g.featured!, ...g.items.filter((i) => i.href === props.current && !g.featured!.includes(i) && !head.includes(i))]
        : g.items;
    const rest = compact ? g.items.filter((i) => !shown.includes(i)) : [];
    return (
        <div class="flex flex-col gap-0.5">
            <span class={`${label} px-3 pb-2`}>{props.title}</span>
            {shown.map((i) => <NavLink key={i.href} item={i} current={props.current} />)}
            {rest.length > 0 && (
                <details class="nav-group" open={inGroup && !shown.some((i) => i.href === props.current) ? true : undefined}>
                    <summary class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-muted hover:text-cyan">
                        {rest.length} more modules
                        <ChevronRight size={14} cls="chev" />
                    </summary>
                    <div class="flex flex-col gap-0.5 pl-2">
                        {rest.map((i) => <NavLink key={i.href} item={i} current={props.current} />)}
                    </div>
                </details>
            )}
            {props.all && (
                <a href={props.all.href} class="mt-3 flex min-h-11 items-center gap-2.5 rounded-xl border border-[#3F2A1A] bg-[#17110C] px-3 font-semibold text-peach hover:text-peach hover:brightness-125">
                    <GridIcon size={16} stroke={2} />
                    <span class="flex-auto">{props.all.title}</span>
                </a>
            )}
        </div>
    );
}, { name: 'NavGroup' });

/** The sidebar for an area: its group, or for Errors the diagnostics pages. */
function areaNav(area: Area): { group: DocGroup; title: string; all?: DocLink } {
    const groups = docGroups();
    if (area.id === 'errors') {
        const ref = groups.find((g) => g.id === 'reference')!;
        const pick = (href: string, title: string) => ({ ...(ref.items.find((i) => i.href === href) ?? { href, mono: false }), title });
        return {
            title: 'Errors',
            group: { ...ref, items: [pick(DIAGNOSTICS_PATH, 'Compiler diagnostics'), pick('/docs/reference/errors/', 'Errors in the language'), pick('/docs/book/errors/', 'Errors in the book')] },
        };
    }
    const group = groups.find((g) => g.id === area.group)!;
    const all = area.id === 'std' ? { href: '/docs/std/', title: 'All modules', mono: false } : undefined;
    return { group, title: group.title, all };
}

const Sidebar = component<{ area: Area; current: string }>(({ props }) => () => {
    const nav = areaNav(props.area);
    return (
        <div class="flex flex-col gap-7 text-sm">
            <NavGroup group={nav.group} title={nav.title} current={props.current} all={nav.all} />
        </div>
    );
}, { name: 'Sidebar' });

/** The std area's one-liner counts its modules. */
function areaItems() {
    const std = docGroups().find((g) => g.id === 'std');
    const modules = std?.items.filter((i) => i.href !== std.href).length ?? 0;
    return AREAS.map(({ id, label: l, meta, glyph, color, href }) => ({
        id, label: l, glyph, color, href,
        meta: id === 'std' ? `${modules} modules · ${meta}` : meta,
    }));
}

export default component<LayoutProps, unknown, LayoutSlots>(({ props, slots }) => () => {
    const path = norm(props.path ?? '/docs/');
    const meta = (props.meta ?? {}) as Record<string, unknown> & { headings?: { id: string; text: string; level: number }[] };
    const area = areaOf(path);
    const nav = areaNav(area);
    const seq = docSequence();
    const at = seq.findIndex((i) => i.href === path);
    const prev = at > 0 ? seq[at - 1] : undefined;
    const next = at >= 0 && at < seq.length - 1 ? seq[at + 1] : path === '/docs/' ? seq[0] : undefined;
    const headings: TocHeading[] = (meta.headings ?? [])
        .filter((h) => h.level === 2 || h.level === 3)
        .map((h) => ({ id: h.id, text: h.text, level: h.level as 2 | 3 }));
    const title = String(meta.title ?? '');
    const source = String(meta.sourceFile ?? '');
    const md = path === '/docs/' ? '/docs.md' : `${path.replace(/\/$/, '')}.md`;
    const hasMd = path !== API_PATH;
    const tabs = hasApiTabs(path);
    const crumbGroup = area.id === 'errors' ? { title: 'Errors', href: DIAGNOSTICS_PATH } : { title: nav.group.title, href: nav.group.href };

    return (
        <div id="top" class="min-h-screen bg-bg text-fg [line-height:1.65]">
            <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
                Skip to content
            </a>
            <header class="relative z-20 border-b border-line bg-bg-header">
                <div class="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-5 gap-y-3 px-6 py-3 leading-[1.4]">
                    <a href="/" aria-label="Velt home" class="text-fg">
                        <Logo size="md" />
                    </a>
                    <span aria-hidden="true" class="hidden h-6 w-px bg-line-2 min-[480px]:block" />
                    <AreaMenu client:idle areas={areaItems()} current={area.id} />
                    {tabs && (
                        <nav aria-label="Guide or API" class="flex gap-1 text-sm">
                            <a
                                href={path === API_PATH ? '/docs/std/' : path}
                                aria-current={path !== API_PATH ? 'page' : undefined}
                                class={`inline-flex min-h-10 items-center px-3 ${path !== API_PATH ? 'font-semibold text-fg shadow-[inset_0_-2px_0_var(--color-orange)]' : 'text-fg-3 hover:text-cyan'}`}
                            >
                                Guide
                            </a>
                            <a
                                href={API_PATH}
                                aria-current={path === API_PATH ? 'page' : undefined}
                                class={`inline-flex min-h-10 items-center px-3 ${path === API_PATH ? 'font-semibold text-fg shadow-[inset_0_-2px_0_var(--color-orange)]' : 'text-fg-3 hover:text-cyan'}`}
                            >
                                API
                            </a>
                        </nav>
                    )}
                    <div class="order-last flex w-full min-[900px]:order-none min-[900px]:ml-auto min-[900px]:w-auto min-[900px]:max-w-[360px] min-[900px]:flex-[0_1_360px]">
                        <DocsSearch client:idle />
                    </div>
                    <div class="hidden items-center gap-2 min-[640px]:ml-auto min-[640px]:flex min-[900px]:ml-0">
                        <a
                            href={`${RELEASES_URL}/tag/v${DOCS_VERSION}`}
                            class="inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-line-3 px-2.5 font-mono text-xs text-fg-3 hover:text-fg"
                        >
                            v{DOCS_VERSION}
                            <span aria-hidden="true" class="text-[#5A5A70]">·</span>
                            <span class="font-sans text-cyan">Changelog</span>
                        </a>
                        <a href={REPO_URL} aria-label="Velt on GitHub" class="grid size-10 place-items-center rounded-[10px] text-fg-3 hover:text-fg">
                            <GitHubIcon size={18} />
                        </a>
                    </div>
                </div>
            </header>

            <div class="mx-auto flex max-w-[1440px] flex-wrap items-start gap-x-12 px-6">
                {/* Phones: the sidebar folds into a menu. */}
                <details class="docs-menu w-full border-b border-line min-[900px]:hidden">
                    <summary class="flex min-h-12 cursor-pointer items-center gap-2 text-sm font-medium text-fg-3">
                        <MenuIcon size={18} />
                        {nav.title}
                        <ChevronDown size={16} cls="menu-chev ml-auto transition-transform" />
                    </summary>
                    <nav aria-label="Documentation" class="pb-6 pt-2">
                        <Sidebar area={area} current={path} />
                        <p class="m-0 mt-6 flex gap-4 px-3 text-[13px] text-muted">
                            <a href={`${RELEASES_URL}/tag/v${DOCS_VERSION}`} class="text-muted hover:text-cyan">
                                <span class="font-mono">v{DOCS_VERSION}</span> · Changelog
                            </a>
                            <a href={REPO_URL} class="text-muted hover:text-cyan">GitHub</a>
                        </p>
                    </nav>
                </details>
                <nav aria-label="Documentation" class="sticky-col hidden max-w-[280px] flex-[1_1_240px] py-8 min-[900px]:block">
                    <Sidebar area={area} current={path} />
                </nav>

                <main id="main" class="flex min-w-0 flex-[999_1_560px] flex-wrap items-start gap-12 pb-24 pt-10">
                    <article class="relative flex min-w-0 max-w-[760px] flex-[999_1_520px] flex-col gap-[22px]">
                        <nav aria-label="Breadcrumb" class="flex flex-wrap gap-2 text-[13px] text-muted">
                            <a href="/docs/" class="text-muted hover:text-cyan">Docs</a>
                            {path !== crumbGroup.href && path !== '/docs/' && (
                                <>
                                    <span aria-hidden="true">/</span>
                                    <a href={crumbGroup.href} class="text-muted hover:text-cyan">{crumbGroup.title}</a>
                                </>
                            )}
                            {path !== '/docs/' && (
                                <>
                                    <span aria-hidden="true">/</span>
                                    <span class="text-fg" aria-current="page">{title}</span>
                                </>
                            )}
                        </nav>
                        {hasMd && (
                            <div class="page-actions">
                                <PageActions client:idle md={md} />
                            </div>
                        )}
                        <div class={`prose ${hasMd ? 'has-page-actions' : ''}`}>{slots.default?.()}</div>

                        {(prev || next) && (
                            <nav aria-label="Pager" class="mt-8 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
                                {prev ? (
                                    <a href={prev.href} class="flex flex-col gap-0.5 rounded-xl border border-line-2 px-5 py-[18px] text-fg hover:border-line-3 hover:text-fg">
                                        <span class="text-[13px] text-muted">← Previous</span>
                                        <span class={`font-semibold ${prev.mono ? 'font-mono text-[15px]' : ''}`}>{prev.title}</span>
                                    </a>
                                ) : (
                                    <span />
                                )}
                                {next && (
                                    <a href={next.href} class="flex flex-col gap-0.5 rounded-xl border border-line-2 px-5 py-[18px] text-right text-fg hover:border-line-3 hover:text-fg">
                                        <span class="text-[13px] text-muted">Next →</span>
                                        <span class={`font-semibold ${next.mono ? 'font-mono text-[15px]' : ''}`}>{next.title}</span>
                                    </a>
                                )}
                            </nav>
                        )}
                        {source && (
                            <p class="m-0 text-[13px]">
                                <a href={`${EDIT_BASE}${source}`} class="text-cyan hover:text-cyan-hover">Edit this page on GitHub</a>
                            </p>
                        )}
                    </article>

                    {hasMd && (
                        <aside data-toc-scroll class="sticky-col max-w-[260px] flex-[1_1_220px] pb-8 pt-2">
                            <OnThisPage client:idle headings={headings} md={md} edit={source ? `${EDIT_BASE}${source}` : undefined} />
                        </aside>
                    )}
                </main>
            </div>
        </div>
    );
}, { name: 'DocsLayout' });
