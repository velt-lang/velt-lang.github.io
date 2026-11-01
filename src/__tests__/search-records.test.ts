import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildRecords, highlight, kindOf, search } from '../lib/search-records';
import { DIAGNOSTICS_MDX, parseDiagnostics } from '../lib/errors-index';

const pages = [
    { path: '/docs/std/net/http', title: 'velt/net/http', description: 'fetch and the web types.', headings: [{ id: 'fetch', text: 'fetch(input, init)', level: 2 }], text: '' },
    { path: '/docs/std/net/websocket', title: 'velt/net/websocket', description: 'WebSocket clients.', headings: [], text: '' },
    { path: '/docs/packages/http-server', title: 'http-server', description: 'An HTTP server written in Velt.', headings: [{ id: 'serve', text: 'serve(opts, handler)', level: 2 }], text: '' },
    { path: '/docs/book/http-server', title: 'An HTTP server', description: 'A JSON API with serve.', headings: [{ id: 'routes', text: 'Routes', level: 2 }], text: '' },
    { path: '/docs/reference/classes', title: 'Classes', description: 'Classes.', headings: [{ id: 'visibility', text: 'Visibility', level: 3 }], text: '' },
    { path: '/docs/tooling/cli', title: 'The velt command', description: 'Every subcommand.', headings: [], text: '' },
];
const errors = parseDiagnostics(readFileSync(DIAGNOSTICS_MDX, 'utf8'));
const records = buildRecords(pages as never, errors);

describe('search records', () => {
    it('sorts paths into sections', () => {
        expect(kindOf('/docs/reference/diagnostics')).toBe('err');
        expect(kindOf('/docs/reference/types/')).toBe('ref');
        expect(kindOf('/docs/std/collections/deque/')).toBe('std');
        expect(kindOf('/docs/tooling/cli/')).toBe('tool');
        expect(kindOf('/docs/packages/sqlite/')).toBe('pkg');
        expect(kindOf('/docs/')).toBe('book');
    });

    it('finds a module, its headings and the guide, std first', () => {
        const groups = search(records, 'net/http');
        expect(groups.map((g) => g.kind)).toEqual(['std']);
        expect(groups[0].hits[0].title).toBe('velt/net/http');
        expect(groups[0].hits[0].mono).toBe(true);
        expect(search(records, 'http').map((g) => g.kind)).toEqual(['std', 'pkg', 'book']);
    });

    it('ranks a module first when the query leaves out velt/', () => {
        expect(search(records, 'net/websocket')[0].hits[0].title).toBe('velt/net/websocket');
    });

    it('sets package names in mono', () => {
        expect(search(records, 'http-server').find((g) => g.kind === 'pkg')?.hits[0]).toMatchObject({ title: 'http-server', mono: true });
    });

    it('finds a pasted compiler message', () => {
        const groups = search(records, '`x` is private');
        const err = groups.find((g) => g.kind === 'err')!;
        expect(err.hits[0].title).toBe('`x` is private');
        expect(err.hits[0].href).toBe('/docs/reference/diagnostics/');
    });

    it('has every diagnostics message', () => {
        expect(errors.length).toBeGreaterThan(40);
        expect(errors.some((e) => e.message.startsWith('floating promise'))).toBe(true);
    });

    it('underlines the match', () => {
        expect(highlight('velt/net/http', 'http')).toEqual(['velt/net/', 'http', '']);
        expect(highlight('Routes', 'zzz')).toEqual(['Routes', '', '']);
    });
});

describe('API symbols', () => {
    const apis = [
        { n: 'listen', g: 'ƒ', m: 'velt/net', s: 'Binds host:port and accepts TCP connections.', h: '/docs/api/net/#listen' },
        { n: 'TcpListener', g: 'S', m: 'velt/net', s: 'A listening socket.', h: '/docs/api/net/#TcpListener' },
        { n: 'TcpListener.close', g: 'ƒ', m: 'velt/net', s: 'Stops accepting.', h: '/docs/api/net/#TcpListener.close' },
    ];
    const withApis = buildRecords(pages as never, errors, apis);

    it('come first, in mono, with their kind glyph and module', () => {
        const groups = search(withApis, 'listen');
        expect(groups[0].kind).toBe('api');
        const [top] = groups[0].hits;
        expect(top).toMatchObject({ title: 'listen', glyph: 'ƒ', mono: true, href: '/docs/api/net/#listen' });
        expect(top.meta).toBe('velt/net · Binds host:port and accepts TCP connections.');
    });

    it('include class members', () => {
        expect(search(withApis, 'close')[0].hits.map((h) => h.title)).toContain('TcpListener.close');
    });
});
