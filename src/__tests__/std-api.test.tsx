/** The std API pages: signature layout, summaries, link targets, tag sections. */
import { describe, expect, it } from 'vitest';
import { renderToString } from '@sigx/server-renderer/server';
import { defineApp } from 'sigx';
import { layoutSignature, tokenize } from '../lib/signature';
import { anchorOf, apiModule, apiModuleForGuide, apiModules, apiPath, coverage, guideIntro, guidePath, hrefOf, sentences, specifierOf, visibleExports, type ApiItem } from '../lib/std-api';
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

    it("takes the API page's import line from the guide, when it has one", () => {
        const intro = guideIntro('std/fs');
        if (intro.importLine) expect(intro.importLine).toMatch(/^import .* from "velt\/fs"$/);
        expect(guideIntro('std/no/such/module')).toEqual({ importLine: null, summary: null });
    });
});

describe('the snapshot', () => {
    it('has a page for every importable std module with a guide', () => {
        expect(apiModules().size).toBeGreaterThanOrEqual(30);
        expect(apiModule('net/http')?.specifier).toBe('velt/net/http');
        expect(apiModule('/fs/')?.specifier).toBe('velt/fs');
        for (const m of apiModules().values()) expect(m.file, m.module).toMatch(/(^|\/)index\.vlt$/);
    });

    it("gives a module's internal files no page of their own", () => {
        expect(apiModule('collections/deque')).toBeUndefined();
        expect(apiModuleForGuide('collections/deque')?.specifier).toBe('velt/collections');
        expect(apiModuleForGuide('time/datetime')?.specifier).toBe('velt/time');
        expect(apiModuleForGuide('nothing/here')).toBeUndefined();
    });

    it("documents the prelude's globals under the prelude", () => {
        const ta = apiModule('prelude/typed_array')!;
        expect(ta.module).toBe('std/lang/typed_array');
        expect(specifierOf(ta)).toBe('prelude/typed_array');
        expect(apiPath(ta.module)).toBe('/docs/api/prelude/typed_array/');
        expect(guidePath('std/lang/symbol')).toBe('/docs/std/prelude/symbol/');
    });

    it('links a re-exported type to the public page that re-exports it', () => {
        const fetch = apiModule('net/http')!.exports.find((e) => e.name === 'fetch')!;
        const req = fetch.spans.find((s) => s.target.name === 'Request')!;
        expect(req.target.module).toBe('std/net/http/fetch/request');
        expect(hrefOf(req.target)).toBe('/docs/api/net/http/#Request');
        const url = fetch.spans.find((s) => s.target.name === 'URL')!;
        expect(hrefOf(url.target)).toBe('/docs/api/net/url/#URL');
    });

    it('lists exports grouped by kind and counts doc coverage', () => {
        const kinds = visibleExports(apiModule('net/http')!).map((e) => e.kind);
        expect(kinds.indexOf('function')).toBeLessThan(kinds.indexOf('class'));
        expect(kinds.lastIndexOf('function')).toBeLessThan(kinds.indexOf('struct'));
        const c = coverage(apiModule('net/http')!);
        expect(c.specifier).toBe('velt/net/http');
        expect(c.exports).toBe(apiModule('net/http')!.exports.filter((e) => e.kind !== 'extend' && e.kind !== 're-export').length);
        expect(c.missing).toContain('Request');
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
        expect(tabTargets('/docs/std/net/http/', { api: '/docs/api/net/http/' })).toEqual({ guide: '/docs/std/net/http/', api: '/docs/api/net/http/', onApi: false });
        expect(tabTargets('/docs/api/prelude/symbol/', { guide: '/docs/std/prelude/symbol/', api: '/docs/api/prelude/symbol/' }).guide).toBe('/docs/std/prelude/symbol/');
        expect(tabTargets('/docs/std/prelude/', {}).api).toBe('/docs/api/');
    });
});

describe('an export section', () => {
    const item: ApiItem = {
        id: 'velt/demo#parse', name: 'parse', kind: 'function', modifiers: ['async', 'deprecated'],
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
        return renderToString(defineApp(<ExportSection item={it} module={apiModule('net/http')!} />));
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
    it('inverts the spans: Response is returned by fetch, RequestInit is a parameter of fetch', async () => {
        const { backlinks } = await import('../lib/std-api');
        expect(backlinks('/docs/api/net/http/#Response').get('Returned by')?.map((b) => b.name)).toContain('fetch');
        expect(backlinks('/docs/api/net/http/#RequestInit').get('Parameter of')?.map((b) => b.name)).toContain('fetch');
    });

    it('lists users of a cross-module type with their modules', async () => {
        const { backlinks } = await import('../lib/std-api');
        const users = backlinks('/docs/api/net/url/#URL').get('Parameter of') ?? [];
        const fetch = users.find((b) => b.name === 'fetch');
        expect(fetch?.module).toBe('std/net/http');
        expect(fetch?.href).toBe('/docs/api/net/http/#fetch');
    });

    it('builds a card per export with its short declaration and linked types', async () => {
        const { moduleCards } = await import('../lib/std-api');
        const http = apiModule('net/http')!;
        const cards = moduleCards(http);
        const init = cards.RequestInit;
        expect(init.kind).toBe('struct');
        expect(init.color).toBe('#A592FF');
        expect(init.module).toBe('velt/net/http');
        expect(init.decl.map((t) => t[1]).join('')).toMatch(/^struct RequestInit \{\n {2}method\?: string;\n {2}headers\?: HeadersInit;/);
        expect(init.decl.find((t) => t[1] === 'HeadersInit')?.[2]).toBe('/docs/api/net/http/#HeadersInit');
        expect(init.usedBy).toContain('fetch');
        expect(Object.keys(cards)).toHaveLength(http.exports.length);
        // A constructor isn't listed, and doesn't make the card look truncated.
        const exec = moduleCards(apiModule('process/child')!).ExecResult;
        expect(exec.decl.map((t) => t[1]).join('')).not.toContain('…');
    });
});
