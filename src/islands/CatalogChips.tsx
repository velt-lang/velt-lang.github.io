/**
 * The std catalog's category chips: a chip shows only its section. The
 * sections are static HTML (`[data-cat]`); without JS all of them show.
 */
import { component } from 'sigx';

export const CatalogChips = component<{ chips: { id: string; label: string; count: number }[] }>(({ props, signal }) => {
    const state = signal({ cat: 'all' });
    const pick = (id: string) => {
        state.cat = id;
        for (const el of document.querySelectorAll<HTMLElement>('[data-cat]')) el.hidden = id !== 'all' && el.dataset.cat !== id;
    };
    return () => (
        <div role="group" aria-label="Filter by category" class="no-scrollbar flex gap-2 overflow-x-auto min-[640px]:flex-wrap">
            {props.chips.map((c) => {
                const sel = c.id === state.cat;
                return (
                    <button
                        key={c.id}
                        type="button"
                        aria-pressed={sel ? 'true' : 'false'}
                        onClick={() => pick(c.id)}
                        class={`inline-flex min-h-9 flex-none items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium ${
                            sel ? 'border-[#34304F] bg-tab text-fg' : 'border-line-2 bg-transparent text-fg-3 hover:text-fg'
                        }`}
                    >
                        {c.label}
                        <span class="text-xs text-muted">{c.count}</span>
                    </button>
                );
            })}
        </div>
    );
}, { name: 'CatalogChips' });
