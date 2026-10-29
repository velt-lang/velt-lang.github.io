/**
 * Client entry: islands only. Pages are static HTML; this registers a lazy
 * loader per island (virtual:sigx-islands, generated from src/islands/) and
 * hydrates the `client:*` components on their schedule. No router, no
 * full-app hydration: links are plain page loads, prefetched on hover.
 */
import './styles/global.css';
import 'virtual:sigx-islands';
import '@sigx/mermaid/styles';
import { hydrateIslands } from '@sigx/ssr-islands/client';
import { installCodeCopy, setupPrefetch } from '@sigx/ssg/client';

hydrateIslands();
// Copy buttons on code windows: one delegated listener, no hydration.
installCodeCopy();
setupPrefetch({ delay: 100 });

// Diagrams: the mermaid runtime loads only on pages that have one.
if (document.querySelector('[data-sigx-mermaid], code.language-mermaid')) {
    void import('@sigx/mermaid/client');
}
