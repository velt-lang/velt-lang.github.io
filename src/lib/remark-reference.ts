/**
 * Build-time readability for dense reference pages (design/Ref.dc.html,
 * handover "Long reference pages"). Runs on the markdown tree, before the
 * headings for "On this page" are collected, so the h3s it makes appear there.
 *
 * - Term bullets: a top-level `- **Term**: …` item longer than about three
 *   lines becomes an h3 (the term) followed by its text. Short ones stay a list.
 * - Diagnostics: inline code that itself contains a backtick (written with
 *   triple backticks, e.g. ``` `x` is private ```) is a compiler message. It
 *   gets the error tint; alone in a paragraph it becomes the `error` block.
 * - Callouts: a blockquote starting with **Note**, **Not supported yet** or
 *   **Planned** becomes a cyan, orange or violet callout with that label.
 *
 * New content can use the MDX components instead (`<Callout>`, `<Diagnostic>`).
 */

type Node = {
    type: string;
    value?: string;
    depth?: number;
    ordered?: boolean | null;
    children?: Node[];
    data?: { hName?: string; hProperties?: Record<string, unknown> };
};

/** About three lines of 700px body text. */
export const TERM_MIN_CHARS = 280;

const CALLOUTS: Record<string, string> = { note: 'note', 'not supported yet': 'unsupported', planned: 'planned' };

const textOf = (n: Node): string => (n.value ?? '') + (n.children ?? []).map(textOf).join('');

/** `**Term**:` or `**Term:**` at the start of a list item's first paragraph. */
function termOf(item: Node): { term: Node[]; rest: Node[] } | undefined {
    const para = item.children?.[0];
    if (para?.type !== 'paragraph') return;
    const [strong, next, ...after] = para.children ?? [];
    if (strong?.type !== 'strong' || !strong.children?.length) return;
    const term = structuredClone(strong.children);
    const last = term[term.length - 1];
    if (last.type === 'text' && /:\s*$/.test(last.value ?? '')) {
        last.value = last.value!.replace(/:\s*$/, '');
        return { term, rest: [next, ...after].filter(Boolean) as Node[] };
    }
    if (next?.type === 'text' && /^:\s*/.test(next.value ?? '')) {
        const value = next.value!.replace(/^:\s*/, '');
        return { term, rest: value ? [{ ...next, value }, ...after] : after };
    }
}

/** Drops leading whitespace and upper-cases the first letter of the text that follows a label. */
const capitalize = (nodes: Node[]) => {
    const first = nodes[0];
    if (first?.type === 'text' && first.value) {
        const value = first.value.trimStart();
        first.value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    return nodes;
};

/** Splits a list around its long term items: list, h3 + text, list, … */
function splitList(list: Node): Node[] | undefined {
    if (list.ordered) return;
    const out: Node[] = [];
    let run: Node[] = [];
    let changed = false;
    const flush = () => {
        if (run.length) out.push({ ...list, children: run });
        run = [];
    };
    for (const item of list.children ?? []) {
        const t = textOf(item).length > TERM_MIN_CHARS ? termOf(item) : undefined;
        if (!t) {
            run.push(item);
            continue;
        }
        changed = true;
        flush();
        out.push({ type: 'heading', depth: 3, children: t.term });
        const [, ...blocks] = item.children!;
        if (t.rest.length) out.push({ type: 'paragraph', children: capitalize(t.rest) });
        out.push(...blocks);
    }
    flush();
    return changed ? out : undefined;
}

const isDiag = (n: Node) => n.type === 'inlineCode' && (n.value ?? '').includes('`');

function markDiagnostics(node: Node) {
    for (const child of node.children ?? []) {
        if (isDiag(child)) child.data ??= { hProperties: { className: ['diag'] } };
        else markDiagnostics(child);
    }
}

/** A paragraph that is one diagnostic (plus punctuation) renders as the error block. */
function diagnosticBlock(para: Node): Node | undefined {
    const kids = (para.children ?? []).filter((c) => !(c.type === 'text' && /^[\s.,;:]*$/.test(c.value ?? '')));
    if (kids.length !== 1 || !isDiag(kids[0])) return;
    return {
        type: 'paragraph',
        data: { hName: 'div', hProperties: { className: ['diag-block'] } },
        children: [
            { type: 'emphasis', data: { hName: 'span', hProperties: { className: ['diag-label'] } }, children: [{ type: 'text', value: 'error' }] },
            { type: 'inlineCode', value: kids[0].value, data: { hName: 'span', hProperties: { className: ['diag-text'] } } },
        ],
    };
}

function calloutOf(quote: Node): Node | undefined {
    const para = quote.children?.[0];
    const strong = para?.children?.[0];
    if (para?.type !== 'paragraph' || strong?.type !== 'strong') return;
    const label = textOf(strong).replace(/[:.]\s*$/, '').trim();
    const kind = CALLOUTS[label.toLowerCase()];
    if (!kind) return;
    const rest = (para.children ?? []).slice(1);
    if (rest[0]?.type === 'text') rest[0] = { ...rest[0], value: rest[0].value!.replace(/^[\s:.]+/, '') };
    const body = [...(rest.length && textOf({ type: 'x', children: rest }).trim() ? [{ ...para, children: capitalize(rest) }] : []), ...quote.children!.slice(1)];
    return {
        type: 'blockquote',
        data: { hName: 'div', hProperties: { role: 'note', className: ['callout', `callout-${kind}`] } },
        children: [{ type: 'paragraph', data: { hName: 'span', hProperties: { className: ['callout-label'] } }, children: [{ type: 'text', value: label }] }, ...body],
    };
}

export function remarkReference() {
    return (tree: Node) => {
        const kids = tree.children ?? [];
        for (let i = 0; i < kids.length; i++) {
            const n = kids[i];
            if (n.type === 'list') {
                const parts = splitList(n);
                if (parts) {
                    kids.splice(i, 1, ...parts);
                    i += parts.length - 1;
                }
            }
        }
        const walk = (node: Node) => {
            const list = node.children ?? [];
            for (let i = 0; i < list.length; i++) {
                const n = list[i];
                if (n.type === 'paragraph') {
                    const block = diagnosticBlock(n);
                    if (block) {
                        list[i] = block;
                        continue;
                    }
                }
                if (n.type === 'blockquote') list[i] = calloutOf(n) ?? n;
                walk(list[i]);
            }
        };
        walk(tree);
        markDiagnostics(tree);
    };
}
