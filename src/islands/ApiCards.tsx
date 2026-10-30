/**
 * Hover cards on the API pages (design/Api.dc.html, api-hover.png): every
 * element with `data-card="/docs/api/<module>/#<anchor>"` (linked type names,
 * Exports rows) shows a card after ~150 ms on hover or keyboard focus. The
 * card stays while the pointer is in it, its own type links open nested
 * cards, Esc closes the top one. No cards on touch screens: a tap follows the
 * link. A module's card data (/api-cards/<module>.json) is fetched on the
 * first hover over one of its types, never with the page.
 */
import { component } from 'sigx';

type Token = [string, string] | [string, string, string];
interface Card {
    kind: string;
    color: string;
    name: string;
    module: string;
    href: string;
    decl: Token[];
    summary: string | null;
    usedBy: string[];
    usedByCount: number;
}

const OPEN_DELAY = 150;
const CLOSE_DELAY = 250;

const files = new Map<string, Promise<Record<string, Card>>>();

function load(href: string): Promise<Card | undefined> {
    const m = href.match(/^\/docs\/api\/(.+)\/#(.+)$/);
    if (!m) return Promise.resolve(undefined);
    let file = files.get(m[1]);
    if (!file) {
        file = fetch(`/api-cards/${m[1]}.json`).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
        files.set(m[1], file);
    }
    return file.then((cards) => cards[decodeURIComponent(m[2])]);
}

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, ...kids: (Node | string)[]) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    e.append(...kids);
    return e;
};

/** Inline Markdown of a summary: only code spans matter in one sentence. */
const inline = (md: string) => md.split(/(`[^`]+`)/).map((p) => (p.startsWith('`') && p.length > 1 ? el('code', '', p.slice(1, -1)) : p));

function render(card: Card, id: string): HTMLElement {
    const color = card.color;
    const pill = el('span', 'api-card-pill', card.kind);
    pill.style.color = color;
    pill.style.borderColor = `${color}4D`;
    pill.style.background = `${color}1A`;
    const decl = el('pre', 'api-card-decl', ...card.decl.map(([cls, text, href]) => {
        if (href) {
            const a = el('a', cls, text);
            a.href = href;
            a.dataset.card = href;
            return a;
        }
        return cls ? el('span', cls, text) : text;
    }));
    const doc = card.summary ? el('p', 'api-card-doc', ...inline(card.summary)) : el('p', 'api-card-doc api-card-missing', 'No doc comment yet.');
    const used = card.usedByCount
        ? el('span', '', 'Used by ', el('span', 'api-card-used', card.usedBy.join(', ')), card.usedByCount > card.usedBy.length ? ` +${card.usedByCount - card.usedBy.length}` : '')
        : el('span', '', '');
    const open = el('a', 'api-card-open', 'Open →');
    open.href = card.href;
    const root = el(
        'div',
        'api-card',
        el('div', 'api-card-head', pill, el('span', 'api-card-name', card.name), el('span', 'api-card-module', card.module)),
        decl,
        doc,
        el('div', 'api-card-foot', used, open),
    );
    root.id = id;
    root.setAttribute('role', 'tooltip');
    return root;
}

interface Open {
    trigger: HTMLElement;
    card: HTMLElement;
}

export const ApiCards = component(({ onMounted, onUnmounted }) => {
    const stack: Open[] = [];
    let openTimer = 0;
    let closeTimer = 0;
    let pending: HTMLElement | null = null;
    let seq = 0;

    /** How many cards to keep for an element under the pointer or focus: up to the card it is in, or the card its trigger opened. */
    const keepFor = (node: Element | null): number => {
        if (!node) return 0;
        for (let i = stack.length - 1; i >= 0; i--) {
            if (stack[i].card.contains(node)) return i + 1;
            if (stack[i].trigger === node || stack[i].trigger.contains(node)) return i + 1;
        }
        return 0;
    };
    const closeFrom = (depth: number, focus = false) => {
        while (stack.length > depth) {
            const top = stack.pop()!;
            top.card.remove();
            top.trigger.removeAttribute('aria-describedby');
            if (focus && stack.length === depth) top.trigger.focus();
        }
    };
    let hovered: Element | null = null;
    const scheduleClose = () => {
        clearTimeout(closeTimer);
        closeTimer = window.setTimeout(() => closeFrom(Math.max(keepFor(hovered), keepFor(document.activeElement))), CLOSE_DELAY);
    };

    const place = (card: HTMLElement, trigger: HTMLElement) => {
        const r = trigger.getBoundingClientRect();
        const w = Math.min(380, window.innerWidth - 16);
        card.style.width = `${w}px`;
        const left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
        card.style.left = `${left + window.scrollX}px`;
        const h = card.offsetHeight;
        const below = r.bottom + 6;
        const top = below + h > window.innerHeight - 8 && r.top - h - 6 > 8 ? r.top - h - 6 : below;
        card.style.top = `${top + window.scrollY}px`;
    };

    const show = async (trigger: HTMLElement) => {
        const href = trigger.dataset.card!;
        const depth = keepFor(trigger.parentElement?.closest('.api-card') ?? null);
        const data = await load(href);
        if (!data || pending !== trigger) return;
        if (stack[depth]?.trigger === trigger) return;
        closeFrom(depth);
        const card = render(data, `api-card-${++seq}`);
        card.style.zIndex = String(40 + depth);
        document.body.append(card);
        place(card, trigger);
        trigger.setAttribute('aria-describedby', card.id);
        stack.push({ trigger, card });
    };

    const triggerOf = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement>('[data-card]') : null);
    const arm = (trigger: HTMLElement) => {
        clearTimeout(openTimer);
        pending = trigger;
        openTimer = window.setTimeout(() => void show(trigger), OPEN_DELAY);
    };

    const onOver = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        hovered = e.target as Element;
        const t = triggerOf(e.target);
        if (t) arm(t);
        else if (pending && !stack.some((s) => s.trigger === pending)) {
            clearTimeout(openTimer);
            pending = null;
        }
        scheduleClose();
    };
    const onFocus = (e: FocusEvent) => {
        const t = triggerOf(e.target);
        if (t) arm(t);
        scheduleClose();
    };
    const onKey = (e: KeyboardEvent) => {
        if (e.key !== 'Escape' || !stack.length) return;
        const inCard = stack[stack.length - 1].card.contains(document.activeElement);
        closeFrom(stack.length - 1, inCard);
        clearTimeout(openTimer);
        pending = null;
    };
    const onScroll = () => closeFrom(0);

    const touchOnly = () => window.matchMedia('(hover: none)').matches;
    onMounted(() => {
        if (touchOnly()) return;
        document.addEventListener('pointerover', onOver);
        document.addEventListener('focusin', onFocus);
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', onScroll);
    });
    onUnmounted(() => {
        document.removeEventListener('pointerover', onOver);
        document.removeEventListener('focusin', onFocus);
        document.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', onScroll);
        closeFrom(0);
    });
    return () => <span hidden />;
}, { name: 'ApiCards' });
