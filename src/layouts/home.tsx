/** Marketing pages: the site header, the page, the footer. */
import { component } from 'sigx';
import type { LayoutProps, LayoutSlots } from '@sigx/ssg';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';

export default component<LayoutProps, unknown, LayoutSlots>(({ slots }) => () => (
    <div class="min-h-screen bg-bg text-fg">
        <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
            Skip to content
        </a>
        <SiteHeader />
        <main id="main">{slots.default?.()}</main>
        <SiteFooter />
    </div>
), { name: 'HomeLayout' });
