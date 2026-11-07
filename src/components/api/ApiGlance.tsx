/**
 * Std guide pages point at their API reference (design/ApiSwitch.dc.html):
 * "API at a glance" after the guide's lead paragraph (export count, counts by
 * kind, the headline exports, a button to the API page), and the card at the
 * top of the "On this page" column. Static: no island.
 */
import { Comment, component, Fragment, Text, type JSXElement, type VNode } from 'sigx';
import { ArrowRight } from '../Icons';
import { tint } from '../../lib/docs-areas';
import { anchorOf, apiPath, countedExports, kindCounts, mainExports, specifierOf, type ApiModule } from '../../lib/std-api';

const plural = (n: number) => `${n} export${n === 1 ? '' : 's'}`;

export const ApiGlance = component<{ module: ApiModule; /** The guide's slug under /docs/std/ (`collections/deque`). */ slug: string; late?: boolean }>(({ props }) => () => {
    const m = props.module;
    const href = apiPath(m.module);
    const total = countedExports(m).length;
    const tops = mainExports(m, props.slug, 6);
    const more = total - tops.length;
    return (
        <section
            aria-label="API at a glance"
            class={`api-glance ${props.late ? 'api-glance-late' : ''} flex flex-col gap-4 rounded-[18px] border border-violet-line bg-linear-to-b from-violet-tint to-surface px-6 py-[22px] leading-[1.5] max-[480px]:px-4`}
        >
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex min-w-0 flex-col gap-0.5">
                    <span class="font-mono text-xs uppercase tracking-[0.08em] text-violet">API reference</span>
                    <span class="font-display text-xl font-semibold text-fg">{plural(total)}, every signature and doc comment</span>
                </div>
                <a href={href} class="api-glance-open inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-[18px] text-[15px] font-semibold hover:brightness-110">
                    Open the API reference
                    <ArrowRight size={16} stroke={2} />
                </a>
            </div>
            <div class="flex flex-wrap gap-2">
                {kindCounts(m).map((k) => (
                    <span key={k.kind} class="inline-flex items-center gap-2 rounded-[10px] border border-line-2 bg-bg-header py-1.5 pl-1.5 pr-3 text-[13px] text-fg-2">
                        <span
                            aria-hidden="true"
                            class="grid size-[22px] flex-none place-items-center rounded-md font-mono text-[11px] font-bold"
                            style={{ color: k.color, background: tint(k.color, 0.12) }}
                        >
                            {k.glyph}
                        </span>
                        <span>
                            <strong class="font-semibold text-fg">{k.count}</strong> {k.noun}
                        </span>
                    </span>
                ))}
            </div>
            <div class="flex flex-wrap items-center gap-1.5 text-[13px]">
                <span class="mr-1 text-muted">Jump to</span>
                {tops.map((e) => (
                    <a key={e.id} href={`${href}#${anchorOf(e)}`} class="inline-flex min-h-8 items-center rounded-lg border border-line-2 bg-input px-2.5 font-mono hover:border-line-3">
                        {e.name}
                    </a>
                ))}
                {more > 0 && (
                    <a href={`${href}#exports`} class="api-glance-more inline-flex min-h-8 items-center px-1.5">
                        +{more} more
                    </a>
                )}
            </div>
        </section>
    );
}, { name: 'ApiGlance' });

/** The "On this page" column's link to the API reference. */
export const ApiAsideCard = component<{ module: ApiModule }>(({ props }) => () => (
    <a
        href={apiPath(props.module.module)}
        class="mb-6 flex flex-col gap-1 rounded-[14px] border border-violet-line bg-violet-tint px-4 py-3.5 text-sm leading-[1.4] text-fg hover:border-violet hover:text-fg"
    >
        <span class="font-mono text-[11px] uppercase tracking-[0.08em] text-violet">API reference</span>
        <span class="font-semibold">
            {plural(countedExports(props.module).length)} in <span class="font-mono text-[13px]">{specifierOf(props.module)}</span> <span aria-hidden="true">→</span>
        </span>
    </a>
), { name: 'ApiAsideCard' });

/** What a layout's default slot holds: the rendered page. */
export type PageNode = VNode | string | number | boolean | null | undefined;
type Node = PageNode;
const isElement = (n: Node, tag: string): n is VNode => !!n && typeof n === 'object' && n.type === tag;
const isFragment = (n: Node): n is VNode => !!n && typeof n === 'object' && n.type === Fragment;

/**
 * The page's content with `node` after its lead: the first element after the
 * H1 when that is a paragraph, else right after the H1. A built MDX page
 * reaches the layout as a fragment of its elements; null when the content has
 * no H1 at that level (the dev server's page is one component).
 */
export function insertAfterLead(content: unknown, node: JSXElement): Node[] | null {
    if (!Array.isArray(content)) return isFragment(content as Node) ? insertAfterLead([content], node) : null;
    const h1 = content.findIndex((n) => isElement(n, 'h1'));
    if (h1 >= 0) {
        const next = content.findIndex((n, i) => i > h1 && !!n && typeof n === 'object' && n.type !== Text && n.type !== Comment);
        const at = next >= 0 && isElement(content[next], 'p') ? next + 1 : h1 + 1;
        return [...content.slice(0, at), node, ...content.slice(at)];
    }
    for (let i = 0; i < content.length; i++) {
        const n = content[i];
        if (!isFragment(n)) continue;
        const inner = insertAfterLead(n.children, node);
        if (inner) return [...content.slice(0, i), <>{inner}</>, ...content.slice(i + 1)];
    }
    return null;
}
