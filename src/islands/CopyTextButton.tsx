/** An icon button that copies a fixed text: the API page's import line. */
import { component } from 'sigx';
import { CheckIcon, CopyIcon } from '../components/Icons';

export const CopyTextButton = component<{ text: string; label: string }>(({ props, signal }) => {
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
            aria-label={state.copied ? 'Copied' : props.label}
            title={props.label}
            class="grid size-8 flex-none place-items-center rounded-[7px] border-0 bg-line text-fg-3 hover:text-fg"
        >
            {state.copied ? <CheckIcon size={15} stroke={2} cls="text-green" /> : <CopyIcon size={15} stroke={2} />}
        </button>
    );
}, { name: 'CopyTextButton' });
