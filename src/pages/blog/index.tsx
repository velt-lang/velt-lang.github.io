/**
 * The blog (design: Blog — Index): what's happening (the latest release, what
 * the next one brings, what is planned), the pinned post, then every post,
 * newest first. Posts are src/pages/blog/*.mdx (src/lib/blog.ts). Static.
 */
import { component } from 'sigx';
import { TOPICS, formatDate, posts } from '../../lib/blog';
import { latestRelease, nextRelease } from '../../data/releases';
import { ROADMAP } from '../../data/roadmap';
import { RELEASES_URL } from '../../lib/site';
import { ic } from '../../lib/inline-code';

export const meta = {
    title: 'Blog — Velt',
    description: "What's happening with Velt: releases, progress on the roadmap, and the reasons behind the design.",
    layout: 'home',
};

const tag = 'rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.04em]';
const dot = 'size-[7px] rounded-full';

export default component(() => () => {
    const all = posts();
    const pinned = all.filter((p) => p.pinned);
    const rest = all.filter((p) => !p.pinned);
    const latest = latestRelease();
    const next = nextRelease();
    const planned = ROADMAP.filter((i) => i.status === 'planned');

    return (
        <div class="mx-auto flex max-w-[1248px] flex-col gap-14 px-6 pb-28 pt-20">
            <div class="flex max-w-[720px] flex-col gap-4">
                <h1 class="m-0 font-display text-[clamp(48px,6vw,80px)] font-bold leading-none tracking-[-0.04em]">Blog</h1>
                <p class="m-0 text-xl leading-[1.55] text-fg-3">
                    What's happening with Velt: releases, progress on the roadmap, and the reasons behind the design.
                </p>
            </div>

            <section aria-label="What's happening" class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] overflow-hidden rounded-2xl border border-line-2 bg-surface">
                <a href="/whats-new/" class="flex flex-col gap-1.5 border-line px-6 py-[22px] text-fg hover:text-fg [&:not(:last-child)]:border-r">
                    <span class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-green"><span class={`${dot} bg-green`} />Latest release</span>
                    <span class="font-display text-lg font-semibold">Velt {latest.version}</span>
                    <span class="text-sm text-muted">{formatDate(latest.date)} · what's new →</span>
                </a>
                {next ? (
                    <a href="/roadmap/" class="flex flex-col gap-1.5 border-line px-6 py-[22px] text-fg hover:text-fg [&:not(:last-child)]:border-r">
                        <span class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-yellow"><span class={`${dot} bg-yellow`} />Coming in {next.version}</span>
                        <span class="font-display text-lg font-semibold">{next.title}</span>
                        <span class="text-sm text-muted">On the roadmap →</span>
                    </a>
                ) : null}
                <a href="/roadmap/" class="flex flex-col gap-1.5 border-line px-6 py-[22px] text-fg hover:text-fg [&:not(:last-child)]:border-r">
                    <span class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-violet"><span class={`${dot} bg-violet`} />Planned</span>
                    <span class="font-display text-lg font-semibold">{planned.length} decided designs</span>
                    <span class="text-sm text-muted">{planned[0] ? ic(planned[0].title) : 'The roadmap'} and more →</span>
                </a>
                <a href={RELEASES_URL} class="flex flex-col gap-1.5 px-6 py-[22px] text-fg hover:text-fg">
                    <span class="text-xs font-semibold uppercase tracking-[0.06em] text-cyan">Follow along</span>
                    <span class="font-display text-lg font-semibold">Watch releases</span>
                    <span class="text-sm text-muted">On GitHub →</span>
                </a>
            </section>

            {pinned.map((p) => (
                <a key={p.href} href={p.href} class="flex flex-wrap items-center gap-x-7 gap-y-4 rounded-[18px] border border-[#2E2A5C] bg-[#12101F] px-7 py-6 text-fg hover:text-fg">
                    <span class="rounded-full bg-yellow px-3 py-1 text-xs font-bold uppercase tracking-[0.04em] text-bg">Start here</span>
                    <span class="flex min-w-0 flex-[1_1_420px] flex-col gap-0.5">
                        <span class="font-display text-[22px] font-semibold leading-[1.25]">{p.title}</span>
                        <span class="text-[15px] text-fg-3">{p.description}</span>
                    </span>
                    <span class="text-[15px] font-semibold text-cyan">Read it →</span>
                </a>
            ))}

            {rest.length > 0 ? (
                <section aria-label="Posts" class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-5">
                    {rest.map((p) => (
                        <a key={p.href} href={p.href} class="flex min-h-[240px] flex-col gap-3.5 rounded-[18px] border border-line-2 bg-surface p-7 text-fg hover:border-line-3 hover:text-fg">
                            <span class="flex flex-wrap items-center gap-2.5">
                                <span class={`${tag} ${TOPICS[p.topic].cls}`}>{TOPICS[p.topic].label}</span>
                                {p.draft && <span class="rounded-md border border-dashed border-line-3 px-2.5 py-0.5 text-xs font-medium text-muted">Draft</span>}
                            </span>
                            <span class="font-display text-[23px] font-semibold leading-[1.2] tracking-[-0.01em]">{p.title}</span>
                            <span class="flex-auto text-[15px] text-muted">{p.description}</span>
                            <span class="text-sm text-dim">{formatDate(p.date)}</span>
                        </a>
                    ))}
                </section>
            ) : (
                <p class="m-0 text-fg-3">
                    More posts are on the way. Until then, <a href="/whats-new/" class="text-cyan hover:text-cyan-hover">see what's new</a> or{' '}
                    <a href="/roadmap/" class="text-cyan hover:text-cyan-hover">what's planned</a>.
                </p>
            )}
        </div>
    );
});
