/**
 * What's new (design: Release notes): the latest release in full, how to
 * upgrade, what's next, and earlier releases. Data: src/data/releases.ts.
 * Static: the New / Changed / Fixed labels are plain text, not filters.
 */
import { component } from 'sigx';
import { ArrowRight } from '../components/Icons';
import { CodeCard } from '../components/Hl';
import { formatDate } from '../lib/blog';
import { ic } from '../lib/inline-code';
import { compareVersions, publishedReleases, releaseUrl, type ChangeKind, type Release } from '../data/releases';
import { ROADMAP } from '../data/roadmap';
import { DOCS_VERSION } from '../lib/site';

export const meta = {
    title: "What's new — Velt",
    description: 'Release notes for Velt: what each release adds and changes, and how to upgrade.',
    layout: 'home',
};

const KIND: Record<ChangeKind, { label: string; cls: string }> = {
    new: { label: 'New', cls: 'border-[#1D3A2E] bg-[#0C1512] text-green' },
    changed: { label: 'Changed', cls: 'border-[#2E2A5C] bg-[#12101F] text-violet' },
    fixed: { label: 'Fixed', cls: 'border-[#3F2A1A] bg-[#17110C] text-peach' },
    breaking: { label: 'Breaking', cls: 'border-[#4A2330] bg-[#1A0D12] text-pink' },
};

const Kind = component<{ kind: ChangeKind }>(({ props }) => () => (
    <span class={`self-start rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.04em] ${KIND[props.kind].cls}`}>
        {KIND[props.kind].label}
    </span>
), { name: 'Kind' });

const h2 = 'm-0 font-display text-[36px] font-bold leading-[1.1] tracking-[-0.02em]';
const btnPrimary = 'inline-flex min-h-[52px] items-center gap-2.5 rounded-xl bg-accent px-6 font-semibold text-white hover:text-white hover:brightness-110';
const btnGhost = 'inline-flex min-h-[52px] items-center rounded-xl border border-line-3 px-6 font-semibold text-fg';

const Notes = component<{ release: Release; preview: boolean }>(({ props }) => () => {
    const r = props.release;
    return (
        <>
            <section class="border-b border-line bg-[radial-gradient(80%_120%_at_85%_0%,rgba(110,91,255,0.22),rgba(8,8,13,0)_60%)]">
                <div class="mx-auto flex max-w-[1248px] flex-wrap items-end justify-between gap-12 px-6 pb-20 pt-[88px]">
                    <div class="flex min-w-0 flex-[1_1_560px] flex-col gap-6">
                        <div class="flex flex-wrap items-center gap-2.5">
                            {props.preview ? (
                                <span class="inline-flex items-center gap-2 rounded-full border border-[#3F2A1A] bg-[#17110C] px-3.5 py-1.5 text-[13px] font-medium text-peach">
                                    Preview: the docs don't describe {r.version} yet
                                </span>
                            ) : (
                                <span class="inline-flex items-center gap-2 rounded-full border border-[#1D3A2E] bg-[#0C1512] px-3.5 py-1.5 text-[13px] font-medium text-green">
                                    <span class="size-2 rounded-full bg-green" />
                                    Latest release
                                </span>
                            )}
                            <time dateTime={r.date} class="text-sm text-muted">{formatDate(r.date)}</time>
                        </div>
                        <h1 class="m-0 font-display text-[clamp(44px,6vw,76px)] font-bold leading-[1.02] tracking-[-0.035em]">
                            What's new in <span class="brand-text">Velt {r.version.replace(/\.0$/, '')}</span>
                        </h1>
                        <p class="m-0 max-w-[640px] text-xl leading-[1.55] text-fg-3">
                            <strong class="font-semibold text-fg">{r.title}.</strong> {ic(r.summary)}
                        </p>
                        <div class="flex flex-wrap gap-3">
                            {r.upgrade && (
                                <a href="#upgrade" class={btnPrimary}>
                                    Upgrade to {r.version.replace(/\.0$/, '')}
                                    <ArrowRight stroke={2} />
                                </a>
                            )}
                            <a href={releaseUrl(r.version)} class={btnGhost}>Full changelog on GitHub</a>
                        </div>
                    </div>
                    <div aria-hidden="true" class="hidden flex-[0_1_300px] justify-center font-display text-[200px] font-bold leading-[0.85] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1.5px_#34304F] min-[900px]:flex">
                        {r.version.replace(/\.0$/, '')}
                    </div>
                </div>
            </section>

            {r.glance && (
                <section aria-labelledby="glance" class="mx-auto max-w-[1248px] px-6 pt-16">
                    <h2 id="glance" class="m-0 mb-6 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-muted">At a glance</h2>
                    <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
                        {r.glance.map((g) => (
                            <a key={g.href} href={g.href} class="flex flex-col gap-2 rounded-2xl border border-line-2 bg-surface p-6 text-fg hover:border-line-3 hover:text-fg">
                                <span class="font-display text-[19px] font-semibold">{ic(g.title)}</span>
                                <span class="text-[15px] text-muted">{ic(g.text)}</span>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {r.highlights && (
                <section aria-labelledby="details" class="mx-auto flex max-w-[1248px] flex-col gap-6 px-6 pt-16">
                    <h2 id="details" class={h2}>The details</h2>
                    {r.highlights.map((h, i) => (
                        <article key={h.id} id={h.id} class={`flex scroll-mt-28 flex-wrap items-center gap-10 rounded-3xl border border-line-2 bg-surface p-[clamp(24px,4vw,40px)] ${i % 2 ? 'flex-row-reverse' : ''}`}>
                            <div class="flex min-w-0 flex-[1_1_380px] flex-col gap-3.5">
                                <Kind kind={h.kind} />
                                <h3 class="m-0 font-display text-[30px] font-bold leading-[1.15] tracking-[-0.02em]">{ic(h.title)}</h3>
                                <p class="m-0 text-[17px] text-fg-3">{ic(h.body)}</p>
                                {h.aside && <p class="m-0 text-[15px] text-muted">{ic(h.aside)}</p>}
                                {h.href && (
                                    <a href={h.href} class="self-start font-medium text-cyan hover:text-cyan-hover">{h.link ?? 'Read more'} →</a>
                                )}
                            </div>
                            {h.code && (
                                <div class="flex min-w-0 flex-[1_1_460px]">
                                    <CodeCard title={h.code.file} code={h.code.src} />
                                </div>
                            )}
                            {h.uses && (
                                <div class="flex min-w-0 basis-full flex-col gap-3 border-t border-line pt-6">
                                    <span class="font-mono text-xs uppercase tracking-[0.08em] text-muted">The packages already build on it</span>
                                    <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3">
                                        {h.uses.map((u) => (
                                            <a key={u.name} href={u.href} class="flex flex-col gap-1.5 rounded-xl border border-line-2 bg-bg-raised p-5 text-fg hover:border-line-3 hover:text-fg">
                                                <span class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                                    <span class="font-mono text-[15px] font-semibold">{u.name}</span>
                                                    <span class="text-xs font-semibold uppercase tracking-[0.04em] text-green">{u.stat}</span>
                                                </span>
                                                <span class="text-sm text-fg-3">{ic(u.text)}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </article>
                    ))}
                </section>
            )}

            {r.groups && (
                <section aria-label="More changes" class="mx-auto grid max-w-[1248px] grid-cols-[repeat(auto-fit,minmax(min(100%,480px),1fr))] gap-6 px-6 pt-6">
                    {r.groups.map((g) => (
                        <div key={g.title} class="flex flex-col gap-4 rounded-3xl border border-line-2 bg-surface p-[clamp(24px,4vw,40px)]">
                            <h3 class="m-0 font-display text-[22px] font-semibold">{g.title}</h3>
                            <ul class="m-0 flex list-none flex-col gap-3 p-0">
                                {g.items.map((it, i) => (
                                    <li key={i} class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                        <Kind kind={it.kind} />
                                        <span class="min-w-0 flex-[1_1_240px] text-[15px] text-fg-3">{ic(it.text)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            {r.upgrade && (
                <section id="upgrade" aria-labelledby="upgrade-title" class="mx-auto max-w-[1248px] scroll-mt-28 px-6 pt-24">
                    <div class="flex flex-wrap gap-10 rounded-3xl border border-line-3 bg-surface bg-[radial-gradient(120%_140%_at_100%_0%,rgba(34,216,245,0.12),rgba(8,8,13,0)_55%)] p-[clamp(24px,4vw,48px)]">
                        <div class="flex min-w-0 flex-[1_1_320px] flex-col gap-3.5">
                            <h2 id="upgrade-title" class={h2}>Upgrading</h2>
                            <p class="m-0 text-[17px] text-fg-3">
                                Velt is pre-1.0, so old syntax is removed rather than deprecated. The compiler explains how to update anything it no longer accepts.
                            </p>
                            <div class="install-cmd overflow-x-auto rounded-xl border border-line-2 bg-input px-4 py-3 font-mono text-[13px] whitespace-nowrap">
                                <span class="text-dim">$ </span>velt toolchain install {r.version}
                            </div>
                            <p class="m-0 text-sm text-muted">
                                Versions install side by side. In a package, change the <code class="c">velt</code> field of{' '}
                                <code class="c">package.{compareVersions(r.version, '0.6.0') >= 0 ? 'velt' : 'vlt'}</code> and run <code class="c">velt update</code> (
                                <a href="/docs/tooling/cli/#velt-toolchain" class="text-cyan hover:text-cyan-hover">how toolchains work</a>). New to Velt?{' '}
                                <a href="/#install" class="text-cyan hover:text-cyan-hover">Install it</a>.
                            </p>
                        </div>
                        <ol class="m-0 flex min-w-0 flex-[1_1_440px] list-none flex-col gap-3.5 p-0">
                            {r.upgrade.map((u, i) => (
                                <li key={i} class="flex items-start gap-4">
                                    <span class="grid size-8 flex-none place-items-center rounded-full bg-[#17152A] text-sm font-semibold text-violet">{i + 1}</span>
                                    <span class="text-fg-3"><strong class="font-semibold text-fg">{ic(u.title)}.</strong> {ic(u.text)}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}
        </>
    );
}, { name: 'Notes' });

export default component(() => () => {
    const releases = publishedReleases();
    const latest = releases[0];
    const earlier = releases.slice(1);
    const planned = ROADMAP.filter((i) => i.status === 'planned').slice(0, 4);

    return (
        <div class="pb-28">
            <Notes release={latest} preview={latest.version !== DOCS_VERSION} />

            <section aria-labelledby="next" class="mx-auto max-w-[1248px] px-6 pt-24">
                <div class="mb-7 flex flex-wrap items-end justify-between gap-4">
                    <div class="flex flex-col gap-2">
                        <h2 id="next" class={h2}>Coming next</h2>
                        <p class="m-0 text-[17px] text-muted">Decided designs that aren't built yet.</p>
                    </div>
                    <a href="/roadmap/" class="font-medium text-cyan hover:text-cyan-hover">The roadmap →</a>
                </div>
                <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
                    {planned.map((p) => (
                        <a key={p.title} href={p.href} class="flex flex-col gap-2 rounded-2xl border border-dashed border-line-3 p-6 text-fg hover:text-fg">
                            <span class="font-mono text-xs uppercase tracking-[0.08em] text-violet">Planned</span>
                            <span class="font-display text-[19px] font-semibold">{ic(p.title)}</span>
                            <span class="text-[15px] text-muted">{ic(p.detail)}</span>
                        </a>
                    ))}
                </div>
            </section>

            <section aria-labelledby="earlier" class="mx-auto max-w-[1248px] px-6 pt-24">
                <h2 id="earlier" class={`${h2} mb-6`}>Earlier releases</h2>
                <ul class="m-0 list-none border-t border-line p-0">
                    {earlier.map((r) => (
                        <li key={r.version} class="border-b border-line">
                            <a href={releaseUrl(r.version)} class="flex min-h-16 flex-wrap items-center gap-x-6 gap-y-1 px-1 py-3 text-fg hover:text-fg">
                                <span class="w-24 font-mono font-medium">{r.version}</span>
                                <span class="flex-auto text-muted">
                                    {formatDate(r.date)}
                                    {r.title ? ` · ${r.title}` : ''}
                                </span>
                                <span class="text-[15px] text-cyan">Release notes →</span>
                            </a>
                        </li>
                    ))}
                </ul>
                <p class="m-0 mt-6 text-[15px] text-muted">
                    The story behind a release is on the <a href="/blog/" class="text-cyan hover:text-cyan-hover">blog</a>.
                </p>
            </section>
        </div>
    );
});
