import { describe, expect, it } from 'vitest';
import { BENCHMARKS } from '../data/benchmarks';

describe('benchmarks', () => {
    it('have unique ids', () => {
        expect(new Set(BENCHMARKS.map((b) => b.id)).size).toBe(BENCHMARKS.length);
    });

    for (const b of BENCHMARKS) {
        it(`${b.id}: a Velt row, positive values and a source in velt-lang/velt`, () => {
            expect(b.rows.some((r) => r.name === 'Velt')).toBe(true);
            for (const r of b.rows) expect(r.value).toBeGreaterThan(0);
            expect(b.source).toMatch(/^bench\/.+\.md$/);
            expect(b.note).toMatch(/bench\/\w+\.?$/);
        });
    }
});
