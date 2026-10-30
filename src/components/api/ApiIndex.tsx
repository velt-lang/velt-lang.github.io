/** The list of std API pages with export counts and doc coverage (/docs/api/). */
import { component } from 'sigx';
import { apiModules, apiPath, coverage, guideIntro, percent } from '../../lib/std-api';
import { DocInline } from './DocText';

export const ApiIndex = component(() => () => {
    const rows = [...apiModules().values()].map((m) => ({ m, c: coverage(m) }));
    const total = rows.reduce((t, r) => ({ exports: t.exports + r.c.exports, documented: t.documented + r.c.documented }), { exports: 0, documented: 0 });
    return (
        <>
            <h1 class="m-0 font-display text-[40px] font-bold leading-[1.1] tracking-[-0.03em] text-fg">Standard library API</h1>
            <p class="m-0 text-lg text-fg-3">
                Every export of every <code>velt:</code> module with its signature and doc comment, generated from the
                standard library sources. {total.documented} of {total.exports} exports ({percent(total)}%) have a doc comment.
            </p>
            <div class="api-table overflow-x-auto rounded-xl border border-card-line">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Module</th>
                            <th scope="col" class="min-w-64">What it is</th>
                            <th scope="col" class="text-right">Exports</th>
                            <th scope="col" class="text-right">Documented</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(({ m, c }) => {
                            const summary = guideIntro(m.module).summary;
                            return (
                                <tr key={m.module}>
                                    <td class="whitespace-nowrap"><a href={apiPath(m.module)} class="font-mono text-[13.5px]">{m.specifier}</a></td>
                                    <td class="text-fg-3">{summary ? <DocInline md={summary.replace(/\. .*$/, '.')} /> : null}</td>
                                    <td class="text-right font-mono text-[13.5px]">{c.exports}</td>
                                    <td class={`text-right font-mono text-[13.5px] ${percent(c) < 50 ? 'text-orange' : 'text-fg-3'}`}>{percent(c)}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}, { name: 'ApiIndex' });
