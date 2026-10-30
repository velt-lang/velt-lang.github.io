/**
 * Canonical signatures from `velt doc --format json`, laid out and colored for
 * the API pages (design/Api.dc.html). A signature is one line per overload;
 * one that is longer than the code block gets one parameter per line (the
 * design's one-line `upgradeConnection` overflows: this doesn't). Linked type
 * names keep their spans through the re-layout.
 */

export interface Span<T = unknown> {
    start: number;
    end: number;
    target: T;
}

/** A piece of a laid-out signature: plain text, a colored token, or a link. */
export type Token<T = unknown> =
    | { kind: 'text'; text: string }
    | { kind: 'k' | 't' | 'f' | 's' | 'n'; text: string }
    | { kind: 'link'; text: string; target: T };

/** Characters a signature line may have before its parameters go one per line. */
export const WRAP_AT = 80;

const KEYWORDS = new Set([
    'function', 'async', 'class', 'struct', 'interface', 'enum', 'type', 'const', 'let', 'extend', 'extends',
    'implements', 'throws', 'static', 'readonly', 'abstract', 'protected', 'public', 'private', 'mut', 'get', 'set',
    'new', 'null', 'undefined', 'true', 'false', 'keyof', 'typeof', 'in', 'is', 'shared', 'export', 'declare',
]);
const PRIMITIVES = new Set([
    'number', 'string', 'boolean', 'void', 'never', 'unknown', 'any', 'object', 'bigint', 'symbol',
    'i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64', 'f32', 'f64', 'isize', 'usize', 'char', 'bool',
]);

interface Edit {
    at: number;
    remove: number;
    insert: string;
}

/** Index of the bracket closing the one at `open`, skipping strings. */
function closing(src: string, open: number): number {
    let depth = 0;
    for (let i = open; i < src.length; i++) {
        const c = src[i];
        if (c === '"' || c === "'" || c === '`') {
            const q = c;
            for (i++; i < src.length && src[i] !== q; i++) if (src[i] === '\\') i++;
        } else if (c === '(' || c === '[' || c === '{' || c === '<') depth++;
        else if (c === ')' || c === ']' || c === '}' || (c === '>' && src[i - 1] !== '=')) {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

/**
 * The edits that put each parameter of the first parameter list on its own
 * line, or none when the line fits or the list is empty.
 */
function wrapEdits(line: string, width: number): Edit[] {
    if (line.length <= width) return [];
    // The parameter list: the first `(` outside a type-parameter list.
    let open = -1;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '<') {
            const end = closing(line, i);
            if (end < 0) return [];
            i = end;
        } else if (line[i] === '(') {
            open = i;
            break;
        } else if (line[i] === '=' || line[i] === '{') return [];
    }
    if (open < 0) return [];
    const close = closing(line, open);
    if (close < 0 || close === open + 1) return [];
    const edits: Edit[] = [{ at: open + 1, remove: 0, insert: '\n  ' }];
    let depth = 0;
    for (let i = open + 1; i < close; i++) {
        const c = line[i];
        if (c === '"' || c === "'" || c === '`') {
            for (i++; i < close && line[i] !== c; i++) if (line[i] === '\\') i++;
        } else if (c === '(' || c === '[' || c === '{' || c === '<') depth++;
        else if (c === ')' || c === ']' || c === '}' || (c === '>' && line[i - 1] !== '=')) depth--;
        else if (c === ',' && depth === 0) edits.push({ at: i + 1, remove: line[i + 1] === ' ' ? 1 : 0, insert: '\n  ' });
    }
    edits.push({ at: close, remove: 0, insert: ',\n' });
    return edits;
}

/** Applies edits (sorted, non-overlapping) to a string and shifts the spans with it. */
function applyEdits<T>(src: string, spans: Span<T>[], edits: Edit[]): { text: string; spans: Span<T>[] } {
    if (edits.length === 0) return { text: src, spans };
    let text = '';
    let last = 0;
    for (const e of edits) {
        text += src.slice(last, e.at) + e.insert;
        last = e.at + e.remove;
    }
    text += src.slice(last);
    const shift = (pos: number) => edits.reduce((d, e) => (e.at < pos || (e.at === pos && e.remove > 0) ? d + e.insert.length - e.remove : d), 0);
    return { text, spans: spans.map((s) => ({ ...s, start: s.start + shift(s.start), end: s.end + shift(s.start) })) };
}

/**
 * Lays a signature out (overloads on their own lines, long parameter lists
 * one per line) and keeps its spans pointing at the same names.
 */
export function layoutSignature<T>(signature: string, spans: Span<T>[], width = WRAP_AT): { text: string; spans: Span<T>[] } {
    const lines = signature.split('\n');
    let offset = 0;
    let text = '';
    const out: Span<T>[] = [];
    for (const [n, line] of lines.entries()) {
        const mine = spans.filter((s) => s.start >= offset && s.end <= offset + line.length).map((s) => ({ ...s, start: s.start - offset, end: s.end - offset }));
        const laid = applyEdits(line, mine, wrapEdits(line, width));
        const base = text.length + (n > 0 ? 1 : 0);
        text += (n > 0 ? '\n' : '') + laid.text;
        out.push(...laid.spans.map((s) => ({ ...s, start: s.start + base, end: s.end + base })));
        offset += line.length + 1;
    }
    return { text, spans: out };
}

/** Colors one stretch of signature text (no links in it). */
function colorize<T>(src: string, out: Token<T>[], prev: { word: string }) {
    const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d[\d_.]*n?\b)|([A-Za-z_$][\w$]*)|([^"'A-Za-z_$\d]+|.)/g;
    for (const m of src.matchAll(re)) {
        const [all, str, num, word] = m;
        if (str) out.push({ kind: 's', text: str });
        else if (num) out.push({ kind: 'n', text: num });
        else if (word) {
            const after = src.slice(m.index! + all.length);
            const kind = KEYWORDS.has(word) && !/^\s*[?:]/.test(after)
                ? 'k'
                : PRIMITIVES.has(word) || /^[A-Z]/.test(word)
                    ? 't'
                    : /^(<[^()]*>)?\(/.test(after) && prev.word !== ':'
                        ? 'f'
                        : 'text';
            out.push({ kind, text: word });
            prev.word = word;
            continue;
        } else out.push({ kind: 'text', text: all });
        const t = all.trim();
        if (t) prev.word = t.slice(-1);
    }
}

/** A laid-out signature as tokens: keywords, types, function names, strings, links. */
export function tokenize<T>(text: string, spans: Span<T>[]): Token<T>[] {
    const out: Token<T>[] = [];
    const prev = { word: '' };
    let last = 0;
    for (const s of [...spans].sort((a, b) => a.start - b.start)) {
        if (s.start < last) continue;
        colorize(text.slice(last, s.start), out, prev);
        out.push({ kind: 'link', text: text.slice(s.start, s.end), target: s.target });
        prev.word = text.slice(s.start, s.end);
        last = s.end;
    }
    colorize(text.slice(last), out, prev);
    // Merge neighbouring plain text so the markup stays small.
    return out.reduce<Token<T>[]>((acc, t) => {
        const p = acc[acc.length - 1];
        if (p && p.kind === t.kind && t.kind !== 'link' && p.kind !== 'link') p.text += t.text;
        else acc.push({ ...t });
        return acc;
    }, []);
}
