/**
 * Old URLs that keep working: `redirects` in ssg.config.ts turns each entry
 * into a static page at the old path (meta refresh, canonical to the new
 * URL, noindex) and a line in `_redirects`. A test checks that every target
 * is a page and that no old path is one.
 *
 * The std pages moved when std took its `velt/<area>/<module>` layout (the
 * page path follows the import path), and the database drivers and the HTTP
 * server left std for packages.
 */

/** Old std guide page → new page, both as /docs/std/<slug>/ slugs or absolute paths. */
const STD_GUIDES: Record<string, string> = {
    arena: 'mem/arena',
    bigint: 'math/bigint',
    channel: 'sync/channel',
    child_process: 'process/child',
    csv: 'encoding/csv',
    datetime: 'time/datetime',
    dns: 'net/dns',
    fetch: 'net/http',
    fs_stream: 'fs/stream',
    html: 'text/html',
    // velt:http was the server, but most links to it were about Request and Response.
    http: 'net/http',
    http_server: '/docs/packages/http-server/',
    json: 'encoding/json',
    postgres: '/docs/packages/postgres/',
    redis: '/docs/packages/redis/',
    regex: 'text/regex',
    sqlite: '/docs/packages/sqlite/',
    stdin: 'process/stdin',
    streams: 'io/streams',
    symbol: 'prelude/symbol',
    timers: 'time/timers',
    typed_array: 'prelude/typed_array',
    udp: 'net/udp',
    url: 'net/url',
    uuid: 'random/uuid',
    websocket: 'net/websocket',
};

/**
 * Old API page → new API page, as /docs/api/<slug>/ slugs or absolute paths.
 * API pages are per importable module now, so a part of a module
 * (`collections/deque`) goes to the module's page.
 */
const STD_API: Record<string, string> = {
    arena: 'mem',
    bigint: 'math',
    channel: 'sync',
    child_process: 'process/child',
    'collections/deque': 'collections',
    'collections/priority_queue': 'collections',
    'collections/set': 'collections',
    'collections/sorted_map': 'collections',
    csv: 'encoding/csv',
    datetime: 'time',
    dns: 'net/dns',
    fetch: 'net/http',
    fs_stream: 'fs',
    html: 'text',
    http: '/docs/packages/http-server/',
    'http/server': '/docs/packages/http-server/',
    json: 'encoding/json',
    postgres: '/docs/packages/postgres/',
    redis: '/docs/packages/redis/',
    regex: 'text',
    sqlite: '/docs/packages/sqlite/',
    stdin: 'process',
    streams: 'io',
    symbol: 'prelude/symbol',
    timers: 'time',
    typed_array: 'prelude/typed_array',
    udp: 'net/udp',
    url: 'net/url',
    uuid: 'random/uuid',
    websocket: 'net/websocket',
};

const under = (root: string, map: Record<string, string>) =>
    Object.fromEntries(Object.entries(map).map(([from, to]) => [`${root}${from}/`, to.startsWith('/') ? to : `${root}${to}/`]));

/** Every redirect, old path → new path. */
export const REDIRECTS: Record<string, string> = {
    ...under('/docs/std/', STD_GUIDES),
    ...under('/docs/api/', STD_API),
};
