/**
 * The install command with OS tabs. Server-renders macOS; on hydration it
 * switches to the visitor's OS. Only the command scrolls: the copy button
 * stays pinned at the right edge.
 */
import { component } from 'sigx';
import { INSTALLS, type OsId } from '../lib/site';
import { CheckIcon, CopyIcon } from '../components/Icons';

function detectOs(): OsId {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const platform = (nav.userAgentData?.platform || nav.platform || nav.userAgent || '').toLowerCase();
    if (platform.includes('win')) return 'win';
    if (platform.includes('mac') || /iphone|ipad/.test(platform)) return 'mac';
    if (platform.includes('linux') || platform.includes('android') || platform.includes('x11')) return 'linux';
    return 'mac';
}

export const InstallBox = component(({ signal, onMounted }) => {
    const state = signal({ os: 'mac' as OsId, copied: false });

    onMounted(() => {
        state.os = detectOs();
    });

    const copy = async () => {
        const cur = INSTALLS.find((o) => o.id === state.os)!;
        try {
            await navigator.clipboard.writeText(cur.cmd);
            state.copied = true;
            setTimeout(() => (state.copied = false), 1500);
        } catch {
            /* clipboard blocked: the command is still selectable */
        }
    };

    const onKey = (e: KeyboardEvent) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const i = INSTALLS.findIndex((o) => o.id === state.os);
        const next = INSTALLS[(i + (e.key === 'ArrowRight' ? 1 : INSTALLS.length - 1)) % INSTALLS.length];
        state.os = next.id;
        (e.currentTarget as HTMLElement).querySelector<HTMLElement>(`[data-os="${next.id}"]`)?.focus();
    };

    return () => {
        const cur = INSTALLS.find((o) => o.id === state.os)!;
        return (
            <div class="flex max-w-[560px] flex-col gap-2">
                <div class="overflow-hidden rounded-xl border border-line-2 bg-input">
                    <div role="tablist" aria-label="Operating system" class="flex gap-0.5 border-b border-line px-1.5 pt-1.5" onKeydown={onKey}>
                        {INSTALLS.map((o) => {
                            const sel = o.id === state.os;
                            return (
                                <button
                                    key={o.id}
                                    type="button"
                                    role="tab"
                                    id={`os-tab-${o.id}`}
                                    data-os={o.id}
                                    aria-selected={sel ? 'true' : 'false'}
                                    aria-controls="os-panel"
                                    tabIndex={sel ? 0 : -1}
                                    onClick={() => (state.os = o.id)}
                                    class={`min-h-[38px] border-0 border-b-2 bg-transparent px-3.5 text-[13px] font-medium ${sel ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'}`}
                                >
                                    {o.label}
                                </button>
                            );
                        })}
                    </div>
                    <div
                        role="tabpanel"
                        id="os-panel"
                        aria-labelledby={`os-tab-${cur.id}`}
                        class="flex items-center gap-3 py-2.5 pl-4 pr-2.5 font-mono text-[13px]"
                    >
                        <span class="flex-none text-dim">{cur.prompt}</span>
                        <span class="install-cmd min-w-0 flex-auto overflow-x-auto whitespace-nowrap py-1 text-fg">{cur.cmd}</span>
                        <button
                            type="button"
                            aria-label={state.copied ? 'Copied' : 'Copy install command'}
                            onClick={copy}
                            class="grid size-9 flex-none place-items-center rounded-lg border-0 bg-line text-fg-3 hover:text-fg"
                        >
                            {state.copied ? <CheckIcon size={16} stroke={2} cls="text-green" /> : <CopyIcon size={16} stroke={2} />}
                        </button>
                    </div>
                </div>
                <p class="m-0 text-[13px] text-muted">
                    {cur.note} Brings its own linker — no Xcode, Visual Studio or C compiler needed.
                </p>
            </div>
        );
    };
}, { name: 'InstallBox' });
