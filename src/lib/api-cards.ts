/**
 * The hover cards' data files: /api-cards/<module slug>.json, one per API
 * page, fetched by the ApiCards island on the first hover over a type from
 * that module (never with the page). Written after the build; served on the
 * fly by `pnpm dev`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';
import { apiModule, apiModules, moduleCards, moduleSlug } from './std-api';

export const CARDS_PATH = '/api-cards/';

/** Writes every module's card file under `outDir`; returns how many. */
export function writeApiCards(outDir: string): number {
    let n = 0;
    for (const m of apiModules().values()) {
        const file = join(outDir, CARDS_PATH, `${moduleSlug(m.module)}.json`);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, JSON.stringify(moduleCards(m)));
        n++;
    }
    return n;
}

/** Dev server: answer /api-cards/<slug>.json from the API JSON. */
export function apiCardsDev(): Plugin {
    return {
        name: 'velt-api-cards-dev',
        apply: 'serve',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const slug = req.url?.match(/^\/api-cards\/(.+)\.json$/)?.[1];
                const m = slug ? apiModule(slug) : undefined;
                if (!m) return next();
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify(moduleCards(m)));
            });
        },
    };
}
