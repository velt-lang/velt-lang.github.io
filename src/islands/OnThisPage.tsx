/** "On this page": the article's h2s, with the section being read highlighted. */
import { component } from 'sigx';

export const OnThisPage = component<{ headings: { id: string; text: string }[] }>(({ props, signal, onMounted, onUnmounted }) => {
    const state = signal({ active: props.headings[0]?.id ?? '' });
    let els: HTMLElement[] = [];
    let frame = 0;

    // The active section is the last heading above 30% of the viewport.
    const update = () => {
        frame = 0;
        const line = window.innerHeight * 0.3;
        let active = els[0]?.id ?? '';
        for (const el of els) {
            if (el.getBoundingClientRect().top <= line) active = el.id;
            else break;
        }
        state.active = active;
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

    return () => (
        <nav aria-label="On this page" class="flex flex-col gap-2.5 text-sm">
            <span class="font-mono text-xs uppercase tracking-[0.08em] text-muted">On this page</span>
            {props.headings.map((h) => (
                <a
                    key={h.id}
                    href={`#${h.id}`}
                    aria-current={h.id === state.active ? 'location' : undefined}
                    class={h.id === state.active ? 'font-medium text-fg' : 'text-fg-3 hover:text-cyan'}
                >
                    {h.text}
                </a>
            ))}
        </nav>
    );
}, { name: 'OnThisPage' });
