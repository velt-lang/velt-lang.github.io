#!/usr/bin/env node
/**
 * Checks the docs' code examples with the installed `velt` (AGENTS.md: code
 * examples must be valid Velt for DOCS_VERSION). The same rules as velt-lang/
 * velt's former `cargo test -p veltc --test docs`:
 *
 *   ```ts          must type-check (`velt check`)
 *   ```ts error    must be rejected with a diagnostic, not an internal compiler error
 *   ```ts ignore   not a complete program (an excerpt, pseudo-code): skipped
 *   ```ts planned  designed but not implemented yet: skipped
 *
 * `vlt` and `tsx` fences follow the same rules; `title="…"` is allowed with any of them.
 * A snippet without `main` is completed: declarations (`import`, `function`, `class`,
 * `struct`, `interface`, `type`, `enum`, `extend`, `export …`, `const UPPER_CASE`) stay at
 * module level, and every other top-level statement moves, in order, into a generated
 * `async function main()`.
 *
 * Known failures (scripts/check-examples-known.json, each with its issue) are reported but
 * don't fail the check; one that starts passing does, so the list stays current.
 *
 * Usage: node scripts/check-examples.mjs [filter]   (filter: a substring of "file:line")
 * Env:   VELT=<path to velt>, EXAMPLES_DUMP=<dir> to keep the completed programs.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const DOCS = join(ROOT, 'src/pages/docs');
const VELT = process.env.VELT ?? 'velt';
const LANGS = new Set(['ts', 'vlt', 'tsx']);
const filter = process.argv[2];
const KNOWN = JSON.parse(readFileSync(join(import.meta.dirname, 'check-examples-known.json'), 'utf8')).known;
const knownOf = (s) => KNOWN.find((k) => s.origin.startsWith(`${k.file}:`) && s.source.split('\n')[0].trim() === k.first);

const walk = (dir) =>
    readdirSync(dir).flatMap((n) => {
        const f = join(dir, n);
        return statSync(f).isDirectory() ? walk(f) : n.endsWith('.mdx') ? [f] : [];
    });

/** The `ts` / `vlt` / `tsx` fences of one MDX file. */
export function snippets(rel, text) {
    const out = [];
    const errors = [];
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trimStart();
        if (!trimmed.startsWith('```')) continue;
        const indent = lines[i].length - trimmed.length;
        const info = trimmed.slice(3).replace(/title=(?:"[^"]*"|'[^']*'|\S+)/, '').trim().split(/\s+/);
        const start = i;
        const body = [];
        for (i++; i < lines.length && !lines[i].trimStart().startsWith('```'); i++) body.push(lines[i].slice(indent));
        if (!LANGS.has(info[0])) continue;
        const origin = `${rel}:${start + 1}`;
        const flag = info[1];
        const expect = flag === undefined ? 'compiles' : flag === 'error' ? 'fails' : flag === 'ignore' || flag === 'planned' ? 'skipped' : undefined;
        if (!expect) {
            errors.push(`${origin}: unknown fence flag \`${info[0]} ${flag}\` (use error, ignore or planned)`);
            continue;
        }
        out.push({ origin, expect, lang: info[0], source: `${body.join('\n')}\n` });
    }
    return { out, errors };
}

const DECLARATIONS = ['import ', 'export ', 'function ', 'function*', 'async function ', 'async function*', 'class ', 'abstract class ', 'struct ', 'interface ', 'type ', 'enum ', 'extend ', 'extend<', 'declare ', 'namespace '];

function isDeclaration(first) {
    if (DECLARATIONS.some((k) => first.startsWith(k))) return true;
    // `const MAX = 100;`: a module constant, by naming convention.
    const name = first.startsWith('const ') ? first.slice(6).split(/[ :=]/)[0] : '';
    return name !== '' && /^[A-Z0-9_]+$/.test(name);
}

/** The program a snippet stands for. */
export function complete(source) {
    const lines = source.replace(/\n$/, '').split('\n');
    if (lines.some((l) => /^(export )?(async )?function main\(/.test(l))) return source;
    // An item starts at a non-blank line without indentation that doesn't close a bracket;
    // column-0 comments belong to the item that follows them.
    const items = [];
    let comments = [];
    for (const line of lines) {
        const startsItem = line !== '' && !/^[ \t})\]]/.test(line) && !line.startsWith('//');
        if (line.startsWith('//')) comments.push(line);
        else if (startsItem || items.length === 0) {
            items.push([...comments, line]);
            comments = [];
        } else {
            items[items.length - 1].push(...comments, line);
            comments = [];
        }
    }
    let decls = '';
    let stmts = '';
    for (const item of items) {
        const first = item.find((l) => !l.startsWith('//') && l.trim() !== '') ?? '';
        const text = item.join('\n') + '\n';
        if (isDeclaration(first)) decls += text;
        else stmts += text;
    }
    if (!stmts.trim()) return `${decls}\nfunction main() {}\n`;
    const body = stmts.replace(/\n$/, '').split('\n').map((l) => `  ${l}`).join('\n');
    return `${decls}\nasync function main() {\n${body}\n}\n`;
}

function run(file) {
    return new Promise((resolve) => {
        const child = spawn(VELT, ['check', file], { cwd: join(file, '..') });
        let output = '';
        child.stdout.on('data', (d) => (output += d));
        child.stderr.on('data', (d) => (output += d));
        child.on('error', (e) => resolve({ code: -1, output: String(e) }));
        child.on('close', (code) => resolve({ code, output }));
    });
}

async function main() {
    const files = walk(DOCS).sort();
    const all = [];
    const problems = [];
    const known = [];
    for (const f of files) {
        const rel = relative(ROOT, f).replace(/\\/g, '/');
        const { out, errors } = snippets(rel, readFileSync(f, 'utf8'));
        problems.push(...errors);
        all.push(...out.filter((s) => !filter || s.origin.includes(filter)));
    }
    const checked = all.filter((s) => s.expect !== 'skipped');
    const dir = process.env.EXAMPLES_DUMP ?? mkdtempSync(join(tmpdir(), 'velt-examples-'));
    mkdirSync(dir, { recursive: true });

    let next = 0;
    const worker = async () => {
        while (next < checked.length) {
            const s = checked[next++];
            const name = s.origin.replace(/[/.:]/g, '_');
            const sub = join(dir, name);
            mkdirSync(sub, { recursive: true });
            const program = complete(s.source);
            const file = join(sub, `main.${s.lang === 'tsx' ? 'tsx' : 'vlt'}`);
            writeFileSync(file, program);
            const { code, output } = await run(file);
            const shown = () => program.split('\n').map((l, i) => `${String(i + 1).padStart(4)} | ${l}`).join('\n');
            const k = s.expect === 'compiles' ? knownOf(s) : undefined;
            if (k && code === 0) problems.push(`${s.origin}: listed in check-examples-known.json (#${k.issue}) but checks now: remove it from the list`);
            else if (k && code === 1) known.push(`${s.origin} (#${k.issue})`);
            else if (code === -1) problems.push(`${s.origin}: could not run \`${VELT}\`: ${output}`);
            else if (s.expect === 'compiles' && code !== 0) problems.push(`${s.origin}: does not compile\n${output.trim()}\n${shown()}`);
            else if (s.expect === 'fails' && code === 0) problems.push(`${s.origin}: marked \`error\` but compiles\n${shown()}`);
            else if (code !== 0 && code !== 1) problems.push(`${s.origin}: velt exited with ${code} (internal compiler error?)\n${output.trim()}`);
        }
    };
    await Promise.all(Array.from({ length: Math.max(1, availableParallelism()) }, worker));
    if (!process.env.EXAMPLES_DUMP) rmSync(dir, { recursive: true, force: true });

    const skipped = all.length - checked.length;
    if (known.length) console.log(`Known failures, not counted:\n  ${known.join('\n  ')}\n`);
    if (problems.length) {
        console.error(problems.join('\n\n'));
        console.error(`\n${problems.length} problem(s) in ${checked.length} checked example(s) (${skipped} skipped).`);
        process.exit(1);
    }
    console.log(`✓ ${checked.length - known.length} example(s) check with ${VELT} (${skipped} skipped: ignore / planned).`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('check-examples.mjs')) await main();
