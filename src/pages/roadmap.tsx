/**
 * The roadmap: what the next release brings (once its notes are written),
 * what is planned (decided designs), the known gaps, and what has shipped.
 * Data: src/data/roadmap.ts and src/data/releases.ts. Static.
 */
import { component } from 'sigx';
import { ic } from '../lib/inline-code';
import { formatDate } from '../lib/blog';
import { AREAS, ROADMAP, type RoadmapItem } from '../data/roadmap';
import { nextRelease, releaseUrl } from '../data/releases';
import { REPO_URL } from '../lib/site';

export const meta = {
    title: 'Roadmap — Velt',
    description: 'Where Velt is going: what the next release brings, the designs that are decided but not built yet, the known gaps, and what has shipped.',
    layout: 'home',
};

const h2 = 'm-0 font-display text-[clamp(28px,3vw,36px)] font-bold leading-[1.1] tracking-[-0.02em]';
const eyebrow = 'font-mono text-xs uppercase tracking-[0.08em]';

const Item = component<{ item: RoadmapItem; tone: string; dashed?: boolean }>(({ props }) => () => {
    const i = props.item;
    return (
        <a href={i.href} class={`flex flex-col gap-2 rounded-2xl border p-6 text-fg hover:text-fg ${props.dashed ? 'border-dashed border-line-3' : 'border-line-2 bg-surface hover:border-line-3'}`}>
            <span class={`${eyebrow} ${props.tone}`}>
                {AREAS[i.area]}
                {i.since ? ` · ${i.since}` : ''}
            </span>
            <span class="font-display text-[19px] font-semibold leading-[1.3]">{ic(i.title)}</span>
            <span class="text-[15px] text-muted">{ic(i.detail)}</span>
        </a>
    );
}, { name: 'RoadmapItem' });

const grid = 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-4';

export default component(() => () => {
    const next = nextRelease();
    const planned = ROADMAP.filter((i) => i.status === 'planned');
    const gaps = ROADMAP.filter((i) => i.status === 'gap');
    const shipped = ROADMAP.filter((i) => i.status === 'shipped');

    return (
        <div class="mx-auto flex max-w-[1248px] flex-col gap-20 px-6 pb-28 pt-20">
            <div class="flex max-w-[720px] flex-col gap-4">
                <span class={`${eyebrow} text-[13px] text-orange`}>Roadmap</span>
                <h1 class="m-0 font-display text-[clamp(40px,5vw,64px)] font-bold leading-[1.04] tracking-[-0.035em]">Where Velt is going</h1>
                <p class="m-0 text-xl leading-[1.55] text-fg-3">
                    Velt is pre-1.0 and changes quickly. This page tracks what's coming, what's decided, and what's still missing. Every item links to the
                    docs that describe it, so it stays as current as the docs.
                </p>
                <nav aria-label="On this page" class="flex flex-wrap gap-2 pt-2 text-sm">
                    {[
                        ...(next ? [{ href: '#next', label: `In ${next.version}` }] : []),
                        { href: '#planned', label: 'Planned' },
                        { href: '#gaps', label: 'Not there yet' },
                        { href: '#shipped', label: 'Shipped' },
                    ].map((l) => (
                        <a key={l.href} href={l.href} class="inline-flex min-h-11 items-center rounded-full border border-line-3 px-4 text-fg-3 hover:text-cyan">{l.label}</a>
                    ))}
                </nav>
            </div>

            {next && (
                <section id="next" aria-labelledby="next-title" class="flex scroll-mt-28 flex-col gap-6">
                    <div class="flex flex-col gap-2">
                        <span class={`${eyebrow} text-yellow`}>Next release · {formatDate(next.date)}</span>
                        <h2 id="next-title" class={h2}>Velt {next.version}: {next.title}</h2>
                        <p class="m-0 max-w-[720px] text-[17px] text-fg-3">{ic(next.summary)}</p>
                    </div>
                    <ul class={`${grid} m-0 list-none p-0`}>
                        {(next.highlights ?? []).map((h) => (
                            <li key={h.id} class="flex flex-col gap-2 rounded-2xl border border-[#3A3218] bg-[#141108] p-6">
                                <span class="font-display text-[19px] font-semibold leading-[1.3]">{ic(h.title)}</span>
                                <span class="text-[15px] text-muted">{ic(h.body)}</span>
                            </li>
                        ))}
                    </ul>
                    <p class="m-0 text-[15px] text-muted">
                        The docs describe it once it's documented: then the full notes are on <a href="/whats-new/" class="text-cyan hover:text-cyan-hover">What's new</a>. Until then,{' '}
                        <a href={releaseUrl(next.version)} class="text-cyan hover:text-cyan-hover">its release on GitHub</a>.
                    </p>
                </section>
            )}

            <section id="planned" aria-labelledby="planned-title" class="flex scroll-mt-28 flex-col gap-6">
                <div class="flex flex-col gap-2">
                    <span class={`${eyebrow} text-violet`}>Planned</span>
                    <h2 id="planned-title" class={h2}>Decided, not built yet</h2>
                    <p class="m-0 max-w-[720px] text-[17px] text-fg-3">The design is settled and written down in the docs as a Planned note. No dates: they ship when they're ready.</p>
                </div>
                <div class={grid}>{planned.map((i) => <Item key={i.title} item={i} tone="text-violet" dashed />)}</div>
            </section>

            <section id="gaps" aria-labelledby="gaps-title" class="flex scroll-mt-28 flex-col gap-6">
                <div class="flex flex-col gap-2">
                    <span class={`${eyebrow} text-peach`}>Not there yet</span>
                    <h2 id="gaps-title" class={h2}>Known gaps</h2>
                    <p class="m-0 max-w-[720px] text-[17px] text-fg-3">
                        Things people ask for that don't have a design yet. Want one sooner?{' '}
                        <a href={`${REPO_URL}/issues`} class="text-cyan hover:text-cyan-hover">Open an issue</a> and say what you'd build with it.
                    </p>
                </div>
                <div class={grid}>{gaps.map((i) => <Item key={i.title} item={i} tone="text-peach" dashed />)}</div>
            </section>

            <section id="shipped" aria-labelledby="shipped-title" class="flex scroll-mt-28 flex-col gap-6">
                <div class="flex flex-col gap-2">
                    <span class={`${eyebrow} text-green`}>Shipped</span>
                    <h2 id="shipped-title" class={h2}>Recently done</h2>
                    <p class="m-0 max-w-[720px] text-[17px] text-fg-3">
                        Milestones from earlier releases. Each release's changes are on <a href="/whats-new/" class="text-cyan hover:text-cyan-hover">What's new</a>.
                    </p>
                </div>
                <div class={grid}>{shipped.map((i) => <Item key={i.title} item={i} tone="text-green" />)}</div>
            </section>
        </div>
    );
});
