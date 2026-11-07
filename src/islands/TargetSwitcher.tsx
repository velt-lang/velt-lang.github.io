/**
 * The "Run anywhere" target switcher (design/Wasm.dc.html): a tab per target,
 * and the selected target's code cards, headline, facts and docs link. Data:
 * src/data/targets.ts, passed as props. The server renders the default target
 * (Cloudflare Workers), so the page reads without JS. The tabs are a scrolling
 * row on phones, two columns from 640px and one row of four from 1024px.
 */
import { component } from 'sigx';
import { TONE } from '../data/beyond';
import type { Target } from '../data/targets';
import { codeWindow, newBadge, pathIcon, prose, tabKeys } from './BeyondExplorer';

export const TargetSwitcher = component<{ targets: Target[]; initial: string }>(({ props, signal, onMounted }) => {
    const state = signal({ id: props.initial });
    let row: HTMLElement | null = null;

    // On a phone the row scrolls: bring the selected tab into view without moving the page.
    onMounted(() => {
        const sel = row?.querySelector<HTMLElement>('[aria-selected="true"]');
        if (!row || !sel || row.scrollWidth <= row.clientWidth) return;
        row.scrollLeft += sel.getBoundingClientRect().left - row.getBoundingClientRect().left - 24;
    });

    const onKey = tabKeys(() => props.targets.map((t) => t.id), () => state.id, (id) => (state.id = id));

    return () => {
        const cur = props.targets.find((t) => t.id === state.id) ?? props.targets[0];
        const tone = TONE[cur.tone];
        return (
            <div class="flex flex-col gap-5">
                <div
                    ref={(el: HTMLElement) => (row = el)}
                    role="tablist"
                    aria-label="Targets"
                    onKeydown={onKey}
                    class="no-scrollbar relative -mx-6 flex gap-3 overflow-x-auto px-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
                >
                    {props.targets.map((t) => {
                        const sel = t.id === cur.id;
                        const tt = TONE[t.tone];
                        return (
                            <button
                                key={t.id}
                                type="button"
                                role="tab"
                                id={`target-tab-${t.id}`}
                                data-tab={t.id}
                                aria-selected={sel ? 'true' : 'false'}
                                aria-controls="target-panel"
                                tabIndex={sel ? 0 : -1}
                                onClick={() => (state.id = t.id)}
                                class={`flex min-h-[120px] w-[264px] flex-none flex-col items-start gap-2 rounded-[18px] border px-5 py-[18px] text-left text-fg sm:w-auto ${sel ? `bg-input ${tt.border}` : 'border-card-line bg-bg-raised hover:border-line-3'}`}
                            >
                                <span class="flex w-full items-center gap-2.5">
                                    <span class={`grid size-[34px] flex-none place-items-center rounded-[10px] ${tt.tint} ${tt.text}`}>{pathIcon(t.icon)}</span>
                                    <span class="flex-auto font-display text-lg font-semibold leading-[1.25]">{t.name}</span>
                                    {t.isNew && newBadge()}
                                </span>
                                <span class="text-sm text-muted">{t.runs}</span>
                                <span class={`font-mono text-xs ${tt.text}`}>{t.triple}</span>
                            </button>
                        );
                    })}
                </div>

                <div role="tabpanel" id="target-panel" aria-labelledby={`target-tab-${cur.id}`} class="flex flex-wrap items-stretch gap-5">
                    <div class="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
                        {cur.cards.map((c) => (
                            <div key={c.file}>{codeWindow(c.file, c.code, c.same ? 'unchanged' : undefined)}</div>
                        ))}
                    </div>
                    <div class="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 rounded-[18px] border border-line-2 bg-surface p-6">
                        <span class={`font-mono text-xs uppercase tracking-[0.08em] ${tone.text}`}>{cur.name}</span>
                        <h3 class="m-0 font-display text-2xl font-bold leading-[1.2] tracking-[-0.01em]">{cur.headline}</h3>
                        <p class="m-0 text-[15px] text-fg-2">{prose(cur.body)}</p>
                        <ul class="m-0 flex list-none flex-col gap-2 p-0 text-sm text-fg-3">
                            {cur.facts.map((f) => (
                                <li key={f} class="flex items-baseline gap-2.5">
                                    <span class={`size-1.5 flex-none -translate-y-0.5 rounded-full ${tone.dot}`} />
                                    <span>{prose(f)}</span>
                                </li>
                            ))}
                        </ul>
                        {cur.chips && cur.chips.length > 0 && (
                            <ul aria-label="Bindings" class="m-0 flex list-none flex-wrap gap-1.5 p-0">
                                {cur.chips.map((c) => (
                                    <li key={c} class="rounded-full border border-[#3F2A1A] bg-[#17110C] px-2.5 py-0.5 text-xs font-semibold text-peach">{c}</li>
                                ))}
                            </ul>
                        )}
                        <a href={cur.href} class="mt-auto inline-flex min-h-11 items-center self-start font-medium text-cyan hover:text-cyan-hover">
                            {cur.link} →
                        </a>
                    </div>
                </div>
            </div>
        );
    };
}, { name: 'TargetSwitcher' });
