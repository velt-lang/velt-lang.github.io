/**
 * The standard library catalog (design/Std.dc.html). The modules are the std
 * docs pages; src/data/std-catalog.ts puts them in categories. Static except
 * the category chips. Export counts and doc coverage come from the API JSON
 * (src/lib/std-api.ts).
 */
import { component } from 'sigx';
import { CatalogChips } from '../../../islands/CatalogChips';
import { CATEGORIES } from '../../../data/std-catalog';
import { docGroups } from '../../../lib/docs-nav';
import { apiModuleForGuide, coverage, percent } from '../../../lib/std-api';

export const meta = {
    title: 'Standard library modules',
    description: 'Every velt: module by category: web and network, data and storage, files and processes, concurrency, encoding, text, collections and the built-ins.',
    layout: 'catalog',
};

function sections() {
    const std = docGroups().find((g) => g.id === 'std');
    const byHref = new Map((std?.items ?? []).map((i) => [i.href, i]));
    return CATEGORIES.map((c) => ({
        ...c,
        cards: c.modules.flatMap(([page, line, badge]) => {
            const item = byHref.get(`/docs/std/${page}/`);
            const api = apiModuleForGuide(page);
            return item ? [{ href: item.href, title: item.title, line, badge, cov: api ? coverage(api) : undefined }] : [];
        }),
    })).filter((c) => c.cards.length > 0);
}

export default component(() => () => {
    const cats = sections();
    const total = cats.reduce((n, c) => n + c.cards.length, 0);
    const chips = [{ id: 'all', label: 'All', count: total }, ...cats.map((c) => ({ id: c.id, label: c.title, count: c.cards.length }))];
    return (
        <div class="mx-auto flex max-w-[1248px] flex-col gap-10 px-6 pb-28 pt-14">
            <div class="flex flex-wrap items-end justify-between gap-6">
                <div class="flex max-w-[680px] flex-col gap-3">
                    <span class="font-mono text-[13px] uppercase tracking-[0.08em] text-orange">Standard library · {total} modules</span>
                    <h1 class="m-0 font-display text-[clamp(38px,4.4vw,56px)] font-bold leading-[1.05] tracking-[-0.03em]">Batteries included, written in Velt.</h1>
                    <p class="m-0 text-lg text-fg-3">
                        Import any module as <code class="font-mono text-fg">velt:&lt;name&gt;</code>. It is Velt code, specialized and inlined into your program like
                        your own, so you only pay for what you use. The <a href="/docs/std/" class="text-cyan hover:text-cyan-hover">overview</a> has the conventions they share.
                    </p>
                </div>
                <pre class="max-w-full overflow-x-auto rounded-xl border border-line-2 bg-surface px-5 py-4 font-mono text-[13.5px] leading-[1.7] text-fg">
                    <span class="tk-k">import</span> {'{ serve }'} <span class="tk-k">from</span> <span class="tk-s">"velt:http"</span>;{'\n'}
                    <span class="tk-k">import</span> {'{ connect }'} <span class="tk-k">from</span> <span class="tk-s">"velt:redis"</span>;
                </pre>
            </div>

            <div class="sticky top-0 z-10 border-b border-line bg-bg py-3">
                <CatalogChips client:visible chips={chips} />
            </div>

            {cats.map((c) => (
                <section key={c.id} data-cat={c.id} aria-labelledby={`cat-${c.id}`} class="flex scroll-mt-20 flex-col gap-4">
                    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 id={`cat-${c.id}`} class="m-0 font-display text-2xl font-semibold tracking-[-0.02em]">{c.title}</h2>
                        <span class="text-sm text-muted">{c.blurb}</span>
                    </div>
                    <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
                        {c.cards.map((m) => (
                            <a key={m.href} href={m.href} class="flex min-h-24 flex-col gap-1.5 rounded-[14px] border border-card-line bg-card px-[18px] py-4 text-fg hover:border-line-3 hover:text-fg">
                                <span class="flex items-center justify-between gap-2">
                                    <span class="font-mono text-sm font-medium">
                                        {m.title.startsWith('velt:') ? (
                                            <>
                                                <span class="text-muted">velt:</span>
                                                {m.title.slice(5)}
                                            </>
                                        ) : (
                                            m.title
                                        )}
                                    </span>
                                    {m.badge && <span class="flex-none rounded-full border border-[#3F2A1A] px-2 py-px text-[11px] text-peach">{m.badge}</span>}
                                </span>
                                <span class="text-sm leading-normal text-fg-3">{m.line}</span>
                                {m.cov && m.cov.exports > 0 && (
                                    <span class="mt-auto pt-1 font-mono text-xs text-muted" title={`${m.cov.documented} of ${m.cov.exports} exports have a doc comment`}>
                                        {m.cov.exports} export{m.cov.exports === 1 ? '' : 's'} ·{' '}
                                        <span class={percent(m.cov) < 50 ? 'text-orange' : ''}>{percent(m.cov)}% documented</span>
                                    </span>
                                )}
                            </a>
                        ))}
                    </div>
                </section>
            ))}

            <div class="flex flex-wrap items-center justify-between gap-5 rounded-[18px] border border-line-3 bg-surface px-8 py-7">
                <div class="flex max-w-[640px] flex-col gap-1">
                    <strong class="font-display text-xl font-semibold">Need something that isn't here yet?</strong>
                    <span class="text-[15px] text-fg-3">
                        A Velt package can include any Rust crate and export its functions with <code class="font-mono text-fg">#[export]</code>. Your users never need Rust.
                    </span>
                </div>
                <a href="/docs/book/native-packages/" class="inline-flex min-h-11 items-center rounded-[10px] border border-line-3 px-[18px] text-sm font-semibold text-fg">
                    Native packages →
                </a>
            </div>
        </div>
    );
});
