/**
 * The Guide | API reference switch in the docs header on std module pages
 * (design/ApiSwitch.dc.html): a bordered pill with two real links, the current
 * one filled light, the API side carrying its export count. Static. Between
 * 640 and 1180px, where it shares a row with the search box and the version
 * pill, it drops its icons and reads "API" (still "API reference" to screen
 * readers).
 */
import { component } from 'sigx';

const svg = (d: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="flex-none max-[359px]:hidden min-[640px]:max-[1179px]:hidden">
        <path d={d} />
    </svg>
);
const BOOK = 'M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5zM8 7h6M8 11h6';
const BRACES = 'M8 4c-2 0-3 1-3 3v2c0 1-1 2-2 3 1 1 2 2 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1 1 2 2 3-1 1-2 2-2 3v2c0 2-1 3-3 3';

export interface ApiSwitchProps {
    guide: string;
    api: string;
    onApi: boolean;
    /** The module's export count, shown on the API side; none on the API index. */
    count?: number;
}

const option = (on: boolean) =>
    `inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-[10px] px-4 text-sm font-semibold max-[400px]:px-3 ${
        on ? 'bg-fg text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:text-bg' : 'text-fg-2 hover:text-cyan'
    }`;

export const ApiSwitch = component<ApiSwitchProps>(({ props }) => () => {
    const n = props.count ?? 0;
    return (
        <nav aria-label="Guide or API reference" class="inline-flex gap-1 rounded-[14px] border border-line-2 bg-surface p-1">
            <a href={props.guide} aria-current={!props.onApi ? 'page' : undefined} class={option(!props.onApi)}>
                {svg(BOOK)}
                Guide
            </a>
            <a href={props.api} aria-current={props.onApi ? 'page' : undefined} class={option(props.onApi)}>
                {svg(BRACES)}
                <span>
                    API<span class="min-[640px]:max-[1179px]:sr-only"> reference</span>
                </span>
                {n > 0 && (
                    <>
                        <span aria-hidden="true" class={`rounded-full px-2 py-px font-mono text-[11px] font-semibold ${props.onApi ? 'bg-bg text-fg' : 'bg-tab text-violet'}`}>
                            {n}
                        </span>
                        <span class="sr-only">, {n} export{n === 1 ? '' : 's'}</span>
                    </>
                )}
            </a>
        </nav>
    );
}, { name: 'ApiSwitch' });
