/**
 * The search palette's Errors records: every compiler message quoted in the
 * diagnostics page's tables, so pasting an error finds its page. Emitted at
 * build time as `/errors-index.json` (and served by the dev server).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

export interface ErrorRecord {
    /** The message as the compiler prints it. */
    message: string;
    /** The table's first column: what kind of mistake it is. */
    situation: string;
}

export const DIAGNOSTICS_MDX = 'src/pages/docs/reference/diagnostics.mdx';
export const ERRORS_INDEX = 'errors-index.json';

/** Code spans in a markdown table cell, any number of backticks. */
function codeSpans(cell: string): string[] {
    return [...cell.matchAll(/(`+)(.+?)\1(?!`)/g)].map((m) => m[2].trim());
}

/** Quoted messages ("this async closure modifies captured `n` …"). */
function quoted(cell: string): string[] {
    return [...cell.matchAll(/"([^"]{16,})"/g)].map((m) => m[1].trim());
}

export function parseDiagnostics(markdown: string): ErrorRecord[] {
    const seen = new Set<string>();
    const out: ErrorRecord[] = [];
    for (const line of markdown.split('\n')) {
        if (!line.startsWith('|') || /^\|\s*-/.test(line)) continue;
        // Some rows leave out the closing `|`.
        const cells = line.replace(/\|\s*$/, '').split(/(?<!\\)\|/).slice(1);
        if (cells.length < 2) continue;
        const situation = cells[0].replace(/`/g, '').trim();
        if (/^situation$/i.test(situation)) continue;
        const rest = cells.slice(1).join(' | ');
        for (const message of [...codeSpans(rest), ...quoted(rest)]) {
            if (!message.includes(' ') || seen.has(message)) continue;
            seen.add(message);
            out.push({ message, situation });
        }
    }
    return out;
}

const build = () => JSON.stringify(parseDiagnostics(readFileSync(join(process.cwd(), DIAGNOSTICS_MDX), 'utf8')));

export function errorsIndexPlugin(): Plugin {
    return {
        name: 'velt-errors-index',
        configureServer(server) {
            server.middlewares.use(`/${ERRORS_INDEX}`, (_req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(build());
            });
        },
        generateBundle() {
            if (this.environment?.config.consumer === 'server') return;
            this.emitFile({ type: 'asset', fileName: ERRORS_INDEX, source: build() });
        },
    };
}
