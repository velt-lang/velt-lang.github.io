/**
 * An API page's left column (design/Api.dc.html): the module switcher, "All
 * modules" with the count, then the module's exports grouped Functions /
 * Classes / Structs / … with a kind tile each.
 */
import { component } from 'sigx';
import { GridIcon } from '../Icons';
import { ModuleSwitcher } from '../../islands/ModuleSwitcher';
import { tint } from '../../lib/docs-areas';
import { CATEGORIES } from '../../data/std-catalog';
import { anchorOf, apiModules, apiPath, groupExports, guideSlug, kindInfo, visibleExports, type ApiModule } from '../../lib/std-api';

export const ApiSidebar = component<{ module: ApiModule; catalog: string }>(({ props }) => () => {
    const m = props.module;
    const all = [...apiModules().values()];
    const count = (n: number) => `${n} export${n === 1 ? '' : 's'}`;
    return (
        <div class="flex flex-col gap-3.5 text-sm leading-[1.45]">
            <ModuleSwitcher
                client:idle
                current={m.specifier}
                meta={CATEGORIES.find((c) => c.modules.some(([page]) => page === guideSlug(m.module)))?.title ?? count(visibleExports(m).length)}
                modules={all.map((x) => ({ name: x.specifier, href: apiPath(x.module) }))}
            />
            <a
                href={props.catalog}
                class="flex min-h-11 items-center gap-2.5 rounded-xl border border-[#3F2A1A] bg-[#17110C] px-3 font-semibold text-peach hover:text-peach hover:brightness-125"
            >
                <GridIcon size={16} stroke={2} />
                <span class="flex-auto">All modules</span>
                <span class="rounded-full bg-[rgba(255,159,90,0.15)] px-2 text-xs">{all.length}</span>
            </a>
            {groupExports(visibleExports(m)).map((g) => (
                <div key={g.title} class="flex flex-col gap-px pt-2.5">
                    <span class="px-3 pb-1.5 font-mono text-[11.5px] uppercase tracking-[0.1em] text-muted">{g.title}</span>
                    {g.items.map((it) => {
                        const k = kindInfo(it.kind);
                        return (
                            <a key={it.id} href={`#${anchorOf(it)}`} data-api-nav class="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-fg-3 hover:text-cyan">
                                <span
                                    aria-hidden="true"
                                    class="grid size-5 flex-none place-items-center rounded-[5px] font-mono text-[11px]"
                                    style={{ color: k.color, background: tint(k.color, 0.12) }}
                                >
                                    {k.glyph}
                                </span>
                                <span class="min-w-0 font-mono text-[13.5px] [overflow-wrap:anywhere]">{it.name}</span>
                            </a>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}, { name: 'ApiSidebar' });
