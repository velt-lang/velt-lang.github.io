/** A button that copies a fixed text: the LLM prompt, a page as Markdown. */
import { component } from 'sigx';
import { CheckIcon, FileIcon } from '../components/Icons';

export const CopyPromptButton = component<{ text: string }>(({ props, signal }) => {
    const state = signal({ copied: false });
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(props.text);
            state.copied = true;
            setTimeout(() => (state.copied = false), 1500);
        } catch {
            /* clipboard blocked */
        }
    };
    return () => (
        <button
            type="button"
            onClick={copy}
            aria-live="polite"
            class="min-h-9 flex-none rounded-lg border border-[#34304F] bg-[#17152A] px-3 text-[13px] font-medium text-fg hover:border-violet"
        >
            {state.copied ? 'Copied' : 'Copy prompt'}
        </button>
    );
}, { name: 'CopyPromptButton' });

/** Fetches the page's `.md` rendition (emitted by the llms build) and copies it. */
export const CopyMarkdownButton = component<{ href: string }>(({ props, signal }) => {
    const state = signal({ label: 'Copy page as Markdown' });
    const copy = async () => {
        try {
            const res = await fetch(props.href);
            if (!res.ok) throw new Error(String(res.status));
            await navigator.clipboard.writeText(await res.text());
            state.label = 'Copied';
        } catch {
            state.label = 'Copy failed';
        }
        setTimeout(() => (state.label = 'Copy page as Markdown'), 1500);
    };
    return () => (
        <button
            type="button"
            onClick={copy}
            aria-live="polite"
            class="inline-flex min-h-9 items-center gap-2 rounded-lg border border-line-3 bg-transparent px-3 text-[13px] font-medium text-fg-3 hover:text-fg"
        >
            {state.label === 'Copied' ? <CheckIcon size={15} stroke={2} cls="text-green" /> : <FileIcon size={15} />}
            {state.label}
        </button>
    );
}, { name: 'CopyMarkdownButton' });
