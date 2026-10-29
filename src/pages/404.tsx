import { component } from 'sigx';

export const meta = { title: 'Page not found — Velt', layout: 'default', robots: 'noindex' };

export default component(() => () => (
    <section class="mx-auto flex max-w-[1248px] flex-col items-start gap-6 px-6 py-32">
        <span class="font-mono text-[13px] uppercase tracking-[0.08em] text-orange">404</span>
        <h1 class="m-0 font-display text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em]">This page doesn't exist.</h1>
        <p class="m-0 max-w-[560px] text-lg text-fg-3">
            It may have moved when the docs were reorganized. Search the docs, or start from the overview.
        </p>
        <div class="flex flex-wrap gap-3">
            <a href="/docs/" class="inline-flex min-h-[52px] items-center rounded-xl bg-accent px-6 font-semibold text-white hover:text-white">Read the docs</a>
            <a href="/" class="inline-flex min-h-[52px] items-center rounded-xl border border-line-3 px-6 font-semibold text-fg">Home</a>
        </div>
    </section>
), { name: 'NotFoundPage' });
