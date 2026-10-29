/**
 * The benchmark tabs on the home page. One entry per tab; add a benchmark by
 * adding an entry. Every number must come from the `source` file in
 * velt-lang/velt: quote it, don't round it differently, and update `source`
 * when a newer run replaces it.
 */
export interface BenchRow {
    name: string;
    /** The value the bar length is computed from (any unit, same per tab). */
    value: number;
    /** What the row prints. */
    label: string;
}

export interface Benchmark {
    id: string;
    tab: string;
    title: string;
    unit: string;
    note: string;
    /** Path in velt-lang/velt the numbers come from. */
    source: string;
    rows: BenchRow[];
}

const AZURE = 'AMD EPYC 7763, each server on 8 pinned cores. TechEmpower-style suite, bench/web.';

export const BENCHMARKS: Benchmark[] = [
    {
        id: 'json',
        tab: 'HTTP JSON',
        title: 'JSON responses, 64 connections',
        unit: 'requests / s · higher is better',
        note: AZURE,
        source: 'bench/web/RESULTS.md',
        rows: [
            { name: 'Velt', value: 345, label: '345k' },
            { name: 'Rust · axum', value: 346, label: '346k' },
            { name: 'Node · cluster', value: 243, label: '243k' },
            { name: 'Go', value: 229, label: '229k' },
            { name: 'Bun', value: 63, label: '63k' },
            { name: 'Node', value: 30, label: '30k' },
        ],
    },
    {
        id: 'plain',
        tab: 'Plaintext',
        title: 'Plaintext, pipelined 16 deep',
        unit: 'requests / s · higher is better',
        note: AZURE,
        source: 'bench/web/RESULTS.md',
        rows: [
            { name: 'Velt', value: 3300, label: '3.3M' },
            { name: 'Rust · axum', value: 737, label: '737k' },
            { name: 'Go', value: 399, label: '399k' },
        ],
    },
    {
        id: 'redis',
        tab: 'Redis',
        title: 'Pipelined GET',
        unit: 'operations / s · higher is better',
        note: 'Apple M4, Redis 8.8 on localhost. Rust: redis-rs; Node: ioredis. bench/db.',
        source: 'bench/db/RESULTS.md',
        rows: [
            { name: 'Velt', value: 1566, label: '1.57M' },
            { name: 'Rust', value: 1243, label: '1.24M' },
            { name: 'Node', value: 498, label: '498k' },
        ],
    },
    {
        id: 'pg',
        tab: 'Postgres',
        title: 'Point select',
        unit: 'queries / s · higher is better',
        note: 'Apple M4, PostgreSQL 17 on localhost. Rust: tokio-postgres; Node: pg. bench/db.',
        source: 'bench/db/RESULTS.md',
        rows: [
            { name: 'Velt', value: 35.2, label: '35.2k' },
            { name: 'Rust', value: 26.4, label: '26.4k' },
            { name: 'Node', value: 24.5, label: '24.5k' },
        ],
    },
    {
        id: 'sqlite',
        tab: 'SQLite',
        title: 'Insert, autocommit',
        unit: 'inserts / s · higher is better',
        note: 'Apple M4, bundled SQLite. Rust: rusqlite; Node: better-sqlite3. bench/db.',
        source: 'bench/db/RESULTS.md',
        rows: [
            { name: 'Velt', value: 113, label: '113k' },
            { name: 'Rust', value: 124, label: '124k' },
            { name: 'Node', value: 103, label: '103k' },
        ],
    },
    {
        id: 'mem',
        tab: 'Memory',
        title: 'Hello-world server under load',
        unit: 'peak MB · lower is better',
        note: 'Apple M4, Node 24. Velt serves 220k req/s, Node 130k. bench/http.',
        source: 'bench/http/RESULTS.md',
        rows: [
            { name: 'Velt', value: 21, label: '21 MB' },
            { name: 'Node', value: 129, label: '129 MB' },
        ],
    },
];

/** The stats strip under the hero. Source: velt-lang/velt README.md. */
export const HEADLINE_STATS = [
    { value: '7×', label: 'the JSON requests of Node', color: 'text-cyan' },
    { value: '1.2×', label: "the JSON requests of Rust's axum", color: 'text-violet' },
    { value: '8 MB', label: 'idle web server memory', color: 'text-pink' },
    { value: '3 ms', label: 'to start a program and exit', color: 'text-orange' },
    { value: '6 MB', label: 'one executable to deploy', color: 'text-yellow' },
] as const;
