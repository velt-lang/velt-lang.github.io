import { describe, expect, it } from 'vitest';
import { rehypeVeltCode } from '../lib/rehype-code';

type Node = { type: string; tagName?: string; value?: string; properties?: Record<string, unknown>; children?: Node[]; data?: { meta?: string } };

const fence = (lang: string, code: string, meta = ''): Node => ({
    type: 'root',
    children: [{ type: 'element', tagName: 'pre', children: [{ type: 'element', tagName: 'code', properties: { className: [`language-${lang}`] }, data: { meta }, children: [{ type: 'text', value: code }] }] }],
});
const text = (n: Node): string => (n.type === 'text' ? n.value ?? '' : (n.children ?? []).map(text).join(''));
const find = (n: Node, pred: (n: Node) => boolean): Node | undefined =>
    pred(n) ? n : (n.children ?? []).map((c) => find(c, pred)).find(Boolean);
const hasClass = (c: string) => (n: Node) => ((n.properties?.className as string[] | undefined) ?? []).includes(c);

describe('rehypeVeltCode', () => {
    it('wraps a ts fence in a code window with the Velt palette', async () => {
        const tree = fence('ts', 'const a: i64 = 1;');
        await rehypeVeltCode()(tree);
        const win = find(tree, hasClass('code-window'))!;
        expect(win.tagName).toBe('figure');
        expect(text(find(win, hasClass('code-window-header'))!)).toBe('ts');
        expect(find(win, hasClass('code-window-copy'))).toBeDefined();
        expect(text(find(win, hasClass('code-window-content'))!)).toBe('const a: i64 = 1;');
        expect(JSON.stringify(win)).toContain('#B69CFF'); // keyword color
    });

    it('uses title= for the bar and badges error fences', async () => {
        const tree = fence('vlt', 'x', 'error title="bad.vlt"');
        await rehypeVeltCode()(tree);
        const header = text(find(tree, hasClass('code-window-header'))!);
        expect(header).toBe('bad.vltdoes not compile');
    });

    it('leaves mermaid fences alone', async () => {
        const tree = fence('mermaid', 'graph TD; A-->B');
        await rehypeVeltCode()(tree);
        expect(find(tree, hasClass('code-window'))).toBeUndefined();
    });
});
