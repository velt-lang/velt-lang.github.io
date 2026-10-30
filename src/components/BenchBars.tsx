/** One benchmark's horizontal bars, Velt in the accent color. The home tabs and /benchmarks/ share it. */
import { component } from 'sigx';
import type { Benchmark } from '../data/benchmarks';

export const BenchBars = component<{ bench: Benchmark }>(({ props }) => () => {
    const b = props.bench;
    const max = Math.max(...b.rows.map((r) => r.value));
    return (
        <div class="flex flex-col gap-2.5">
            {b.rows.map((r) => {
                const velt = r.name === 'Velt';
                return (
                    <div key={`${b.id}-${r.name}`} class="flex items-center gap-3.5 text-sm">
                        <span class={`w-28 flex-none ${velt ? 'font-semibold text-fg' : 'text-fg-3'}`}>{r.name}</span>
                        <div class="h-[26px] min-w-0 flex-auto overflow-hidden rounded-md bg-[#15151F]" aria-hidden="true">
                            <div class={`h-full rounded-md ${velt ? 'bg-accent' : 'bg-[#3A3A4C]'}`} style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
                        </div>
                        <span class={`w-[72px] flex-none text-right font-mono text-[13px] ${velt ? 'text-fg' : 'text-fg-3'}`}>{r.label}</span>
                    </div>
                );
            })}
        </div>
    );
}, { name: 'BenchBars' });
