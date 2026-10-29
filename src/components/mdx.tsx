/**
 * Components for docs pages. Import what a page uses at the top of the MDX:
 *
 *   import { Callout, Cards, Card } from '@/components/mdx';
 *
 *   <Callout>New to this? Read [Memory without a GC](/docs/book/memory/).</Callout>
 *   <Callout kind="warn" title="Planned">Weak fields are not in yet.</Callout>
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
    tip: { box: 'border-[#1D3A2E] bg-[#0C1512]', icon: '#3DDC97' },
    warn: { box: 'border-[#3F2A1A] bg-[#17110C]', icon: '#FF9F5A' },
} as const;

export const Callout = component<{ kind?: keyof typeof CALLOUTS; title?: string }>(({ props, slots }) => () => {
    const k = CALLOUTS[props.kind ?? 'info'];
    return (
        <div role="note" class={`not-prose flex gap-3.5 rounded-xl border px-[18px] py-4 text-[15px] ${k.box}`}>
            {props.kind === 'warn' ? (
                <WarnIcon size={20} stroke={2} color={k.icon} cls="mt-[3px] flex-none" />
            ) : (
                <InfoIcon size={20} stroke={2} color={k.icon} cls="mt-[3px] flex-none" />
            )}
            <div class="callout-body flex min-w-0 flex-col gap-2 text-fg-2">
                {props.title && <strong class="text-fg">{props.title}</strong>}
                <div class="callout-text">{slots.default?.()}</div>
            </div>
        </div>
    );
}, { name: 'Callout' });

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
