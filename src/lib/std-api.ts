/**
 * The standard library's API, from `velt doc --std --format json`
 * (src/data/std-api.json, refreshed by scripts/refresh-std-api.mjs). Build
 * time only: pages and layouts read it while rendering; nothing here ships to
 * the browser. Schema: velt's docs/tooling/cli.md, "JSON output".
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_URL } from './site';
import { layoutSignature, tokenize, type Span } from './signature';

export interface Target {
    id: string;
    module: string;
    kind: string;
    name: string;
    member: string | null;
}

export type Role = 'param' | 'return' | 'throws' | 'extends' | 'implements' | 'typeArg' | 'field' | 'type';

export interface ApiSpan {
    start: number;
    end: number;
    role: Role;
    target: Target;
}

export interface ApiLink {
    text: string;
    ref: string;
    target: Target | null;
}

export interface ApiItem {
    id: string;
    name: string;
    kind: string;
    modifiers: string[];
    signature: string;
    spans: ApiSpan[];
    doc: string | null;
    summary: string | null;
    tags: {
        params: { name: string; doc: string }[];
        returns: string | null;
        throws: string[];
        examples: string[];
        deprecated: string | null;
        see: string[];
    };
    links: ApiLink[];
    source: { file: string; line: number } | null;
    reexportedFrom: { module: string; name: string } | null;
    members: ApiItem[];
}

export interface ApiModule {
    module: string;
    specifier: string;
    file: string;
    doc: string | null;
    summary: string | null;
    links: ApiLink[];
    exports: ApiItem[];
}

interface ApiDoc {
    schemaVersion: number;
    title: string;
    /** `velt --version` of the velt that wrote the file. */
    generator: string;
    modules: ApiModule[];
}

let doc: ApiDoc | undefined;

/** The whole document, read once per build. */
export function apiDoc(): ApiDoc {
    if (doc) return doc;
    const file = join(process.cwd(), 'src/data/std-api.json');
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as ApiDoc;
    if (parsed.schemaVersion !== 1) throw new Error(`${file}: schemaVersion ${parsed.schemaVersion}, this site reads 1`);
    doc = parsed;
    return doc;
}

/** The velt commit the snapshot was generated from, for source links (`velt 0.4.0 (8aeb012 …)`). */
export function sourceRef(): string {
    return apiDoc().generator.match(/\(([0-9a-f]{7,40})\s/)?.[1] ?? 'main';
}

export function sourceUrl(file: string, line?: number): string {
    return `${REPO_URL}/blob/${sourceRef()}/${file}${line ? `#L${line}` : ''}`;
}

// ─── Kinds ─────────────────────────────────────────────────────────────────

export interface KindInfo {
    /** The sidebar group and the order groups appear in. */
    group: string;
    glyph: string;
    color: string;
}

/** Tile glyphs and colors (design/Api.dc.html: ƒ pink, C cyan, S violet). */
export const KINDS: Record<string, KindInfo> = {
    function: { group: 'Functions', glyph: 'ƒ', color: '#F07BF5' },
    class: { group: 'Classes', glyph: 'C', color: '#5FE1F7' },
    struct: { group: 'Structs', glyph: 'S', color: '#A592FF' },
    interface: { group: 'Interfaces', glyph: 'I', color: '#3DDC97' },
    enum: { group: 'Enums', glyph: 'E', color: '#FFC93C' },
    type: { group: 'Types', glyph: 'T', color: '#FF9F5A' },
    const: { group: 'Constants', glyph: 'K', color: '#FF8FD8' },
    extend: { group: 'Extensions', glyph: '+', color: '#B4B4C8' },
    're-export': { group: 'Re-exports', glyph: '→', color: '#9A9AB0' },
};
const GROUP_ORDER = Object.values(KINDS).map((k) => k.group);

export const kindInfo = (kind: string): KindInfo => KINDS[kind] ?? KINDS.type;

/** A module's exports grouped Functions / Classes / Structs / … in that order. */
export function groupExports(items: ApiItem[]): { title: string; kind: string; items: ApiItem[] }[] {
    const groups = new Map<string, { title: string; kind: string; items: ApiItem[] }>();
    for (const it of items) {
        const k = kindInfo(it.kind);
        if (!groups.has(k.group)) groups.set(k.group, { title: k.group, kind: it.kind, items: [] });
        groups.get(k.group)!.items.push(it);
    }
    return [...groups.values()].sort((a, b) => GROUP_ORDER.indexOf(a.title) - GROUP_ORDER.indexOf(b.title));
}

// ─── Pages and anchors ─────────────────────────────────────────────────────

export const API_ROOT = '/docs/api/';

/** `std/collections/deque` → `collections/deque`. */
export const moduleSlug = (module: string) => module.replace(/^std\//, '');

export const apiPath = (module: string) => `${API_ROOT}${moduleSlug(module)}/`;
export const guidePath = (module: string) => `/docs/std/${moduleSlug(module)}/`;

/** An export's anchor on its module page: its name, or `kind-name` when an extend block shares it. */
export function anchorOf(item: Pick<ApiItem, 'id' | 'name' | 'kind'>): string {
    const local = item.id.slice(item.id.indexOf('#') + 1);
    if (local.startsWith('extend:')) return `extend-${local.slice(7).replace(/[^\w]+/g, '-').replace(/-+$/, '')}`;
    if (local.startsWith('type:')) return `type-${local.slice(5)}`;
    return local.replace(/[^\w.$-]+/g, '-');
}

let pageModules: Map<string, ApiModule> | undefined;

/**
 * The modules that get an API page: those with a guide page under
 * src/pages/docs/std/ (the public modules; the others are their internals).
 */
export function apiModules(): Map<string, ApiModule> {
    if (pageModules) return pageModules;
    const root = join(process.cwd(), 'src/pages/docs/std');
    pageModules = new Map(
        apiDoc()
            .modules.filter((m) => m.module.startsWith('std/') && existsSync(join(root, `${moduleSlug(m.module)}.mdx`)))
            .sort((a, b) => a.specifier.localeCompare(b.specifier))
            .map((m) => [m.module, m]),
    );
    return pageModules;
}

export const apiModule = (slug: string) => apiModules().get(`std/${slug.replace(/\/$/, '')}`);

let homes: Map<string, string> | undefined;

/**
 * Where a target is documented: its own module's page when that has one,
 * else the page of a public module that re-exports it (the internals of
 * `velt:http` are documented under `velt:http`). `null` when no page has it.
 */
export function hrefOf(target: Target): string | null {
    if (!homes) {
        homes = new Map();
        const all = apiDoc().modules;
        const byId = new Map(all.flatMap((m) => m.exports.map((e) => [e.id, e] as const)));
        for (const m of apiModules().values()) {
            for (const e of m.exports) {
                const href = `${apiPath(m.module)}#${anchorOf(e)}`;
                homes.set(e.id, href);
                for (const mem of e.members) homes.set(mem.id, `${apiPath(m.module)}#${anchorOf(mem)}`);
            }
        }
        // Re-exported items: the declaring module's id → the re-exporting page.
        for (const m of apiModules().values()) {
            for (const e of m.exports) {
                if (!e.reexportedFrom) continue;
                const spec = all.find((x) => x.module === e.reexportedFrom!.module)?.specifier;
                const orig = spec ? byId.get(`${spec}#${e.reexportedFrom.name}`) : undefined;
                if (!orig || homes.has(orig.id)) continue;
                homes.set(orig.id, `${apiPath(m.module)}#${anchorOf(e)}`);
                for (const mem of orig.members) {
                    homes.set(mem.id, `${apiPath(m.module)}#${anchorOf({ ...mem, id: mem.id.replace(orig.id, e.id) })}`);
                }
            }
        }
    }
    return homes.get(target.id) ?? (target.member ? homes.get(target.id.slice(0, target.id.lastIndexOf('.'))) ?? null : null);
}

/**
 * The exports an API page lists, grouped by kind as in its sidebar
 * (functions, classes, structs, …), in source order within a kind.
 */
export const visibleExports = (m: ApiModule): ApiItem[] => groupExports(m.exports).flatMap((g) => g.items);

/**
 * The first `count` sentences of Markdown text. A sentence ends at a period
 * followed by a space or the end, outside code spans and parentheses, and
 * not in "e.g." or "i.e." (velt's own `summary` stops there).
 */
export function sentences(md: string, count = 1): string {
    const text = md.replace(/\s*\n\s*/g, ' ').trim();
    const out: string[] = [];
    let cur = '';
    let code = false;
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        cur += c;
        if (c === '`') code = !code;
        else if (!code && c === '(') depth++;
        else if (!code && c === ')') depth = Math.max(0, depth - 1);
        else if (!code && depth === 0 && c === '.' && (text[i + 1] === ' ' || i === text.length - 1) && !/\b(e\.g|i\.e|etc|vs|cf)\.$/.test(cur)) {
            out.push(cur.trim());
            cur = '';
            if (out.length === count) break;
        }
    }
    if (out.length < count && cur.trim()) out.push(cur.trim());
    return out.join(' ');
}

/** An item's one-line summary: the first sentence of its doc comment. */
export const summaryOf = (it: Pick<ApiItem, 'doc' | 'summary'>): string | null => (it.doc ? sentences(it.doc) : it.summary);

// ─── From the module's guide ───────────────────────────────────────────────

interface GuideIntro {
    /** The guide's import line, e.g. `import { serve, Server } from "velt:http"`. */
    importLine: string | null;
    /** The guide's opening sentences (Markdown), without the import line. */
    summary: string | null;
}

const intros = new Map<string, GuideIntro>();

/**
 * The opening of a module's guide page: the API page's summary comes from
 * the guide, not from the source file's top comment (which describes
 * internals, design/Api.dc.html).
 */
export function guideIntro(module: string): GuideIntro {
    const cached = intros.get(module);
    if (cached) return cached;
    const file = join(process.cwd(), 'src/pages/docs/std', `${moduleSlug(module)}.mdx`);
    const src = existsSync(file) ? readFileSync(file, 'utf8') : '';
    const body = src.replace(/^---[\s\S]*?\n---\n/, '');
    // The first paragraph after the `# heading`.
    const para = body.split(/\n\s*\n/).map((p) => p.trim()).find((p) => p && !p.startsWith('#') && !p.startsWith('import ') && !p.startsWith('<')) ?? '';
    const text = para.replace(/\s*\n\s*/g, ' ');
    const imp = text.match(/^`(import [^`]+)`\.?\s*/);
    const rest = imp ? text.slice(imp[0].length) : text;
    const intro = { importLine: imp ? imp[1].replace(/;$/, '') : null, summary: sentences(rest, 2) || null };
    intros.set(module, intro);
    return intro;
}

export const moduleSummary = (m: ApiModule) => guideIntro(m.module).summary ?? m.summary;

// ─── Doc coverage ──────────────────────────────────────────────────────────

export interface Coverage {
    module: string;
    specifier: string;
    exports: number;
    documented: number;
    /** Exports without a doc comment. */
    missing: string[];
}

/** Doc comment coverage of a module's exports (`extend` blocks and re-export lines don't count). */
export function coverage(m: ApiModule): Coverage {
    const counted = m.exports.filter((e) => e.kind !== 'extend' && e.kind !== 're-export');
    const missing = counted.filter((e) => !e.doc).map((e) => e.name);
    return { module: m.module, specifier: m.specifier, exports: counted.length, documented: counted.length - missing.length, missing };
}

export const percent = (c: Pick<Coverage, 'exports' | 'documented'>) => (c.exports ? Math.round((c.documented / c.exports) * 100) : 100);

/** The build log's coverage table: modules sorted by coverage, least documented first. */
export function coverageReport(): string {
    const rows = [...apiModules().values()].map(coverage).sort((a, b) => percent(a) - percent(b) || a.specifier.localeCompare(b.specifier));
    const total = rows.reduce((t, r) => ({ exports: t.exports + r.exports, documented: t.documented + r.documented }), { exports: 0, documented: 0 });
    const width = Math.max(...rows.map((r) => r.specifier.length));
    const lines = rows.map((r) => {
        const gaps = r.missing.length ? `  missing: ${r.missing.slice(0, 6).join(', ')}${r.missing.length > 6 ? `, +${r.missing.length - 6}` : ''}` : '';
        return `   ${r.specifier.padEnd(width)}  ${String(r.documented).padStart(3)}/${String(r.exports).padEnd(3)} ${String(percent(r)).padStart(3)}%${gaps}`;
    });
    return [`📚 Std API doc coverage (${apiDoc().generator}): ${total.documented}/${total.exports} exports documented (${percent(total)}%)`, ...lines].join('\n');
}

// ─── Backlinks ─────────────────────────────────────────────────────────────

export type BacklinkKind = 'Parameter of' | 'Returned by' | 'Thrown by' | 'Used by';

export interface Backlink {
    /** The using export's name (`serve`, `Server.close` for a member). */
    name: string;
    href: string;
    /** The page module it is on (`std/http`). */
    module: string;
}

const ROLE_LABEL: Record<Role, BacklinkKind> = {
    param: 'Parameter of', return: 'Returned by', throws: 'Thrown by',
    extends: 'Used by', implements: 'Used by', typeArg: 'Used by', field: 'Used by', type: 'Used by',
};
export const BACKLINK_ORDER: BacklinkKind[] = ['Parameter of', 'Returned by', 'Thrown by', 'Used by'];

let backlinkIndex: Map<string, Map<BacklinkKind, Backlink[]>> | undefined;

/**
 * Where an export is used, by inverting the type spans of every documented
 * item: keyed by the export's page href, then by role. An item is listed once
 * per role; a member's span counts for its type (`Server.close` → `Server`).
 */
export function backlinks(href: string): Map<BacklinkKind, Backlink[]> {
    if (!backlinkIndex) {
        backlinkIndex = new Map();
        const pageOf = (h: string) => `std/${h.slice(API_ROOT.length).replace(/\/#.*$/, '')}`;
        const add = (to: string, kind: BacklinkKind, from: Backlink) => {
            if (from.href === to) return;
            let roles = backlinkIndex!.get(to);
            if (!roles) backlinkIndex!.set(to, (roles = new Map()));
            const list = roles.get(kind) ?? [];
            if (!list.some((b) => b.href === from.href)) list.push(from);
            roles.set(kind, list);
        };
        for (const m of apiDoc().modules) {
            for (const e of m.exports) {
                const from = hrefOf({ id: e.id, module: m.module, kind: e.kind, name: e.name, member: null });
                if (!from) continue;
                const source = { name: e.name, href: from, module: pageOf(from) };
                for (const s of e.spans) {
                    const to = hrefOf(s.target);
                    if (to) add(to.replace(/(#[^.]*)\..*$/, '$1'), ROLE_LABEL[s.role], source);
                }
                for (const mem of e.members) {
                    for (const s of mem.spans) {
                        const to = hrefOf(s.target);
                        if (to) add(to.replace(/(#[^.]*)\..*$/, '$1'), ROLE_LABEL[s.role], { ...source, name: `${e.name}.${mem.name}` });
                    }
                }
            }
        }
    }
    return backlinkIndex.get(href) ?? new Map();
}

// ─── Hover cards ───────────────────────────────────────────────────────────

/** A token of a card's declaration: [class, text] or [class, text, href] for a linked type. */
export type CardToken = [string, string] | [string, string, string];

export interface Card {
    kind: string;
    name: string;
    module: string;
    href: string;
    /** The declaration in short form: fields of a struct, public members of a class, the alias of a type. */
    decl: CardToken[];
    /** The first doc sentence (Markdown), or null: "No doc comment yet". */
    summary: string | null;
    /** Exports that use it, for the footer ("Used by serve"). */
    usedBy: string[];
    usedByCount: number;
}

const CARD_MEMBERS = 8;
const TOKEN_CLASS: Record<string, string> = { k: 'tk-k', t: 'tk-t', f: 'tk-f', s: 'tk-s', n: 'tk-n', text: '', link: 'api-type' };

/** The short declaration of an export and its spans, for its card. */
function shortDecl(e: ApiItem): { text: string; spans: Span<Target>[] } {
    const withBody = ['struct', 'class', 'interface', 'enum'].includes(e.kind);
    if (!withBody) return layoutSignature(e.signature, e.spans, 52);
    let text = `${e.signature} {`;
    const spans: Span<Target>[] = e.spans.map((s) => ({ ...s }));
    const shown = e.members.filter((m) => m.kind !== 'constructor').slice(0, CARD_MEMBERS);
    for (const m of shown) {
        text += '\n  ';
        const at = text.length;
        text += m.signature + (e.kind === 'enum' ? ',' : ';');
        for (const s of m.spans) spans.push({ start: s.start + at, end: s.end + at, target: s.target });
    }
    if (e.members.length > shown.length) text += '\n  …';
    text += shown.length ? '\n}' : '}';
    return { text, spans };
}

/** Card data for every export on a module's page, keyed by anchor. Served as /api-cards/<slug>.json. */
export function moduleCards(m: ApiModule): Record<string, Card> {
    const cards: Record<string, Card> = {};
    for (const e of m.exports) {
        const href = `${apiPath(m.module)}#${anchorOf(e)}`;
        const decl = shortDecl(e);
        const used = [...backlinks(href).values()].flat();
        const names = [...new Set(used.map((b) => b.name))];
        cards[anchorOf(e)] = {
            kind: e.kind,
            name: e.name,
            module: m.specifier,
            href,
            decl: tokenize(decl.text, decl.spans).map((t): CardToken => {
                if (t.kind === 'link') {
                    const to = hrefOf(t.target);
                    return to ? ['api-type', t.text, to] : ['tk-t', t.text];
                }
                return [TOKEN_CLASS[t.kind], t.text];
            }),
            summary: summaryOf(e),
            usedBy: names.slice(0, 3),
            usedByCount: names.length,
        };
    }
    return cards;
}
