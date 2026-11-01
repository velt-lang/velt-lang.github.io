/**
 * The standard library catalog's categories (design/Std.dc.html). The module
 * list itself comes from the std docs pages; this file only says which
 * category each page is in, its one-liner, and any status badge. A test
 * fails when a std page has no category, so a new module can't go missing.
 * Pages follow the module path: velt/net/http is `net/http`
 * (src/pages/docs/std/net/http/index.mdx).
 */
export interface Category {
    id: string;
    title: string;
    blurb: string;
    /**
     * Std page paths under /docs/std/, no slashes around (`net/http` for
     * velt/net/http, `collections/deque` for one part of velt/collections),
     * with their one-liners.
     */
    modules: [page: string, line: string, badge?: string][];
}

export const CATEGORIES: Category[] = [
    {
        id: 'web', title: 'Web & network', blurb: 'Clients, sockets, wire formats', modules: [
            ['net/http', 'fetch, Request, Response and Headers: globals, as in Node.'],
            ['net/http/h2', "HTTP/2's frames and HPACK, for clients and servers."],
            ['net/websocket', 'WebSocket clients, and sockets over an upgraded connection.'],
            ['net', 'TCP and TLS: listen, connect, streams.'],
            ['net/udp', 'UDP sockets and datagrams.'],
            ['net/dns', 'Host name resolution through the system resolver.'],
            ['net/url', 'WHATWG URL, URLSearchParams and URI encoding.'],
        ],
    },
    {
        id: 'data', title: 'Data & formats', blurb: 'Rows, JSON, CSV', modules: [
            ['db', 'Typed rows from any row source, for database drivers.'],
            ['encoding/json', 'JSON values. JSON.parse<T> is built in.'],
            ['encoding/csv', 'RFC 4180 parse and stringify.'],
            ['encoding', 'Base64, hex and UTF-8.'],
            ['compress', 'gzip, zlib, DEFLATE and Brotli decompression.'],
        ],
    },
    {
        id: 'files', title: 'Files & processes', blurb: 'The machine you run on', modules: [
            ['fs', 'Async and sync file system API.'],
            ['fs/stream', 'Chunked and line readers, buffered writers.'],
            ['io', 'IoError, the error the I/O modules share.'],
            ['path', 'join, dirname, basename, normalize.'],
            ['process', 'argv, env, cwd, exit, stdout.'],
            ['process/stdin', 'readLine, lines and readAll.'],
            ['process/child', 'exec, spawn and ChildProcess.'],
            ['os', 'platform, arch, availableParallelism, tmpdir.'],
            ['cli', 'ArgParser: flags, options, positionals and help text.'],
        ],
    },
    {
        id: 'conc', title: 'Concurrency', blurb: 'Tasks across every core', modules: [
            ['task', 'Cancellation, timeouts and taskScope.'],
            ['sync', 'Atomic building blocks: Backoff and VersionLatch.'],
            ['sync/channel', 'Typed queues between tasks.'],
            ['sync/epoch', 'Epoch-based reclamation of shared values.'],
            ['time/timers', 'setTimeout, setInterval, delay and Ticker.'],
        ],
    },
    {
        id: 'enc', title: 'Security & randomness', blurb: 'Hashes, keys, ids', modules: [
            ['crypto', 'SHA-256, SHA-1, HMAC, randomBytes, timingSafeEqual.'],
            ['hash', 'fnv1a64: a stable, non-cryptographic hash.'],
            ['random', 'Fast random numbers, not for secrets.'],
            ['random/uuid', 'uuidv4, uuidv7, parse and validate.'],
        ],
    },
    {
        id: 'text', title: 'Text, time & HTML', blurb: 'Strings people read', modules: [
            ['text', 'Regular expressions, StringBuilder and HTML escaping.'],
            ['text/regex', 'RegExp on a linear-time engine.'],
            ['text/string_builder', 'Builds a string in one growing buffer.'],
            ['text/html', 'escapeHtml in one pass.'],
            ['time', 'DateTime, Duration, timers, delay and Ticker.'],
            ['time/datetime', 'UTC-first DateTime and Duration.'],
            ['jsx', 'Server-side TSX: renderToString and streaming.'],
            ['jsx/attrs', 'The attribute types of the HTML, SVG and MathML elements.'],
            ['jsx/jsx-runtime', 'The JSX provider module compiled TSX calls, and the generic one.'],
        ],
    },
    {
        id: 'coll', title: 'Collections & memory', blurb: 'Beyond Array and Map', modules: [
            ['collections', 'Deque, PriorityQueue, SortedMap, BTreeMap, ConcurrentMap, Set.'],
            ['collections/set', 'Set with ES2025 set algebra.'],
            ['collections/deque', 'Ring-buffer double-ended queue.'],
            ['collections/priority_queue', 'Binary heap ordered by a comparator.'],
            ['collections/sorted_map', 'Key-ordered map on two sorted arrays.'],
            ['collections/btree_map', 'Key-ordered B+tree map for large maps.'],
            ['collections/concurrent_map', 'A map many threads read and write at once.'],
            ['mem', 'needsDrop and Blank, for containers.'],
            ['mem/arena', 'A typed memory pool (a region).'],
            ['math', 'gcd, lcm, clamp and other integer helpers.'],
            ['math/bigint', 'Arbitrary-precision integers.'],
            ['simd', 'Vector types and lane-wise methods.'],
        ],
    },
    {
        id: 'tools', title: 'Tests & tooling', blurb: 'For libraries and tools', modules: [
            ['test', 'The runner velt test builds into test programs.'],
            ['test/http', 'expect matchers for a Response.'],
            ['package', 'The type of the package manifest, package.vlt.'],
            ['dev', 'The graceful stop under velt dev.'],
            ['generate', 'What source generators are written with.'],
            ['native', 'The Velt side of packages with native code.'],
            ['reflect', 'What an any holds at run time.'],
        ],
    },
    {
        id: 'globals', title: 'Built-ins', blurb: 'In scope everywhere, no import', modules: [
            ['prelude', 'Strings, arrays, Map, Math, JSON, Error, promises.'],
            ['io/streams', 'ReadableStream and its reader and controller.'],
            ['prelude/typed_array', 'ArrayBuffer, DataView and the typed arrays.'],
            ['prelude/symbol', 'Unique values compared by identity.'],
        ],
    },
];

/**
 * The packages the catalog lists after the std categories: servers and
 * database drivers, which are libraries rather than std. Name, one-liner, page.
 */
export const PACKAGES: [pkg: string, line: string, href: string][] = [
    ['http-server', 'An HTTP/1.1 and HTTP/2 server with web-standard Request and Response handlers.', '/docs/packages/http-server/'],
    ['sqlite', 'Embedded SQLite close to better-sqlite3, and an engine written in Velt.', '/docs/packages/sqlite/'],
    ['postgres', 'A PostgreSQL client close to node-postgres.', '/docs/packages/postgres/'],
    ['redis', 'A Redis client close to ioredis: pipelines, transactions, pub/sub.', '/docs/packages/redis/'],
];
