import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildRecords, highlight, kindOf, search } from '../lib/search-records';
import { DIAGNOSTICS_MDX, parseDiagnostics } from '../lib/errors-index';

const pages = [
    { path: '/docs/std/http', title: 'velt:http', description: 'The HTTP server.', headings: [{ id: 'serve', text: 'serve(opts, handler)', level: 2 }], text: '' },
    { path: '/docs/std/websocket', title: 'velt:websocket', description: 'WebSocket client and server.', headings: [], text: '' },
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
        expect(kindOf('/docs/')).toBe('book');
    });

    it('finds a module, its headings and the guide, std first', () => {
        const groups = search(records, 'http');
        expect(groups.map((g) => g.kind)).toEqual(['std', 'book']);
        expect(groups[0].hits[0].title).toBe('velt:http');
        expect(groups[0].hits[0].mono).toBe(true);
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
        expect(highlight('velt:http', 'http')).toEqual(['velt:', 'http', '']);
        expect(highlight('Routes', 'zzz')).toEqual(['Routes', '', '']);
    });
});

describe('API symbols', () => {
    const apis = [
        { n: 'serve', g: 'ƒ', m: 'velt:http', s: 'Binds host:port and serves handler in the background.', h: '/docs/api/http/#serve' },
        { n: 'Server', g: 'C', m: 'velt:http', s: 'A running server.', h: '/docs/api/http/#Server' },
        { n: 'Server.close', g: 'ƒ', m: 'velt:http', s: 'Stops accepting.', h: '/docs/api/http/#Server.close' },
    ];
    const withApis = buildRecords(pages as never, errors, apis);

    it('come first, in mono, with their kind glyph and module', () => {
        const groups = search(withApis, 'serve');
        expect(groups[0].kind).toBe('api');
        const [top] = groups[0].hits;
        expect(top).toMatchObject({ title: 'serve', glyph: 'ƒ', mono: true, href: '/docs/api/http/#serve' });
        expect(top.meta).toBe('velt:http · Binds host:port and serves handler in the background.');
    });

    it('include class members', () => {
        expect(search(withApis, 'close')[0].hits.map((h) => h.title)).toContain('Server.close');
    });
});
