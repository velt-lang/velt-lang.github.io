/** Full-width docs pages (the std catalog): the docs header, the page, no sidebars. */
import { component } from 'sigx';
import type { LayoutProps, LayoutSlots } from '@sigx/ssg';
import { DocsHeader } from '../components/DocsHeader';

export default component<LayoutProps, unknown, LayoutSlots>(({ props, slots }) => () => (
    <div id="top" class="min-h-screen bg-bg text-fg [line-height:1.65]">
        <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
            Skip to content
        </a>
        <DocsHeader path={props.path ?? '/docs/'} />
        <main id="main">{slots.default?.()}</main>
    </div>
), { name: 'CatalogLayout' });
