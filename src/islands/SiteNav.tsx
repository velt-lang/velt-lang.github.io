/**
 * The marketing header's links. On the home page the link of the section in
 * view is highlighted (scroll spy), as "On this page" does in the docs.
 */
import { component } from 'sigx';

export const SiteNav = component<{ items: { label: string; href: string }[] }>(({ props, signal, onMounted, onUnmounted }) => {
    const state = signal({ active: '' });
    let sections: HTMLElement[] = [];
    let frame = 0;

    // The active section is the last one whose top is above 40% of the viewport.
    const update = () => {
        frame = 0;
        const line = window.innerHeight * 0.4;
        let active = '';
        for (const el of sections) if (el.getBoundingClientRect().top <= line) active = el.id;
        state.active = active;
    };
    const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(update);
    };

    onMounted(() => {
        if (location.pathname !== '/') return;
        sections = props.items
            .map((i) => i.href.match(/^\/#(.+)$/)?.[1])
            .map((id) => (id ? document.getElementById(id) : null))
            .filter((e): e is HTMLElement => !!e);
        window.addEventListener('scroll', onScroll, { passive: true });
        update();
    });
    onUnmounted(() => {
        window.removeEventListener('scroll', onScroll);
        if (frame) cancelAnimationFrame(frame);
    });

    return () => (
        <nav aria-label="Main" class="flex flex-auto flex-wrap gap-x-6 gap-y-1 text-[15px]">
            {props.items.map((n) => {
                const on = state.active && n.href === `/#${state.active}`;
                return (
                    <a key={n.href} href={n.href} aria-current={on ? 'location' : undefined} class={on ? 'font-medium text-fg' : 'text-fg-3 hover:text-cyan'}>
                        {n.label}
                    </a>
                );
            })}
        </nav>
    );
}, { name: 'SiteNav' });
