import { defineSSGConfig } from '@sigx/ssg';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { apiModule, coverageReport, guideIntro } from './src/lib/std-api';
import { writeApiCards } from './src/lib/api-cards';

/**
 * The API pages share one route, so their title and description come from
 * the module: "velt:http API — Velt docs" and the guide's opening sentence.
 */
function apiPageHead(html: string, path: string): string {
    const slug = path.match(/^\/docs\/api\/(.+?)\/?$/)?.[1];
    const m = slug ? apiModule(slug) : undefined;
    if (!m) return html;
    const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const title = esc(`${m.specifier} API`);
    const description = esc(`API reference for ${m.specifier}: ${(guideIntro(m.module).summary ?? m.summary ?? '').replace(/`|\[|\]\([^)]*\)/g, '')}`.trim());
    return html
        // Replacer functions: a `$` in the text must come out as written.
        .replace(/<title>[^<]*<\/title>/, () => `<title>${title}</title>`)
        .replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*"/g, (_, open: string) => `${open}${description}"`)
        .replace(/(<meta property="og:title" content=")[^"]*"/, (_, open: string) => `${open}${title}"`);
}

/**
 * Route paths of every docs page under one area, in sidebar (`order`) order,
 * for the llms.txt sections.
 */
function docsArea(area: string): string[] {
    const root = join(process.cwd(), 'src/pages/docs', area);
    const walk = (dir: string): string[] =>
        readdirSync(dir).flatMap((name) => {
            const full = join(dir, name);
            return statSync(full).isDirectory() ? walk(full) : name.endsWith('.mdx') ? [full] : [];
        });
    return walk(root)
        .map((file) => {
            const order = Number(readFileSync(file, 'utf8').match(/^order:\s*(\d+)/m)?.[1] ?? 0);
            const rel = file.slice(root.length + 1).replace(/\\/g, '/').replace(/(^|\/)?index\.mdx$/, '').replace(/\.mdx$/, '');
            return { order, path: `/docs/${area}/${rel}${rel ? '/' : ''}` };
        })
        .sort((a, b) => a.order - b.order)
        .map((p) => p.path);
}

/**
 * The Latin font files every page renders above the fold, preloaded so text
 * doesn't shift when they swap in. Their hashed names exist only after the
 * client build, which runs before pages render.
 */
const PRELOAD_FONTS = [/^inter-latin-400-normal-.*\.woff2$/, /^inter-latin-600-normal-.*\.woff2$/, /^space-grotesk-latin-700-normal-.*\.woff2$/, /^jetbrains-mono-latin-400-normal-.*\.woff2$/];
let fontPreloads: string | undefined;
function fontPreloadTags(): string {
    if (fontPreloads !== undefined) return fontPreloads;
    const dir = join(process.cwd(), 'dist/assets');
    const files = existsSync(dir) ? readdirSync(dir) : [];
    fontPreloads = PRELOAD_FONTS.map((re) => files.find((f) => re.test(f)))
        .filter(Boolean)
        .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`)
        .join('\n    ');
    return fontPreloads;
}

const DESCRIPTION =
    "Velt compiles TypeScript's good parts to one native executable: no interpreter, no garbage collector, every core in use. It runs your .ts files and leaves JavaScript's dynamic tricks out.";

export default defineSSGConfig({
    pages: 'src/pages',
    layouts: 'src/layouts',
    outDir: 'dist',

    site: {
        title: 'Velt',
        description: DESCRIPTION,
        // origin only — the SSG appends Vite's `base` for sitemap and canonical URLs.
        url: 'https://veltlang.com',
        favicon: '/favicon.png',
        themeColor: '#08080D',
        ogImage: 'https://veltlang.com/og-card.png',
        ogImageAlt: "Velt — TypeScript's good parts, compiled native",
        // Edit links: the page's sourceFile is appended (the docs live in this repo).
        editBase: 'https://github.com/velt-lang/velt-lang.github.io/edit/main/',
    },

    collections: {
        docs: {
            path: '/docs',
            showDrafts: 'dev',
            sectionOrder: ['Overview', 'The book', 'Language reference', 'Standard library', 'Tooling'],
        },
    },

    navigation: { showDrafts: 'dev' },

    // Font preloads on every page, and "Memory model" → "Memory model — Velt
    // docs" in the tab and search results for docs pages.
    hooks: {
        // Which std exports still lack a doc comment (design: missing docs are visible).
        postBuild() {
            console.log(`\n${coverageReport()}\n`);
            console.log(`🃏 Wrote ${writeApiCards(join(process.cwd(), 'dist'))} API hover card files\n`);
        },
        transformHtml(html, page) {
            html = html.replace('<link rel="icon"', `${fontPreloadTags()}\n    <link rel="icon"`);
            if (!page.path.startsWith('/docs')) return html;
            html = apiPageHead(html, page.path);
            return html.replace(/<title>([^<]*)<\/title>/, (m, t: string) =>
                page.path === '/docs/' || page.path === '/docs' ? m : `<title>${t} — Velt docs</title>`,
            );
        },
    },

    // Every internal link and #fragment must resolve: a broken link fails the build.
    linkCheck: 'error',

    // search-index.json for the docs search box (src/islands/DocsSearch.tsx).
    search: true,

    sitemap: {
        // Dates each URL from its source file's last commit: needs full git
        // history (deploy-docs.yml checks out with fetch-depth: 0).
        lastmod: 'git',
    },

    // llms.txt, llms-full.txt and a .md rendition of every docs page — the
    // "Point your AI assistant at veltlang.com/llms.txt" strip on the home page.
    llms: {
        intro: [
            'Velt is a compiled language with TypeScript syntax: `velt run app.ts` compiles a `.ts`/`.tsx`/`.vlt`',
            'file to native code through LLVM. Valid TypeScript behaves as in Node, but the dynamic parts of',
            'JavaScript are left out on purpose (`eval`, prototypes, decorators, `with`, `delete`, loose `==`);',
            'read [Velt for TypeScript developers](https://veltlang.com/docs/book/ts-developers.md) before writing',
            'code. Velt adds integer types (`i64`, `u8`…), typed errors (`throws`), `extend`, `spawn` and',
            '`velt:*` standard modules. Every docs page has a markdown rendition at its URL with the trailing',
            'slash replaced by `.md`; the whole corpus is https://veltlang.com/llms-full.txt.',
        ].join('\n'),
        sections: [
            { title: 'The book', pages: docsArea('book') },
            { title: 'Language reference', pages: docsArea('reference') },
            { title: 'Standard library', pages: docsArea('std') },
            { title: 'Tooling', pages: docsArea('tooling') },
        ],
        // Keep llms-full.txt ingestible: the std modules are indexed above and
        // each is fetchable as .md on its own.
        full: { exclude: ['/docs/std/**'] },
    },
});
