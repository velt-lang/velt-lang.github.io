/**
 * The roadmap page (/roadmap/) and the blog's "what's happening" strip.
 *
 * Every item is backed by the docs: `shipped` items by the page that documents
 * them, `planned` items by a **Planned** note (a decided design that is not
 * built yet: src/pages/docs/reference/index.mdx), `gap` items by a "Not
 * supported yet" / "Not yet available" note. When a release ships a planned
 * item, move it to `shipped` in the PR that documents it, with `since`.
 */

export type RoadmapStatus = 'shipped' | 'planned' | 'gap';

export type RoadmapArea = 'language' | 'std' | 'packages' | 'tooling' | 'platforms';

export interface RoadmapItem {
    title: string;
    detail: string;
    area: RoadmapArea;
    status: RoadmapStatus;
    /** The release it shipped in (shipped items). */
    since?: string;
    /** The docs page that documents it, or its Planned / Not yet note. */
    href: string;
}

export const AREAS: Record<RoadmapArea, string> = {
    language: 'Language',
    std: 'Standard library',
    packages: 'Packages',
    tooling: 'Tooling',
    platforms: 'Platforms',
};

export const ROADMAP: RoadmapItem[] = [
    // Planned: decided designs, not built yet.
    {
        title: '`weak` fields',
        detail: 'Back-pointers that don’t keep their target alive (`parent: weak Node | null`), and a compile-time warning when a type can form a reference cycle. Still without a collector.',
        area: 'language', status: 'planned', href: '/docs/book/memory/',
    },
    {
        title: 'Extensions scoped to their modules',
        detail: 'An `extend` block visible only in the modules that import it, and `static readonly` constants in extensions.',
        area: 'language', status: 'planned', href: '/docs/reference/modules/',
    },
    {
        title: '`JSON.parse` into `any`',
        detail: 'Parse JSON of unknown shape into `any`, then convert it to an interface type when you know what it is.',
        area: 'language', status: 'planned', href: '/docs/reference/types/',
    },
    {
        title: 'Disposable network handles',
        detail: 'Sockets and listeners in `velt/net` become classes you can hold with `using`, so they close at the end of a block.',
        area: 'std', status: 'planned', href: '/docs/std/net/',
    },
    {
        title: 'Streamed uploads in `fetch`',
        detail: 'Send a request body as a stream instead of building it in memory first.',
        area: 'std', status: 'planned', href: '/docs/std/net/http/',
    },

    // Gaps: known, not designed yet.
    {
        title: 'A public package registry',
        detail: 'Today packages come from git, a path, or a registry you run yourself (`velt registry serve`).',
        area: 'packages', status: 'gap', href: '/docs/tooling/packages/',
    },
    {
        title: 'Windows on Arm',
        detail: 'Executables for Windows arm64 are built but haven’t been run on the hardware yet.',
        area: 'platforms', status: 'gap', href: '/docs/tooling/platforms/',
    },
    {
        title: 'Web streams: writing and piping',
        detail: '`WritableStream`, `TransformStream`, `pipeTo` and `pipeThrough`. `ReadableStream` works today.',
        area: 'std', status: 'gap', href: '/docs/std/io/streams/',
    },
    {
        title: 'Packaged support for more editors',
        detail: 'VS Code has an extension. Any editor that can start `velt lsp` works today, without packaging.',
        area: 'tooling', status: 'gap', href: '/docs/tooling/editors/',
    },

    // Shipped (newest first).
    {
        title: 'Any C library through `declare c`',
        detail: 'Declare C functions, constants and structs and call them from `unsafe` code, checked against the C headers. `sqlite` uses it; `allowNative` decides which packages may.',
        area: 'packages', status: 'shipped', since: '0.6.0', href: '/docs/reference/c-interop/',
    },
    {
        title: 'JavaScript hosts and Cloudflare Workers',
        detail: '`declare host` functions, `fetch` through the host, and `velt build --host host-cloudflare` for the same `http-server` program.',
        area: 'platforms', status: 'shipped', since: '0.6.0', href: '/docs/reference/host-functions/',
    },
    {
        title: 'Operators, decorators and default exports',
        detail: 'Operator methods on your own types, typed compile-time decorators, and `export default` as in TypeScript.',
        area: 'language', status: 'shipped', since: '0.6.0', href: '/docs/reference/decorators/',
    },
    {
        title: '`f16` and `bf16`',
        detail: 'Two-byte floats that compute as `number`, like `Float16Array`, with `velt/half` and 16-bit SIMD.',
        area: 'language', status: 'shipped', since: '0.6.0', href: '/docs/reference/types/#f16-and-bf16',
    },
    {
        title: 'Crypto, TLS and compression in Velt',
        detail: 'X25519, ChaCha20-Poly1305, AES-GCM and P-256 in `velt/crypto`, `startTls`, and gzip, deflate and Brotli encoders.',
        area: 'std', status: 'shipped', since: '0.6.0', href: '/docs/std/crypto/',
    },
    {
        title: 'Objects are references, like JavaScript',
        detail: 'Objects, arrays, maps and closures are shared references. `.clone()` makes a deep copy. No more “use of moved value”.',
        area: 'language', status: 'shipped', since: '0.5.0', href: '/docs/reference/memory/',
    },
    {
        title: 'A standard library at import paths',
        detail: 'Every module at `velt/<area>/<module>`, each with its own page.',
        area: 'std', status: 'shipped', since: '0.5.0', href: '/docs/std/',
    },
    {
        title: 'Packages for databases and the web server',
        detail: '`sqlite`, `postgres`, `redis` and `http-server`, from git, a path or a registry, with git and workspace dependencies.',
        area: 'packages', status: 'shipped', since: '0.5.0', href: '/docs/packages/',
    },
    {
        title: 'Programs start at the top',
        detail: 'Top-level statements run as the program, with top-level `await`, as in Node. No `main()` needed.',
        area: 'language', status: 'shipped', since: '0.5.0', href: '/docs/book/getting-started/',
    },
    {
        title: 'A build cache shared by every project',
        detail: 'Nothing is compiled twice; `velt cache warm` compiles the standard library ahead of time.',
        area: 'tooling', status: 'shipped', since: '0.5.0', href: '/docs/tooling/cli/',
    },
    {
        title: 'TSX for server-side rendering',
        detail: 'JSX in `.tsx` files, rendered by the `velt/jsx` provider.',
        area: 'language', status: 'shipped', href: '/docs/reference/tsx/',
    },
    {
        title: '`WeakRef`, `WeakMap` and `WeakSet`',
        detail: 'They work as in JavaScript and let go of their targets the moment the last strong reference goes.',
        area: 'language', status: 'shipped', href: '/docs/std/prelude/',
    },
    {
        title: '`new Promise(...)` and logical assignment',
        detail: '`new Promise`, `Promise.withResolvers()`, and `??=`, `||=`, `&&=`, as in JavaScript.',
        area: 'language', status: 'shipped', href: '/docs/book/ts-developers/',
    },
    {
        title: 'Hot swap with `velt dev`',
        detail: 'Changed functions are swapped into the running program, which keeps its memory, connections and tasks.',
        area: 'tooling', status: 'shipped', href: '/docs/tooling/dev/',
    },
    {
        title: 'Linux, macOS, Windows and WebAssembly',
        detail: 'Native executables for each, and cross-compiling from any of them.',
        area: 'platforms', status: 'shipped', href: '/docs/tooling/platforms/',
    },
];
