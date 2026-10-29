/**
 * Hand-highlighted code for the home page samples, written with markers so
 * the source stays readable: `[[k:const]] x = [[n:1]];`. Kinds: k keyword,
 * s string, t type, f function, n number, c comment (the design's classes).
 */
import { component } from 'sigx';

const MARK = /\[\[([kstfnc]):([\s\S]*?)\]\]/g;

export function hl(src: string): (string | JSX.Element)[] {
    const out: (string | JSX.Element)[] = [];
    let last = 0;
    let i = 0;
    for (const m of src.matchAll(MARK)) {
        if (m.index! > last) out.push(src.slice(last, m.index));
        out.push(<span key={i++} class={`tk-${m[1]}`}>{m[2]}</span>);
        last = m.index! + m[0].length;
    }
    if (last < src.length) out.push(src.slice(last));
    return out;
}

/** A code window: title bar and highlighted body (static). */
export const CodeCard = component<{ title: string; code: string; right?: string; size?: 'sm' | 'md'; lineHeight?: number; footer?: boolean }>(
    ({ props, slots }) => () => (
        <div class="min-w-0 flex-auto overflow-hidden rounded-2xl border border-line-2 bg-surface">
            <div class="border-b border-line px-[18px] py-3 font-mono text-[13px] text-fg-3">{props.title}</div>
            <pre
                class="overflow-x-auto px-[22px] py-5 font-mono text-fg"
                style={{ fontSize: props.size === 'md' ? '14px' : '13.5px', lineHeight: String(props.lineHeight ?? 1.7) }}
            >
                {hl(props.code)}
            </pre>
            {slots.default?.()}
        </div>
    ),
    { name: 'CodeCard' },
);
