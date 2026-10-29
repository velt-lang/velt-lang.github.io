/**
 * Docs pages (design/Docs.dc.html): top bar with search, the sidebar, the
 * article with breadcrumb and pager, "On this page". Static except the
 * search box, the copy-as-Markdown button and the "On this page" highlight.
 */
import { component } from 'sigx';
import type { LayoutProps, LayoutSlots } from '@sigx/ssg';
import { Logo } from '../components/SiteChrome';
import { ChevronDown, ChevronRight, MenuIcon } from '../components/Icons';
import { DocsSearch } from '../islands/DocsSearch';
import { OnThisPage } from '../islands/OnThisPage';
import { CopyMarkdownButton } from '../islands/CopyButton';
import { docGroups, docSequence, groupOf, type DocGroup, type DocLink } from '../lib/docs-nav';
import { EDIT_BASE, REPO_URL } from '../lib/site';

const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`);

const TOP_NAV = [
    { label: 'Book', href: '/docs/book/', group: 'book' },
    { label: 'Reference', href: '/docs/reference/', group: 'reference' },
    { label: 'Standard library', href: '/docs/std/', group: 'std' },
];

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

const NavGroup = component<{ group: DocGroup; current: string }>(({ props }) => () => {
    const g = props.group;
    const inGroup = g.items.some((i) => i.href === props.current);
    const compact = g.featured && g.featured.length > 0;
    const shown = compact
        ? [...g.featured!, ...g.items.filter((i) => i.href === props.current && !g.featured!.includes(i))]
        : g.items;
    const rest = compact ? g.items.filter((i) => !shown.includes(i)) : [];
    return (
        <details class="nav-group flex flex-col" open>
            <summary class={`${label} flex items-center justify-between rounded-md px-3 pb-2 hover:text-fg-3`}>
                {g.title}
                <ChevronRight size={14} cls="chev" />
            </summary>
            <div class="flex flex-col gap-0.5">
                {shown.map((i) => <NavLink key={i.href} item={i} current={props.current} />)}
                {rest.length > 0 && (
                    <details class="nav-group" open={inGroup && !shown.some((i) => i.href === props.current) ? true : undefined}>
                        <summary class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-muted hover:text-cyan">
                            All {g.items.length} modules
                            <ChevronRight size={14} cls="chev" />
                        </summary>
                        <div class="flex flex-col gap-0.5 pl-2">
                            {rest.map((i) => <NavLink key={i.href} item={i} current={props.current} />)}
                        </div>
                    </details>
                )}
            </div>
        </details>
    );
}, { name: 'NavGroup' });

const Sidebar = component<{ current: string }>(({ props }) => () => (
    <div class="flex flex-col gap-7 text-sm">
        {docGroups().map((g) => <NavGroup key={g.id} group={g} current={props.current} />)}
    </div>
), { name: 'Sidebar' });

export default component<LayoutProps, unknown, LayoutSlots>(({ props, slots }) => () => {
    const path = norm(props.path ?? '/docs/');
    const meta = (props.meta ?? {}) as Record<string, unknown> & { headings?: { id: string; text: string; level: number }[] };
    const group = groupOf(path);
    const seq = docSequence();
    const at = seq.findIndex((i) => i.href === path);
    const prev = at > 0 ? seq[at - 1] : undefined;
    const next = at >= 0 && at < seq.length - 1 ? seq[at + 1] : path === '/docs/' ? seq[0] : undefined;
    const headings = (meta.headings ?? []).filter((h) => h.level === 2).map((h) => ({ id: h.id, text: h.text }));
    const title = String(meta.title ?? '');
    const source = String(meta.sourceFile ?? '');
    const mdHref = path === '/docs/' ? '/docs.md' : `${path.replace(/\/$/, '')}.md`;

    return (
        <div class="min-h-screen bg-bg text-fg [line-height:1.65]">
            <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
                Skip to content
            </a>
            <header class="border-b border-line bg-bg-header">
                <div class="mx-auto flex max-w-[1488px] flex-wrap items-center gap-x-7 gap-y-3 px-6 py-3.5">
                    <a href="/" class="flex items-center gap-2.5 text-fg">
                        <Logo size="md" />
                        <span class="rounded-md border border-line-3 px-2 py-0.5 text-xs text-fg-3">Docs</span>
                    </a>
                    <DocsSearch client:idle />
                    <nav aria-label="Top" class="flex min-[700px]:ml-auto flex-wrap gap-x-[22px] gap-y-1 text-sm">
                        {TOP_NAV.map((n) => (
                            <a key={n.href} href={n.href} aria-current={group?.id === n.group ? 'true' : undefined} class={group?.id === n.group ? 'font-semibold text-fg' : 'text-fg-3 hover:text-cyan'}>
                                {n.label}
                            </a>
                        ))}
                        <a href={REPO_URL} class="text-fg-3 hover:text-cyan">GitHub</a>
                    </nav>
                </div>
            </header>

            <div class="mx-auto flex max-w-[1488px] flex-wrap items-start gap-x-12 px-6">
                {/* Phones: the sidebar folds into a menu. */}
                <details class="docs-menu w-full border-b border-line min-[900px]:hidden">
                    <summary class="flex min-h-12 cursor-pointer items-center gap-2 text-sm font-medium text-fg-3">
                        <MenuIcon size={18} />
                        {group ? group.title : 'Menu'}
                        <ChevronDown size={16} cls="menu-chev ml-auto transition-transform" />
                    </summary>
                    <nav aria-label="Documentation" class="pb-6 pt-2">
                        <Sidebar current={path} />
                    </nav>
                </details>
                <nav aria-label="Documentation" class="hidden max-w-[280px] flex-[1_1_240px] py-8 min-[900px]:sticky min-[900px]:top-0 min-[900px]:block min-[900px]:max-h-screen min-[900px]:overflow-y-auto">
                    <Sidebar current={path} />
                </nav>

                <main id="main" class="flex min-w-0 flex-[999_1_560px] flex-wrap items-start gap-12 pb-24 pt-10">
                    <article class="flex min-w-0 max-w-[760px] flex-[999_1_520px] flex-col gap-[22px]">
                        <nav aria-label="Breadcrumb" class="flex flex-wrap gap-2 text-[13px] text-muted">
                            <a href="/docs/" class="text-muted hover:text-cyan">Docs</a>
                            {group && path !== group.href && (
                                <>
                                    <span aria-hidden="true">/</span>
                                    <a href={group.href} class="text-muted hover:text-cyan">{group.title}</a>
                                </>
                            )}
                            {path !== '/docs/' && (
                                <>
                                    <span aria-hidden="true">/</span>
                                    <span class="text-fg" aria-current="page">{title}</span>
                                </>
                            )}
                        </nav>
                        <div class="prose">{slots.default?.()}</div>

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
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            {source ? (
                                <a href={`${EDIT_BASE}${source}`} class="text-[13px] text-cyan hover:text-cyan-hover">Edit this page on GitHub</a>
                            ) : (
                                <span />
                            )}
                            <CopyMarkdownButton client:idle href={mdHref} />
                        </div>
                    </article>

                    {headings.length > 0 && (
                        <aside class="max-w-[240px] flex-[1_1_200px] pt-2 min-[1200px]:sticky min-[1200px]:top-8">
                            <OnThisPage client:idle headings={headings} />
                        </aside>
                    )}
                </main>
            </div>
        </div>
    );
}, { name: 'DocsLayout' });
