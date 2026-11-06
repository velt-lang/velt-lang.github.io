import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { mermaidColors } from '@/lib/mermaid-theme';

// The package's index has an extensionless import that plain Node can't resolve.
vi.mock('@sigx/mermaid', () => ({ configureMermaid: () => {} }));

const css = readFileSync(resolve(import.meta.dirname, '../styles/global.css'), 'utf8');

describe('mermaid theme', () => {
    // A token renamed in global.css would otherwise give diagrams an empty color.
    it('uses only design tokens that exist', () => {
        const tokens = new Set([...css.matchAll(/^\s*--color-([\w-]+):/gm)].map((m) => m[1]));
        const missing = Object.values(mermaidColors).filter((token) => !tokens.has(token));
        expect(missing).toEqual([]);
    });
});
