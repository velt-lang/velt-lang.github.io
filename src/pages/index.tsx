/**
 * The home page (design/Main.dc.html, Beyond.dc.html, Wasm.dc.html). Islands:
 * InstallBox, CopyPromptButton, BenchmarkPanel, BeyondExplorer, TargetSwitcher.
 */
import { component } from 'sigx';
import { ArrowRight, BanIcon, BoltIcon, BoxIcon, CheckIcon, ChipIcon, PulseIcon, ReloadIcon, SparkIcon, WarnIcon } from '../components/Icons';
import { CodeCard, hl } from '../components/Hl';
import { InstallBox } from '../islands/InstallBox';
import { CopyPromptButton } from '../islands/CopyButton';
import { BenchmarkPanel } from '../islands/BenchmarkPanel';
import { BeyondExplorer, newBadge, pathIcon } from '../islands/BeyondExplorer';
import { TargetSwitcher } from '../islands/TargetSwitcher';
import { HEADLINE_STATS } from '../data/benchmarks';
import { AREAS, NEW_IN, TONE, beyondCounts, indexItems } from '../data/beyond';
import { DEFAULT_TARGET, TARGETS } from '../data/targets';
import { SERVER_TS, TERMINAL } from '../data/samples';
import { LLM_PROMPT, LLMS_URL, VSCODE_URL } from '../lib/site';
import { EXPECTATIONS_POST, post } from '../lib/blog';

export const meta = {
    title: 'Velt — TypeScript, compiled native',
    description:
        "Velt compiles TypeScript's good parts to one native executable through LLVM: no interpreter, no garbage collector, every core in use. It runs your .ts files and leaves JavaScript's dynamic tricks out.",
    layout: 'home',
    autoJsonLd: false,
};

/** Inline code in marketing copy. */
const C = component(({ slots }) => () => <code class="c">{slots.default?.()}</code>, { name: 'C' });

const eyebrow = 'font-mono text-[13px] uppercase tracking-[0.08em]';
const h2 = 'm-0 font-display font-bold tracking-[-0.03em]';

const FEATURES = [
    {
        title: 'Native speed',
        icon: <BoltIcon size={28} color="#5FE1F7" />,
        body: () => <>Generics compile to specialized code. <C>number</C> becomes a machine integer wherever that provably gives the same result. No boxing, no GC.</>,
    },
    {
        title: 'Every core, not one',
        icon: <ChipIcon size={28} color="#A592FF" />,
        body: () => <>A multi-threaded scheduler. Handlers spread over all cores, <C>spawn</C> puts work on another — and data races are compile errors.</>,
    },
    {
        title: "Memory you don't think about",
        icon: <PulseIcon size={28} color="#F07BF5" />,
        body: () => <>Objects are references, as in JavaScript. Memory is freed the moment the last reference goes — no GC pauses, and <C>using</C> runs at a known point.</>,
    },
    {
        title: 'One file to ship',
        icon: <BoxIcon size={28} color="#FF9F5A" />,
        body: () => <><C>velt build --release</C> writes a native executable. Nothing to install on the server, no <C>node_modules</C>. Cross-compile from any OS.</>,
    },
    {
        title: "Fixes JavaScript's traps",
        icon: <WarnIcon size={28} color="#FFC93C" />,
        body: () => <><C>1 == "1"</C> is a compile error. A forgotten <C>await</C> is caught before it drops an error. Every message says what to write instead.</>,
    },
    {
        title: 'A 60 ms edit loop',
        icon: <ReloadIcon size={28} color="#3DDC97" />,
        body: () => <><C>velt dev</C> swaps changed functions into the running program, keeping its memory, open connections and running tasks.</>,
    },
];

const btnPrimary = 'inline-flex min-h-[52px] items-center gap-2.5 rounded-xl bg-accent px-6 font-semibold text-white hover:text-white hover:brightness-110';
const btnGhost = 'inline-flex min-h-[52px] items-center rounded-xl border border-line-3 px-6 font-semibold text-fg';

export default component(() => () => {
    const expectations = post(EXPECTATIONS_POST);
    const counts = beyondCounts();
    return (
    <>
        {/* Hero */}
        <section id="top" class="mx-auto flex max-w-[1248px] flex-wrap items-center gap-14 px-6 pb-[72px] pt-[88px]">
            <div class="flex min-w-0 flex-[1_1_460px] flex-col gap-7">
                <div class="flex flex-wrap items-center gap-2.5">
                    {expectations && (
                        <a href={expectations.href} class="inline-flex min-h-9 items-center gap-2.5 rounded-full border border-[#2E2A5C] bg-[#12101F] py-1 pl-1.5 pr-3 text-[13px] text-fg hover:text-fg">
                            <span class="rounded-full bg-yellow px-2.5 py-0.5 text-xs font-semibold text-bg">Pre-1.0</span>
                            What works today, and what doesn't yet
                            <ArrowRight size={14} stroke={2} />
                        </a>
                    )}
                    <span class="inline-flex min-h-9 items-center gap-2.5 rounded-full border border-line-3 px-3.5 text-[13px] text-fg-3">
                        <span class="size-2 rounded-full bg-green" />
                        Linux · macOS · Windows · WebAssembly
                    </span>
                </div>
                <h1 class="m-0 font-display text-[clamp(44px,6vw,76px)] font-bold leading-[1.02] tracking-[-0.035em]">
                    Familiar as TypeScript. <span class="brand-text">Fast as Rust.</span>
                </h1>
                <p class="m-0 max-w-[560px] text-xl leading-[1.55] text-fg-3">
                    Velt compiles typed, modern TypeScript (classes, interfaces, generics, <code class="c text-[0.85em]">async</code>/
                    <code class="c text-[0.85em]">await</code>) through LLVM to one native executable. No interpreter, no garbage
                    collector, every core in use. It isn't a drop-in for every <code class="c text-[0.85em]">.ts</code> file yet:{' '}
                    <a href="#compat" class="text-cyan underline decoration-cyan/35 underline-offset-[3px] hover:text-cyan-hover hover:decoration-current">see what's in</a>.
                </p>
                <div class="flex flex-wrap gap-3">
                    <a href="/docs/book/getting-started/" class={btnPrimary}>
                        Get started
                        <ArrowRight stroke={2} />
                    </a>
                    <a href="/docs/book/tour/" class={btnGhost}>Take the tour</a>
                </div>
                <div id="install" class="scroll-mt-6">
                    <InstallBox client:load />
                </div>
                <div id="llm" class="flex max-w-[560px] flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-xl border border-dashed border-[#34304F] bg-[#0E0D18] px-3.5 py-3">
                    <SparkIcon size={20} color="#A592FF" />
                    <span class="flex-[1_1_220px] text-sm text-fg-2">
                        Starting with an AI assistant? Point it at{' '}
                        <a href={LLMS_URL} class="font-mono text-[13px] text-fg underline decoration-[#4A4470] underline-offset-2">
                            {LLMS_URL.replace('https://', '')}
                        </a>
                    </span>
                    <CopyPromptButton client:visible text={LLM_PROMPT} />
                </div>
            </div>

            <div class="min-w-0 flex-[1_1_500px] overflow-hidden rounded-2xl border border-line-2 bg-surface shadow-[0_40px_120px_-40px_rgba(110,91,255,0.45)]">
                <div class="flex items-center gap-2 border-b border-line px-4 py-3">
                    <span class="size-[11px] rounded-full bg-line-3" />
                    <span class="size-[11px] rounded-full bg-line-3" />
                    <span class="size-[11px] rounded-full bg-line-3" />
                    <span class="ml-3 font-mono text-[13px] text-fg-3">src/main.velt</span>
                    <span class="ml-auto font-mono text-xs text-muted">velt run</span>
                </div>
                <pre class="overflow-x-auto px-[22px] py-5 font-mono text-[13.5px] leading-[1.7] text-fg">{hl(SERVER_TS)}</pre>
                <div class="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-[22px] py-3.5 text-[13px] text-fg-3">
                    <span>A complete HTTP server, on the <a href="/docs/packages/http-server/" class="text-fg-3 underline decoration-line-3 underline-offset-2 hover:text-cyan">http-server</a> package.</span>
                    <span class="text-cyan">Every core answers requests.</span>
                </div>
            </div>
        </section>

        {/* Stats */}
        <section id="perf" aria-label="Headline numbers" class="border-y border-line bg-bg-raised">
            <div class="mx-auto grid max-w-[1248px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-8 px-6 py-10">
                {HEADLINE_STATS.map((s) => (
                    <div key={s.value} class="flex flex-col gap-1">
                        <span class={`font-display text-[44px] font-bold leading-[1.1] tracking-[-0.03em] ${s.color}`}>{s.value}</span>
                        <span class="text-sm text-fg-3">{s.label}</span>
                    </div>
                ))}
            </div>
        </section>

        {/* Why */}
        <section id="why" class="mx-auto flex max-w-[1248px] scroll-mt-6 flex-col gap-12 px-6 pb-10 pt-28">
            <div class="flex max-w-[720px] flex-col gap-3.5">
                <span class={`${eyebrow} text-cyan`}>Why Velt</span>
                <h2 class={`${h2} text-[clamp(34px,4vw,52px)] leading-[1.08]`}>If you write TypeScript, you already write Velt.</h2>
                <p class="m-0 text-lg text-fg-3">
                    <C>velt run app.ts</C> runs your file, and <C>.ts</C> and <C>.velt</C> import each other, so a project
                    moves over one file at a time. Valid TypeScript behaves as it does in Node; where JavaScript is a trap,
                    the compiler stops and says what to write instead.
                </p>
            </div>
            <div id="compat" class="flex scroll-mt-6 flex-wrap gap-5">
                <div class="flex min-w-0 flex-[1.4_1_420px] flex-col gap-3 rounded-2xl border border-[#1D3A2E] bg-[#0C1512] p-6">
                    <span class="flex items-center gap-2 text-sm font-semibold text-green">
                        <CheckIcon stroke={2.2} />
                        Works as in TypeScript
                    </span>
                    <p class="m-0 text-[15px] text-fg-2">
                        Classes, interfaces, generics, unions and narrowing, discriminated unions, closures, <C>async</C>/<C>await</C>,
                        template literals, destructuring, spread, <C>?.</C> and <C>??</C>, ES modules, <C>try</C>/<C>catch</C>,{' '}
                        <C>using</C>, TSX.
                    </p>
                </div>
                <div class="flex min-w-0 flex-[1_1_320px] flex-col gap-3 rounded-2xl border border-[#3F2A1A] bg-[#17110C] p-6">
                    <span class="flex items-center gap-2 text-sm font-semibold text-orange">
                        <BanIcon stroke={2.2} />
                        Left out on purpose
                    </span>
                    <p class="m-0 text-[15px] text-fg-2">
                        <C>eval</C>, prototypes, run-time decorators, <C>with</C>, <C>delete</C>, <C>1 == "1"</C> — the dynamic parts a native
                        compiler can't make fast or safe.
                    </p>
                    <a href="/docs/book/ts-developers/" class="inline-flex min-h-11 items-center self-start text-[15px] font-medium text-peach hover:text-orange">
                        Every difference, on one page →
                    </a>
                </div>
            </div>
            <div class="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-5">
                {FEATURES.map((f) => (
                    <article key={f.title} class="flex flex-col gap-3 rounded-2xl border border-card-line bg-card p-7">
                        {f.icon}
                        <h3 class="m-0 font-display text-[21px] font-semibold">{f.title}</h3>
                        <p class="m-0 text-[15px] text-fg-3">{f.body()}</p>
                    </article>
                ))}
            </div>
        </section>

        {/* Benchmarks */}
        <section id="benchmarks" class="mx-auto flex max-w-[1248px] scroll-mt-6 flex-wrap items-start gap-12 px-6 py-[72px]">
            <div class="flex min-w-0 flex-[1_1_320px] flex-col gap-3.5">
                <span class={`${eyebrow} text-orange`}>Benchmarks</span>
                <h2 class={`${h2} text-[clamp(30px,3.4vw,44px)] leading-[1.1]`}>The whole stack is fast, not just the loop.</h2>
                <p class="m-0 text-fg-3">
                    Web servers and the Redis, Postgres and SQLite clients, measured against Rust, Go, Bun and Node. Every
                    number links to its method and raw data.
                </p>
                <a href="/benchmarks/" class="inline-flex min-h-11 items-center gap-2 self-start font-medium text-cyan hover:text-cyan-hover">
                    All benchmarks and methods
                    <ArrowRight size={16} stroke={2} />
                </a>
            </div>
            <BenchmarkPanel client:visible />
        </section>

        {/* Beyond TypeScript */}
        <section id="beyond" class="scroll-mt-6 border-y border-line bg-bg-raised">
            <div class="mx-auto flex max-w-[1248px] flex-col gap-14 px-6 py-28">
                <div class="flex flex-wrap items-end justify-between gap-8">
                    <div class="flex min-w-0 flex-[1_1_560px] flex-col gap-4">
                        <span class={`${eyebrow} text-violet`}>Beyond TypeScript</span>
                        <h2 class={`${h2} text-[clamp(34px,4.4vw,56px)] leading-[1.04]`}>
                            TypeScript's syntax. <span class="brand-text">Then everything a compiler adds.</span>
                        </h2>
                        <p class="m-0 max-w-[640px] text-lg text-fg-3">
                            TypeScript compiles to JavaScript, so it stops where JavaScript stops. Velt compiles to native code, so
                            it keeps going: real number types, typed errors, every core, C libraries, and code that runs at compile
                            time.
                        </p>
                    </div>
                    <dl class="m-0 flex flex-wrap gap-3">
                        {[
                            { label: 'Areas', value: counts.areas, cls: 'border-line-2 bg-surface', dt: 'text-muted' },
                            { label: 'Features', value: counts.features, cls: 'border-line-2 bg-surface', dt: 'text-muted' },
                            { label: `New in ${NEW_IN}`, value: counts.isNew, cls: 'border-[#1D3A2E] bg-[#0C1512]', dt: 'text-green' },
                        ].map((c) => (
                            <div key={c.label} class={`flex min-w-[104px] flex-1 flex-col gap-0.5 rounded-[14px] border px-4 py-4 sm:min-w-[120px] sm:flex-none sm:px-5 ${c.cls}`}>
                                <dt class={`text-[13px] ${c.dt}`}>{c.label}</dt>
                                <dd class="m-0 font-display text-[32px] font-bold leading-[1.1]">{c.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <BeyondExplorer client:visible areas={AREAS} />

                <div class="flex flex-col gap-6">
                    <div class="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 class="m-0 font-display text-[26px] font-bold tracking-[-0.02em]">Everything Velt adds</h3>
                        <a href="/docs/book/ts-developers/" class="inline-flex min-h-11 items-center font-medium text-cyan hover:text-cyan-hover">
                            Velt for TypeScript developers →
                        </a>
                    </div>
                    <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
                        {AREAS.map((a) => (
                            <div key={a.id} class="flex flex-col gap-3 rounded-2xl border border-card-line bg-card p-[22px]">
                                <h4 class={`m-0 inline-flex items-center gap-2.5 text-base font-semibold ${TONE[a.tone].text}`}>
                                    {pathIcon(a.icon)}
                                    {a.title}
                                </h4>
                                <ul class="m-0 flex list-none flex-col p-0 text-sm">
                                    {indexItems(a).map((it) => (
                                        <li key={it.name}>
                                            <a href={it.href} class="flex items-baseline gap-2 py-1 text-fg-3 hover:text-cyan">
                                                <span class="flex-auto">{it.name}</span>
                                                {it.isNew && newBadge(true)}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Run anywhere */}
        <section
            id="anywhere"
            class="scroll-mt-6"
            style={{
                background:
                    'radial-gradient(70% 90% at 15% 0%, rgba(61,220,151,0.10), rgba(8,8,13,0) 60%), radial-gradient(60% 80% at 100% 100%, rgba(95,225,247,0.10), rgba(8,8,13,0) 60%), var(--color-bg)',
            }}
        >
            <div class="mx-auto flex max-w-[1248px] flex-col gap-12 px-6 py-28">
                <div class="flex max-w-[760px] flex-col gap-4">
                    <span class={`${eyebrow} text-green`}>Run anywhere</span>
                    <h2 class={`${h2} text-[clamp(34px,4.4vw,56px)] leading-[1.04]`}>
                        One program.{' '}
                        <span class="brand-text" style={{ backgroundImage: 'linear-gradient(90deg, var(--color-green), #22d8f5 55%, #8b6cff)' }}>
                            Native, in the browser, or at the edge.
                        </span>
                    </h2>
                    <p class="m-0 text-lg text-fg-3">
                        The same Velt code compiles to a native executable, to WebAssembly for WASI runtimes and JavaScript hosts,
                        or straight to a Cloudflare Worker. A server written with <C>http-server</C>'s <C>serve</C> runs natively
                        and on Workers without a change.
                    </p>
                </div>

                <TargetSwitcher client:visible targets={TARGETS} initial={DEFAULT_TARGET} />

                <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
                    <div class="flex flex-col gap-2 rounded-[18px] border border-card-line bg-card p-6">
                        <h3 class="m-0 text-base font-semibold">Try it in the playground</h3>
                        <p class="m-0 text-sm text-muted">
                            <C>velt playground</C> opens an editor with examples. Your machine compiles, your browser runs the module
                            in a Web Worker.
                        </p>
                        <a href="/docs/tooling/webassembly/#the-playground" class="mt-auto inline-flex min-h-11 items-center self-start text-sm font-medium text-cyan hover:text-cyan-hover">
                            The playground →
                        </a>
                    </div>
                    <div class="flex flex-col gap-2 rounded-[18px] border border-card-line bg-card p-6">
                        <h3 class="m-0 text-base font-semibold">The whole language, one thread</h3>
                        <p class="m-0 text-sm text-muted">
                            <C>async</C>/<C>await</C>, <C>spawn</C> and <C>Promise.all</C> run on one thread in WebAssembly: tasks
                            take turns at each <C>await</C>, and on a JavaScript host the program hands control back while it waits.
                        </p>
                        <a href="/docs/tooling/webassembly/#what-works" class="mt-auto inline-flex min-h-11 items-center self-start text-sm font-medium text-cyan hover:text-cyan-hover">
                            What works →
                        </a>
                    </div>
                    <div class="flex flex-col gap-2 rounded-[18px] border border-dashed border-[#3F2A1A] bg-[#17110C] p-6">
                        <h3 class="m-0 text-base font-semibold text-peach">For now: build from a checkout</h3>
                        <p class="m-0 text-sm text-fg-3">
                            Release toolchains don't include the WebAssembly runtime yet. WebAssembly builds need a checkout of the
                            Velt repository and the Rust toolchain.
                        </p>
                        <a href="/docs/tooling/webassembly/#setup" class="mt-auto inline-flex min-h-11 items-center self-start text-sm font-medium text-peach hover:text-orange">
                            Setup →
                        </a>
                    </div>
                </div>
            </div>
        </section>

        {/* Tooling */}
        <section id="tooling" class="mx-auto flex max-w-[1248px] scroll-mt-6 flex-col gap-12 px-6 py-28">
            <div class="flex max-w-[720px] flex-col gap-3.5">
                <span class={`${eyebrow} text-green`}>Everything in one tool</span>
                <h2 class={`${h2} text-[clamp(30px,3.4vw,44px)] leading-[1.1]`}>Build, run, test, format, package. One binary.</h2>
            </div>
            <div id="tour" class="flex flex-wrap gap-5">
                <div class="flex min-w-0 flex-[1.3_1_480px] flex-col">
                    <CodeCard title="Terminal" code={TERMINAL} size="md" lineHeight={1.9} />
                </div>
                <div class="grid min-w-0 flex-[1_1_340px] grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
                    <article class="flex flex-col gap-2.5 rounded-2xl border border-card-line bg-card p-6">
                        <h3 class="m-0 font-display text-[19px] font-semibold">Editor and debugger</h3>
                        <p class="m-0 text-[15px] text-fg-3">
                            The VS Code extension: errors as you type, completion, rename, quick fixes, and F5 debugging with no
                            setup. Other editors use <C>velt lsp</C>.
                        </p>
                        <a href={VSCODE_URL} class="text-[15px] font-medium text-cyan hover:text-cyan-hover">Get the extension →</a>
                    </article>
                    <article class="flex flex-col gap-2.5 rounded-2xl border border-card-line bg-card p-6">
                        <h3 class="m-0 font-display text-[19px] font-semibold">Any C library, one declaration away</h3>
                        <p class="m-0 text-[15px] text-fg-3">
                            Until a library exists in Velt, a package calls the C library that does it with <C>declare c</C>,
                            checked against its headers. <C>sqlite</C> does. Its users need no C compiler.
                        </p>
                        <a href="/docs/book/native-packages/" class="text-[15px] font-medium text-cyan hover:text-cyan-hover">Native packages →</a>
                    </article>
                </div>
            </div>
        </section>

        {/* CTA */}
        <section class="mx-auto max-w-[1248px] px-6 pb-28">
            <div class="relative flex flex-wrap items-center justify-between gap-8 overflow-hidden rounded-3xl border border-line-3 p-[clamp(28px,5vw,56px)]" style={{ background: 'radial-gradient(120% 140% at 100% 0%, rgba(110,91,255,0.28), rgba(8,8,13,0) 60%), #0D0D14' }}>
                <div class="relative z-10 flex max-w-[620px] flex-col gap-3">
                    <h2 class={`${h2} text-[clamp(30px,3.6vw,48px)] leading-[1.08]`}>Try it on a TypeScript file you have.</h2>
                    <p class="m-0 text-lg text-fg-3">
                        <C>velt run app.ts</C> compiles and runs it, or <C>velt new hello</C> to start fresh. If something isn't
                        supported, the error says what to write instead.
                    </p>
                </div>
                <div class="relative z-10 flex flex-wrap gap-3">
                    <a href="/docs/" class={btnPrimary}>Read the docs</a>
                    <a href="#install" class={btnGhost}>Install</a>
                </div>
                <img src="/velt-logo-520.png" alt="" aria-hidden="true" width="260" height="208" loading="lazy" class="pointer-events-none absolute -bottom-[70px] -right-10 w-[260px] opacity-[0.12]" />
            </div>
        </section>
    </>
    );
}, { name: 'HomePage' });
