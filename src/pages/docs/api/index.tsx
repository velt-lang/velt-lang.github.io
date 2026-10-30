/**
 * The std API tab's placeholder. The API pages will be generated from
 * `velt doc --std --format json` (exports, signatures, doc comments); until
 * then this says where the API is documented.
 */
import { component } from 'sigx';

export const meta = {
    title: 'Standard library API',
    description: 'API reference pages for the velt: modules are on their way. Until then, each module guide lists its exports, and velt doc --std generates them locally.',
    layout: 'docs',
};

export default component(() => () => (
    <>
        <h1>Standard library API</h1>
        <p>
            Generated API pages for every <code>velt:</code> module are on their way: each export with its
            signature, its doc comment, parameters, return value and the errors it throws.
        </p>
        <p>
            Until then, every module's <a href="/docs/std/">guide</a> lists its exports with examples, and{' '}
            <code>velt doc --std</code> generates the same reference locally as HTML from the sources.
        </p>
        <figure class="code-window">
            <div class="code-window-header">
                <span>Terminal</span>
            </div>
            <pre class="shiki" tabIndex={0}><code>velt doc --std</code></pre>
        </figure>
    </>
));
