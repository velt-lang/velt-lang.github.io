/**
 * The standard library's API, from `velt doc --std --format json`
 * (src/data/std-api.json, refreshed by scripts/refresh-std-api.mjs). Build
 * time only: pages and layouts read it while rendering; nothing here ships to
 * the browser. Schema: velt's docs/tooling/cli.md, "JSON output".
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_URL } from './site';

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
