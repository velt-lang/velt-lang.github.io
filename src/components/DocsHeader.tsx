/**
 * The docs header (design/Api.dc.html): logo, the area switcher, Guide | API
 * tabs on std module pages, search, the version pill. Docs pages and the std
 * catalog share it.
 */
import { component } from 'sigx';
import { Logo } from './SiteChrome';
import { GitHubIcon } from './Icons';
import { AreaMenu } from '../islands/AreaMenu';
import { DocsSearch } from '../islands/DocsSearch';
import { docGroups } from '../lib/docs-nav';
import { AREAS, areaOf, hasApiTabs, stdModuleOf, tabTargets } from '../lib/docs-areas';
import { apiModule } from '../lib/std-api';
import { DOCS_VERSION, RELEASES_URL, REPO_URL } from '../lib/site';

/** The std area's one-liner counts its modules. */
function areaItems() {
    const std = docGroups().find((g) => g.id === 'std');
    const modules = std?.items.filter((i) => i.href !== std.href).length ?? 0;
    return AREAS.map(({ id, label, meta, glyph, color, href }) => ({
        id, label, glyph, color, href,
        meta: id === 'std' ? `${modules} modules · ${meta}` : meta,
    }));
}

export const DocsHeader = component<{ path: string }>(({ props }) => () => {
    const path = props.path;
    const area = areaOf(path);
    const tabs = hasApiTabs(path);
    const mod = stdModuleOf(path);
    const tab = tabTargets(path, !!(mod && apiModule(mod)));
    return (
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
                            href={tab.guide}
                            aria-current={!tab.onApi ? 'page' : undefined}
                            class={`inline-flex min-h-10 items-center px-3 ${!tab.onApi ? 'font-semibold text-fg shadow-[inset_0_-2px_0_var(--color-orange)]' : 'text-fg-3 hover:text-cyan'}`}
                        >
                            Guide
                        </a>
                        <a
                            href={tab.api}
                            aria-current={tab.onApi ? 'page' : undefined}
                            class={`inline-flex min-h-10 items-center px-3 ${tab.onApi ? 'font-semibold text-fg shadow-[inset_0_-2px_0_var(--color-orange)]' : 'text-fg-3 hover:text-cyan'}`}
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
    );
}, { name: 'DocsHeader' });
