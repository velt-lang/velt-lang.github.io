/**
 * Doc comment Markdown (the `doc` and tag texts of `velt doc --format json`)
 * rendered to static markup at build time: paragraphs, lists, inline code,
 * emphasis, links and fenced code (highlighted like the rest of the docs).
 */
import { component } from 'sigx';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { CodeBlock } from './CodeBlock';

type MdNode = {
    type: string;
    value?: string;
    url?: string;
    lang?: string | null;
    ordered?: boolean | null;
    depth?: number;
    children?: MdNode[];
};

/** Doc links are written for velt's own docs; send relative ones to the velt repo. */
const href = (url: string) => (/^(https?:|mailto:|\/|#)/.test(url) ? url : `https://github.com/velt-lang/velt/blob/main/${url}`);

function inline(nodes: MdNode[] | undefined): (string | JSX.Element)[] {
    return (nodes ?? []).map((n, i): string | JSX.Element => {
        switch (n.type) {
            case 'text':
                return n.value ?? '';
            case 'inlineCode':
                return <code key={i}>{n.value}</code>;
            case 'emphasis':
                return <em key={i}>{inline(n.children)}</em>;
            case 'strong':
                return <strong key={i}>{inline(n.children)}</strong>;
            case 'link':
                return <a key={i} href={href(n.url ?? '')}>{inline(n.children)}</a>;
            case 'break':
                return <br key={i} />;
            default:
                return n.value ?? '';
        }
    });
}

function block(nodes: MdNode[] | undefined): JSX.Element[] {
    return (nodes ?? []).map((n, i) => {
        switch (n.type) {
            case 'paragraph':
                return <p key={i}>{inline(n.children)}</p>;
            case 'list':
                return n.ordered ? (
                    <ol key={i}>{(n.children ?? []).map((li, j) => <li key={j}>{block(li.children)}</li>)}</ol>
                ) : (
                    <ul key={i}>{(n.children ?? []).map((li, j) => <li key={j}>{block(li.children)}</li>)}</ul>
                );
            case 'code':
                return <CodeBlock key={i} code={n.value ?? ''} lang={n.lang ?? 'ts'} />;
            case 'blockquote':
                return <blockquote key={i}>{block(n.children)}</blockquote>;
            case 'heading':
                return <p key={i}><strong>{inline(n.children)}</strong></p>;
            default:
                return <p key={i}>{inline(n.children) ?? n.value}</p>;
        }
    });
}

/** Block Markdown: the doc text of an export or a module. */
export const DocText = component<{ md: string; class?: string }>(({ props }) => () => (
    <div class={`api-doc ${props.class ?? ''}`}>{block(fromMarkdown(props.md).children as MdNode[])}</div>
), { name: 'DocText' });

/** One paragraph of Markdown inline, for table cells and tag texts. */
export const DocInline = component<{ md: string }>(({ props }) => () => {
    const root = fromMarkdown(props.md).children as MdNode[];
    return <>{root.length === 1 && root[0].type === 'paragraph' ? inline(root[0].children) : block(root)}</>;
}, { name: 'DocInline' });
