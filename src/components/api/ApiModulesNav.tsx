/**
 * The API reference's sidebar on /docs/api/: every module with an API page,
 * grouped like the standard library catalog, each with its export count. The
 * guide sidebar folds most modules away to keep reading pages calm; here the
 * whole API is one click away. Static.
 */
import { component } from 'sigx';
import { CATEGORIES } from '../../data/std-catalog';
import { apiModule, apiModules, apiPath, countedExports, specifierOf, type ApiModule } from '../../lib/std-api';

const label = 'font-mono text-xs uppercase tracking-[0.08em] text-muted';

interface Group {
    title: string;
    modules: ApiModule[];
}

let cache: Group[] | undefined;

/** The modules with API pages, in the catalog's categories and order; any the catalog misses go last. */
export function apiModuleGroups(): Group[] {
    if (cache) return cache;
    const seen = new Set<string>();
    const groups: Group[] = CATEGORIES.map((c) => {
        const modules: ApiModule[] = [];
        for (const [page] of c.modules) {
            const m = apiModule(page);
            if (m && !seen.has(m.module)) {
                seen.add(m.module);
                modules.push(m);
            }
        }
        return { title: c.title, modules };
    }).filter((g) => g.modules.length > 0);
    const rest = [...apiModules().values()].filter((m) => !seen.has(m.module));
    if (rest.length) groups.push({ title: 'More modules', modules: rest });
    cache = groups;
    return groups;
}

export const ApiModulesNav = component<{ current: string }>(({ props }) => () => {
    const groups = apiModuleGroups();
    const total = groups.reduce((n, g) => n + g.modules.length, 0);
    return (
        <div class="flex flex-col gap-6 text-sm">
            <div class="flex flex-col gap-0.5">
                <span class={`${label} px-3 pb-2`}>API reference</span>
                <a
                    href="/docs/api/"
                    aria-current={props.current === '/docs/api/' ? 'page' : undefined}
                    class={`rounded-lg px-3 py-1.5 ${props.current === '/docs/api/' ? 'bg-[#17172A] font-semibold text-fg shadow-[inset_0_0_0_1px_#2E2A5C]' : 'text-fg-3 hover:text-cyan'}`}
                >
                    All {total} modules
                </a>
            </div>
            {groups.map((g) => (
                <div key={g.title} class="flex flex-col gap-0.5">
                    <span class={`${label} px-3 pb-2`}>{g.title}</span>
                    {g.modules.map((m) => {
                        const href = apiPath(m.module);
                        const active = href === props.current;
                        return (
                            <a
                                key={m.module}
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                class={`flex items-baseline gap-2 rounded-lg px-3 py-1.5 font-mono text-[13px] ${
                                    active ? 'bg-[#17172A] font-semibold text-fg shadow-[inset_0_0_0_1px_#2E2A5C]' : 'text-fg-3 hover:text-cyan'
                                }`}
                            >
                                <span class="min-w-0 flex-auto [overflow-wrap:anywhere]">{specifierOf(m)}</span>
                                <span class="flex-none text-[11px] text-dim">{countedExports(m).length}</span>
                            </a>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}, { name: 'ApiModulesNav' });
