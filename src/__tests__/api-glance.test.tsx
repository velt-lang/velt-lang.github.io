/** Std guides point at their API reference: the header switch, "API at a glance", the aside card. */
import { describe, expect, it } from 'vitest';
import { renderToString } from '@sigx/server-renderer/server';
import { defineApp, type JSXElement } from 'sigx';
import { anchorOf, apiModule, apiModules, apiPath, countedExports, kindCounts, mainExports } from '../lib/std-api';
import { ApiSwitch } from '../components/api/ApiSwitch';
import { ApiAsideCard, ApiGlance, insertAfterLead } from '../components/api/ApiGlance';

/** The HTML without the renderer's hydration comments. */
const render = async (el: JSXElement) => (await renderToString(defineApp(el))).replace(/<!--[^>]*-->/g, '');

describe('the Guide | API reference switch', () => {
    it('links both pages, marks the current one and shows the export count', async () => {
        const html = await render(<ApiSwitch guide="/docs/std/net/http/" api="/docs/api/net/http/" onApi={false} count={18} />);
        expect(html).toContain('href="/docs/std/net/http/"');
        expect(html).toContain('href="/docs/api/net/http/"');
        expect(html.match(/aria-current="page"/g)).toHaveLength(1);
        expect(html).toMatch(/aria-current="page"[^>]*>[\s\S]*Guide/);
        expect(html).toContain('>18<');
        expect(html).toContain('18 exports');
        expect(html).toContain('min-h-11');
    });

    it('shows no badge without a count', async () => {
        const html = await render(<ApiSwitch guide="/docs/std/" api="/docs/api/" onApi={true} />);
        expect(html).not.toContain('exports');
        expect(html).toMatch(/aria-current="page"[^>]*href="\/docs\/api\/"|href="\/docs\/api\/"[^>]*aria-current="page"/);
    });
});

describe('API at a glance', () => {
    const http = apiModule('net/http')!;

    it('counts exports by kind, adding up to the total', () => {
        for (const m of apiModules().values()) {
            expect(kindCounts(m).reduce((n, k) => n + k.count, 0), m.specifier).toBe(countedExports(m).length);
        }
        const fns = kindCounts(http).find((k) => k.kind === 'function')!;
        expect(fns.noun).toBe('functions');
        expect(kindCounts(http)[0].kind).toBe('function');
    });

    it("ranks the exports a guide's code uses most first", () => {
        expect(mainExports(http, 'net/http').map((e) => e.name)).toContain('fetch');
        expect(mainExports(apiModule('collections')!, 'collections/deque')[0].name).toBe('Deque');
        expect(mainExports(http, 'net/http', 3)).toHaveLength(3);
    });

    it('links its chips to anchors the API page renders, and the rest to the exports table', async () => {
        const html = await render(<ApiGlance module={http} slug="net/http" />);
        const total = countedExports(http).length;
        expect(html).toContain(`${total} exports, every signature and doc comment`);
        expect(html).toContain('Open the API reference');
        expect(html).toContain(`href="${apiPath(http.module)}"`);
        for (const e of mainExports(http, 'net/http')) expect(html).toContain(`href="${apiPath(http.module)}#${anchorOf(e)}"`);
        expect(html).toContain(`+${total - 6} more`);
        expect(html).toContain(`href="${apiPath(http.module)}#exports"`);
    });

    it('goes after the lead paragraph, or after the H1 when no paragraph follows it', () => {
        const page = (
            <>
                <h1>velt/net/http</h1>
                {'\n'}
                <p>Lead.</p>
                {'\n'}
                <h2>Fetching</h2>
            </>
        );
        const types = (nodes: unknown[] | null) =>
            (nodes as { type: unknown; children: { type: unknown }[] }[])[0].children.map((n) => (typeof n.type === 'string' ? n.type : typeof n.type === 'symbol' ? '' : 'glance')).filter(Boolean);
        expect(types(insertAfterLead([page], <ApiGlance module={http} slug="net/http" />))).toEqual(['h1', 'p', 'glance', 'h2']);
        const noLead = (
            <>
                <h1>T</h1>
                <h2>Section</h2>
                <p>Text.</p>
            </>
        );
        expect(types(insertAfterLead([noLead], <ApiGlance module={http} slug="net/http" />))).toEqual(['h1', 'glance', 'h2', 'p']);
        expect(insertAfterLead([<p>No title.</p>], <ApiGlance module={http} slug="net/http" />)).toBeNull();
    });

    it('has an aside card with the count and module', async () => {
        const html = await render(<ApiAsideCard module={http} />);
        expect(html).toContain(`${countedExports(http).length} exports in`);
        expect(html).toContain('velt/net/http');
        expect(html).toContain(`href="${apiPath(http.module)}"`);
    });
});
