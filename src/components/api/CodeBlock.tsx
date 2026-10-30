/**
 * A highlighted code block for the API pages (examples, fenced code in doc
 * comments): the docs' Shiki highlighter and Velt palette, without the file
 * bar (design/Api.dc.html "Example"). Highlighting is synchronous, so the
 * page awaits `highlighterReady` once before rendering.
 */
import { component } from 'sigx';
import type { HighlighterGeneric } from 'shiki';
import { ALIASES, getHighlighter } from '../../lib/rehype-code';

let hl: HighlighterGeneric<string, string> | undefined;

/** Resolves once the highlighter is loaded; await it at the top of a page module. */
export const highlighterReady: Promise<void> = getHighlighter().then((h) => {
    hl = h;
});

export const CodeBlock = component<{ code: string; lang?: string }>(({ props }) => () => {
    const fence = props.lang || 'ts';
    const lang = ALIASES[fence] ?? fence;
    const code = props.code.replace(/\n+$/, '');
    const lines = hl && hl.getLoadedLanguages().includes(lang) ? hl.codeToTokensBase(code, { lang, theme: 'velt-dark' }) : null;
    return (
        <pre class="api-code" tabIndex={0}>
            <code>
                {lines
                    ? lines.map((line, i) => (
                          <>
                              {i > 0 && '\n'}
                              {line.map((t) => (t.color && t.color.toUpperCase() !== '#ECECF3' ? <span style={{ color: t.color }}>{t.content}</span> : t.content))}
                          </>
                      ))
                    : code}
            </code>
        </pre>
    );
}, { name: 'CodeBlock' });
