/**
 * The search palette (design/Search.dc.html). The header shows a search
 * field that opens a dialog; ⌘K / Ctrl+K or "/" opens it from anywhere.
 * The index loads on first open: the docs pages and their headings
 * (search-index.json) and the compiler messages (errors-index.json).
 */
import { component } from 'sigx';
import { loadSearchIndex } from '@sigx/ssg/client';
import { SearchIcon, SparkIcon } from '../components/Icons';
import { KINDS, buildRecords, highlight, search, type Kind, type SearchRecord } from '../lib/search-records';
import { LLMS_URL, SITE_URL } from '../lib/site';
import type { ErrorRecord } from '../lib/errors-index';

type Filter = 'all' | Kind;
type Row = Pick<SearchRecord, 'kind' | 'title' | 'meta' | 'href' | 'mono'> & { glyph?: string; page?: boolean };

const RECENT_KEY = 'velt-search-recent';

const JUMP: Row[] = [
    { kind: 'book', glyph: '→', title: 'Getting started', meta: 'The book · Install, create a project, run it', href: '/docs/book/getting-started/', mono: false },
    { kind: 'book', glyph: 'TS', title: 'Velt for TypeScript developers', meta: 'The book · Every difference from TypeScript', href: '/docs/book/ts-developers/', mono: false },
    { kind: 'std', title: 'Browse the standard library', meta: 'Std · Every velt: module and the conventions they share', href: '/docs/std/', mono: false },
    { kind: 'ref', title: 'Language reference', meta: 'Reference · Types, functions, classes, memory, modules', href: '/docs/reference/', mono: false },
];

let records: Promise<SearchRecord[]> | undefined;
const loadRecords = () =>
    (records ??= Promise.all([
        loadSearchIndex(),
        fetch('/errors-index.json').then((r) => (r.ok ? (r.json() as Promise<ErrorRecord[]>) : [])).catch(() => []),
    ]).then(([pages, errors]) => buildRecords(pages, errors)));

function readRecent(): Row[] {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as Row[];
    } catch {
        return [];
    }
}
function remember(row: Row) {
    try {
        const list = [row, ...readRecent().filter((r) => r.href !== row.href)].slice(0, 5);
        localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch {
        /* storage blocked: no recents */
    }
}

const tint = (hex: string, a: number) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};
const kbd = 'rounded-[5px] border border-line-3 px-1.5 font-mono text-xs text-fg-3';

export const DocsSearch = component(({ signal, onMounted, onUnmounted }) => {
    const state = signal({
        open: false,
        query: '',
        filter: 'all' as Filter,
        active: 0,
        ready: false,
        mac: true,
        asked: false,
        groups: [] as { kind: Kind; hits: Row[]; total: number }[],
        counts: {} as Partial<Record<Filter, number>>,
        recent: [] as Row[],
    });
    let all: SearchRecord[] = [];
    let input: HTMLInputElement | null = null;
    let trigger: HTMLElement | null = null;
    let list: HTMLElement | null = null;

    const run = () => {
        const q = state.query.trim();
        if (!q) {
            state.groups = [];
            state.counts = {};
            state.active = 0;
            return;
        }
        const groups = search(all, q, state.filter === 'all' ? 5 : 40);
        const counts: Partial<Record<Filter, number>> = { all: 0 };
        for (const g of groups) {
            counts[g.kind] = g.total;
            counts.all! += g.total;
        }
        state.counts = counts;
        state.groups = groups.filter((g) => state.filter === 'all' || g.kind === state.filter);
        state.active = 0;
    };

    /** The rows on screen, in order: results, or Jump to + Recent. */
    const rows = (): Row[] => (state.query.trim() ? state.groups.flatMap((g) => g.hits) : [...JUMP, ...state.recent]);

    const open = async () => {
        if (state.open) return;
        state.recent = readRecent();
        state.open = true;
        document.documentElement.style.overflow = 'hidden';
        requestAnimationFrame(() => input?.focus());
        all = await loadRecords();
        state.ready = true;
        run();
    };
    const close = () => {
        if (!state.open) return;
        state.open = false;
        document.documentElement.style.overflow = '';
        trigger?.focus();
    };
    const go = (row: Row | undefined) => {
        if (!row) return;
        remember({ kind: row.kind, title: row.title, meta: row.meta, href: row.href, mono: row.mono, glyph: row.glyph, page: row.page });
        close();
        location.href = row.href;
    };
    const reveal = () =>
        requestAnimationFrame(() => list?.querySelector<HTMLElement>(`#search-row-${state.active}`)?.scrollIntoView({ block: 'nearest' }));

    const FILTERS = (): Filter[] => ['all', 'book', 'ref', 'std', 'tool', 'err'];
    const onKey = (e: KeyboardEvent) => {
        const n = rows().length;
        if (e.key === 'Escape') {
            e.preventDefault();
            close();
        } else if (e.key === 'ArrowDown' && n) {
            e.preventDefault();
            state.active = (state.active + 1) % n;
            reveal();
        } else if (e.key === 'ArrowUp' && n) {
            e.preventDefault();
            state.active = (state.active + n - 1) % n;
            reveal();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            go(rows()[state.active]);
        } else if (e.key === 'Tab') {
            // Tab moves between the filters; focus stays in the field (the dialog traps it).
            e.preventDefault();
            const f = FILTERS();
            state.filter = f[(f.indexOf(state.filter) + (e.shiftKey ? f.length - 1 : 1)) % f.length];
            run();
        }
    };

    const global = (e: KeyboardEvent) => {
        const typing = (e.target as HTMLElement)?.closest?.('input, textarea, select, [contenteditable]');
        if ((e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !state.open)) {
            e.preventDefault();
            if (state.open) close();
            else void open();
        }
    };

    const ask = async () => {
        const q = state.query.trim();
        const top = rows().filter((r) => r.kind !== 'err').slice(0, 3).map((r) => `${SITE_URL}${r.href.split('#')[0].replace(/\/$/, '')}.md`);
        const prompt = q
            ? `Read ${LLMS_URL}${top.length ? ` and ${[...new Set(top)].join(', ')}` : ''}, then answer my question about Velt: ${q}`
            : `Read ${LLMS_URL} and help me with Velt.`;
        try {
            await navigator.clipboard.writeText(prompt);
            state.asked = true;
            setTimeout(() => (state.asked = false), 1800);
        } catch {
            /* clipboard blocked */
        }
    };

    onMounted(() => {
        state.mac = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
        document.addEventListener('keydown', global);
    });
    onUnmounted(() => {
        document.removeEventListener('keydown', global);
        document.documentElement.style.overflow = '';
    });

    const tile = (row: Row) => {
        const k = KINDS[row.kind];
        // A section of a page shows #; pages and messages their section's glyph.
        const glyph = row.glyph ?? (row.page === false && row.kind !== 'err' ? '#' : k.glyph);
        return (
            <span
                aria-hidden="true"
                class="grid size-9 flex-none place-items-center rounded-[9px] border font-mono text-[13px] font-medium"
                style={{ color: k.color, background: tint(k.color, 0.1), borderColor: tint(k.color, 0.3) }}
            >
                {glyph}
            </span>
        );
    };

    const renderRow = (row: Row, i: number) => {
        const on = i === state.active;
        const k = KINDS[row.kind];
        const [pre, match, post] = state.query.trim() ? highlight(row.title, state.query) : [row.title, '', ''];
        return (
            <a
                key={`${row.href}-${row.title}`}
                id={`search-row-${i}`}
                role="option"
                aria-selected={on ? 'true' : 'false'}
                href={row.href}
                onMouseenter={() => (state.active = i)}
                onClick={(e: MouseEvent) => {
                    e.preventDefault();
                    go(row);
                }}
                class={`flex items-center gap-3.5 rounded-xl border px-3 py-2.5 text-fg hover:text-fg ${on ? 'border-[#34304F] bg-[#1A1830]' : 'border-transparent'}`}
            >
                {tile(row)}
                <span class="flex min-w-0 flex-auto flex-col gap-0.5 leading-[1.4]">
                    <span class={`truncate text-[15px] font-semibold ${row.mono ? 'font-mono text-[14px]' : ''}`}>
                        {pre}
                        {match && (
                            <span class="underline underline-offset-[3px]" style={{ color: k.color, textDecorationColor: k.color }}>
                                {match}
                            </span>
                        )}
                        {post}
                    </span>
                    <span class="truncate text-[13px] text-muted">{row.meta}</span>
                </span>
                {on && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B4B4C8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="flex-none">
                        <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                        <path d="m9 10-5 5 5 5" />
                    </svg>
                )}
            </a>
        );
    };

    const groupBox = (title: string, items: Row[], offset: number) => (
        <div key={title} role="group" aria-label={title} class="flex flex-col gap-0.5 pb-2">
            <span class="px-3 pb-1.5 pt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{title}</span>
            {items.map((r, i) => renderRow(r, offset + i))}
        </div>
    );

    const results = () => {
        const q = state.query.trim();
        if (!q) {
            return (
                <>
                    {groupBox('Jump to', JUMP, 0)}
                    {state.recent.length > 0 && groupBox('Recent', state.recent, JUMP.length)}
                </>
            );
        }
        if (!state.ready) return <p class="m-0 px-3 py-4 text-sm text-muted">Loading the index…</p>;
        if (!state.groups.length) {
            return (
                <p class="m-0 px-3 py-4 text-sm text-muted">
                    Nothing {state.filter === 'all' ? '' : `in ${KINDS[state.filter].label} `}matches “{q}”.
                    {state.filter !== 'all' && (state.counts.all ?? 0) > 0 ? ' Press Tab for other filters.' : ''}
                </p>
            );
        }
        let offset = 0;
        return state.groups.map((g) => {
            const box = groupBox(KINDS[g.kind].group, g.hits, offset);
            offset += g.hits.length;
            return box;
        });
    };

    const chip = (f: Filter) => {
        const sel = f === state.filter;
        const label = f === 'all' ? 'All' : KINDS[f].label;
        const count = state.query.trim() && state.ready ? state.counts[f] ?? 0 : undefined;
        return (
            <button
                key={f}
                type="button"
                role="tab"
                tabIndex={-1}
                aria-selected={sel ? 'true' : 'false'}
                onClick={() => {
                    state.filter = f;
                    run();
                    input?.focus();
                }}
                class={`inline-flex min-h-[30px] items-center gap-1.5 rounded-full border px-[11px] text-[13px] font-medium ${
                    sel ? 'border-[#34304F] bg-tab text-fg' : 'border-line-2 bg-transparent text-fg-3 hover:text-fg'
                }`}
            >
                <span aria-hidden="true" class="size-[7px] rounded-full" style={{ background: f === 'all' ? '#ECECF3' : KINDS[f].color }} />
                {label}
                {count !== undefined && <span class="text-xs text-muted">{count}</span>}
            </button>
        );
    };

    return () => {
        const n = rows().length;
        return (
            <div class="flex min-w-0 max-w-[520px] flex-[1_1_280px]">
                <button
                    ref={(el: HTMLElement) => (trigger = el)}
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={`Search the docs (${state.mac ? '⌘K' : 'Ctrl K'})`}
                    onClick={() => void open()}
                    onPointerenter={() => void loadRecords()}
                    onFocus={() => void loadRecords()}
                    class="flex min-h-10 w-full min-w-0 flex-auto items-center gap-2.5 rounded-[10px] border border-line-2 bg-input px-3 text-left text-sm text-muted hover:border-line-3"
                >
                    <SearchIcon size={16} stroke={2} />
                    <span class="flex-auto truncate">Search the docs</span>
                    <kbd class={`${kbd} py-0.5 text-muted`}>{state.mac ? '⌘K' : 'Ctrl K'}</kbd>
                </button>
                {state.open && (
                    <div class="fixed inset-0 z-50">
                        <div aria-hidden="true" class="absolute inset-0 bg-[rgba(5,5,9,0.72)] backdrop-blur-[3px]" onClick={close} />
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Search the docs"
                            onKeydown={onKey}
                            class="absolute inset-0 flex flex-col overflow-hidden bg-card min-[720px]:inset-auto min-[720px]:left-1/2 min-[720px]:top-[88px] min-[720px]:max-h-[calc(100vh-120px)] min-[720px]:w-[min(720px,calc(100vw-32px))] min-[720px]:-translate-x-1/2 min-[720px]:rounded-[18px] min-[720px]:border min-[720px]:border-line-3 min-[720px]:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(110,91,255,0.08)]"
                        >
                            <label class="flex items-center gap-3.5 pb-4 pl-[22px] pr-5 pt-5">
                                <SearchIcon size={20} stroke={2} color="#B4B4C8" />
                                <span class="sr-only">Search</span>
                                <input
                                    ref={(el: HTMLInputElement) => (input = el)}
                                    type="search"
                                    placeholder="Search docs, modules and errors…"
                                    autoComplete="off"
                                    spellCheck={false}
                                    role="combobox"
                                    aria-expanded="true"
                                    aria-controls="search-results"
                                    aria-autocomplete="list"
                                    aria-activedescendant={n ? `search-row-${state.active}` : undefined}
                                    value={state.query}
                                    onInput={(e: Event) => {
                                        state.query = (e.target as HTMLInputElement).value;
                                        run();
                                    }}
                                    class="min-w-0 flex-auto border-0 bg-transparent text-[19px] text-fg outline-none placeholder:text-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
                                />
                                <button type="button" onClick={close} class={`${kbd} bg-transparent px-2 py-1`} aria-label="Close search">
                                    Esc
                                </button>
                            </label>
                            <div role="tablist" aria-label="Filter results" class="flex flex-wrap gap-1.5 border-b border-line px-5 pb-3.5">
                                {FILTERS().map(chip)}
                            </div>
                            <div ref={(el: HTMLElement) => (list = el)} id="search-results" role="listbox" aria-label="Results" class="min-h-0 flex-auto overflow-y-auto px-2.5 pb-3 pt-2 min-[720px]:h-[486px] min-[720px]:flex-none">
                                {results()}
                            </div>
                            <p class="sr-only" aria-live="polite">
                                {state.asked
                                    ? 'Prompt copied'
                                    : state.query.trim() && state.ready
                                      ? `${state.counts[state.filter] ?? 0} results${state.filter === 'all' ? '' : ` in ${KINDS[state.filter].label}`}`
                                      : ''}
                            </p>
                            <div class="flex flex-wrap items-center gap-x-[18px] gap-y-2.5 border-t border-line bg-[#0C0C13] px-5 py-3 text-[13px] text-muted">
                                <span class="hidden items-center gap-1.5 min-[720px]:inline-flex">
                                    <kbd class={kbd}>↑</kbd>
                                    <kbd class={kbd}>↓</kbd>
                                    navigate
                                </span>
                                <span class="hidden items-center gap-1.5 min-[720px]:inline-flex">
                                    <kbd class={kbd}>↵</kbd>
                                    open
                                </span>
                                <span class="hidden items-center gap-1.5 min-[720px]:inline-flex">
                                    <kbd class={kbd}>Tab</kbd>
                                    filter
                                </span>
                                <button
                                    type="button"
                                    onClick={ask}
                                    class="ml-auto inline-flex min-h-8 max-w-full items-center gap-2 rounded-lg border border-dashed border-[#34304F] bg-[#17152A] px-3 text-[13px] text-fg"
                                >
                                    <SparkIcon size={14} stroke={2} color="#A592FF" />
                                    <span class="truncate">
                                        {state.asked ? 'Prompt copied: paste it in your AI' : state.query.trim() ? `Ask an AI about “${state.query.trim()}”` : 'Ask an AI about Velt'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
}, { name: 'DocsSearch' });
