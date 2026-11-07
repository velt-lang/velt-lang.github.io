/**
 * Blog posts (design: Blog — Post): the site header, a reading column with
 * the topic, date and byline over the post's MDX, "On this page" beside it
 * from 1100px, and the footer. Static.
 */
import { component } from 'sigx';
import type { LayoutProps, LayoutSlots } from '@sigx/ssg';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import { BLOG_PATH, TOPICS, formatDate, posts, type Topic } from '../lib/blog';
import { REPO_URL } from '../lib/site';

export default component<LayoutProps, unknown, LayoutSlots>(({ props, slots }) => () => {
    const meta = (props.meta ?? {}) as Record<string, unknown> & { headings?: { id: string; text: string; level: number }[] };
    const topicId = (String(meta.topic ?? 'news') in TOPICS ? String(meta.topic ?? 'news') : 'news') as Topic;
    const topic = TOPICS[topicId];
    const date = meta.date ? String(meta.date).slice(0, 10) : undefined;
    const author = String(meta.author ?? 'Andreas Ekdahl');
    const headings = (meta.headings ?? []).filter((h) => h.level === 2);
    const path = props.path ?? '';
    const more = posts().filter((p) => p.href !== path && p.href !== `${path}/`).slice(0, 2);

    return (
        <div class="min-h-screen bg-bg text-fg">
            <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
                Skip to content
            </a>
            <SiteHeader />
            <main id="main" class="mx-auto flex max-w-[1248px] flex-wrap items-start gap-x-16 px-6 pb-24 pt-[72px]">
                <article class="flex min-w-0 max-w-[760px] flex-[999_1_560px] flex-col gap-6">
                    <a href={BLOG_PATH} class="self-start text-[15px] text-muted hover:text-cyan">← All posts</a>
                    <div class="flex flex-wrap items-center gap-2.5 text-sm text-muted">
                        <span class={`rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.04em] ${topic.cls}`}>{topic.label}</span>
                        {meta.draft === true && <span class="rounded-md border border-dashed border-line-3 px-2.5 py-0.5 text-xs font-medium">Draft</span>}
                        <time dateTime={date}>{formatDate(date)}</time>
                    </div>
                    <div class="post prose">{slots.default?.()}</div>
                    <div class="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7 text-[15px]">
                        <span class="text-muted">
                            {author} · Questions or pushback?{' '}
                            <a href={`${REPO_URL}/issues`} class="text-cyan hover:text-cyan-hover">Open an issue on GitHub</a>
                        </span>
                        <a href={BLOG_PATH} class="inline-flex min-h-11 items-center rounded-[10px] border border-line-3 px-[18px] font-semibold text-fg">More posts</a>
                    </div>
                </article>

                {headings.length > 1 && (
                    <aside aria-label="On this page" class="sticky-col hidden min-w-0 flex-[1_1_220px] flex-col gap-3 pt-[132px] text-sm min-[1100px]:flex">
                        <span class="font-mono text-xs uppercase tracking-[0.08em] text-muted">On this page</span>
                        <nav class="flex flex-col gap-2.5 border-l border-line-2 pl-4">
                            {headings.map((h) => (
                                <a key={h.id} href={`#${h.id}`} class="text-muted hover:text-cyan">{h.text}</a>
                            ))}
                        </nav>
                    </aside>
                )}
            </main>

            {more.length > 0 && (
                <section aria-labelledby="keep-reading" class="border-t border-line">
                    <div class="mx-auto flex max-w-[1248px] flex-col gap-6 px-6 pb-24 pt-16">
                        <h2 id="keep-reading" class="m-0 font-display text-[28px] font-bold tracking-[-0.02em]">Keep reading</h2>
                        <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-5">
                            {more.map((p) => (
                                <a key={p.href} href={p.href} class="flex flex-col gap-2.5 rounded-[18px] border border-line-2 bg-surface p-7 text-fg hover:border-line-3">
                                    <span class={`self-start rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.04em] ${TOPICS[p.topic].cls}`}>{TOPICS[p.topic].label}</span>
                                    <span class="font-display text-[22px] font-semibold leading-[1.25]">{p.title}</span>
                                    <span class="text-[15px] text-muted">{formatDate(p.date)}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            <SiteFooter />
        </div>
    );
}, { name: 'PostLayout' });
