/** A button that copies a fixed text: the LLM prompt. */
import { component } from 'sigx';

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
