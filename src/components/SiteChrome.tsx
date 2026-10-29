/** The marketing header and footer (design/Main.dc.html). Static: no client JS. */
import { component } from 'sigx';
import { GitHubIcon } from './Icons';
import { REPO_URL, RELEASES_URL, VSCODE_URL } from '../lib/site';

export const Logo = component<{ size?: 'lg' | 'md' }>(({ props }) => () => {
    const lg = props.size !== 'md';
    return (
        <span class="flex items-center gap-2.5">
            <img
                src="/velt-logo-64.png"
                alt=""
                width={lg ? 30 : 26}
                height={lg ? 25 : 22}
                class={lg ? 'h-[25px] w-[30px] object-contain' : 'h-[22px] w-[26px] object-contain'}
            />
            <span class={`font-display font-bold tracking-[-0.02em] ${lg ? 'text-[22px]' : 'text-[20px]'}`}>Velt</span>
        </span>
    );
}, { name: 'Logo' });

const NAV = [
    { label: 'Docs', href: '/docs/' },
    { label: 'Why Velt', href: '/#why' },
    { label: 'Benchmarks', href: '/#benchmarks' },
    { label: 'Beyond TypeScript', href: '/#beyond' },
    { label: 'Tooling', href: '/#tooling' },
];

export const SiteHeader = component(() => () => (
    <header class="relative border-b border-line">
        <div class="mx-auto flex max-w-[1248px] flex-wrap items-center gap-x-8 gap-y-4 px-6 py-[18px]">
            <a href="/" aria-label="Velt home" class="text-fg">
                <Logo />
            </a>
            <nav aria-label="Main" class="flex flex-auto flex-wrap gap-x-6 gap-y-1 text-[15px]">
                {NAV.map((n) => (
                    <a key={n.href} href={n.href} class="text-fg-3 hover:text-cyan">
                        {n.label}
                    </a>
                ))}
            </nav>
            <div class="flex items-center gap-3">
                <a
                    href={REPO_URL}
                    class="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-line-3 px-3.5 text-sm text-fg"
                >
                    <GitHubIcon />
                    GitHub
                </a>
                <a
                    href="/#install"
                    class="inline-flex min-h-11 items-center rounded-[10px] bg-accent px-[18px] text-sm font-semibold text-white hover:text-white hover:brightness-110"
                >
                    Install Velt
                </a>
            </div>
        </div>
        <div aria-hidden="true" class="brand-line" />
    </header>
), { name: 'SiteHeader' });

const FOOTER = [
    {
        title: 'Learn',
        label: 'Learn',
        links: [
            { label: 'Getting started', href: '/docs/book/getting-started/' },
            { label: 'Tour', href: '/docs/book/tour/' },
            { label: 'For TypeScript developers', href: '/docs/book/ts-developers/' },
        ],
    },
    {
        title: 'Reference',
        label: 'Reference',
        links: [
            { label: 'Language', href: '/docs/reference/' },
            { label: 'Standard library', href: '/docs/std/' },
            { label: 'Tooling', href: '/docs/tooling/' },
        ],
    },
    {
        title: 'Project',
        label: 'Community',
        links: [
            { label: 'GitHub', href: REPO_URL },
            { label: 'Releases', href: RELEASES_URL },
            { label: 'VS Code', href: VSCODE_URL },
        ],
    },
];

export const SiteFooter = component(() => () => (
    <footer class="border-t border-line">
        <div class="mx-auto flex max-w-[1248px] flex-wrap justify-between gap-10 px-6 py-12">
            <div class="flex max-w-[300px] flex-col gap-3">
                <Logo size="md" />
                <p class="m-0 text-sm text-muted">TypeScript syntax, native code, Rust-level performance.</p>
            </div>
            <div class="flex flex-wrap gap-12 text-sm">
                {FOOTER.map((col) => (
                    <nav key={col.title} aria-label={col.label} class="flex flex-col gap-2.5">
                        <span class="font-semibold text-fg">{col.title}</span>
                        {col.links.map((l) => (
                            <a key={l.href} href={l.href} class="text-muted hover:text-cyan">
                                {l.label}
                            </a>
                        ))}
                    </nav>
                ))}
            </div>
        </div>
    </footer>
), { name: 'SiteFooter' });
