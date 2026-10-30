/**
 * The search palette's API records: every export of the std API pages, and
 * the public members of their classes, emitted at build time as
 * `/api-index.json` (and served by the dev server) from src/data/std-api.json.
 */
import type { Plugin } from 'vite';
import { apiSearchEntries } from './std-api';

export const API_INDEX = 'api-index.json';

const build = () => JSON.stringify(apiSearchEntries());

export function apiIndexPlugin(): Plugin {
    return {
        name: 'velt-api-index',
        configureServer(server) {
            server.middlewares.use(`/${API_INDEX}`, (_req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(build());
            });
        },
        generateBundle() {
            if (this.environment?.config.consumer === 'server') return;
            this.emitFile({ type: 'asset', fileName: API_INDEX, source: build() });
        },
    };
}
