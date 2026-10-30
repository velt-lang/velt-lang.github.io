/**
 * Every benchmark from src/data/benchmarks.ts on one page: the home page's
 * "All benchmarks and methods". Static.
 */
import { component } from 'sigx';
import { BenchBars } from '../components/BenchBars';
import { BENCHMARKS } from '../data/benchmarks';
import { REPO_URL } from '../lib/site';

export const meta = {
    title: 'Benchmarks — Velt',
    description: 'Velt against Rust, Go, Bun and Node: HTTP JSON and plaintext, Redis, Postgres, SQLite and memory, each with the machine, the method and the raw results it comes from.',
    layout: 'home',
};

const blob = (path: string) => `${REPO_URL}/blob/main/${path}`;

export default component(() => () => (
    <div class="mx-auto flex max-w-[1248px] flex-col gap-12 px-6 pb-28 pt-[72px]">
        <div class="flex max-w-[720px] flex-col gap-4">
            <span class="font-mono text-[13px] uppercase tracking-[0.08em] text-orange">Benchmarks</span>
            <h1 class="m-0 font-display text-[clamp(38px,4.4vw,56px)] font-bold leading-[1.05] tracking-[-0.03em]">Every number, with its method.</h1>
            <p class="m-0 text-lg text-fg-3">
                The HTTP server and the Redis, Postgres and SQLite drivers are written in Velt and measured against Rust, Go, Bun and Node.
                Each benchmark names its machine and links the results file in{' '}
                <a href={`${REPO_URL}/tree/main/bench`} class="text-cyan hover:text-cyan-hover">velt-lang/velt/bench</a>, which has the
                method, the raw data and how to run it yourself.
            </p>
        </div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,520px),1fr))] gap-5">
            {BENCHMARKS.map((b) => (
                <section key={b.id} id={b.id} aria-labelledby={`bench-${b.id}`} class="flex scroll-mt-6 flex-col gap-[18px] rounded-2xl border border-line-2 bg-surface px-6 pb-5 pt-6">
                    <div class="flex flex-col gap-1">
                        <span class="font-mono text-xs uppercase tracking-[0.08em] text-muted">{b.tab}</span>
                        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <h2 id={`bench-${b.id}`} class="m-0 font-display text-[19px] font-semibold">{b.title}</h2>
                            <span class="text-[13px] text-muted">{b.unit}</span>
                        </div>
                    </div>
                    <BenchBars bench={b} />
                    <p class="m-0 mt-auto border-t border-line pt-3 text-[13px] text-muted">
                        {b.note.replace(/\s*bench\/\w+\.?$/, '')}{' '}
                        <a href={blob(b.source)} class="font-mono text-muted underline decoration-line-3 underline-offset-2 hover:text-cyan">{b.source}</a>
                    </p>
                </section>
            ))}
        </div>
    </div>
));
