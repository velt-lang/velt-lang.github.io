/** Every docs path lands in one area of the header switcher. */
import { describe, expect, it } from 'vitest';
import { areaOf, hasApiTabs, tint } from '../lib/docs-areas';

describe('docs areas', () => {
    it('maps paths to areas', () => {
        expect(areaOf('/docs/').id).toBe('learn');
        expect(areaOf('/docs/book/tour/').id).toBe('learn');
        expect(areaOf('/docs/reference/classes/').id).toBe('language');
        expect(areaOf('/docs/reference/diagnostics/').id).toBe('errors');
        expect(areaOf('/docs/std/collections/deque').id).toBe('std');
        expect(areaOf('/docs/api/').id).toBe('std');
        expect(areaOf('/docs/tooling/cli/').id).toBe('tooling');
    });

    it('gives std modules Guide | API tabs, not the overview', () => {
        expect(hasApiTabs('/docs/std/http/')).toBe(true);
        expect(hasApiTabs('/docs/api/')).toBe(true);
        expect(hasApiTabs('/docs/std/')).toBe(false);
        expect(hasApiTabs('/docs/book/')).toBe(false);
    });

    it('tints a hex color', () => {
        expect(tint('#FF9F5A', 0.1)).toBe('rgba(255,159,90,0.1)');
    });
});
