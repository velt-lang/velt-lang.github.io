/** Site-wide constants: the one place URLs and install commands live. */

export const SITE_URL = 'https://veltlang.com';
export const REPO_URL = 'https://github.com/velt-lang/velt';
export const SITE_REPO_URL = 'https://github.com/velt-lang/velt-lang.github.io';
export const RELEASES_URL = `${REPO_URL}/releases`;
export const VSCODE_URL = 'https://marketplace.visualstudio.com/items?itemName=andtii.velt';
/** Edit links point at this repo: the docs are authored here. */
export const EDIT_BASE = `${SITE_REPO_URL}/edit/main/`;

/**
 * The Velt release the docs describe. Bump it in the same PR that documents a
 * release (AGENTS.md, "Refresh playbook").
 */
export const DOCS_VERSION = '0.4.0';

export const LLMS_URL = `${SITE_URL}/llms.txt`;
export const LLM_PROMPT = `Read ${LLMS_URL} and help me build a small HTTP server in Velt.`;

export type OsId = 'mac' | 'linux' | 'win';

export interface InstallOption {
    id: OsId;
    label: string;
    prompt: string;
    cmd: string;
    note: string;
}

const SH = `curl -fsSL ${REPO_URL}/releases/latest/download/get-velt.sh | sh`;
const PS = `irm ${REPO_URL}/releases/latest/download/get-velt.ps1 | iex`;

export const INSTALLS: InstallOption[] = [
    { id: 'mac', label: 'macOS', prompt: '$', cmd: SH, note: 'Apple silicon and Intel, in Terminal.' },
    { id: 'linux', label: 'Linux', prompt: '$', cmd: SH, note: 'x86_64 and arm64.' },
    { id: 'win', label: 'Windows', prompt: 'PS>', cmd: PS, note: 'In PowerShell.' },
];
