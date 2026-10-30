/**
 * The docs area switcher (design/Api.dc.html, api-menu.png): a button with
 * the current area's tile that opens a menu of the five areas. Without JS the
 * button is a plain link to the current area.
 */
import { component } from 'sigx';
import { ChevronDown } from '../components/Icons';
import { AreaTile, type AreaItem as Item } from '../components/AreaTile';

export const AreaMenu = component<{ areas: Item[]; current: string }>(({ props, signal, onMounted, onUnmounted }) => {
    const state = signal({ open: false });
    let root: HTMLElement | null = null;
    let button: HTMLElement | null = null;

    const items = () => Array.from(root?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const close = (focus: boolean) => {
        state.open = false;
        if (focus) button?.focus();
    };
    const toggle = (e: Event) => {
        e.preventDefault();
        state.open = !state.open;
        if (state.open) requestAnimationFrame(() => (items().find((i) => i.dataset.current === 'true') ?? items()[0])?.focus());
    };
    const onKey = (e: KeyboardEvent) => {
        if (!state.open) return;
        const list = items();
        const at = list.indexOf(document.activeElement as HTMLElement);
        if (e.key === 'Escape') {
            e.preventDefault();
            close(true);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const step = e.key === 'ArrowDown' ? 1 : list.length - 1;
            list[(at + step) % list.length]?.focus();
        } else if (e.key === 'Tab') {
            close(false);
        }
    };
    const outside = (e: Event) => {
        if (state.open && !root?.contains(e.target as Node)) close(false);
    };

    onMounted(() => document.addEventListener('pointerdown', outside));
    onUnmounted(() => document.removeEventListener('pointerdown', outside));

    return () => {
        const cur = props.areas.find((a) => a.id === props.current) ?? props.areas[0];
        return (
            <div ref={(el: HTMLElement) => (root = el)} class="relative" onKeydown={onKey}>
                <a
                    ref={(el: HTMLElement) => (button = el)}
                    href={cur.href}
                    role="button"
                    aria-haspopup="menu"
                    aria-expanded={state.open ? 'true' : 'false'}
                    aria-label={`${cur.label}: switch documentation area`}
                    onClick={toggle}
                    class="inline-flex min-h-10 items-center gap-2.5 whitespace-nowrap rounded-[10px] border border-line-2 bg-input py-0 pl-1.5 pr-2.5 text-sm font-semibold text-fg hover:border-line-3 hover:text-fg"
                >
                    <AreaTile area={cur} size={26} />
                    {cur.label}
                    <ChevronDown size={14} stroke={2} color="#9A9AB0" />
                </a>
                {state.open && (
                    <div
                        role="menu"
                        aria-label="Documentation areas"
                        class="absolute left-0 top-12 z-40 flex w-[min(340px,calc(100vw-48px))] flex-col gap-0.5 rounded-[14px] border border-line-3 bg-card p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
                    >
                        {props.areas.map((a) => {
                            const on = a.id === cur.id;
                            return (
                                <a
                                    key={a.id}
                                    role="menuitem"
                                    href={a.href}
                                    data-current={on ? 'true' : undefined}
                                    aria-current={on ? 'true' : undefined}
                                    class={`flex items-center gap-3 rounded-[10px] p-2.5 text-fg hover:bg-[#1A1830] hover:text-fg focus-visible:bg-[#1A1830] ${on ? 'bg-[#1A1830]' : ''}`}
                                >
                                    <AreaTile area={a} size={32} />
                                    <span class="flex flex-col gap-px leading-[1.4]">
                                        <span class="text-sm font-semibold">{a.label}</span>
                                        <span class="text-[12.5px] text-muted">{a.meta}</span>
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };
}, { name: 'AreaMenu' });
