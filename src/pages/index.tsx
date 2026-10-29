/** The home page (design/Main.dc.html). Islands: InstallBox, CopyPromptButton, BenchmarkPanel. */
import { component } from 'sigx';
import { ArrowRight, BanIcon, BoltIcon, BoxIcon, CheckIcon, ChipIcon, PulseIcon, ReloadIcon, SparkIcon, WarnIcon } from '../components/Icons';
import { CodeCard, hl } from '../components/Hl';
import { InstallBox } from '../islands/InstallBox';
import { CopyPromptButton } from '../islands/CopyButton';
import { BenchmarkPanel } from '../islands/BenchmarkPanel';
import { HEADLINE_STATS } from '../data/benchmarks';
import { BEYOND_VLT, SERVER_TS, TERMINAL } from '../data/samples';
import { LLM_PROMPT, LLMS_URL, VSCODE_URL } from '../lib/site';

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
        body: () => <>A multi-threaded scheduler from the start. Handlers spread over all cores, <C>spawn</C> puts work on another — and data races are compile errors.</>,
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

const BEYOND = [
    { title: () => <>Typed errors</>, body: () => <><C>catch (e)</C> knows what its <C>try</C> can throw. Plain return values: no unwinding, no cost when nothing is thrown.</> },
    { title: () => <>Integer and float types</>, body: () => <><C>i8</C>–<C>i64</C>, <C>u8</C>–<C>u64</C>, <C>f32</C>, with suffixes like <C>255u8</C>.</> },
    { title: () => <><code class="font-mono">extend</code> any type</>, body: () => <>Add methods to <C>string</C>, numbers and arrays at no run-time cost.</> },
    { title: () => <>Tasks and shared state</>, body: () => <><C>spawn</C>, typed channels, <C>shared(x)</C>, <C>Mutex</C> and <C>taskScope</C>.</> },
    { title: () => <>Typed JSON</>, body: () => <><C>{'JSON.parse<User>(text)'}</C> checks the shape and builds the object in one pass.</> },
];

const btnPrimary = 'inline-flex min-h-[52px] items-center gap-2.5 rounded-xl bg-accent px-6 font-semibold text-white hover:text-white hover:brightness-110';
const btnGhost = 'inline-flex min-h-[52px] items-center rounded-xl border border-line-3 px-6 font-semibold text-fg';

export default component(() => () => (
    <>
        {/* Hero */}
        <section id="top" class="mx-auto flex max-w-[1248px] flex-wrap items-center gap-14 px-6 pb-[72px] pt-[88px]">
            <div class="flex min-w-0 flex-[1_1_460px] flex-col gap-7">
                <div class="inline-flex items-center gap-2.5 self-start rounded-full border border-line-3 px-3.5 py-1.5 text-[13px] text-fg-3">
                    <span class="size-2 rounded-full bg-green" />
                    Linux · macOS · Windows · WebAssembly
                </div>
                <h1 class="m-0 font-display text-[clamp(44px,6vw,76px)] font-bold leading-[1.02] tracking-[-0.035em]">
                    TypeScript’s good parts, <span class="brand-text">compiled native.</span>
                </h1>
                <p class="m-0 max-w-[560px] text-xl leading-[1.55] text-fg-3">
                    Velt runs typed, modern TypeScript — your <code class="c text-[0.85em]">.ts</code> and{' '}
                    <code class="c text-[0.85em]">.tsx</code> files — compiled through LLVM to one native executable. No
                    interpreter, no garbage collector, every core in use. Not JavaScript's dynamic tricks:{' '}
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
                    <span class="ml-3 font-mono text-[13px] text-fg-3">server.ts</span>
                    <span class="ml-auto font-mono text-xs text-muted">velt run server.ts</span>
                </div>
                <pre class="overflow-x-auto px-[22px] py-5 font-mono text-[13.5px] leading-[1.7] text-fg">{hl(SERVER_TS)}</pre>
                <div class="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-[22px] py-3.5 text-[13px] text-fg-3">
                    <span>A complete HTTP server.</span>
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
                    <C>velt run app.ts</C> runs your file, and <C>.ts</C> and <C>.vlt</C> import each other, so a project
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
                        <C>eval</C>, prototypes, decorators, <C>with</C>, <C>delete</C>, <C>1 == "1"</C> — the dynamic parts a native
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
                    The HTTP server, the Redis, Postgres and SQLite drivers are written in Velt and measured against Rust, Go, Bun
                    and Node. Every number links to its method and raw data.
                </p>
                <a href="https://github.com/velt-lang/velt/tree/main/bench" class="inline-flex min-h-11 items-center gap-2 self-start font-medium text-cyan hover:text-cyan-hover">
                    All benchmarks and methods
                    <ArrowRight size={16} stroke={2} />
                </a>
            </div>
            <BenchmarkPanel client:visible />
        </section>

        {/* Beyond TypeScript */}
        <section id="beyond" class="scroll-mt-6 border-y border-line bg-bg-raised">
            <div class="mx-auto flex max-w-[1248px] flex-wrap-reverse items-center gap-14 px-6 py-28">
                <div class="min-w-0 flex-[1.2_1_520px]">
                    <CodeCard title="beyond.vlt" code={BEYOND_VLT} />
                </div>
                <div class="flex min-w-0 flex-[1_1_380px] flex-col gap-6">
                    <div class="flex flex-col gap-3.5">
                        <span class={`${eyebrow} text-violet`}>Beyond TypeScript</span>
                        <h2 class={`${h2} text-[clamp(30px,3.4vw,44px)] leading-[1.1]`}>What a compiler makes possible.</h2>
                        <p class="m-0 text-fg-3">TypeScript compiles to JavaScript, so it can't have these. Velt can.</p>
                    </div>
                    <ul class="m-0 flex list-none flex-col gap-[18px] p-0">
                        {BEYOND.map((b, i) => (
                            <li key={i} class="flex flex-col gap-0.5">
                                <strong class="font-semibold">{b.title()}</strong>
                                <span class="text-[15px] text-fg-3">{b.body()}</span>
                            </li>
                        ))}
                    </ul>
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
                        <h3 class="m-0 font-display text-[19px] font-semibold">Any Rust crate, a few lines away</h3>
                        <p class="m-0 text-[15px] text-fg-3">
                            Until a library exists in Velt, a package can include the Rust crate that does it and export functions
                            with <C>#[export]</C>. Its users never need Rust.
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
), { name: 'HomePage' });
