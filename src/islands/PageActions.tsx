/**
 * "Copy page" by the H1 (design/Docs.dc.html), with a menu: copy as
 * Markdown, open the page in Claude or ChatGPT, view the raw `.md` (emitted
 * by the llms build).
 */
import { component } from 'sigx';
import { CheckIcon, ChevronDown, CopyIcon } from '../components/Icons';
import { copyPageMarkdown, pagePrompt } from '../lib/page-ai';

export const PageActions = component<{ md: string }>(({ props, signal, onMounted, onUnmounted }) => {
    const state = signal({ open: false, label: 'Copy page' });
    let root: HTMLElement | null = null;
    let toggleBtn: HTMLElement | null = null;

    const copy = async () => {
        state.open = false;
        state.label = (await copyPageMarkdown(props.md)) ? 'Copied' : 'Copy failed';
        setTimeout(() => (state.label = 'Copy page'), 1500);
    };
    const items = () => Array.from(root?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const onKey = (e: KeyboardEvent) => {
        if (!state.open) return;
        const list = items();
        const at = list.indexOf(document.activeElement as HTMLElement);
        if (e.key === 'Escape') {
            e.preventDefault();
            state.open = false;
            toggleBtn?.focus();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            list[(at + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length]?.focus();
        } else if (e.key === 'Tab') {
            state.open = false;
        }
    };
    const outside = (e: Event) => {
        if (state.open && !root?.contains(e.target as Node)) state.open = false;
    };
    onMounted(() => document.addEventListener('pointerdown', outside));
    onUnmounted(() => document.removeEventListener('pointerdown', outside));

    const btn = 'border border-line-3 bg-input text-[13px] font-medium rounded-lg min-h-9';
    const item = 'flex w-full items-center gap-2.5 rounded-lg border-0 bg-transparent px-2.5 py-2 text-left text-[13px] text-fg-2 hover:bg-[#1A1830] hover:text-fg focus-visible:bg-[#1A1830]';
    const prompt = () => encodeURIComponent(pagePrompt(props.md));

    return () => (
        <div ref={(el: HTMLElement) => (root = el)} class="relative flex gap-2" onKeydown={onKey}>
            <button type="button" onClick={copy} aria-live="polite" class={`${btn} inline-flex items-center gap-2 px-3 text-fg`}>
                {state.label === 'Copied' ? <CheckIcon size={14} stroke={2} cls="text-green" /> : <CopyIcon size={14} stroke={2} />}
                {state.label}
            </button>
            <button
                ref={(el: HTMLElement) => (toggleBtn = el)}
                type="button"
                aria-label="More page actions"
                aria-haspopup="menu"
                aria-expanded={state.open ? 'true' : 'false'}
                onClick={() => {
                    state.open = !state.open;
                    if (state.open) requestAnimationFrame(() => items()[0]?.focus());
                }}
                class={`${btn} grid w-9 place-items-center text-fg-3 hover:text-fg`}
            >
                <ChevronDown size={14} stroke={2} />
            </button>
            {state.open && (
                <div role="menu" aria-label="Page actions" class="absolute right-0 top-11 z-30 flex w-60 flex-col gap-0.5 rounded-xl border border-line-3 bg-card p-1.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                    <button type="button" role="menuitem" onClick={copy} class={item}>Copy as Markdown</button>
                    <a role="menuitem" href={`https://claude.ai/new?q=${prompt()}`} target="_blank" rel="noopener" class={item}>Open in Claude</a>
                    <a role="menuitem" href={`https://chatgpt.com/?q=${prompt()}`} target="_blank" rel="noopener" class={item}>Open in ChatGPT</a>
                    <a role="menuitem" href={props.md} class={item}>View as Markdown</a>
                </div>
            )}
        </div>
    );
}, { name: 'PageActions' });
