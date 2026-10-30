/**
 * "On this page" (design/Docs.dc.html, docs-toc.png): the article's h2s with
 * their h3s indented, on a 1px track; the section being read gets a 2px cyan
 * marker. Under it the page actions: copy as Markdown, ask an AI, edit, top.
 */
import { component } from 'sigx';
import { CheckIcon, ChevronUp, EditIcon, FileIcon, SparkIcon } from '../components/Icons';
import { copyPageMarkdown, copyText, pagePrompt } from '../lib/page-ai';

export interface TocHeading {
    id: string;
    text: string;
    level: 2 | 3;
    /** Code names (an API page's exports) show in mono. */
    code?: boolean;
}

export interface TocLink {
    href: string;
    label: string;
}

export const OnThisPage = component<{ headings: TocHeading[]; md?: string; edit?: string; links?: TocLink[] }>(({ props, signal, onMounted, onUnmounted }) => {
    const state = signal({ active: props.headings[0]?.id ?? '', copied: '' });
    let els: HTMLElement[] = [];
    let nav: HTMLElement | null = null;
    let frame = 0;

    // Keep the marked entry visible when the column scrolls on its own (long reference pages).
    const reveal = () => {
        const box = nav?.closest<HTMLElement>('[data-toc-scroll]');
        const link = nav?.querySelector<HTMLElement>('[aria-current="location"]');
        if (!box || !link || box.scrollHeight <= box.clientHeight) return;
        const top = link.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
        if (top < box.scrollTop + 40) box.scrollTop = top - 40;
        else if (top > box.scrollTop + box.clientHeight - 80) box.scrollTop = top - box.clientHeight + 80;
    };

    // The active section is the last heading above 30% of the viewport.
    const update = () => {
        frame = 0;
        const line = window.innerHeight * 0.3;
        let active = els[0]?.id ?? '';
        for (const el of els) {
            if (el.getBoundingClientRect().top <= line) active = el.id;
            else break;
        }
        if (active !== state.active) {
            state.active = active;
            requestAnimationFrame(reveal);
        }
    };
    const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(update);
    };

    onMounted(() => {
        els = props.headings.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => !!e);
        window.addEventListener('scroll', onScroll, { passive: true });
        update();
    });
    onUnmounted(() => {
        window.removeEventListener('scroll', onScroll);
        if (frame) cancelAnimationFrame(frame);
    });

    const flash = (what: string) => {
        state.copied = what;
        setTimeout(() => (state.copied = ''), 1500);
    };
    const action = 'flex min-h-9 items-center gap-2.5 border-0 bg-transparent p-0 text-left text-[13px] text-fg-3 hover:text-fg';

    return () => (
        <div class="flex flex-col gap-5">
            {props.headings.length > 0 && (
                <div class="flex flex-col gap-3">
                    <span class="font-mono text-xs uppercase tracking-[0.08em] text-muted">On this page</span>
                    <nav ref={(el: HTMLElement) => (nav = el)} aria-label="On this page" class="flex flex-col border-l border-line-2">
                        {props.headings.map((h) => {
                            const on = h.id === state.active;
                            const h2 = h.level === 2;
                            return (
                                <a
                                    key={h.id}
                                    href={`#${h.id}`}
                                    aria-current={on ? 'location' : undefined}
                                    class={`-ml-px border-l-2 py-[5px] pr-1 leading-[1.4] ${h2 ? 'pl-3.5 text-sm' : 'pl-7 text-[13px]'} ${h.code ? 'font-mono !text-[12.5px]' : ''} ${
                                        on ? 'border-cyan font-semibold text-fg' : `border-transparent hover:text-cyan ${h2 ? 'font-medium text-fg-3' : 'text-muted'}`
                                    }`}
                                >
                                    {h.text}
                                </a>
                            );
                        })}
                    </nav>
                </div>
            )}
            <div class={`flex flex-col gap-1 ${props.headings.length > 0 ? 'border-t border-line pt-4' : ''}`}>
                {props.links?.map((l) => (
                    <a key={l.href} href={l.href} class={action}>
                        {l.label} →
                    </a>
                ))}
                {props.md && (
                <button type="button" class={action} aria-live="polite" onClick={async () => flash((await copyPageMarkdown(props.md!)) ? 'md' : '')}>
                    {state.copied === 'md' ? <CheckIcon size={15} stroke={2} cls="text-green" /> : <FileIcon size={15} stroke={2} />}
                    {state.copied === 'md' ? 'Copied' : 'Copy page as Markdown'}
                </button>
                )}
                {props.md && (
                <button
                    type="button"
                    class={action}
                    aria-live="polite"
                    title="Copies a prompt that points an AI assistant at this page"
                    onClick={async () => flash((await copyText(pagePrompt(props.md!))) ? 'ai' : '')}
                >
                    {state.copied === 'ai' ? <CheckIcon size={15} stroke={2} cls="text-green" /> : <SparkIcon size={15} stroke={2} />}
                    {state.copied === 'ai' ? 'Prompt copied: paste it in your AI' : 'Ask an AI about this page'}
                </button>
                )}
                {props.edit && (
                    <a href={props.edit} class={action}>
                        <EditIcon size={15} stroke={2} />
                        Edit on GitHub
                    </a>
                )}
                <a href="#top" class={action}>
                    <ChevronUp size={15} stroke={2} />
                    Back to top
                </a>
            </div>
        </div>
    );
}, { name: 'OnThisPage' });
