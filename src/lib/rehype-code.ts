/**
 * Build-time code highlighting for the docs: Shiki with the Velt palette,
 * rendered into the design's code window (a file bar with the language or
 * `title="…"`, and a copy button that `installCodeCopy()` wires on the
 * client). Replaces @sigx/ssg's built-in Shiki (`markdown.shiki: false` in
 * vite.config.ts), which only takes bundled theme names.
 *
 * Fence meta:
 *   ```ts title="server.vlt"   file name in the bar instead of the language
 *   ```ts error                a "does not compile" badge (velt's docs-test meta)
 *   ```ts ignore               accepted and ignored (velt's docs-test meta)
 *
 * Also wraps tables in a scroll box so a wide table never widens the page.
 */
import { createHighlighter, type HighlighterGeneric, type ThemeRegistration } from 'shiki';

type Node = {
    type: string;
    tagName?: string;
    value?: string;
    properties?: Record<string, unknown>;
    children?: Node[];
    data?: { meta?: string | null };
};

/** The design's syntax colors (design/Main.dc.html `.k .s .t .f .c .n`). */
export const VELT_THEME: ThemeRegistration = {
    name: 'velt-dark',
    type: 'dark',
    colors: { 'editor.background': '#0D0D14', 'editor.foreground': '#ECECF3' },
    settings: [
        { settings: { foreground: '#ECECF3', background: '#0D0D14' } },
        { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#8A8AA3' } },
        {
            scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.operator.new',
                'keyword.operator.expression', 'keyword.operator.word', 'constant.language', 'variable.language.this',
                'variable.language.super', 'markup.heading'],
            settings: { foreground: '#B69CFF' },
        },
        { scope: ['string', 'punctuation.definition.string', 'string.template', 'markup.inline.raw'], settings: { foreground: '#FFB27A' } },
        {
            scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class',
                'storage.type.primitive', 'support.type.primitive', 'entity.name.type.module', 'entity.name.namespace',
                'support.type.property-name.json', 'entity.name.tag'],
            settings: { foreground: '#5FE1F7' },
        },
        { scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function'], settings: { foreground: '#FFD27A' } },
        { scope: ['constant.numeric', 'constant.character.escape', 'constant.other'], settings: { foreground: '#FF8FD8' } },
        { scope: ['punctuation.definition.template-expression', 'punctuation.section.embedded'], settings: { foreground: '#B69CFF' } },
        { scope: ['keyword.operator', 'punctuation'], settings: { foreground: '#ECECF3' } },
    ],
};

const LANGS = ['ts', 'tsx', 'js', 'jsx', 'json', 'sh', 'bash', 'powershell', 'rust', 'toml', 'yaml', 'diff', 'html', 'css', 'sql'] as const;
/** Fence names that highlight with another grammar. `vlt` is TypeScript syntax. */
const ALIASES: Record<string, string> = { vlt: 'ts', velt: 'ts', shell: 'sh', console: 'sh', zsh: 'sh', ps1: 'powershell', pwsh: 'powershell', rs: 'rust', typescript: 'ts', javascript: 'js' };
const LABELS: Record<string, string> = { sh: 'Terminal', bash: 'Terminal', powershell: 'PowerShell', text: 'Text', txt: 'Text' };

let highlighter: Promise<HighlighterGeneric<string, string>> | undefined;
const getHighlighter = () => (highlighter ??= createHighlighter({ themes: [VELT_THEME], langs: [...LANGS] }) as never);

const svg = (cls: string, children: Node[]): Node => ({
    type: 'element', tagName: 'svg',
    properties: { className: [cls], width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ariaHidden: 'true' },
    children,
});
const shape = (tagName: string, properties: Record<string, unknown>): Node => ({ type: 'element', tagName, properties, children: [] });
const COPY_ICON = () => [shape('rect', { x: 9, y: 9, width: 12, height: 12, rx: 2 }), shape('path', { d: 'M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1' })];
const DONE_ICON = () => [shape('path', { d: 'm5 12 5 5 9-10' })];

const el = (tagName: string, className: string | null, children: Node[], properties: Record<string, unknown> = {}): Node => ({
    type: 'element', tagName, properties: className ? { className: [className], ...properties } : properties, children,
});
const text = (value: string): Node => ({ type: 'text', value });

function textOf(node: Node): string {
    if (node.type === 'text') return node.value ?? '';
    return (node.children ?? []).map(textOf).join('');
}

function parseMeta(meta: string) {
    const title = meta.match(/title=(?:"([^"]*)"|'([^']*)'|(\S+))/);
    const flags = new Set(meta.replace(/title=(?:"[^"]*"|'[^']*'|\S+)/, '').split(/\s+/).filter(Boolean));
    return { title: title ? (title[1] ?? title[2] ?? title[3]) : undefined, flags };
}

export function rehypeVeltCode() {
    return async (tree: Node) => {
        const hl = await getHighlighter();
        const loaded = new Set(hl.getLoadedLanguages());
        const walk = (node: Node) => {
            const kids = node.children;
            if (!kids) return;
            for (let i = 0; i < kids.length; i++) {
                const child = kids[i];
                if (child.type !== 'element') continue;
                if (child.tagName === 'table') {
                    kids[i] = el('div', 'table-scroll', [child]);
                    continue;
                }
                const code = child.tagName === 'pre' ? child.children?.find((c) => c.tagName === 'code') : undefined;
                if (!code) {
                    walk(child);
                    continue;
                }
                const classes = (code.properties?.className as string[] | undefined) ?? [];
                const fence = classes.find((c) => c.startsWith('language-'))?.slice(9) ?? 'text';
                if (fence === 'mermaid') continue;
                const lang = ALIASES[fence] ?? fence;
                const meta = parseMeta(String(code.data?.meta ?? code.properties?.metastring ?? ''));
                const source = textOf(code).replace(/\n$/, '');
                const highlighted = loaded.has(lang)
                    ? (hl.codeToHast(source, { lang, theme: 'velt-dark' }).children[0] as Node)
                    : el('pre', 'shiki', [el('code', null, [text(source)])]);
                highlighted.properties = { ...highlighted.properties, style: undefined, tabIndex: 0 };

                const label = meta.title ?? LABELS[fence] ?? fence;
                const header: Node[] = [el('span', null, [text(label), ...(meta.flags.has('error') ? [el('span', 'code-badge code-badge-error', [text('does not compile')])] : [])])];
                header.push(el('button', 'code-window-copy', [svg('icon-copy', COPY_ICON()), svg('icon-done', DONE_ICON())], { type: 'button', ariaLabel: 'Copy code', title: 'Copy code' }));
                kids[i] = el('figure', 'code-window', [
                    el('div', 'code-window-header', header),
                    el('div', 'code-window-content', [highlighted]),
                ], { dataLang: lang });
            }
        };
        walk(tree);
    };
}
