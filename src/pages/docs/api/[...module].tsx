/**
 * One API page per std module, the Guide | API tab's target:
 * /docs/api/http/ for velt:http, /docs/api/collections/deque/ for
 * velt:collections/deque. Generated from src/data/std-api.json.
 */
import { component } from 'sigx';
import { ApiIndex } from '../../../components/api/ApiIndex';
import { ApiPage } from '../../../components/api/ApiPage';
import { highlighterReady } from '../../../components/api/CodeBlock';
import { apiModule, apiModules, moduleSlug } from '../../../lib/std-api';

await highlighterReady;

export const meta = {
    title: 'API',
    description: 'A Velt standard library module API reference.',
    layout: 'docs',
};

export function getStaticPaths() {
    return [...apiModules().keys()].map((m) => ({ params: { module: moduleSlug(m) } }));
}

export default component<{ params: { module?: string } }>(({ props }) => () => {
    // The router also matches /docs/api/ here (an empty module): that's the index.
    const m = props.params.module ? apiModule(props.params.module) : undefined;
    return m ? <ApiPage module={m} /> : <ApiIndex />;
}, { name: 'StdApiPage' });
