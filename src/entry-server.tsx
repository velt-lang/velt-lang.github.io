/**
 * Server entry: @sigx/ssg's generated one plus `islandsPlugin()`, which turns
 * each `client:*` component into a boundary record the client hydrates.
 */
import { renderToString } from '@sigx/server-renderer/server';
import { defineApp, type ComponentFactory } from 'sigx';
import { createRouter, createMemoryHistory, type RouteRecordRaw } from '@sigx/router';
import { islandsPlugin } from '@sigx/ssr-islands';
import routes from 'virtual:ssg-routes';
import { setupLayouts, LayoutRouter, setPageProps } from 'virtual:generated-layouts';

// The virtual modules type routes and the router component loosely.
const routesWithLayouts = setupLayouts(routes) as unknown as RouteRecordRaw[];
const Layouts = LayoutRouter as ComponentFactory<any, any, any>;
const BASE = import.meta.env.BASE_URL || '/';

export async function render(url: string, context?: { props?: Record<string, unknown> }) {
    setPageProps(url || '/', context?.props);
    const router = createRouter({
        routes: routesWithLayouts,
        history: createMemoryHistory({ base: BASE, initialLocation: url || '/' }),
    });
    const app = defineApp(<Layouts />).use(router).use(islandsPlugin());
    return await renderToString(app);
}

/** Build-time meta for every route, straight from the bundled page modules. */
export const routeMetas = routes.map((r) => ({ path: r.path, meta: r.meta }));

export async function getStaticPathsForRoute(routePath: string) {
    const route = routes.find((r) => r.path === routePath) as { getStaticPaths?: () => unknown } | undefined;
    if (!route || typeof route.getStaticPaths !== 'function') return null;
    return route.getStaticPaths();
}
