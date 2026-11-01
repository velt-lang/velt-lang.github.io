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
 * Each snippet is checked as written, as the root file of a program: Velt runs a root
 * file's top-level statements like Node (top-level `await` included), and a file with
 * only declarations, or with `function main()`, checks too. So a snippet means what it
 * would mean in a file of its own.
 *
 * A snippet that imports an official package (`http-server`, `sqlite`, `postgres`, `redis`)
 * is checked inside a package that depends on it by path: set VELT_PACKAGES to the `packages/`
 * directory of a velt checkout at the release the docs describe (the database packages build
 * their native code with cargo the first time). Without VELT_PACKAGES such snippets are skipped.
 *
 * Known failures (scripts/check-examples-known.json, each with its issue) are reported but
 * don't fail the check; one that starts passing does, so the list stays current.
 *
 * Usage: node scripts/check-examples.mjs [filter]   (filter: a substring of "file:line")
 * Env:   VELT=<path to velt>, VELT_PACKAGES=<velt checkout>/packages, EXAMPLES_DUMP=<dir> to keep
 *        the checked files.
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
const PACKAGES_DIR = process.env.VELT_PACKAGES;
const PACKAGES = ['http-server', 'sqlite', 'postgres', 'redis'];

/** The official packages a snippet imports (`import … from "sqlite"`, `"http-server/websocket"`). */
export function packagesOf(source) {
    const names = new Set();
    for (const m of source.matchAll(/^\s*(?:import|export)\b[^"'\n]*?(?:from\s*)?["']([^"']+)["']/gm)) {
        const name = m[1].split('/')[0];
        if (PACKAGES.includes(name)) names.add(name);
    }
    return [...names].sort();
}

/** package.vlt for a snippet that uses `pkgs`, each by path from VELT_PACKAGES. */
const manifest = (pkgs) =>
    `import type { Package } from "velt/package";\n\nexport const pkg: Package = {\n  name: "example",\n  version: "0.1.0",\n  dependencies: {\n${pkgs
        .map((p) => `    ${JSON.stringify(p)}: { path: ${JSON.stringify(join(PACKAGES_DIR, p).replace(/\\/g, '/'))} },`)
        .join('\n')}\n  },\n};\n`;
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
    const needPackages = PACKAGES_DIR ? [] : all.filter((s) => s.expect !== 'skipped' && packagesOf(s.source).length > 0);
    const checked = all.filter((s) => s.expect !== 'skipped' && !needPackages.includes(s));
    const dir = process.env.EXAMPLES_DUMP ?? mkdtempSync(join(tmpdir(), 'velt-examples-'));
    mkdirSync(dir, { recursive: true });

    let next = 0;
    const worker = async () => {
        while (next < checked.length) {
            const s = checked[next++];
            const name = s.origin.replace(/[/.:]/g, '_');
            const sub = join(dir, name);
            mkdirSync(sub, { recursive: true });
            const program = s.source;
            const pkgs = packagesOf(program);
            if (pkgs.length) {
                writeFileSync(join(sub, 'package.vlt'), manifest(pkgs));
                mkdirSync(join(sub, 'src'), { recursive: true });
            }
            const file = join(sub, pkgs.length ? 'src' : '', `main.${s.lang === 'tsx' ? 'tsx' : 'vlt'}`);
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

    const skipped = all.length - checked.length - needPackages.length;
    if (needPackages.length) console.log(`${needPackages.length} example(s) import a package and were not checked: set VELT_PACKAGES to check them.\n`);
    if (known.length) console.log(`Known failures, not counted:\n  ${known.join('\n  ')}\n`);
    if (problems.length) {
        console.error(problems.join('\n\n'));
        console.error(`\n${problems.length} problem(s) in ${checked.length} checked example(s) (${skipped} skipped).`);
        process.exit(1);
    }
    console.log(`✓ ${checked.length - known.length} example(s) check with ${VELT} (${skipped} skipped: ignore / planned).`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('check-examples.mjs')) await main();
