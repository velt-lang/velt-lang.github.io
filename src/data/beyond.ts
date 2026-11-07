/**
 * The home page's "Beyond TypeScript" section (design/Beyond.dc.html): what
 * Velt adds to TypeScript, by area. Each area's `features` are the explorer's
 * pills (code, explanation, the TypeScript way, a docs link); `more` are
 * further items for the "Everything Velt adds" index. The section's counters
 * are computed from this data. Code uses the markers of src/components/Hl.tsx;
 * prose marks inline code with backticks.
 */

/** The release the "new" badges name. */
export const NEW_IN = '0.6';

/** A site color (src/styles/global.css); TONE maps it to classes. */
export type Tone = 'cyan' | 'orange' | 'violet' | 'pink' | 'yellow' | 'peach' | 'green';

/** Literal class names per tone, so Tailwind sees each one. */
export const TONE: Record<Tone, { text: string; dot: string; tint: string; border: string }> = {
    cyan: { text: 'text-cyan', dot: 'bg-cyan', tint: 'bg-cyan/8', border: 'border-cyan' },
    orange: { text: 'text-orange', dot: 'bg-orange', tint: 'bg-orange/8', border: 'border-orange' },
    violet: { text: 'text-violet', dot: 'bg-violet', tint: 'bg-violet/8', border: 'border-violet' },
    pink: { text: 'text-pink', dot: 'bg-pink', tint: 'bg-pink/8', border: 'border-pink' },
    yellow: { text: 'text-yellow', dot: 'bg-yellow', tint: 'bg-yellow/8', border: 'border-yellow' },
    peach: { text: 'text-peach', dot: 'bg-peach', tint: 'bg-peach/8', border: 'border-peach' },
    green: { text: 'text-green', dot: 'bg-green', tint: 'bg-green/8', border: 'border-green' },
};

/** Text with `inline code` marked by backticks, split into its parts. */
export function ticks(text: string): { code: boolean; text: string }[] {
    return text.split('`').map((t, i) => ({ code: i % 2 === 1, text: t })).filter((p) => p.text !== '');
}

export interface IndexItem {
    name: string;
    href: string;
    /** New in the release the docs describe (the "0.6" badge). */
    isNew?: boolean;
}

export interface Feature extends IndexItem {
    /** The code card's title. */
    file: string;
    /** Hand-highlighted code (src/components/Hl.tsx markers). */
    code: string;
    /** What it is, in a sentence or two. */
    what: string;
    /** How TypeScript does it, or doesn't. */
    ts: string;
    /** The docs link's label. */
    link: string;
}

export interface Area {
    id: string;
    title: string;
    tone: Tone;
    /** An SVG path on a 24×24 grid, stroked. */
    icon: string;
    pitch: string;
    features: Feature[];
    more: IndexItem[];
}

export const AREAS: Area[] = [
    {
        id: 'types',
        title: 'Numbers and types',
        tone: 'cyan',
        icon: 'M4 7h16M4 12h16M4 17h10',
        pitch: 'Real number types, and your own operators.',
        features: [
            {
                name: 'Integer types',
                file: 'hash.velt',
                link: 'Numbers',
                href: '/docs/reference/types/#numbers',
                what: '`i8` to `i64`, `u8` to `u64`, `f32` and `f64`, with suffixes like `255u8`. A `u32` wraps as in C or Rust, and `number` becomes a machine integer wherever that gives the same result.',
                ts: 'Every number is a 64-bit float. Integer maths needs `BigInt` or bit tricks like `| 0`.',
                code: `[[c:// Real integer types: u32 wraps as in C or Rust.]]
[[k:function]] [[f:fnv1a]](text: [[t:string]]): [[t:u32]] {
  [[k:let]] hash: [[t:u32]] = [[n:2166136261]];
  [[k:for]] ([[k:let]] i = [[n:0]]; i < text.length; i++) {
    hash = (hash ^ (text.[[f:charCodeAt]](i) [[k:as]] [[t:u32]])) * [[n:16777619]];
  }
  [[k:return]] hash;
}`,
            },
            {
                name: 'Operators',
                isNew: true,
                file: 'vec.velt',
                link: 'Operator methods',
                href: '/docs/reference/classes/#operator-methods',
                what: 'Classes and extensions define operators with well-known symbols: `a + b` calls `a[Symbol.add](b)`. Indexers like `m[i, j]` work too. SIMD vectors, `BigInt` and `Duration` have them built in.',
                ts: 'No operator overloading: `a.add(b.mul(0.5))`.',
                code: `[[k:class]] [[t:Vec3]] {
  [[k:constructor]]([[k:public]] x: [[t:f64]], [[k:public]] y: [[t:f64]], [[k:public]] z: [[t:f64]]) {}
  [[[t:Symbol]].add](o: [[t:Vec3]]): [[t:Vec3]] { [[k:return new]] [[t:Vec3]]([[k:this]].x + o.x, [[k:this]].y + o.y, [[k:this]].z + o.z); }
  [[[t:Symbol]].mul](k: [[t:f64]]): [[t:Vec3]] { [[k:return new]] [[t:Vec3]]([[k:this]].x * k, [[k:this]].y * k, [[k:this]].z * k); }
}

[[k:const]] p = a + b * [[n:0.5]]; [[c:// a, b: Vec3]]`,
            },
            {
                name: 'Half floats',
                isNew: true,
                file: 'half.velt',
                link: 'f16 and bf16',
                href: '/docs/reference/types/#f16-and-bf16',
                what: "`f16` and `bf16` store two bytes per value and compute as `number`, exactly like JavaScript's `Float16Array`. `velt/half` converts them in bulk for ML weights.",
                ts: '`Float16Array`, with every read widened to a double.',
                code: `[[k:const]] w: [[t:f16]] = [[n:0.1]];   [[c:// stores 0.0999755859375]]
[[k:const]] x = w * [[n:0.1]];      [[c:// a number: 0.00999755859375]]

[[k:let]] acc: [[t:f16]] = [[n:0]];
acc += [[n:0.1]];             [[c:// as Float16Array e[0] += 0.1]]`,
            },
            {
                name: 'extend any type',
                file: 'extend.velt',
                link: 'extend',
                href: '/docs/reference/classes/#extend',
                what: 'Add methods to `string`, numbers, arrays, functions and your own unions, at no run-time cost.',
                ts: 'Patching `String.prototype`, or a helper function.',
                code: `[[k:extend]] [[t:string]] {
  [[f:shout]](): [[t:string]] { [[k:return this]].[[f:toUpperCase]]() + [[s:"!"]]; }
}

[[k:extend]]<[[t:R]]> (() => [[t:R]]) {  [[c:// every function without parameters]]
  [[f:twice]](): [[t:R]][] { [[k:return]] [[[k:this]](), [[k:this]]()]; }
}

console.[[f:log]]([[s:"hi"]].[[f:shout]]()); [[c:// HI!]]`,
            },
        ],
        more: [
            { name: 'SIMD vectors (u8x16, f32x4, f16x8…)', href: '/docs/std/simd/' },
            { name: 'Checked, saturating, wrapping maths', href: '/docs/std/prelude/#numbers', isNew: true },
        ],
    },
    {
        id: 'errors',
        title: 'Errors',
        tone: 'orange',
        icon: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
        pitch: "Errors are part of the type, and JavaScript's traps are compile errors.",
        features: [
            {
                name: 'Typed errors',
                file: 'users.velt',
                link: 'Errors',
                href: '/docs/reference/errors/',
                what: 'A function says what it throws, and `catch (e)` knows the type. Errors are plain return values: no unwinding, and no cost when nothing is thrown.',
                ts: '`catch (e)` is `unknown`, and nothing says what a function can throw.',
                code: `[[k:class]] [[t:NotFound]] [[k:extends]] [[t:Error]] {}

[[c:// Errors are part of the type.]]
[[k:function]] [[f:findUser]](id: [[t:string]]): [[t:string]] [[k:throws]] [[t:NotFound]] {
  [[k:if]] (id !== [[s:"42"]]) [[k:throw new]] [[t:NotFound]]([[s:"no user"]]);
  [[k:return]] [[s:"Ada"]];
}`,
            },
            {
                name: 'Typed promises',
                file: 'async.velt',
                link: 'Errors in async code',
                href: '/docs/reference/async/#errors',
                what: 'A promise carries its error type too: `Promise<T, E>`. Forget an `await` and the compiler tells you, before the error is dropped.',
                ts: '`Promise<T>` only; rejections are `any`.',
                code: `[[k:async function]] [[f:load]](id: [[t:string]]): [[t:Promise]]<[[t:string]], [[t:NotFound]]> {
  [[k:return]] [[f:findUser]](id);
}

[[k:try]] {
  [[k:await]] [[f:load]]([[s:"7"]]);
} [[k:catch]] (e) {   [[c:// e: NotFound]]
  console.[[f:log]](e.message);
}`,
            },
            {
                name: 'No silent coercion',
                file: 'traps.velt',
                link: 'For TypeScript developers',
                href: '/docs/book/ts-developers/#equality',
                what: '`1 == "1"` is a compile error, `x!` is checked at run time, and `as` never lies: every message says what to write instead.',
                ts: 'Loose equality and unchecked assertions compile fine.',
                code: `[[k:const]] n = [[n:1]];
[[k:if]] (n == [[s:"1"]]) {}   [[c:// a compile error, not true]]

[[k:const]] m = [[k:new]] [[t:Map]]<[[t:string]], [[t:i64]]>();
m.[[f:get]]([[s:"a"]])!;          [[c:// checked at run time, not trusted]]`,
            },
        ],
        more: [{ name: 'catchPanic for servers that keep serving', href: '/docs/std/task/#caught-panics', isNew: true }],
    },
    {
        id: 'tasks',
        title: 'Concurrency',
        tone: 'violet',
        icon: 'M9 3h6v4H9zM4 17h6v4H4zM14 17h6v4h-6zM12 7v5M7 17v-3h10v3',
        pitch: 'Every core, not one event loop. Data races are compile errors.',
        features: [
            {
                name: 'spawn and channels',
                file: 'workers.velt',
                link: 'Using every core',
                href: '/docs/book/async/#using-every-core-with-spawn',
                what: '`spawn` runs a task on another core. Typed channels pass work between them, and the runtime spreads tasks over every core.',
                ts: 'One thread. Worker threads talk through messages you serialise yourself.',
                code: `[[k:const]] jobs = [[f:channel]]<[[t:string]]>([[n:8]]);
[[k:const]] results = [[f:channel]]<[[t:string]]>();
[[k:const]] workers = [[[f:spawn]]([[f:worker]]([[n:1]], jobs, results)), [[f:spawn]]([[f:worker]]([[n:2]], jobs, results))];

[[k:for]] ([[k:const]] job [[k:of]] [[[s:"resize"]], [[s:"upload"]], [[s:"notify"]]]) {
  [[k:await]] jobs.[[f:send]](job);
}
jobs.[[f:close]]();
[[k:await]] [[t:Promise]].[[f:all]](workers);`,
            },
            {
                name: 'taskScope',
                file: 'scope.velt',
                link: 'Task scopes',
                href: '/docs/std/task/#task-scopes',
                what: 'Tasks started in a scope finish with it, and cancelling the scope cancels them all.',
                ts: '`Promise.all`, and `AbortController` wired by hand.',
                code: `[[k:const]] total = [[k:await]] [[f:taskScope]]([[k:async]] (scope: [[t:TaskScope]]<[[t:AbortError]]>): [[t:Promise]]<[[t:i64]]> [[k:throws]] [[t:AbortError]] => {
  [[k:const]] a = scope.[[f:spawn]]([[f:fetchPart]]([[n:3]], scope.signal));
  [[k:const]] b = scope.[[f:spawn]]([[f:fetchPart]]([[n:5]], scope.signal));
  [[k:return]] ([[k:await]] a) + ([[k:await]] b);
});`,
            },
            {
                name: 'shared, Mutex, Atomic',
                file: 'counter.velt',
                link: 'Sharing state between tasks',
                href: '/docs/book/async/#sharing-state-between-tasks',
                what: 'Data used by more than one task is `shared(…)`, a `Mutex`, an `RwLock` or an `Atomic`. Anything else that two tasks could change is a compile error.',
                ts: '`SharedArrayBuffer` and `Atomics` on raw bytes.',
                code: `[[k:const]] hits = [[f:shared]]([[k:new]] [[t:Mutex]]([[k:new]] [[t:Map]]<[[t:string]], [[t:i64]]>()));

[[k:await]] [[f:serve]]({ port: [[n:8080]] }, (req: [[t:Request]]): [[t:Response]] => {
  [[c:// every core runs this handler: the Mutex makes it safe]]
  hits.[[f:with]]((m) => m.[[f:set]](req.url, (m.[[f:get]](req.url) ?? [[n:0]]) + [[n:1]]));
  [[k:return new]] [[t:Response]]([[s:"ok"]]);
});`,
            },
        ],
        more: [{ name: 'RwLock and Atomic', href: '/docs/reference/async/#thread-safety' }],
    },
    {
        id: 'memory',
        title: 'Memory',
        tone: 'pink',
        icon: 'M3 12h4l3-8 4 16 3-8h4',
        pitch: 'No garbage collector, and nothing ever pauses.',
        features: [
            {
                name: 'Deterministic cleanup',
                file: 'temp.velt',
                link: 'Resource cleanup',
                href: '/docs/reference/memory/#resource-cleanup-using-and-symboldispose',
                what: 'Memory is freed the moment the last reference goes. `[Symbol.dispose]()` and `using` run at a point you can read off the page.',
                ts: 'A GC frees memory later, and finalizers may never run.',
                code: `[[k:class]] [[t:TempFile]] {
  [[k:constructor]]([[k:public]] path: [[t:string]]) {}
  [[[t:Symbol]].dispose]() { console.[[f:log]]([[s:"removing"]], [[k:this]].path); }
}

{
  [[k:const]] t = [[k:new]] [[t:TempFile]]([[s:"a.tmp"]]);
}   [[c:// prints "removing a.tmp" here]]`,
            },
            {
                name: 'References, like JS',
                file: 'shared.velt',
                link: 'Values and references',
                href: '/docs/reference/memory/#values-and-references',
                what: 'Objects, arrays, maps and closures are shared references, as in JavaScript. `.clone()` makes a deep copy when you want one.',
                ts: 'The same, but with a GC behind it.',
                code: `[[k:const]] a = [[[n:1]], [[n:2]], [[n:3]]];
[[k:const]] b = a;            [[c:// the same array]]
b.[[f:push]]([[n:4]]);
console.[[f:log]](a.length);  [[c:// 4]]

[[k:const]] c = a.[[f:clone]]();    [[c:// an independent deep copy]]`,
            },
            {
                name: 'Weak references',
                file: 'cache.velt',
                link: 'WeakMap, WeakSet and WeakRef',
                href: '/docs/std/prelude/#weakmap-weakset-and-weakref',
                what: '`WeakRef`, `WeakMap` and `WeakSet` let go of their targets the moment the last strong reference goes.',
                ts: 'They let go whenever the GC next runs.',
                code: `[[k:const]] sizes = [[k:new]] [[t:WeakMap]]<[[t:Node]], [[t:number]]>();

[[k:function]] [[f:sizeOf]](n: [[t:Node]]): [[t:number]] {
  [[k:return]] sizes.[[f:get]](n) ?? [[f:measure]](n);
}`,
            },
        ],
        more: [{ name: 'using and await using', href: '/docs/reference/memory/#resource-cleanup-using-and-symboldispose' }],
    },
    {
        id: 'compile',
        title: 'Compile time',
        tone: 'yellow',
        icon: 'M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z',
        pitch: 'Types that exist at run time, and code that runs before it.',
        features: [
            {
                name: 'Typed JSON',
                file: 'user.velt',
                link: 'velt/encoding/json',
                href: '/docs/std/encoding/json/#parsing-into-types',
                what: '`JSON.parse<User>(text)` checks the text against your type and builds the object in one pass.',
                ts: '`JSON.parse` returns `any`; a validation library checks the shape.',
                code: `[[k:interface]] [[t:User]] {
  id: [[t:string]];
  name: [[t:string]];
}

[[k:const]] user = [[t:JSON]].[[f:parse]]<[[t:User]]>(text); [[c:// checked against User]]
console.[[f:log]](user.name);`,
            },
            {
                name: 'Decorators',
                isNew: true,
                file: 'model.velt',
                link: 'Decorators',
                href: '/docs/reference/decorators/',
                what: 'Typed decorators attach checked data to classes, fields and functions. They are read at compile time, so nothing runs and nothing costs.',
                ts: 'Run-time decorators that execute code when the class loads.',
                code: `[[k:export declare decorator function]] [[f:name]](key: [[t:string]]): [[t:FieldDecorator]];
[[k:export declare decorator function]] [[f:tag]](t: [[t:string]]): [[t:Repeatable]]<[[t:TypeDecorator]] | [[t:FunctionDecorator]]>;

@[[f:tag]]([[s:"a"]])
@[[f:tag]]([[s:"b"]])
[[k:export class]] [[t:User]] {
  @[[f:name]]([[s:"id"]]) id: [[t:i64]] = [[n:1]];
}`,
            },
            {
                name: 'Source generators',
                file: 'gen.velt',
                link: 'Source generators',
                href: '/docs/reference/source-generators/',
                what: 'A generic function can have its body written at build time, for each type the program uses it with. Errors show in the editor like any other.',
                ts: 'A separate codegen step in the build.',
                code: `[[c:// show/index.velt]]
[[k:export declare]] [[f:generated]]([[s:"./gen"]]) [[k:function]] [[f:show]]<[[t:T]]>(value: [[t:T]]): [[t:string]];

[[c:// show/gen.velt: runs during the build, once per type T]]
[[k:import]] { [[t:InstanceRequest]], [[t:Output]] } [[k:from]] [[s:"velt/generate"]];

[[k:export function]] [[f:show]](req: [[t:InstanceRequest]], out: [[t:Output]]): [[t:void]] {
  [[k:const]] t = req.model.[[f:type]](req.args[[[n:0]]]); [[c:// the type T]]
  [[c:// ... writes the body with out.line(...)]]
}`,
            },
        ],
        more: [
            { name: 'velt/reflect', href: '/docs/std/reflect/' },
            { name: 'Conditional imports (#name)', href: '/docs/reference/modules/#conditional-imports', isNew: true },
        ],
    },
    {
        id: 'native',
        title: 'Native and C',
        tone: 'peach',
        icon: 'M7 7h10v10H7zM4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3',
        pitch: 'Call C directly, and still know what your dependencies are allowed to do.',
        features: [
            {
                name: 'declare c',
                isNew: true,
                file: 'abs.velt',
                link: 'C functions and unsafe code',
                href: '/docs/reference/c-interop/',
                what: "Declare a C function and call it. Calls are checked against the library's C headers, and C sources build with a pinned compiler.",
                ts: 'Node-API addons in C++, and a native build step.',
                code: `[[k:declare]] [[f:c]]([[s:"c"]]) [[k:function]] [[f:llabs]](x: [[t:i64]]): [[t:i64]];

[[k:export function]] [[f:absolute]](x: [[t:i64]]): [[t:i64]] {
  [[c:// SAFETY: llabs takes any long long but LLONG_MIN.]]
  [[k:return unsafe]] { [[f:llabs]](x) };
}`,
            },
            {
                name: 'allowNative',
                isNew: true,
                file: 'package.velt',
                link: 'allowNative',
                href: '/docs/tooling/manifest/#allownative',
                what: 'A dependency with native code builds only if your package lists it. `unsafe` needs a `SAFETY` comment, and `velt check` lists every unsafe place for review.',
                ts: "`npm install` runs any package's install scripts.",
                code: `[[k:export const]] pkg: [[t:Package]] = {
  name: [[s:"app"]],
  version: [[s:"0.1.0"]],
  velt: [[s:"0.6"]],
  allowNative: [[[s:"sqlite"]]],   [[c:// nothing else may run C]]
};`,
            },
            {
                name: 'One executable',
                file: 'terminal',
                link: 'Cross-compiling',
                href: '/docs/tooling/platforms/#cross-compiling',
                what: '`velt build --release` writes one native executable. Nothing to install on the server, no `node_modules`, and cross-compiling from any OS.',
                ts: 'Ship Node and `node_modules`, or bundle a runtime.',
                code: `[[c:$]] velt build --release

[[c:# a fully static Linux executable, from any OS]]
[[c:$]] velt target add aarch64-unknown-linux-musl
[[c:$]] velt build --release --target aarch64-unknown-linux-musl`,
            },
        ],
        more: [
            { name: 'velt/ffi pointers and buffers', href: '/docs/std/ffi/', isNew: true },
            { name: 'C structs and constants', href: '/docs/reference/c-interop/#declare-c-struct', isNew: true },
        ],
    },
    {
        id: 'targets',
        title: 'Run anywhere',
        tone: 'green',
        icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
        pitch: 'Native on every desktop OS, WebAssembly, and JavaScript hosts.',
        features: [
            {
                name: 'JavaScript hosts',
                isNew: true,
                file: 'app.velt + app.js',
                link: 'Host functions',
                href: '/docs/reference/host-functions/',
                what: "A WebAssembly build calls functions the JavaScript host provides, async ones too, and uses the host's `fetch`.",
                ts: 'It is the host.',
                code: `[[k:declare]] [[f:host]]([[s:"app"]]) [[k:function]] [[f:greet]](name: [[t:string]]): [[t:string]];

[[c:// app.js, the host:]]
[[k:const]] code = [[k:await]] [[f:runVelt]]([[f:fetch]]([[s:"app.wasm"]]), {
  imports: { app: { greet: (name) => [[s:"hello, "]] + name } },
});`,
            },
            {
                name: 'Cloudflare Workers',
                isNew: true,
                file: 'terminal',
                link: 'The cloudflare package',
                href: '/docs/packages/cloudflare/',
                what: 'The same `http-server` program deploys to Cloudflare Workers, with a `cloudflare` package for R2, D1, KV, the cache and Durable Object stubs.',
                ts: 'A Workers-specific framework and its own APIs.',
                code: `[[c:# package.velt depends on http-server, cloudflare, host-cloudflare]]
[[c:$]] velt build --release --host host-cloudflare
[[c:$]] cd target/velt/app-workers && npx wrangler deploy`,
            },
            {
                name: 'Desktop and server',
                file: 'targets',
                link: 'Supported platforms',
                href: '/docs/tooling/platforms/#supported-platforms',
                what: 'Linux and macOS on x86_64 and arm64, Windows on x64, and fully static Linux executables with musl.',
                ts: 'Wherever Node runs.',
                code: `[[t:x86_64-unknown-linux-gnu]]     [[t:aarch64-unknown-linux-gnu]]
[[t:x86_64-unknown-linux-musl]]    [[t:aarch64-unknown-linux-musl]]
[[t:aarch64-apple-darwin]]         [[t:x86_64-apple-darwin]]
[[t:x86_64-pc-windows-msvc]]       [[t:wasm32-unknown-unknown]]`,
            },
        ],
        more: [{ name: 'Hot swap with velt dev', href: '/docs/tooling/dev/' }],
    },
];

/** Every item of the index: an area's features, then its further items. */
export const indexItems = (a: Area): IndexItem[] => [...a.features, ...a.more];

/** The header's counters. */
export function beyondCounts(areas: Area[] = AREAS) {
    const all = areas.flatMap(indexItems);
    return { areas: areas.length, features: all.length, isNew: all.filter((i) => i.isNew).length };
}
