#!/usr/bin/env node
/**
 * Refreshes src/data/std-api.json, the standard library's API as
 * `velt doc --std --format json` writes it (velt-lang/velt#1951). The API
 * pages, their hover cards and backlinks, the search index's API records and
 * the catalog's export counts are all built from this one file.
 *
 *   node scripts/refresh-std-api.mjs [path/to/velt]
 *
 * Uses the `velt` given, else $VELT, else the one on PATH. The JSON output is
 * newer than velt 0.4.0: until a release has it, run a velt built from main
 * (`cargo build --release -p veltc` in velt-lang/velt). The file records the
 * velt version that wrote it.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const velt = process.argv[2] ?? process.env.VELT ?? 'velt';
const out = join(import.meta.dirname, '..', 'src', 'data', 'std-api.json');

const run = (args) => execFileSync(velt, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

const version = run(['--version']).trim();
const doc = JSON.parse(run(['doc', '--std', '--format', 'json', '-o', '-']));
if (doc.schemaVersion !== 1) {
    throw new Error(`velt doc wrote schemaVersion ${doc.schemaVersion}; src/lib/std-api.ts reads version 1`);
}

// One line per module keeps diffs readable without the 7 MB of indentation.
const lines = doc.modules.map((m) => JSON.stringify(m));
writeFileSync(
    out,
    `{"schemaVersion":${doc.schemaVersion},"title":${JSON.stringify(doc.title)},"generator":${JSON.stringify(version)},"modules":[\n${lines.join(',\n')}\n]}\n`,
);
console.log(`${out}: ${doc.modules.length} modules from ${version}`);
