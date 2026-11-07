/**
 * The home page's "Run anywhere" section (design/Wasm.dc.html): the targets
 * one program builds for. Each has code cards (src/components/Hl.tsx markers),
 * a headline, facts and a docs link; prose marks inline code with backticks.
 * Facts follow /docs/tooling/webassembly/ and /docs/packages/cloudflare/.
 */
import type { Tone } from './beyond';

export interface TargetCard {
    file: string;
    code: string;
    /** The same source as on the native target (the "unchanged" badge). */
    same?: boolean;
}

export interface Target {
    id: string;
    name: string;
    /** Where it runs, on the tab. */
    runs: string;
    /** The target triple or flag, on the tab. */
    triple: string;
    tone: Tone;
    /** An SVG path on a 24×24 grid, stroked. */
    icon: string;
    isNew?: boolean;
    headline: string;
    body: string;
    facts: string[];
    chips?: string[];
    link: string;
    href: string;
    cards: TargetCard[];
}

/** An http-server program: it runs natively and, unchanged, as a Worker. */
const SERVER = `[[k:import]] { serve } [[k:from]] [[s:"http-server"]];

[[k:await]] [[f:serve]]({ port: [[n:8080]] }, (req: [[t:Request]]): [[t:Response]] => {
  [[k:const]] name = [[k:new]] [[t:URL]](req.url).searchParams.[[f:get]]([[s:"name"]]) ?? [[s:"world"]];
  [[k:return]] [[t:Response]].[[f:json]]({ hello: name });
});`;

export const TARGETS: Target[] = [
    {
        id: 'native',
        name: 'Native',
        runs: 'Linux, macOS, Windows',
        triple: 'x86_64 · arm64',
        tone: 'violet',
        icon: 'M7 7h10v10H7zM4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3',
        headline: 'One executable, every core.',
        body: 'The default: a native executable with nothing to install next to it, and a scheduler that spreads requests over every core.',
        facts: ['Cross-compile from any OS, static Linux builds with musl', 'No runtime, no `node_modules` on the server'],
        link: 'Platforms',
        href: '/docs/tooling/platforms/',
        cards: [
            { file: 'src/main.velt', code: SERVER },
            { file: 'terminal', code: '[[c:$]] velt build --release     [[c:# one native executable]]' },
        ],
    },
    {
        id: 'wasi',
        name: 'WebAssembly',
        runs: "wasmtime, wasmer, Node's WASI",
        triple: 'wasm32-wasip1',
        tone: 'green',
        icon: 'M4 4h16v16H4zM8 9l1.5 6L12 10l2.5 5L16 9',
        headline: 'A WASI module you can run anywhere.',
        body: 'The language and the standard library as on native targets, in one thread. `velt/fs` uses the WASI file system.',
        facts: ['`velt run --target wasm32-wasip1` builds it and runs it with wasmtime', 'Process arguments, environment and clocks work'],
        link: 'WebAssembly',
        href: '/docs/tooling/webassembly/',
        cards: [
            {
                file: 'fib.velt',
                code: `[[k:function]] [[f:fib]](n: [[t:i64]]): [[t:i64]] {
  [[k:return]] n < [[n:2]] ? n : [[f:fib]](n - [[n:1]]) + [[f:fib]](n - [[n:2]]);
}

console.[[f:log]]([[f:fib]]([[n:30]]));   [[c:// 832040]]`,
            },
            { file: 'terminal', code: '[[c:$]] velt run --target wasm32-wasip1 fib.velt\n832040' },
        ],
    },
    {
        id: 'browser',
        name: 'Browser and Node',
        runs: 'Browsers, Node, Deno',
        triple: 'wasm32-unknown-unknown',
        tone: 'cyan',
        icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
        isNew: true,
        headline: 'Call JavaScript, and let it call you.',
        body: "Declare the functions the host provides, async ones too, and call them like any other. The program runs in turns of the host's event loop, so it never blocks the page while it waits.",
        facts: [
            "`fetch` goes through the host's own `fetch`",
            "`sleep` and timers use the host's `setTimeout`, no busy-waiting",
            '`runVelt` runs the module; `loadVelt` lets you drive it',
        ],
        link: 'Host functions',
        href: '/docs/reference/host-functions/',
        cards: [
            {
                file: 'app.velt',
                code: `[[k:declare]] [[f:host]]([[s:"app"]]) [[k:function]] [[f:greet]](name: [[t:string]]): [[t:string]];

console.[[f:log]]([[f:greet]]([[s:"Ada"]]));`,
            },
            {
                file: 'app.js',
                code: `[[k:import]] { runVelt } [[k:from]] [[s:"./velt_web.mjs"]];

[[k:const]] code = [[k:await]] [[f:runVelt]]([[f:fetch]]([[s:"app.wasm"]]), {
  imports: { app: { greet: (name) => [[s:"hello, "]] + name } },
});`,
            },
        ],
    },
    {
        id: 'workers',
        name: 'Cloudflare Workers',
        runs: 'At the edge, with bindings',
        triple: '--host host-cloudflare',
        tone: 'peach',
        icon: 'M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9z',
        isNew: true,
        headline: 'The same server, deployed to the edge.',
        body: '`velt build --host` builds for a JavaScript platform described by a host package. `host-cloudflare` is the first: the output is a Worker, ready for wrangler.',
        facts: [
            "`http-server`'s `serve` runs with no change to the program",
            'A host package is an ordinary package: new platforms need no compiler change',
        ],
        chips: ['R2', 'D1', 'KV', 'Cache', 'Durable Object stubs'],
        link: 'The cloudflare package',
        href: '/docs/packages/cloudflare/',
        cards: [
            { file: 'src/main.velt', code: SERVER, same: true },
            {
                file: 'terminal',
                code: `[[c:# package.velt depends on http-server, cloudflare, host-cloudflare]]
[[c:$]] velt build --release --host host-cloudflare
[[c:$]] cd target/velt/app-workers && npx wrangler deploy`,
            },
        ],
    },
];

/** The target selected before any choice. */
export const DEFAULT_TARGET = 'workers';
