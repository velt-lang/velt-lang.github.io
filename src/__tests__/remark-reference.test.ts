import { describe, expect, it } from 'vitest';
import { remarkReference } from '../lib/remark-reference';

type Node = { type: string; value?: string; depth?: number; ordered?: boolean; children?: Node[]; data?: { hName?: string; hProperties?: Record<string, unknown> } };

const t = (value: string): Node => ({ type: 'text', value });
const strong = (value: string): Node => ({ type: 'strong', children: [t(value)] });
const p = (...children: Node[]): Node => ({ type: 'paragraph', children });
const li = (...children: Node[]): Node => ({ type: 'listItem', children });
const ul = (...children: Node[]): Node => ({ type: 'list', ordered: false, children });
const root = (...children: Node[]): Node => ({ type: 'root', children });
const run = (tree: Node) => (remarkReference()(tree as never), tree);
const long = 'word '.repeat(80);

describe('remarkReference', () => {
    it('turns a long top-level term bullet into an h3 and its text', () => {
        const tree = run(root(ul(li(p(strong('Short'), t(': fine'))), li(p(strong('Dispatch'), t(`: a method ${long}`))), li(p(strong('Other'), t(': also short'))))));
        expect(tree.children!.map((n) => n.type)).toEqual(['list', 'heading', 'paragraph', 'list']);
        const h = tree.children![1];
        expect(h.depth).toBe(3);
        expect(h.children![0].value).toBe('Dispatch');
        expect(tree.children![2].children![0].value!.startsWith('A method')).toBe(true);
    });

    it('accepts the colon inside the bold term, and keeps short bullets as a list', () => {
        const tree = run(root(ul(li(p(strong('Values that copy:'), t(` numbers ${long}`))))));
        expect(tree.children![0].type).toBe('heading');
        expect(tree.children![0].children![0].value).toBe('Values that copy');
        const short = run(root(ul(li(p(strong('A'), t(': b'))))));
        expect(short.children![0].type).toBe('list');
    });

    it('marks inline code with backticks as a diagnostic, and a lone one as the error block', () => {
        const inline: Node = { type: 'inlineCode', value: '`x` is private' };
        const tree = run(root(p(t('Says '), inline, t('.')), p({ type: 'inlineCode', value: '`y` is not exported' }, t('.'))));
        expect(inline.data?.hProperties?.className).toEqual(['diag']);
        expect(tree.children![1].data?.hProperties?.className).toEqual(['diag-block']);
    });

    it('turns labelled blockquotes into callouts', () => {
        const tree = run(root({ type: 'blockquote', children: [p(strong('Not supported yet'), t(': static this.'))] }));
        const c = tree.children![0];
        expect(c.data?.hProperties?.className).toEqual(['callout', 'callout-unsupported']);
        expect(c.children![0].children![0].value).toBe('Not supported yet');
        expect(c.children![1].children![0].value).toBe('Static this.');
    });
});
