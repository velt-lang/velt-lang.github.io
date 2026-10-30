/** The std API pages: signature layout, summaries, link targets, tag sections. */
import { describe, expect, it } from 'vitest';
import { renderToString } from '@sigx/server-renderer/server';
import { defineApp } from 'sigx';
import { layoutSignature, tokenize } from '../lib/signature';
import { anchorOf, apiModule, apiModuleForGuide, apiModules, coverage, guideIntro, guidePath, hrefOf, sentences, visibleExports, type ApiItem } from '../lib/std-api';
import { tabTargets } from '../lib/docs-areas';
import { ExportSection } from '../components/api/ApiPage';
import { highlighterReady } from '../components/api/CodeBlock';

describe('signature layout', () => {
    const sig = 'async function exec(program: string, args: string[] = [], opts: ExecOptions = {}): Promise<ExecResult>';
    const spans = [
        { start: sig.indexOf('ExecOptions'), end: sig.indexOf('ExecOptions') + 11, target: 'opts' },
        { start: sig.indexOf('ExecResult'), end: sig.indexOf('ExecResult') + 10, target: 'result' },
    ];

    it('puts each parameter on its own line when the line is long, keeping spans on their names', () => {
        const laid = layoutSignature(sig, spans, 80);
        expect(laid.text).toBe('async function exec(\n  program: string,\n  args: string[] = [],\n  opts: ExecOptions = {},\n): Promise<ExecResult>');
        for (const s of laid.spans) expect(laid.text.slice(s.start, s.end)).toBe(s.target === 'opts' ? 'ExecOptions' : 'ExecResult');
    });

    it('leaves a short signature and type-parameter commas alone', () => {
        expect(layoutSignature('function pick<T, U>(a: T): U', [], 80).text).toBe('function pick<T, U>(a: T): U');
        expect(layoutSignature('function f<A, B>(a: Map<A, B>, b: string): void', [], 20).text).toBe('function f<A, B>(\n  a: Map<A, B>,\n  b: string,\n): void');
    });

    it('colors keywords, the function name and types, and links spans', () => {
        const sig = 'async function serve(opts: ServeOptions): Promise<Server>';
        const tokens = tokenize(sig, [{ start: sig.indexOf('ServeOptions'), end: sig.indexOf('ServeOptions') + 12, target: 'x' }]);
        expect(tokens).toContainEqual({ kind: 'k', text: 'async' });
        expect(tokens).toContainEqual({ kind: 'f', text: 'serve' });
        expect(tokens).toContainEqual({ kind: 'link', text: 'ServeOptions', target: 'x' });
        expect(tokens).toContainEqual({ kind: 't', text: 'Promise' });
        expect(tokens.find((t) => t.text.includes('opts'))?.kind).toBe('text');
    });
});

describe('summaries', () => {
    it('ends the first sentence after "e.g." and parentheses', () => {
        expect(sentences('A chain and its key, both PEM text (e.g. read with `readFile`). More.')).toBe('A chain and its key, both PEM text (e.g. read with `readFile`).');
        expect(sentences('Runs `a.b` first. Then this.', 2)).toBe('Runs `a.b` first. Then this.');
    });

    it("takes the API page's summary and import line from the guide", () => {
        const intro = guideIntro('std/http');
        expect(intro.importLine).toBe('import { serve, ServeInfo, Server } from "velt:http"');
        expect(intro.summary).toMatch(/^An HTTP server on hyper/);
    });
});

describe('the snapshot', () => {
    it('has a page for every std guide with a module', () => {
        expect(apiModules().size).toBeGreaterThanOrEqual(40);
        expect(apiModule('http')?.specifier).toBe('velt:http');
        expect(apiModule('collections/deque')?.specifier).toBe('velt:collections/deque');
    });

    it('links a re-exported type to the public page that re-exports it', () => {
        const serve = apiModule('http')!.exports.find((e) => e.name === 'serve')!;
        const req = serve.spans.find((s) => s.target.name === 'Request')!;
        expect(req.target.module).toBe('std/fetch/request');
        expect(hrefOf(req.target)).toBe('/docs/api/fetch/#Request');
        const opts = serve.spans.find((s) => s.target.name === 'ServeOptions')!;
        expect(hrefOf(opts.target)).toBe('/docs/api/http/#ServeOptions');
    });

    it('lists exports grouped by kind and counts doc coverage', () => {
        const kinds = visibleExports(apiModule('http')!).map((e) => e.kind);
        expect(kinds.indexOf('function')).toBeLessThan(kinds.indexOf('class'));
        expect(kinds.lastIndexOf('function')).toBeLessThan(kinds.indexOf('struct'));
        const c = coverage(apiModule('http')!);
        expect(c.exports).toBe(9);
        expect(c.missing).toContain('ServeOptions');
    });

    it('gives anchors that are unique per page', () => {
        for (const m of apiModules().values()) {
            const ids = m.exports.map(anchorOf);
            expect(new Set(ids).size, m.specifier).toBe(ids.length);
        }
    });
});

describe('Guide | API tabs', () => {
    it('point at the same module', () => {
        expect(tabTargets('/docs/std/http/', { api: '/docs/api/http/' })).toEqual({ guide: '/docs/std/http/', api: '/docs/api/http/', onApi: false });
        expect(tabTargets('/docs/api/http/server/', { guide: '/docs/std/http_server/', api: '/docs/api/http/server/' }).guide).toBe('/docs/std/http_server/');
        expect(tabTargets('/docs/std/prelude/', {}).api).toBe('/docs/api/');
    });

    it('find the module of a guide whose name differs from the module path', () => {
        expect(apiModuleForGuide('http_server')?.specifier).toBe('velt:http/server');
        expect(guidePath('std/http/server')).toBe('/docs/std/http_server/');
    });
});

describe('an export section', () => {
    const item: ApiItem = {
        id: 'velt:demo#parse', name: 'parse', kind: 'function', modifiers: ['async', 'deprecated'],
        signature: 'async function parse(text: string): Value', spans: [],
        doc: 'Parses `text`.', summary: 'Parses `text`.',
        tags: {
            params: [{ name: 'text', doc: 'The JSON text.' }], returns: 'The parsed value.', throws: ['SyntaxError if `text` is not JSON.'],
            examples: ['```ts\nconst v = await parse("1");\n```'], deprecated: 'Use `JSON.parse`.', see: ['`stringify`'],
        },
        links: [], source: { file: 'std/demo.vlt', line: 12 }, reexportedFrom: null, members: [],
    };
    const render = async (it: ApiItem) => {
        await highlighterReady;
        return renderToString(defineApp(<ExportSection item={it} module={apiModule('http')!} />));
    };

    it('renders every tag section it has', async () => {
        const html = await render(item);
        for (const label of ['Deprecated', 'Parameters', 'Returns', 'Throws', 'Example', 'See also']) expect(html).toContain(`>${label}<`);
        expect(html).toContain('std/demo.vlt:12');
        expect(html).toContain('>async<');
        expect(html).toContain('>deprecated<');
    });

    it('says when there is no doc comment, with a link to add one, and no empty sections', async () => {
        const html = await render({ ...item, doc: null, summary: null, modifiers: [], tags: { params: [], returns: null, throws: [], examples: [], deprecated: null, see: [] } });
        expect(html).toContain('No doc comment yet');
        expect(html).toContain('add one');
        expect(html).not.toContain('>Parameters<');
        expect(html).not.toContain('>Returns<');
    });
});

describe('backlinks and hover cards', () => {
    it('inverts the spans: Server is returned by serve, ServeOptions is a parameter of serve', async () => {
        const { backlinks } = await import('../lib/std-api');
        expect(backlinks('/docs/api/http/#Server').get('Returned by')?.map((b) => b.name)).toEqual(['serve']);
        expect(backlinks('/docs/api/http/#ServeOptions').get('Parameter of')?.map((b) => b.name)).toContain('serve');
    });

    it('lists users of a cross-module type with their modules', async () => {
        const { backlinks } = await import('../lib/std-api');
        const users = backlinks('/docs/api/fetch/#Request').get('Parameter of') ?? [];
        expect(users.map((b) => b.module)).toEqual(expect.arrayContaining(['std/fetch', 'std/http']));
        expect(users.find((b) => b.name === 'serve')?.href).toBe('/docs/api/http/#serve');
    });

    it('builds a card per export with its short declaration and linked types', async () => {
        const { moduleCards } = await import('../lib/std-api');
        const cards = moduleCards(apiModule('http')!);
        const opts = cards.ServeOptions;
        expect(opts.kind).toBe('struct');
        expect(opts.decl.map((t) => t[1]).join('')).toBe('struct ServeOptions {\n  port: number;\n  host?: string;\n  tls?: TlsOptions;\n}');
        expect(opts.decl.find((t) => t[1] === 'TlsOptions')?.[2]).toBe('/docs/api/http/#TlsOptions');
        expect(opts.summary).toBeNull();
        expect(opts.usedBy).toContain('serve');
        expect(Object.keys(cards)).toHaveLength(apiModule('http')!.exports.length);
    });
});
