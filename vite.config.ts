import { defineConfig } from 'vite';
import { sigxPlugin } from '@sigx/vite';
import { sigxIslands } from '@sigx/vite/islands';
import { ssgPlugin } from '@sigx/ssg/vite';
import { remarkMermaid } from '@sigx/mermaid/ssg';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { rehypeVeltCode } from './src/lib/rehype-code.ts';
import { remarkReference } from './src/lib/remark-reference.ts';

// Asset path prefix. `/` for the GitHub Pages deployment at the domain root
// (https://veltlang.com/); override with BASE_PATH to serve from a subpath.
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
    base: BASE_PATH,
    build: {
        // LightningCSS drops at-rules it doesn't know; esbuild keeps them.
        cssMinify: 'esbuild',
    },
    plugins: [
        tailwindcss(),
        sigxPlugin(),
        // Islands: only components rendered with a `client:*` directive ship
        // JavaScript (src/islands/). Everything else is static HTML.
        sigxIslands(),
        ssgPlugin({
            markdown: {
                // Highlighting is ours (src/lib/rehype-code.ts): the Velt palette
                // and the design's code window. `remarkMermaid` claims ```mermaid
                // fences before that, so diagrams render in dev and build.
                // `remarkReference` makes dense reference pages readable
                // (term sections, diagnostics, callouts) before the headings
                // for "On this page" are collected.
                shiki: false,
                remarkPlugins: [remarkMermaid, remarkReference],
                rehypePlugins: [rehypeVeltCode],
            },
        }),
    ],
    oxc: {
        jsx: {
            runtime: 'automatic',
            importSource: 'sigx',
        },
    },
    resolve: {
        alias: {
            '@': resolve(import.meta.dirname, 'src'),
        },
    },
    optimizeDeps: {
        // mermaid is lazy-loaded, so Vite's scanner never reaches it, and its
        // dayjs dependency is UMD: prebundle it for dev. (Same as sigx.dev.)
        include: ['mermaid'],
    },
});
