/**
 * A std module's API reference (design/Api.dc.html, api-1440.png): the
 * module name with an "API reference" pill, the guide's summary, the import
 * line, the Exports table, then one section per export. Built from
 * `velt doc --format json`; static except the copy button.
 */
import { component } from 'sigx';
import { CopyTextButton } from '../../islands/CopyTextButton';
import {
    anchorOf, guideIntro, guidePath, groupExports, kindInfo, moduleSummary, sourceUrl, summaryOf, visibleExports,
    type ApiItem, type ApiModule,
} from '../../lib/std-api';
import { tint } from '../../lib/docs-areas';
import { DocInline, DocText } from './DocText';
import { CodeBlock } from './CodeBlock';
import { SignatureBlock, SignatureInline, TypeLink } from './Signature';

const eyebrow = 'font-mono text-[11.5px] uppercase tracking-[0.1em] text-muted';

/** A kind or modifier pill: `function` in its kind color, `async` outlined. */
export const KindPill = component<{ kind: string; size?: 'sm' | 'md' }>(({ props }) => () => {
    const k = kindInfo(props.kind);
    const sm = props.size === 'sm';
    return (
        <span
            class={`inline-block whitespace-nowrap border font-mono leading-[1.6] ${sm ? 'rounded-[5px] px-[7px] text-[11px]' : 'rounded-md px-2 text-[11.5px]'}`}
            style={{ color: k.color, background: tint(k.color, 0.1), borderColor: tint(k.color, 0.3) }}
        >
            {props.kind}
        </span>
    );
}, { name: 'KindPill' });

const ModifierPill = component<{ text: string }>(({ props }) => () => (
    <span class={`rounded-md border px-2 font-mono text-[11.5px] leading-[1.6] ${props.text === 'deprecated' ? 'border-[#5A2A35] text-[#FFB3C0]' : 'border-line-3 text-fg-3'}`}>
        {props.text}
    </span>
), { name: 'ModifierPill' });

/** A tag section: eyebrow label and its content. */
const Tag = component<{ label: string }>(({ props, slots }) => () => (
    <div class="flex flex-col gap-2">
        <span class={eyebrow}>{props.label}</span>
        {slots.default?.()}
    </div>
), { name: 'Tag' });

/** A `@throws` text starts with the type it throws; link it when it names one. */
function throwsTarget(text: string, item: ApiItem) {
    const name = text.match(/^\{?([A-Z][\w.]*)\}?/)?.[1];
    return name ? item.spans.find((s) => s.role === 'throws' && s.target.name === name)?.target : undefined;
}

/** Struct fields as a table: Field / Type / Description. */
const FieldTable = component<{ fields: ApiItem[] }>(({ props }) => () => (
    <div class="api-table overflow-x-auto rounded-xl border border-card-line">
        <table>
            <thead>
                <tr>
                    <th scope="col">Field</th>
                    <th scope="col">Type</th>
                    <th scope="col" class="min-w-64">Description</th>
                </tr>
            </thead>
            <tbody>
                {props.fields.map((f) => {
                    // `name?: Type` / `readonly name: Type`: split at the first top-level colon.
                    const colon = f.signature.indexOf(':');
                    const head = colon > 0 ? f.signature.slice(0, colon) : f.signature;
                    return (
                        <tr key={f.id} id={anchorOf(f)}>
                            <td class="whitespace-nowrap font-mono text-[13.5px] text-fg">{head}</td>
                            <td class="whitespace-nowrap font-mono text-[13.5px]">
                                {colon > 0 ? <SignatureInline signature={f.signature} spans={f.spans} offset={colon + 1} /> : null}
                            </td>
                            <td class="text-fg-3">{f.doc ? <DocInline md={f.doc} /> : <span class="text-muted" title="No doc comment yet">—</span>}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
), { name: 'FieldTable' });

/** Class, interface, enum and extend members: one row each, signature and description. */
const MemberRows = component<{ members: ApiItem[] }>(({ props }) => () => (
    <div class="overflow-hidden rounded-xl border border-card-line">
        {props.members.map((m, i) => (
            <div key={m.id} id={anchorOf(m)} class={`flex scroll-mt-6 flex-col gap-1 px-4 py-3.5 ${i > 0 ? 'border-t border-line' : ''}`}>
                <SignatureInline signature={m.signature} spans={m.spans} />
                {m.doc ? (
                    <div class="api-member-doc text-[14.5px] text-fg-3">
                        <DocText md={m.doc} />
                    </div>
                ) : (
                    <span class="text-[14px] text-muted">No doc comment yet</span>
                )}
            </div>
        ))}
    </div>
), { name: 'MemberRows' });

/** True when a signature says no more than `kind Name`: the heading already says it. */
const trivialSignature = (it: ApiItem) => new RegExp(`^(export )?(abstract )?(${it.kind}) ${it.name.replace(/[$]/g, '\\$')}$`).test(it.signature.trim());

export const ExportSection = component<{ item: ApiItem; module: ApiModule }>(({ props }) => () => {
    const it = props.item;
    const t = it.tags;
    const fields = it.kind === 'struct' ? it.members.filter((m) => m.kind === 'field') : [];
    const rows = it.members.filter((m) => !fields.includes(m));
    const src = it.source;
    const mods = it.modifiers.filter((m) => m !== 'public');
    return (
        <section id={anchorOf(it)} class="flex scroll-mt-6 flex-col gap-3.5 border-t border-line pt-7">
            <div class="flex flex-wrap items-center gap-2.5">
                <KindPill kind={it.kind} />
                {mods.map((m) => <ModifierPill key={m} text={m} />)}
                <h3 class="m-0 font-mono text-[22px] font-medium leading-[1.3] text-fg [overflow-wrap:anywhere]">{it.name}</h3>
                <a href={`#${anchorOf(it)}`} aria-label={`Link to ${it.name}`} class="text-[#5A5A70] hover:text-cyan">#</a>
                {src && (
                    <a href={sourceUrl(src.file, src.line)} class="ml-auto font-mono text-xs text-muted hover:text-cyan">
                        {`${src.file}:${src.line}`}
                    </a>
                )}
            </div>
            {it.reexportedFrom && (
                <p class="m-0 text-[14px] text-muted">
                    Re-exported from <code>{it.reexportedFrom.module.replace(/^std\//, 'velt:')}</code>
                </p>
            )}
            {!trivialSignature(it) && <SignatureBlock signature={it.signature} spans={it.spans} />}
            {it.doc ? (
                <DocText md={it.doc} />
            ) : (
                <p class="m-0 text-[14px] text-muted">
                    No doc comment yet{src && <>: <a href={sourceUrl(src.file, src.line)} class="text-cyan hover:text-cyan-hover">add one</a></>}
                </p>
            )}
            {t.deprecated !== null && (
                <Tag label="Deprecated">
                    <div class="api-tag text-[15px]">{t.deprecated ? <DocInline md={t.deprecated} /> : 'This is deprecated.'}</div>
                </Tag>
            )}
            {t.params.length > 0 && (
                <Tag label="Parameters">
                    <dl class="api-params">
                        {t.params.map((p) => (
                            <>
                                <dt>{p.name}</dt>
                                <dd><DocInline md={p.doc} /></dd>
                            </>
                        ))}
                    </dl>
                </Tag>
            )}
            {t.returns && (
                <Tag label="Returns">
                    <div class="api-tag text-[15px]"><DocInline md={t.returns} /></div>
                </Tag>
            )}
            {t.throws.length > 0 && (
                <Tag label="Throws">
                    {t.throws.map((th) => {
                        const target = throwsTarget(th, it);
                        const rest = target ? th.replace(/^\{?[A-Z][\w.]*\}?\s*-?\s*/, '') : th;
                        return (
                            <div class="api-tag text-[15px]">
                                {target && <><code><TypeLink target={target} text={target.name} /></code>{' '}</>}
                                <DocInline md={rest} />
                            </div>
                        );
                    })}
                </Tag>
            )}
            {t.examples.length > 0 && (
                <Tag label={t.examples.length > 1 ? 'Examples' : 'Example'}>
                    {t.examples.map((ex) => {
                        const fence = ex.match(/^```(\w*)\n([\s\S]*?)\n?```\s*$/);
                        return <CodeBlock code={fence ? fence[2] : ex} lang={fence?.[1] || 'ts'} />;
                    })}
                </Tag>
            )}
            {t.see.length > 0 && (
                <Tag label="See also">
                    <ul class="api-see">
                        {t.see.map((s) => <li><DocInline md={s} /></li>)}
                    </ul>
                </Tag>
            )}
            {fields.length > 0 && <FieldTable fields={fields} />}
            {rows.length > 0 && <MemberRows members={rows} />}
        </section>
    );
}, { name: 'ExportSection' });

/** The Exports table: kind glyph, name, first sentence of the doc comment. */
const ExportsTable = component<{ items: ApiItem[] }>(({ props }) => () => (
    <div class="overflow-hidden rounded-xl border border-card-line">
        {props.items.map((it, i) => {
            const k = kindInfo(it.kind);
            return (
                <a
                    key={it.id}
                    href={`#${anchorOf(it)}`}
                    class={`api-export-row grid items-baseline gap-x-3 px-4 py-2.5 text-[14.5px] leading-normal text-fg-2 hover:bg-[#12121B] hover:text-fg-2 ${i > 0 ? 'border-t border-card-line' : ''}`}
                >
                    <span class="font-mono text-xs" style={{ color: k.color }} aria-hidden="true">{k.glyph}</span>
                    <span class="font-mono text-sm text-fg [overflow-wrap:anywhere]">{it.name}</span>
                    <span class={summaryOf(it) ? '' : 'text-muted'}>{summaryOf(it) ? <DocInline md={summaryOf(it)!} /> : 'No doc comment yet'}</span>
                </a>
            );
        })}
    </div>
), { name: 'ExportsTable' });

/** The guide's import line (`import { serve, Server } from "velt:http";`), else the module's first function and type. */
export function importLine(m: ApiModule): string {
    const guide = guideIntro(m.module).importLine;
    if (guide && !guide.includes('…')) return `${guide};`;
    const named = groupExports(visibleExports(m))
        .filter((g) => g.kind !== 'extend' && g.kind !== 're-export')
        .slice(0, 2)
        .map((g) => g.items[0].name);
    return named.length ? `import { ${named.join(', ')} } from "${m.specifier}";` : `import "${m.specifier}";`;
}

const ImportLine = component<{ code: string }>(({ props }) => () => {
    const m = props.code.match(/^import (type )?(\{ .* \} )?from (".*");$/);
    return (
        <div class="flex items-center gap-3 rounded-xl border border-line-2 bg-surface py-3 pl-4 pr-3 font-mono text-[13.5px]">
            <span class="no-scrollbar min-w-0 flex-auto overflow-x-auto whitespace-nowrap">
                {m ? (
                    <>
                        <span class="tk-k">import</span> {m[1] && <span class="tk-k">type </span>}{m[2] ?? ''}<span class="tk-k">from</span> <span class="tk-s">{m[3]}</span>;
                    </>
                ) : (
                    props.code
                )}
            </span>
            <CopyTextButton client:visible text={props.code} label="Copy import" />
        </div>
    );
}, { name: 'ImportLine' });

export const ApiPage = component<{ module: ApiModule }>(({ props, slots }) => () => {
    const m = props.module;
    const items = visibleExports(m);
    const summary = moduleSummary(m);
    return (
        <>
            <div class="flex flex-wrap items-baseline gap-3">
                <h1 class="m-0 font-mono text-[40px] font-medium leading-[1.1] tracking-[-0.02em] text-fg max-[480px]:text-[32px]">{m.specifier}</h1>
                <span class="rounded-full border border-line-3 px-2.5 py-0.5 text-xs text-fg-3">API reference</span>
            </div>
            <p class="api-lead m-0 text-lg text-fg-3">
                {summary && <DocInline md={summary} />} For a walkthrough, read <a href={guidePath(m.module)} class="text-cyan hover:text-cyan-hover">the guide</a>.
            </p>
            <ImportLine code={importLine(m)} />
            {slots.default?.()}
            <section id="exports" class="flex scroll-mt-6 flex-col gap-3 pt-2">
                <h2 class="m-0 font-display text-[26px] font-semibold tracking-[-0.02em] text-fg">Exports</h2>
                {items.length > 0 ? <ExportsTable items={items} /> : <p class="m-0 text-muted">This module exports nothing yet.</p>}
            </section>
            {items.map((it) => <ExportSection key={it.id} item={it} module={m} />)}
        </>
    );
}, { name: 'ApiPage' });

