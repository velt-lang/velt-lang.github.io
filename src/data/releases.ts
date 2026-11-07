/**
 * Release notes for /whats-new/ (design: Release notes). Newest first.
 *
 * A release appears on the site once the docs describe it: its version is at
 * most DOCS_VERSION (src/lib/site.ts). Write the next release's notes here
 * ahead of time; the PR that documents the release bumps DOCS_VERSION and they
 * go live with it. `pnpm dev` shows every release, so you can preview them.
 *
 * Text fields are plain strings: `code` in backticks. Code samples use the
 * home page's markers (src/components/Hl.tsx). Every `href` is checked by the
 * build, so it must be a page that exists in the release's docs.
 */
import { DOCS_VERSION, RELEASES_URL } from '../lib/site';

/**
 * `pnpm dev` shows drafts and unreleased notes, and so does a preview build
 * (`VITE_SHOW_UNPUBLISHED=1 pnpm build --drafts`); a normal build doesn't. (import.meta.env.DEV is
 * true while the SSG renders pages, so the build is told apart by its mode.)
 */
const SHOW_UNPUBLISHED = import.meta.env.MODE !== 'production' || import.meta.env.VITE_SHOW_UNPUBLISHED === '1';

export type ChangeKind = 'new' | 'changed' | 'fixed' | 'breaking';

export interface Highlight {
    id: string;
    kind: ChangeKind;
    title: string;
    body: string;
    /** A second, quieter paragraph. */
    aside?: string;
    code?: { file: string; src: string };
    href?: string;
    link?: string;
    /** Who already builds on it: shown as a row of cards under the highlight. */
    uses?: { name: string; text: string; stat: string; href: string }[];
}

export interface ChangeGroup {
    title: string;
    items: { kind: ChangeKind; text: string }[];
}

export interface Release {
    version: string;
    /** ISO date (YYYY-MM-DD). */
    date: string;
    /** One line: what the release is about. */
    title: string;
    summary: string;
    /** Four short tiles at the top of the notes. */
    glance?: { title: string; text: string; href: string }[];
    highlights?: Highlight[];
    groups?: ChangeGroup[];
    /** Upgrading from the release before. */
    upgrade?: { title: string; text: string }[];
}

export const RELEASES: Release[] = [
    {
        version: '0.6.0',
        date: '2026-11-07',
        title: 'C libraries, JavaScript hosts, and more of TypeScript',
        summary:
            'Use any C library straight from Velt (the packages already do), deploy the same server to Cloudflare Workers, and write default exports, decorators and operators as you would in TypeScript. Velt files are now `.velt`.',
        glance: [
            { title: 'Any C library', text: 'One `declare c` away, and the packages use it.', href: '#call-c' },
            { title: '`.velt` files', text: 'A name Velt can have to itself on GitHub.', href: '#velt-files' },
            { title: 'Cloudflare Workers', text: 'One `serve(...)` program, native or on a JS host.', href: '#js-hosts' },
            { title: 'More TypeScript', text: 'Default exports, decorators, operators.', href: '#typescript' },
        ],
        highlights: [
            {
                id: 'call-c',
                kind: 'new',
                title: 'Any C library is one declaration away',
                body: 'Velt talks to C directly now. Declare a function from any library with a C header and call it: databases, compression, image and audio codecs, system APIs. No wrapper language, no build script, no Rust toolchain. `velt/ffi` covers pointers, buffers, C strings and out-parameters, and C structs and constants work too.',
                aside: 'Every call is checked against the library’s real C headers, and bundled C sources build with a pinned compiler on every platform. You stay in control: a dependency with native code only builds if your `package.velt` lists it in `allowNative`, and `velt check` lists every unsafe place for review.',
                code: {
                    file: 'abs.velt',
                    src: `[[k:declare]] [[f:c]]([[s:"c"]]) [[k:function]] [[f:llabs]](x: [[t:i64]]): [[t:i64]];

[[k:export function]] [[f:absolute]](x: [[t:i64]]): [[t:i64]] {
  [[c:// SAFETY: \`llabs\` takes any \`long long\` but LLONG_MIN.]]
  [[k:return unsafe]] { [[f:llabs]](x) };
}`,
                },
                href: '/docs/book/native-packages/',
                link: 'Native packages',
                uses: [
                    { name: 'sqlite', stat: '35 C functions', text: 'Calls the real SQLite engine through `declare c`, compiled from the bundled SQLite 3.53.2. No Rust crate any more.', href: '/docs/packages/sqlite/' },
                    { name: 'cloudflare', stat: '24 host functions', text: 'The same idea for JavaScript hosts: `declare host` binds R2, D1, KV, the cache and Durable Objects on Workers.', href: '/docs/packages/cloudflare/' },
                    { name: 'redis', stat: 'No native code', text: 'Written in plain Velt, so it needs no `allowNative` entry at all.', href: '/docs/packages/redis/' },
                ],
            },
            {
                id: 'velt-files',
                kind: 'breaking',
                title: 'Velt files are `.velt` now',
                body: 'Source files end in `.velt` and the manifest is `package.velt`. `.vlt` is in wide use on GitHub, mostly by Verilator configuration files, which stood in the way of GitHub ever recognising Velt. `.velt` is Velt’s alone, so it can get its own language entry and highlighting.',
                href: '/blog/velt-on-github/',
                link: 'Help get Velt on GitHub',
                aside: '`.vlt` sources still build for one more release, with a warning. `package.vlt` is no longer read: the error tells you to rename it.',
                code: {
                    file: 'my-app/',
                    src: `package.velt        [[c:// was package.vlt]]
velt.lock.json
src/
  main.velt         [[c:// was main.vlt]]
  routes.velt`,
                },
            },
            {
                id: 'js-hosts',
                kind: 'new',
                title: 'Run on JavaScript hosts and Cloudflare Workers',
                body: 'A WebAssembly program can call functions the JavaScript host provides, use the host’s `fetch`, and wait on timers without busy-waiting. `velt build --host` deploys the same `http-server` program to Cloudflare Workers, and the `cloudflare` package reaches R2, D1, KV, the cache and Durable Objects.',
                aside: 'Conditional imports (`#name`) let a package ship different files per target.',
                code: {
                    file: 'terminal',
                    src: `[[c:$]] velt add cloudflare host-cloudflare
[[c:$]] velt build --release --host host-cloudflare
[[c:$]] npx wrangler deploy        [[c:# in the output directory]]`,
                },
                href: '/docs/tooling/webassembly/',
                link: 'WebAssembly',
            },
            {
                id: 'typescript',
                kind: 'new',
                title: 'Default exports, decorators and operators',
                body: '`export default`, default imports and `export * as ns` work as in TypeScript. Typed decorators attach checked data to classes, fields and functions at compile time. And classes can define operators, so `a + b * 0.5` works on your own vector type.',
                aside: 'Decorators are read at compile time: nothing runs. TC39 run-time decorators are still not supported.',
                code: {
                    file: 'vec.velt',
                    src: `[[k:export default class]] [[t:Vec3]] {
  [[k:constructor]]([[k:public]] x: [[t:f64]], [[k:public]] y: [[t:f64]], [[k:public]] z: [[t:f64]]) {}

  [[[t:Symbol]].add](o: [[t:Vec3]]): [[t:Vec3]] {
    [[k:return new]] [[t:Vec3]]([[k:this]].x + o.x, [[k:this]].y + o.y, [[k:this]].z + o.z);
  }
}

[[k:const]] p = a + b;  [[c:// calls a[Symbol.add](b)]]`,
                },
                href: '/docs/reference/modules/',
                link: 'Modules',
            },
            {
                id: 'numbers',
                kind: 'new',
                title: 'Half-precision floats and faster numeric code',
                body: '`f16` and `bf16` store two bytes per value and compute as `number`, matching JavaScript’s `Float16Array`. `velt/half` loads and converts them in bulk, and SIMD gains `f16x8`, `bf16x8`, int8 dot products and fused multiply-add.',
                aside: 'Integers gain checked, saturating and wrapping arithmetic, and `rotateLeft`, `rotateRight` and `swapBytes`.',
                code: {
                    file: 'half.velt',
                    src: `[[k:const]] w: [[t:f16]] = [[n:0.1]];   [[c:// stores 0.0999755859375]]
[[k:const]] x = w * [[n:0.1]];      [[c:// a number, as in JS]]

[[k:let]] acc: [[t:f16]] = [[n:0]];
acc += [[n:0.1]];             [[c:// as Float16Array's e[0] += 0.1]]`,
                },
                href: '/docs/reference/types/',
                link: 'Types',
            },
            {
                id: 'written-in-velt',
                kind: 'new',
                title: 'Crypto, TLS, compression and a web framework, in Velt',
                body: '`velt/crypto` adds X25519, ChaCha20-Poly1305, AES-GCM (with hardware AES), HKDF and P-256. `velt/compress` can compress now: gzip, deflate and Brotli. And the new `web` package is a router with middleware, including `rateLimit`, `bodyLimit` and `compress()`.',
                aside: '`startTls` is a TLS 1.3 client that doesn’t check certificates yet, so it needs `verify: false` for now.',
                href: '/docs/std/crypto/',
                link: 'velt/crypto',
            },
        ],
        groups: [
            {
                title: 'Language',
                items: [
                    { kind: 'new', text: 'JSX uses TypeScript’s automatic runtime (`jsx`/`jsxs`).' },
                    { kind: 'new', text: 'lib.dom’s types (`HTMLElement`, `Event`, …) exist as types, for code shared with the browser.' },
                    { kind: 'new', text: 'Better inference for untyped arrows, module-level destructuring, `flatMap`, `reduce(f)` and `reduceRight`.' },
                    { kind: 'new', text: '`unique symbol` types, and `a[i]! += 1` as an assignment target.' },
                    { kind: 'changed', text: '`object | undefined` is no longer accepted where a plain `object` is expected.' },
                ],
            },
            {
                title: 'Standard library and packages',
                items: [
                    { kind: 'new', text: 'Cookies in `velt/net/http`: `getCookies`, `setCookie` and `deleteCookie`.' },
                    { kind: 'new', text: '`http-server`: `serveFile`, Range and conditional requests, and `req.signal` aborts when the client leaves.' },
                    { kind: 'new', text: '`catchPanic` in `velt/task`; a panicking handler gets a 500 and the server keeps serving.' },
                    { kind: 'new', text: '`openRead` byte ranges and `realpath` in `velt/fs`.' },
                    { kind: 'changed', text: '`sqlite` calls SQLite directly (bundled 3.53.2), and `redis` is plain Velt.' },
                ],
            },
            {
                title: 'Tooling',
                items: [
                    { kind: 'new', text: 'Lint profiles: `velt check --perf`, `--fix`, and `lint` settings in the manifest.' },
                    { kind: 'new', text: 'Debug builds use every core; `VELT_JOBS` sets how many.' },
                    { kind: 'new', text: 'Dependencies from a release archive (`url` + `sha256`), and `velt add <url>`.' },
                    { kind: 'changed', text: 'On macOS, release builds use the newest clang found; `velt doctor` says which.' },
                ],
            },
            {
                title: 'Fixes',
                items: [
                    { kind: 'fixed', text: '`u8[]` `write`, `set` and `copy` throw a catchable `RangeError` instead of panicking.' },
                    { kind: 'fixed', text: 'Calling an `any` that holds no function throws a catchable `TypeError`.' },
                    { kind: 'fixed', text: 'Timers under `Promise.all` and `yieldNow` resume in Node’s order.' },
                    { kind: 'fixed', text: '`console.log` in a source generator no longer breaks the build.' },
                ],
            },
        ],
        upgrade: [
            { title: 'Rename your files', text: '`*.vlt` to `*.velt`, and `package.vlt` to `package.velt`.' },
            { title: 'Allow native dependencies', text: 'List packages with native code in `allowNative` in `package.velt` (for example `allowNative: ["sqlite"]`). The error shows the line to add.' },
            { title: 'Run `velt install` once', text: 'The lock now records `allowNative`, and `velt install --locked` checks it.' },
            { title: 'Run `velt check`', text: 'A few patterns are new errors: a server handler that changes captured state (use `shared(...)`, a `Mutex` or an `Atomic`), and `object | undefined` where `object` is expected.' },
            { title: 'Re-test what changed behaviour', text: '`RangeError` from `u8[]` methods, `TypeError` from calling a non-function `any`, timer order, and a fixed `workerCount()`.' },
        ],
    },
    {
        version: '0.5.0',
        date: '2026-11-01',
        title: 'Programs that read like Node',
        summary:
            'Code runs from the top of the file, every standard module has a real import path, and the database drivers and web server are packages you add when you need them.',
        glance: [
            { title: 'No more main()', text: 'Top-level code runs first, as in Node.', href: '#top-level' },
            { title: 'std at import paths', text: 'Every module at `velt/<area>/<module>`.', href: '#std-paths' },
            { title: '4 packages', text: 'sqlite, postgres, redis and http-server.', href: '#packages' },
            { title: 'References, like JS', text: 'No more “use of moved value”.', href: '#references' },
        ],
        highlights: [
            {
                id: 'top-level',
                kind: 'new',
                title: 'Programs start at the top, like Node',
                body: 'You don’t need a `main()` any more. A program runs its top-level statements in order, and `await` works right there. Every example in the docs is written this way now.',
                code: {
                    file: 'src/main.vlt',
                    src: `[[k:import]] { serve } [[k:from]] [[s:"http-server"]];

[[k:const]] users = [[k:new]] [[t:Map]]<[[t:string]], [[t:string]]>();
users.[[f:set]]([[s:"42"]], [[s:"Ada"]]);

[[c:// No main(): this runs when the program starts.]]
[[k:await]] [[f:serve]]({ port: [[n:8080]] }, (req: [[t:Request]]): [[t:Response]] => {
  [[k:return]] [[t:Response]].[[f:json]]({ users: users.size });
});`,
                },
                href: '/docs/book/getting-started/',
                link: 'Getting started',
            },
            {
                id: 'std-paths',
                kind: 'changed',
                title: 'Every std module has an address',
                body: 'The standard library is organised by area: `velt/net/http`, `velt/text/regex`, `velt/math/bigint`. Each module has its own docs page at the same path, and old links still work.',
                aside: 'New modules: `velt/test`, `velt/reflect`, `velt/generate`, `velt/native` and `velt/dev`.',
                code: {
                    file: 'imports',
                    src: `[[k:import]] { readFile } [[k:from]] [[s:"velt/fs"]];
[[k:import]] { Deque } [[k:from]] [[s:"velt/collections"]];
[[k:import]] { fetch } [[k:from]] [[s:"velt/net/http"]];

[[c:// velt/net/http → /docs/std/net/http/]]`,
                },
                href: '/docs/std/',
                link: 'Browse the standard library',
            },
            {
                id: 'packages',
                kind: 'new',
                title: 'Databases and the web server are packages',
                body: 'The `sqlite`, `postgres` and `redis` drivers and `http-server` left the standard library. They are versioned packages now, so they can improve without waiting for a compiler release.',
                aside: 'There’s no public registry yet: packages come from git, a path, or a registry you run yourself.',
                code: {
                    file: 'package.vlt',
                    src: `[[k:import type]] { [[t:Package]] } [[k:from]] [[s:"velt/package"]];

[[k:export const]] pkg: [[t:Package]] = {
  name: [[s:"todo"]],
  version: [[s:"0.1.0"]],
  velt: [[s:"0.5"]],
  dependencies: {
    [[s:"http-server"]]: {
      git: [[s:"https://github.com/velt-lang/velt"]],
      tag: [[s:"v0.5.0"]],
      path: [[s:"packages/http-server"]],
    },
  },
};`,
                },
                href: '/docs/packages/',
                link: 'Read about packages',
            },
            {
                id: 'references',
                kind: 'changed',
                title: 'Objects are references, just like JavaScript',
                body: 'Objects, arrays, maps and closures are shared references. Assigning, passing or storing one gives you the same object, so code you bring over from TypeScript behaves the way you expect. `.clone()` makes a deep copy when you want one.',
                aside: 'Still no garbage collector: memory is freed the moment the last reference goes away.',
                code: {
                    file: 'shared.vlt',
                    src: `[[k:const]] a = [[[n:1]], [[n:2]], [[n:3]]];
[[k:const]] b = a;            [[c:// the same array, as in JS]]
b.[[f:push]]([[n:4]]);
console.[[f:log]](a.length);  [[c:// 4]]

[[k:const]] c = a.[[f:clone]]();    [[c:// an independent deep copy]]`,
                },
                href: '/docs/reference/memory/',
                link: 'The memory model',
            },
        ],
        groups: [
            {
                title: 'Tooling',
                items: [
                    { kind: 'new', text: 'A build cache shared by every project on your machine: nothing is compiled twice.' },
                    { kind: 'new', text: '`velt cache warm` compiles the standard library ahead of a first build.' },
                    { kind: 'new', text: '`velt test` caches its runs.' },
                    { kind: 'new', text: '`velt doc --format json` writes a package’s API as data.' },
                    { kind: 'new', text: 'Source generators with `velt/generate`.' },
                ],
            },
            {
                title: 'Fixes',
                items: [
                    { kind: 'fixed', text: 'Programs that use `fetch` no longer get false “runs on another thread” errors for their own stored callbacks.' },
                ],
            },
        ],
        upgrade: [
            { title: 'Update std imports', text: 'Use the `velt/…` paths. The standard library page lists every module.' },
            { title: 'Add the packages you use', text: 'sqlite, postgres, redis or http-server go in `package.vlt`.' },
            { title: 'Move `main()` to the top level', text: 'Optional, but it’s how the docs write programs now.' },
            { title: 'Run `velt check`', text: 'Old syntax is removed, not deprecated: the compiler says what to write instead.' },
        ],
    },
    { version: '0.4.0', date: '2026-10-25', title: '', summary: '' },
    { version: '0.3.0', date: '2026-10-20', title: '', summary: '' },
    { version: '0.2.0', date: '2026-10-10', title: 'Then 0.2.1 and 0.2.2', summary: '' },
    { version: '0.1.0', date: '2026-10-09', title: 'The first release', summary: '' },
];

/** -1, 0 or 1, comparing dotted versions numerically. */
export function compareVersions(a: string, b: string): number {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const d = (pa[i] ?? 0) - (pb[i] ?? 0);
        if (d) return Math.sign(d);
    }
    return 0;
}

/** Releases the docs describe (every release in dev). */
export function publishedReleases(): Release[] {
    return RELEASES.filter((r) => SHOW_UNPUBLISHED || compareVersions(r.version, DOCS_VERSION) <= 0);
}

/** The release the docs describe: the newest one at or below DOCS_VERSION (RELEASES is newest first). */
export function latestRelease(): Release {
    return RELEASES.find((r) => compareVersions(r.version, DOCS_VERSION) <= 0) ?? RELEASES[RELEASES.length - 1];
}

/** Notes written ahead of the docs: the next release, if there is one. */
export function nextRelease(): Release | undefined {
    return [...RELEASES].reverse().find((r) => compareVersions(r.version, DOCS_VERSION) > 0);
}

/** A release's notes on GitHub. */
export const releaseUrl = (v: string) => `${RELEASES_URL}/tag/v${v}`;
