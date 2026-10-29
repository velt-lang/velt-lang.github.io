/**
 * The docs search box. The index (`search-index.json`, emitted by the build)
 * loads on first focus; ⌘K / Ctrl+K or "/" focuses the box from anywhere.
 */
import { component } from 'sigx';
import { loadSearchIndex, searchPages } from '@sigx/ssg/client';
import { SearchIcon } from '../components/Icons';

type Result = { href: string; title: string; excerpt?: string; section: string };

const SECTIONS: [string, string][] = [
    ['/docs/book/', 'Book'],
    ['/docs/reference/', 'Reference'],
    ['/docs/std/', 'Standard library'],
    ['/docs/tooling/', 'Tooling'],
];
const sectionOf = (path: string) => SECTIONS.find(([p]) => path.startsWith(p))?.[1] ?? 'Docs';

export const DocsSearch = component(({ signal, onMounted, onUnmounted }) => {
    const state = signal({ query: '', open: false, active: 0, results: [] as Result[], mac: true });
    let index: Awaited<ReturnType<typeof loadSearchIndex>> | null = null;
    let input: HTMLInputElement | null = null;

    const ensureIndex = async () => {
        index ??= await loadSearchIndex();
        return index;
    };

    const run = async () => {
        const q = state.query.trim();
        if (!q) {
            state.results = [];
            return;
        }
        const idx = await ensureIndex();
        if (q !== state.query.trim()) return;
        state.results = searchPages(idx, q, { limit: 8 }).map((r) => ({
            href: r.anchor ? r.path + r.anchor : r.path,
            title: r.title.replace(/ — Velt( docs)?$/, ''),
            excerpt: r.excerpt,
            section: sectionOf(r.path),
        }));
        state.active = 0;
        state.open = true;
    };

    const onKey = (e: KeyboardEvent) => {
        const n = state.results.length;
        if (e.key === 'ArrowDown' && n) {
            e.preventDefault();
            state.active = (state.active + 1) % n;
        } else if (e.key === 'ArrowUp' && n) {
            e.preventDefault();
            state.active = (state.active + n - 1) % n;
        } else if (e.key === 'Enter' && n) {
            e.preventDefault();
            location.href = state.results[state.active].href;
        } else if (e.key === 'Escape') {
            state.open = false;
            input?.blur();
        }
    };

    const global = (e: KeyboardEvent) => {
        const typing = (e.target as HTMLElement)?.closest?.('input, textarea, [contenteditable]');
        if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
            e.preventDefault();
            input?.focus();
        }
    };
    const outside = (e: Event) => {
        if (!(e.target as HTMLElement)?.closest?.('[data-docs-search]')) state.open = false;
    };

    onMounted(() => {
        state.mac = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
        document.addEventListener('keydown', global);
        document.addEventListener('pointerdown', outside);
    });
    onUnmounted(() => {
        document.removeEventListener('keydown', global);
        document.removeEventListener('pointerdown', outside);
    });

    return () => (
        <div data-docs-search class="relative max-w-[520px] flex-[1_1_280px]">
            <label class="flex min-h-11 items-center gap-2.5 rounded-[10px] border border-line-2 bg-input px-3.5 text-muted focus-within:border-line-3">
                <SearchIcon size={16} stroke={2} />
                <span class="sr-only">Search the docs</span>
                <input
                    ref={(el: HTMLInputElement) => (input = el)}
                    type="search"
                    placeholder="Search the docs"
                    autoComplete="off"
                    spellCheck={false}
                    role="combobox"
                    aria-expanded={state.open && state.query ? 'true' : 'false'}
                    aria-controls="docs-search-results"
                    aria-autocomplete="list"
                    value={state.query}
                    onInput={(e: Event) => {
                        state.query = (e.target as HTMLInputElement).value;
                        void run();
                    }}
                    onFocus={() => {
                        void ensureIndex();
                        if (state.query) state.open = true;
                    }}
                    onKeydown={onKey}
                    class="min-w-0 flex-auto border-0 bg-transparent text-sm text-fg outline-none placeholder:text-muted focus-visible:outline-none"
                />
                <kbd class="rounded-[5px] border border-line-3 px-1.5 py-0.5 font-mono text-xs text-muted">{state.mac ? '⌘K' : 'Ctrl K'}</kbd>
            </label>
            {state.open && state.query.trim() && (
                <div
                    id="docs-search-results"
                    role="listbox"
                    class="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(70vh,520px)] overflow-y-auto rounded-xl border border-line-3 bg-[#0E0E16] p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
                >
                    {state.results.length === 0 ? (
                        <p class="m-0 px-3 py-3 text-sm text-muted">No pages match “{state.query.trim()}”.</p>
                    ) : (
                        state.results.map((r, i) => (
                            <a
                                key={r.href}
                                href={r.href}
                                role="option"
                                aria-selected={i === state.active ? 'true' : 'false'}
                                onMouseenter={() => (state.active = i)}
                                class={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 ${i === state.active ? 'bg-[#17172A]' : ''}`}
                            >
                                <span class="flex items-baseline justify-between gap-3">
                                    <span class="text-sm font-medium text-fg">{r.title}</span>
                                    <span class="flex-none font-mono text-[11px] uppercase tracking-[0.06em] text-muted">{r.section}</span>
                                </span>
                                {r.excerpt && <span class="line-clamp-2 text-[13px] text-fg-3">{r.excerpt}</span>}
                            </a>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}, { name: 'DocsSearch' });
