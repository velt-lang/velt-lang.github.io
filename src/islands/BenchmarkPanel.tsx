/** The tabbed benchmark panel. Data: src/data/benchmarks.ts. */
import { component } from 'sigx';
import { BENCHMARKS } from '../data/benchmarks';

/** Split a note ending in "bench/web." so the bench folder links to its results. */
function noteParts(note: string) {
    const m = note.match(/^(.*?)(bench\/\w+)\.?$/);
    return m ? { before: m[1], dir: m[2] } : { before: `${note} `, dir: 'Method and raw data' };
}

export const BenchmarkPanel = component(({ signal }) => {
    const state = signal({ id: BENCHMARKS[0].id });

    const onKey = (e: KeyboardEvent) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const i = BENCHMARKS.findIndex((b) => b.id === state.id);
        const next = BENCHMARKS[(i + (e.key === 'ArrowRight' ? 1 : BENCHMARKS.length - 1)) % BENCHMARKS.length];
        state.id = next.id;
        (e.currentTarget as HTMLElement).querySelector<HTMLElement>(`[data-bench="${next.id}"]`)?.focus();
    };

    return () => {
        const b = BENCHMARKS.find((x) => x.id === state.id)!;
        const max = Math.max(...b.rows.map((r) => r.value));
        return (
            <div class="min-w-0 flex-[1.5_1_560px] overflow-hidden rounded-2xl border border-line-2 bg-surface">
                <div role="tablist" aria-label="Benchmark" class="no-scrollbar flex gap-1 overflow-x-auto border-b border-line p-2" onKeydown={onKey}>
                    {BENCHMARKS.map((t) => {
                        const sel = t.id === state.id;
                        return (
                            <button
                                key={t.id}
                                type="button"
                                role="tab"
                                id={`bench-tab-${t.id}`}
                                data-bench={t.id}
                                aria-selected={sel ? 'true' : 'false'}
                                aria-controls="bench-panel"
                                tabIndex={sel ? 0 : -1}
                                onClick={() => (state.id = t.id)}
                                class={`min-h-10 flex-none whitespace-nowrap rounded-[9px] border-0 px-3.5 text-sm font-medium ${sel ? 'bg-tab text-fg' : 'bg-transparent text-muted hover:text-fg'}`}
                            >
                                {t.tab}
                            </button>
                        );
                    })}
                </div>
                <div role="tabpanel" id="bench-panel" aria-labelledby={`bench-tab-${b.id}`} class="flex flex-col gap-[18px] px-6 pb-5 pt-6">
                    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <strong class="font-display text-[19px] font-semibold">{b.title}</strong>
                        <span class="text-[13px] text-muted">{b.unit}</span>
                    </div>
                    <div class="flex flex-col gap-2.5">
                        {b.rows.map((r) => {
                            const velt = r.name === 'Velt';
                            return (
                                <div key={`${b.id}-${r.name}`} class="flex items-center gap-3.5 text-sm">
                                    <span class={`w-28 flex-none ${velt ? 'font-semibold text-fg' : 'text-fg-3'}`}>{r.name}</span>
                                    <div class="h-[26px] min-w-0 flex-auto overflow-hidden rounded-md bg-[#15151F]" aria-hidden="true">
                                        <div
                                            class={`h-full rounded-md ${velt ? 'bg-accent' : 'bg-[#3A3A4C]'}`}
                                            style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }}
                                        />
                                    </div>
                                    <span class={`w-[72px] flex-none text-right font-mono text-[13px] ${velt ? 'text-fg' : 'text-fg-3'}`}>{r.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    <p class="m-0 border-t border-line pt-3 text-[13px] text-muted">
                        {noteParts(b.note).before}
                        <a href={`https://github.com/velt-lang/velt/blob/main/${b.source}`} class="text-muted hover:text-cyan">
                            {noteParts(b.note).dir}
                        </a>
                        .
                    </p>
                </div>
            </div>
        );
    };
}, { name: 'BenchmarkPanel' });
