/**
 * Components for docs pages. Import what a page uses at the top of the MDX:
 *
 *   import { Callout, Cards, Card, Diagnostic } from '@/components/mdx';
 *
 *   <Callout>New to this? Read [Memory without a GC](/docs/book/memory/).</Callout>
 *   <Callout kind="unsupported">Weak fields.</Callout>       (also "planned", "note", "warn" + title)
 *   <Diagnostic>`x` is private</Diagnostic>
 *
 *   <Cards>
 *     <Card eyebrow="Single owner" color="green" title="Moved">No count, no overhead.</Card>
 *   </Cards>
 *
 * Diagrams: a ```mermaid fence renders as a diagram (@sigx/mermaid).
 * All of these are static: they ship no JavaScript.
 */
import { component } from 'sigx';
import { InfoIcon, WarnIcon } from './Icons';

const CALLOUTS = {
    info: { box: 'border-[#1E3346] bg-[#0F1420]', icon: '#5FE1F7' },
    note: { box: 'border-[#1E3346] bg-[#0F1420]', icon: '#5FE1F7' },
    tip: { box: 'border-[#1D3A2E] bg-[#0C1512]', icon: '#3DDC97' },
    warn: { box: 'border-[#3F2A1A] bg-[#17110C]', icon: '#FF9F5A' },
    unsupported: { box: 'border-[#3F2A1A] bg-[#17110C]', icon: '#FF9F5A' },
    planned: { box: 'border-[#2E2A5C] bg-[#12101F]', icon: '#A592FF' },
} as const;

/** Labels the kinds get when no `title` is given. */
const LABELS: Partial<Record<keyof typeof CALLOUTS, string>> = { unsupported: 'Not supported yet', planned: 'Planned' };

/**
 * A note in the text. With a title (or kind="unsupported" / "planned") it is the reference
 * pages' labelled callout (design/Ref.dc.html): the label on top in the kind's color.
 * Without one, an icon and the text (design/Docs.dc.html).
 */
export const Callout = component<{ kind?: keyof typeof CALLOUTS; title?: string }>(({ props, slots }) => () => {
    const kind = props.kind ?? 'info';
    const k = CALLOUTS[kind];
    const title = props.title ?? LABELS[kind];
    if (title) {
        return (
            <div role="note" class={`callout callout-${kind === 'info' ? 'note' : kind}`}>
                <span class="callout-label">{title}</span>
                <div class="callout-text">{slots.default?.()}</div>
            </div>
        );
    }
    return (
        <div role="note" class={`not-prose flex max-w-[700px] gap-3.5 rounded-xl border px-[18px] py-4 text-[15px] ${k.box}`}>
            {kind === 'warn' || kind === 'unsupported' ? (
                <WarnIcon size={20} stroke={2} color={k.icon} cls="mt-[3px] flex-none" />
            ) : (
                <InfoIcon size={20} stroke={2} color={k.icon} cls="mt-[3px] flex-none" />
            )}
            <div class="callout-body flex min-w-0 flex-col gap-2 text-fg-2">
                <div class="callout-text">{slots.default?.()}</div>
            </div>
        </div>
    );
}, { name: 'Callout' });

/**
 * A compiler message on its own line (design/Ref.dc.html's `error` block):
 *
 *   <Diagnostic>`x` is private</Diagnostic>
 *   <Diagnostic level="note">expected i64, found string</Diagnostic>
 */
export const Diagnostic = component<{ level?: 'error' | 'warning' | 'note' }>(({ props, slots }) => () => (
    <div class={`diag-block diag-${props.level ?? 'error'}`}>
        <span class="diag-label">{props.level ?? 'error'}</span>
        <span class="diag-text">{slots.default?.()}</span>
    </div>
), { name: 'Diagnostic' });

export const Cards = component(({ slots }) => () => (
    <div class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">{slots.default?.()}</div>
), { name: 'Cards' });

const COLORS = { green: 'text-green', violet: 'text-violet', orange: 'text-orange', cyan: 'text-cyan', pink: 'text-pink', yellow: 'text-yellow' } as const;

export const Card = component<{ title: string; eyebrow?: string; color?: keyof typeof COLORS; href?: string }>(({ props, slots }) => () => {
    const body = (
        <>
            {props.eyebrow && <span class={`font-mono text-xs uppercase ${COLORS[props.color ?? 'cyan']}`}>{props.eyebrow}</span>}
            <strong class="font-semibold text-fg">{props.title}</strong>
            <span class="card-body text-sm text-fg-3">{slots.default?.()}</span>
        </>
    );
    const cls = 'flex flex-col gap-1.5 rounded-xl border border-card-line bg-card p-[18px]';
    return props.href ? <a href={props.href} class={`${cls} hover:border-line-3`}>{body}</a> : <div class={cls}>{body}</div>;
}, { name: 'Card' });
