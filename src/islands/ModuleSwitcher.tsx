/**
 * The API sidebar's module switcher (design/Api.dc.html): a card with the
 * current module that opens a filterable list of every module's API page.
 * Without JS it is a link to the catalog's list.
 */
import { component } from 'sigx';
import { ChevronDown } from '../components/Icons';

interface Item {
    name: string;
    href: string;
}

export const ModuleSwitcher = component<{ current: string; meta: string; modules: Item[] }>(({ props, signal, onMounted, onUnmounted }) => {
    const state = signal({ open: false, query: '', active: 0 });
    let root: HTMLElement | null = null;
    let button: HTMLElement | null = null;
    let input: HTMLInputElement | null = null;

    const matches = () => {
        const q = state.query.trim().toLowerCase().replace(/^velt:/, '');
        return q ? props.modules.filter((m) => m.name.toLowerCase().includes(q)) : props.modules;
    };
    const close = (focus: boolean) => {
        state.open = false;
        state.query = '';
        if (focus) button?.focus();
    };
    const open = () => {
        state.open = true;
        state.active = Math.max(0, props.modules.findIndex((m) => m.name === props.current));
        requestAnimationFrame(() => {
            input?.focus();
            root?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
        });
    };
    const onKey = (e: KeyboardEvent) => {
        const list = matches();
        if (e.key === 'Escape') {
            e.preventDefault();
            close(true);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            state.active = (state.active + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % Math.max(list.length, 1);
            requestAnimationFrame(() => root?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }));
        } else if (e.key === 'Enter' && list[state.active]) {
            e.preventDefault();
            location.href = list[state.active].href;
        }
    };
    const onDoc = (e: MouseEvent) => {
        if (state.open && root && !root.contains(e.target as Node)) close(false);
    };
    onMounted(() => document.addEventListener('click', onDoc));
    onUnmounted(() => document.removeEventListener('click', onDoc));

    return () => {
        const list = matches();
        return (
            <div ref={(el: HTMLElement) => (root = el)} class="relative">
                <button
                    ref={(el: HTMLElement) => (button = el)}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={state.open ? 'true' : 'false'}
                    onClick={() => (state.open ? close(false) : open())}
                    class="flex w-full items-center gap-3 rounded-[14px] border border-line-2 bg-card p-3 text-left text-fg hover:border-line-3"
                >
                    <span
                        aria-hidden="true"
                        class="grid size-9 flex-none place-items-center rounded-[9px] border border-[rgba(255,159,90,0.3)] bg-[rgba(255,159,90,0.1)] font-mono text-[13px] text-orange"
                    >
                        {'{}'}
                    </span>
                    <span class="flex min-w-0 flex-auto flex-col gap-0.5">
                        <span class="font-mono text-sm font-medium">{props.current}</span>
                        <span class="text-[12.5px] text-muted">{props.meta}</span>
                    </span>
                    <ChevronDown size={14} stroke={2} cls="text-muted" />
                </button>
                {state.open && (
                    <div class="absolute inset-x-0 top-full z-30 mt-2 flex flex-col overflow-hidden rounded-[14px] border border-[#34304F] bg-[#12121C] shadow-[0_24px_60px_-16px_rgba(0,0,0,0.85)]" onKeyDown={onKey}>
                        <input
                            ref={(el: HTMLInputElement) => (input = el)}
                            type="text"
                            role="combobox"
                            aria-label="Filter modules"
                            aria-controls="module-switcher-list"
                            aria-expanded="true"
                            aria-activedescendant={list[state.active] ? `module-opt-${state.active}` : undefined}
                            placeholder="Filter modules"
                            value={state.query}
                            onInput={(e: Event) => {
                                state.query = (e.target as HTMLInputElement).value;
                                state.active = 0;
                            }}
                            class="m-2 min-h-10 rounded-lg border border-line-2 bg-input px-3 font-mono text-[13px] text-fg outline-none placeholder:text-muted focus:border-[#34304F]"
                        />
                        <ul id="module-switcher-list" role="listbox" aria-label="Modules" class="m-0 max-h-80 list-none overflow-y-auto p-1.5 pt-0">
                            {list.map((m, i) => (
                                <li key={m.href} id={`module-opt-${i}`} role="option" aria-selected={i === state.active ? 'true' : 'false'}>
                                    <a
                                        href={m.href}
                                        tabIndex={-1}
                                        onMouseEnter={() => (state.active = i)}
                                        class={`flex min-h-9 flex-wrap items-baseline gap-x-2 rounded-lg px-2.5 py-1.5 ${i === state.active ? 'bg-[#1A1830] text-fg' : 'text-fg-3'} ${m.name === props.current ? 'font-semibold' : ''}`}
                                    >
                                        <span class="min-w-0 font-mono text-[13px] [overflow-wrap:anywhere]">{m.name}</span>
                                    </a>
                                </li>
                            ))}
                            {list.length === 0 && <li class="px-2.5 py-2 text-[13px] text-muted">No module matches.</li>}
                        </ul>
                    </div>
                )}
            </div>
        );
    };
}, { name: 'ModuleSwitcher' });
