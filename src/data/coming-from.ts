/**
 * "Coming from" boxes on the std API pages (design/Api.dc.html): the closest
 * Node, Deno and Bun APIs for a module, and one sentence on the difference.
 * Hand-written: keep each in step with the module's guide, which names the
 * same APIs in its text. Keyed by the API page's slug, the module path
 * (`net/http`, `process/child`).
 */
export interface ComingFrom {
    node: string;
    deno: string;
    bun: string;
    /** One sentence (Markdown) on how Velt's module differs or matches. */
    note: string;
}

export const COMING_FROM: Record<string, ComingFrom> = {
    'net/http': {
        node: 'fetch',
        deno: 'fetch',
        bun: 'fetch',
        note: 'The same WHATWG `fetch`, `Request`, `Response` and `Headers` globals, with no import; a failed request rejects with a typed `IoError` (`code` such as `ECONNREFUSED`, message `fetch failed: …`) instead of a `TypeError`.',
    },
    fs: {
        node: 'fs/promises',
        deno: 'Deno.readTextFile',
        bun: 'Bun.file',
        note: "Shaped like Node's `fs`: each operation has a promise form and a `*Sync` form, but `readFile` returns text and `readFileBytes` returns bytes.",
    },
    path: {
        node: 'path.posix',
        deno: '@std/path/posix',
        bun: 'path.posix',
        note: "Node's `path.posix`: the separator is `/` on every platform, Windows included.",
    },
    process: {
        node: 'process',
        deno: 'Deno.env, Deno.args',
        bun: 'process',
        note: 'The builtin `process` works as in Node, with no import; `velt/process` has the rest as functions: `argv()`, `envAll()`, `setEnv`, `exit`.',
    },
    crypto: {
        node: 'crypto.createHash',
        deno: 'crypto.subtle.digest',
        bun: 'Bun.CryptoHasher',
        note: 'One call per digest (`sha256Hex(data)`) instead of a hash object, and synchronous, unlike Web Crypto.',
    },
    'process/child': {
        node: 'child_process.spawn',
        deno: 'Deno.Command',
        bun: 'Bun.spawn',
        note: "Arguments are an array passed as-is, with no shell: `exec` is Node's `execFile`, and `execShell` is Node's `exec`.",
    },
};
