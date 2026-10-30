/** Inline stroke icons (1.8 stroke unless the design says otherwise). Never emoji. */
import { component } from 'sigx';

type IconProps = { size?: number; color?: string; stroke?: number; cls?: string };

const icon = (name: string, paths: () => JSX.Element) =>
    component<IconProps>(({ props }) => () => (
        <svg
            class={props.cls}
            width={props.size ?? 18}
            height={props.size ?? 18}
            viewBox="0 0 24 24"
            fill="none"
            stroke={props.color ?? 'currentColor'}
            stroke-width={props.stroke ?? 1.8}
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            {paths()}
        </svg>
    ), { name });

export const GitHubIcon = icon('GitHubIcon', () => (
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
));
export const ArrowRight = icon('ArrowRight', () => <path d="M5 12h14M13 6l6 6-6 6" />);
export const CopyIcon = icon('CopyIcon', () => (
    <>
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </>
));
export const CheckIcon = icon('CheckIcon', () => <path d="m5 12 5 5 9-10" />);
export const SparkIcon = icon('SparkIcon', () => (
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
));
export const BanIcon = icon('BanIcon', () => (
    <>
        <circle cx="12" cy="12" r="9" />
        <path d="M5.6 5.6l12.8 12.8" />
    </>
));
export const BoltIcon = icon('BoltIcon', () => <path d="M13 2 4 14h7l-1 8 9-12h-7z" />);
export const ChipIcon = icon('ChipIcon', () => (
    <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </>
));
export const PulseIcon = icon('PulseIcon', () => <path d="M3 12h4l3-8 4 16 3-8h4" />);
export const BoxIcon = icon('BoxIcon', () => (
    <>
        <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
    </>
));
export const WarnIcon = icon('WarnIcon', () => (
    <>
        <path d="M12 3 2 20h20z" />
        <path d="M12 10v4M12 17h.01" />
    </>
));
export const ReloadIcon = icon('ReloadIcon', () => (
    <>
        <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
        <path d="M21 3v5h-5" />
    </>
));
export const SearchIcon = icon('SearchIcon', () => (
    <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </>
));
export const InfoIcon = icon('InfoIcon', () => (
    <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v4h1" />
    </>
));
export const ChevronRight = icon('ChevronRight', () => <path d="m9 6 6 6-6 6" />);
export const ChevronDown = icon('ChevronDown', () => <path d="m6 9 6 6 6-6" />);
export const MenuIcon = icon('MenuIcon', () => <path d="M4 7h16M4 12h16M4 17h16" />);
export const FileIcon = icon('FileIcon', () => (
    <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
));
export const ChevronUp = icon('ChevronUp', () => <path d="m18 15-6-6-6 6" />);
export const EditIcon = icon('EditIcon', () => (
    <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
));
export const GridIcon = icon('GridIcon', () => (
    <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
));
