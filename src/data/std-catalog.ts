/**
 * The standard library catalog's categories (design/Std.dc.html). The module
 * list itself comes from the std docs pages; this file only says which
 * category each page is in, its one-liner, and any status badge. A test
 * fails when a std page has no category, so a new module can't go missing.
 */
export interface Category {
    id: string;
    title: string;
    blurb: string;
    /** Std page paths (under /docs/std/, no slashes around) with their one-liners. */
    modules: [page: string, line: string, badge?: string][];
}

export const CATEGORIES: Category[] = [
    {
        id: 'web', title: 'Web & network', blurb: 'Servers, clients, sockets', modules: [
            ['http', 'serve: HTTP/1.1, HTTP/2 and HTTPS servers on every core.'],
            ['http_server', 'The HTTP/1.1 server written in Velt, on velt:net.'],
            ['fetch', 'The global fetch, Request, Response and Headers.'],
            ['websocket', 'WebSocket servers and clients.'],
            ['net', 'TCP and TLS: listen, connect, streams.'],
            ['udp', 'UDP sockets and datagrams.'],
            ['dns', 'Host name resolution through the system resolver.'],
            ['url', 'WHATWG URL, URLSearchParams and URI encoding.'],
        ],
    },
    {
        id: 'data', title: 'Data & storage', blurb: 'Databases and formats', modules: [
            ['postgres', 'PostgreSQL client with pools and transactions.'],
            ['redis', 'Redis client with pipelines, transactions and pub/sub.'],
            ['sqlite', 'Embedded SQLite with a synchronous, better-sqlite3-like API.', 'moving to a package'],
            ['db', 'Typed rows from any row source.'],
            ['json', 'JSON values. JSON.parse<T> is built in.'],
            ['csv', 'RFC 4180 parse and stringify.'],
        ],
    },
    {
        id: 'files', title: 'Files & processes', blurb: 'The machine you run on', modules: [
            ['fs', 'Async and sync file system API.'],
            ['fs_stream', 'Chunked and line readers, buffered writers.'],
            ['io', 'IoError, the error the I/O modules share.'],
            ['path', 'join, dirname, basename, normalize.'],
            ['process', 'argv, env, cwd, exit, stdout.'],
            ['child_process', 'exec, spawn and ChildProcess.'],
            ['os', 'platform, arch, availableParallelism, tmpdir.'],
            ['stdin', 'readLine, lines and readAll.'],
            ['cli', 'ArgParser: flags, options, positionals and help text.'],
            ['package', 'The type of the package manifest, package.vlt.'],
        ],
    },
    {
        id: 'conc', title: 'Concurrency', blurb: 'Tasks across every core', modules: [
            ['task', 'Cancellation, timeouts and taskScope.'],
            ['channel', 'Typed queues between tasks.'],
            ['timers', 'setTimeout, setInterval, delay and Ticker.'],
        ],
    },
    {
        id: 'enc', title: 'Encoding & security', blurb: 'Bytes in, bytes out', modules: [
            ['crypto', 'SHA-256, SHA-1, HMAC, randomBytes, timingSafeEqual.'],
            ['encoding', 'Base64, hex and UTF-8.'],
            ['hash', 'fnv1a64: a stable, non-cryptographic hash.'],
            ['uuid', 'uuidv4, uuidv7, parse and validate.'],
            ['random', 'Fast random numbers, not for secrets.'],
        ],
    },
    {
        id: 'text', title: 'Text, time & HTML', blurb: 'Strings people read', modules: [
            ['regex', 'RegExp on a linear-time engine.'],
            ['datetime', 'UTC-first DateTime and Duration.'],
            ['jsx', 'Server-side TSX: renderToString and streaming.'],
            ['html', 'escapeHtml in one pass.'],
        ],
    },
    {
        id: 'coll', title: 'Collections & memory', blurb: 'Beyond Array and Map', modules: [
            ['collections/set', 'Set with ES2025 set algebra.'],
            ['collections/deque', 'Ring-buffer double-ended queue.'],
            ['collections/priority_queue', 'Binary heap ordered by a comparator.'],
            ['collections/sorted_map', 'Key-ordered map with floorKey and range.'],
            ['arena', 'A typed memory pool (a region).'],
            ['bigint', 'Arbitrary-precision integers.'],
            ['simd', '128-bit vector types and lane-wise methods.'],
            ['math', 'gcd and other integer helpers.'],
        ],
    },
    {
        id: 'globals', title: 'Built-ins', blurb: 'In scope everywhere, no import', modules: [
            ['prelude', 'Strings, arrays, Map, Math, JSON, Error, promises.'],
            ['streams', 'ReadableStream and its reader and controller.'],
            ['typed_array', 'ArrayBuffer, DataView and the typed arrays.'],
            ['symbol', 'Unique values compared by identity.'],
        ],
    },
];
