/**
 * Docs pages (design/Api.dc.html header, design/Docs.dc.html body): the area
 * switcher with the Guide | API reference switch on std modules, search, the
 * version pill; the current area's pages on the left; the article with
 * breadcrumb, page actions and pager; "On this page" on the right. From 1100px
 * both side columns stick and scroll on their own. A std guide points at its
 * API reference three ways (design/ApiSwitch.dc.html): "API at a glance"
 * after its lead, a card above "On this page", and an "API" link by each
 * module in the sidebar. Static except the islands.
 */
import { component } from 'sigx';
import type { LayoutProps, LayoutSlots } from '@sigx/ssg';
import { DocsHeader } from '../components/DocsHeader';
import { ChevronDown, ChevronRight, GridIcon, MenuIcon } from '../components/Icons';
import { OnThisPage, type TocHeading } from '../islands/OnThisPage';
import { PageActions } from '../islands/PageActions';
import { docGroups, docSequence, type DocGroup, type DocLink } from '../lib/docs-nav';
import { API_PATH, CATALOG_PATH, DIAGNOSTICS_PATH, areaOf, hasApiTabs, stdModuleOf, type Area } from '../lib/docs-areas';
import { ApiSidebar } from '../components/api/ApiSidebar';
import { ApiModulesNav } from '../components/api/ApiModulesNav';
import { ApiAsideCard, ApiGlance, insertAfterLead } from '../components/api/ApiGlance';
import { anchorOf, apiModule, apiModuleForGuide, apiPath, countedExports, guidePath, sourceUrl, specifierOf, visibleExports, type ApiModule } from '../lib/std-api';
import { DOCS_VERSION, EDIT_BASE, RELEASES_URL, REPO_URL } from '../lib/site';

const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`);

const label = 'font-mono text-xs uppercase tracking-[0.08em] text-muted';

const ACTIVE = 'bg-[#17172A] shadow-[inset_0_0_0_1px_var(--color-violet-line)]';

/** A sidebar entry; a std module with an API page gets a small "API" link beside it. */
const NavLink = component<{ item: DocLink; current: string; api?: ApiModule }>(({ props }) => () => {
    const active = props.item.href === props.current;
    const text = `${props.item.mono ? 'font-mono text-[13px]' : ''} ${active ? 'font-semibold text-fg' : 'text-fg-3 hover:text-cyan'}`;
    const link = (cls: string) => (
        <a href={props.item.href} aria-current={active ? 'page' : undefined} class={`${cls} ${text}`}>
            {props.item.title}
        </a>
    );
    if (!props.api) return link(`rounded-lg px-3 py-1.5 ${active ? ACTIVE : ''}`);
    return (
        <div class={`flex items-stretch rounded-lg ${active ? ACTIVE : ''}`}>
            {link('min-w-0 flex-auto py-1.5 pl-3')}
            <a
                href={apiPath(props.api.module)}
                aria-label={`${specifierOf(props.api)} API reference`}
                class="group flex flex-none items-center px-2"
            >
                <span class="rounded-[5px] border border-violet-line px-1.5 text-[10px] font-semibold leading-[1.6] tracking-[0.04em] text-violet group-hover:border-violet group-hover:text-fg">
                    API
                </span>
            </a>
        </div>
    );
}, { name: 'NavLink' });

/** The API page of a std sidebar entry (`/docs/std/fs/` → velt/fs), when the module has its own with exports on it. */
function apiOfEntry(href: string): ApiModule | undefined {
    const m = href.startsWith('/docs/std/') ? apiModule(href.slice('/docs/std/'.length)) : undefined;
    return m && countedExports(m).length > 0 ? m : undefined;
}

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
            {shown.map((i) => <NavLink key={i.href} item={i} current={props.current} api={apiOfEntry(i.href)} />)}
            {rest.length > 0 && (
                <details class="nav-group" open={inGroup && !shown.some((i) => i.href === props.current) ? true : undefined}>
                    <summary class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-muted hover:text-cyan">
                        {rest.length} more modules
                        <ChevronRight size={14} cls="chev" />
                    </summary>
                    <div class="flex flex-col gap-0.5 pl-2">
                        {rest.map((i) => <NavLink key={i.href} item={i} current={props.current} api={apiOfEntry(i.href)} />)}
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
    const all = area.id === 'std' ? { href: CATALOG_PATH, title: 'All modules', mono: false } : undefined;
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
    const hasMd = !path.startsWith(API_PATH);
    const stdModule = stdModuleOf(path);
    // A std module's API page (/docs/api/net/http/), from the velt doc JSON.
    const api = path.startsWith(API_PATH) && stdModule ? apiModule(stdModule) : undefined;
    if (api) {
        headings.splice(0, headings.length, { id: 'exports', text: 'Exports', level: 2 },
            ...visibleExports(api).map((e) => ({ id: anchorOf(e), text: e.name, level: 3 as const, code: true })));
    }
    // A std guide's API reference (`collections/deque` → velt/collections), when it has exports.
    const guideApi = !api && hasApiTabs(path) && stdModule ? apiModuleForGuide(stdModule) : undefined;
    const glanceApi = guideApi && countedExports(guideApi).length > 0 ? guideApi : undefined;
    const content = slots.default?.();
    const body = glanceApi
        ? insertAfterLead(content, <ApiGlance module={glanceApi} slug={stdModule!} />) ?? [content, <ApiGlance module={glanceApi} slug={stdModule!} late />]
        : content;
    const crumbGroup = area.id === 'errors' ? { title: 'Errors', href: DIAGNOSTICS_PATH } : { title: nav.group.title, href: nav.group.href };

    return (
        <div id="top" class="min-h-screen bg-bg text-fg [line-height:1.65]">
            <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
                Skip to content
            </a>
            <DocsHeader path={path} />

            <div class="mx-auto flex max-w-[1440px] flex-wrap items-start gap-x-12 px-6">
                {/* Phones: the sidebar folds into a menu. */}
                <details class="docs-menu w-full border-b border-line min-[900px]:hidden">
                    <summary class="flex min-h-12 cursor-pointer items-center gap-2 text-sm font-medium text-fg-3">
                        <MenuIcon size={18} />
                        {api ? <span class="font-mono">{specifierOf(api)} exports</span> : nav.title}
                        <ChevronDown size={16} cls="menu-chev ml-auto transition-transform" />
                    </summary>
                    <nav aria-label="Documentation" class="pb-6 pt-2">
                        {api ? <ApiSidebar module={api} catalog={CATALOG_PATH} /> : path === API_PATH ? <ApiModulesNav current={path} /> : <Sidebar area={area} current={path} />}
                        <p class="m-0 mt-6 flex gap-4 px-3 text-[13px] text-muted">
                            <a href={`${RELEASES_URL}/tag/v${DOCS_VERSION}`} class="text-muted hover:text-cyan">
                                <span class="font-mono">v{DOCS_VERSION}</span> · Changelog
                            </a>
                            <a href={REPO_URL} class="text-muted hover:text-cyan">GitHub</a>
                        </p>
                    </nav>
                </details>
                <nav aria-label={api ? `${specifierOf(api)} API` : 'Documentation'} class="sticky-col hidden max-w-[290px] flex-[1_1_240px] py-8 min-[900px]:block">
                    {api ? <ApiSidebar module={api} catalog={CATALOG_PATH} /> : path === API_PATH ? <ApiModulesNav current={path} /> : <Sidebar area={area} current={path} />}
                </nav>

                <main id="main" class="flex min-w-0 flex-[999_1_560px] flex-wrap items-start gap-12 pb-24 pt-10">
                    <article class="relative flex min-w-0 max-w-[760px] flex-[999_1_520px] flex-col gap-[22px]">
                        {api ? (
                            <nav aria-label="Breadcrumb" class="flex flex-wrap gap-2 text-[13px] text-muted">
                                <a href="/docs/std/" class="text-muted hover:text-cyan">Standard library</a>
                                <span aria-hidden="true">/</span>
                                <a href={guidePath(api.module)} class="text-fg hover:text-cyan">{specifierOf(api)}</a>
                                <span aria-hidden="true">/</span>
                                <span class="text-fg" aria-current="page">API</span>
                            </nav>
                        ) : (
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
                        )}
                        {hasMd && (
                            <div class="page-actions">
                                <PageActions client:idle md={md} />
                            </div>
                        )}
                        <div class={api ? 'api-page' : `prose ${hasMd ? 'has-page-actions' : ''}`}>{body}</div>

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
                        {source && !api && (
                            <p class="m-0 text-[13px]">
                                <a href={`${EDIT_BASE}${source}`} class="text-cyan hover:text-cyan-hover">Edit this page on GitHub</a>
                            </p>
                        )}
                    </article>

                    {api && (
                        <aside data-toc-scroll class="sticky-col max-w-[260px] flex-[1_1_220px] pb-8 pt-2">
                            <OnThisPage
                                client:idle
                                headings={headings}
                                links={[
                                    { href: guidePath(api.module), label: 'Read the guide' },
                                    { href: sourceUrl(api.file), label: 'View source' },
                                ]}
                            />
                        </aside>
                    )}
                    {hasMd && (
                        <aside data-toc-scroll class="sticky-col max-w-[260px] flex-[1_1_220px] pb-8 pt-2">
                            {glanceApi && <ApiAsideCard module={glanceApi} />}
                            <OnThisPage client:idle headings={headings} md={md} edit={source ? `${EDIT_BASE}${source}` : undefined} />
                        </aside>
                    )}
                </main>
            </div>
        </div>
    );
}, { name: 'DocsLayout' });
