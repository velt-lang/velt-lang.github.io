/**
 * The "Beyond TypeScript" explorer (design/Beyond.dc.html): area tabs, the
 * area's feature pills, and the selected feature's code, explanation,
 * TypeScript comparison and docs link. Data: src/data/beyond.ts, passed as
 * props. The server renders the first area's first feature, so the page reads
 * without JS. The tabs are a column from 1024px and a scrolling row below.
 */
import { component } from 'sigx';
import { hl } from '../components/Hl';
import { NEW_IN, TONE, ticks, type Area } from '../data/beyond';

/** Prose with `inline code`. */
export const prose = (text: string): (string | JSX.Element)[] => ticks(text).map((p, i) => (p.code ? <code key={i} class="c text-[0.9em]">{p.text}</code> : p.text));

/** The "new in 0.6" badge. */
export function newBadge(small = false): JSX.Element {
    return (
        <span class={`flex-none rounded-full border border-[#1D3A2E] bg-[#0C1512] text-[11px] font-semibold leading-[1.6] text-green ${small ? 'px-[7px]' : 'px-2'}`}>
            <span class="sr-only">New in </span>
            {NEW_IN}
        </span>
    );
}

/** A stroked icon from one SVG path on a 24×24 grid. */
export function pathIcon(d: string, size = 18): JSX.Element {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d={d} />
        </svg>
    );
}

/** A code window with the design's three dots, a file name and an optional badge. */
export function codeWindow(file: string, code: string, badge?: string): JSX.Element {
    return (
        <div class="min-w-0 overflow-hidden rounded-2xl border border-line-2 bg-bg-header">
            <div class="flex items-center gap-2 border-b border-line px-4 py-2.5">
                <span class="size-2.5 flex-none rounded-full bg-line-3" />
                <span class="size-2.5 flex-none rounded-full bg-line-3" />
                <span class="size-2.5 flex-none rounded-full bg-line-3" />
                <span class="ml-2 min-w-0 truncate font-mono text-xs text-fg-3">{file}</span>
                {badge && (
                    <span class="ml-auto flex-none rounded-full border border-cyan/25 bg-cyan/8 px-2 text-[11px] font-semibold leading-[1.6] text-cyan">{badge}</span>
                )}
            </div>
            <pre class="overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.7] text-fg sm:text-[13.5px]">{hl(code)}</pre>
        </div>
    );
}

/**
 * Arrow keys (and Home/End) move between tabs, selecting as they go:
 * `select` gets the new tab's id and the focus moves to `[data-tab="<id>"]`.
 */
export function tabKeys(ids: () => string[], current: () => string, select: (id: string) => void) {
    return (e: KeyboardEvent) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const list = ids();
        const i = list.indexOf(current());
        const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        let next: number;
        if (step) next = (i + step + list.length) % list.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = list.length - 1;
        else return;
        e.preventDefault();
        select(list[next]);
        (e.currentTarget as HTMLElement).querySelector<HTMLElement>(`[data-tab="${list[next]}"]`)?.focus();
    };
}

export const BeyondExplorer = component<{ areas: Area[] }>(({ props, signal, onMounted, onUnmounted }) => {
    const state = signal({ area: props.areas[0].id, feat: 0, vertical: true });
    let mq: MediaQueryList | null = null;
    const onMq = () => (state.vertical = !!mq?.matches);

    onMounted(() => {
        mq = window.matchMedia('(min-width: 1024px)');
        onMq();
        mq.addEventListener('change', onMq);
    });
    onUnmounted(() => mq?.removeEventListener('change', onMq));

    const pick = (id: string) => {
        if (id === state.area) return;
        state.area = id;
        state.feat = 0;
    };
    const onKey = tabKeys(() => props.areas.map((a) => a.id), () => state.area, pick);

    return () => {
        const area = props.areas.find((a) => a.id === state.area) ?? props.areas[0];
        const fi = Math.min(state.feat, area.features.length - 1);
        const f = area.features[fi];
        const tone = TONE[area.tone];
        return (
            <div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
                <div
                    role="tablist"
                    aria-label="Areas"
                    aria-orientation={state.vertical ? 'vertical' : 'horizontal'}
                    onKeydown={onKey}
                    class="no-scrollbar relative -mx-6 flex gap-1.5 overflow-x-auto px-6 lg:mx-0 lg:w-[280px] lg:flex-none lg:flex-col lg:overflow-visible lg:px-0"
                >
                    {props.areas.map((a) => {
                        const sel = a.id === area.id;
                        const items = [...a.features, ...a.more];
                        return (
                            <button
                                key={a.id}
                                type="button"
                                role="tab"
                                id={`beyond-tab-${a.id}`}
                                data-tab={a.id}
                                aria-selected={sel ? 'true' : 'false'}
                                aria-controls="beyond-panel"
                                tabIndex={sel ? 0 : -1}
                                onClick={() => pick(a.id)}
                                class={`flex min-h-[60px] flex-none items-center gap-3.5 rounded-[14px] border px-3.5 py-2.5 text-left text-fg ${sel ? 'border-violet/25 bg-chip' : 'border-transparent bg-transparent hover:bg-input'}`}
                            >
                                <span class={`grid size-9 flex-none place-items-center rounded-[10px] ${TONE[a.tone].tint} ${TONE[a.tone].text}`}>
                                    {pathIcon(a.icon)}
                                </span>
                                <span class="flex flex-auto flex-col whitespace-nowrap leading-[1.3] lg:whitespace-normal">
                                    <span class="text-[15px] font-semibold">{a.title}</span>
                                    <span class="text-[13px] text-muted">{items.length} features</span>
                                </span>
                                {items.some((x) => x.isNew) && newBadge()}
                            </button>
                        );
                    })}
                </div>

                <div
                    role="tabpanel"
                    id="beyond-panel"
                    aria-labelledby={`beyond-tab-${area.id}`}
                    class="flex min-w-0 flex-auto flex-col gap-5 rounded-3xl border border-line-2 bg-surface p-[clamp(20px,3vw,32px)]"
                >
                    <div class="flex flex-col gap-2">
                        <span class={`font-mono text-xs uppercase tracking-[0.08em] ${tone.text}`}>{area.title}</span>
                        <h3 class="m-0 font-display text-[clamp(24px,2.6vw,32px)] font-bold leading-[1.15] tracking-[-0.02em]">{area.pitch}</h3>
                    </div>

                    <div role="group" aria-label={`${area.title}: features`} class="flex flex-wrap gap-2">
                        {area.features.map((x, i) => {
                            const on = i === fi;
                            return (
                                <button
                                    key={x.name}
                                    type="button"
                                    aria-pressed={on ? 'true' : 'false'}
                                    onClick={() => (state.feat = i)}
                                    class={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium ${on ? 'border-fg bg-fg text-bg' : 'border-line-3 bg-transparent text-fg-3 hover:text-fg'}`}
                                >
                                    {x.name}
                                    {x.isNew && newBadge(true)}
                                </button>
                            );
                        })}
                    </div>

                    <div class="flex flex-wrap items-start gap-5">
                        <div class="min-w-0 flex-[999_1_400px]">
                            {codeWindow(f.file, f.code)}
                        </div>
                        <div class="flex min-w-0 flex-[1_1_240px] flex-col gap-3.5">
                            <p class="m-0 text-fg-2">{prose(f.what)}</p>
                            <div class="flex flex-col gap-1.5 rounded-xl border border-line bg-input px-4 py-3.5 text-sm">
                                <span class="text-xs font-semibold uppercase tracking-[0.06em] text-dim">In TypeScript</span>
                                <span class="text-fg-3">{prose(f.ts)}</span>
                            </div>
                            <a href={f.href} class="inline-flex min-h-11 items-center self-start font-medium text-cyan hover:text-cyan-hover">
                                {f.link} →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}, { name: 'BeyondExplorer' });
