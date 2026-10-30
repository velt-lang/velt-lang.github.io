/**
 * A canonical signature with its type names linked (design/Api.dc.html): as
 * a code block for an export, inline for member rows and field types.
 */
import { component } from 'sigx';
import { layoutSignature, tokenize, type Token } from '../../lib/signature';
import { hrefOf, type ApiSpan, type Target } from '../../lib/std-api';

const CLASS: Record<string, string> = { k: 'tk-k', t: 'tk-t', f: 'tk-f', s: 'tk-s', n: 'tk-n' };

/** A linked type name; `data-card` is the export whose hover card it shows (ApiCards). */
export const TypeLink = component<{ target: Target; text: string }>(({ props }) => () => {
    const href = hrefOf(props.target);
    return href ? (
        <a class="api-type" href={href} data-card={href.replace(/(#[^.]*)\..*$/, '$1')}>{props.text}</a>
    ) : (
        <span class="tk-t">{props.text}</span>
    );
}, { name: 'TypeLink' });

function render(tokens: Token<Target>[]) {
    return tokens.map((t) =>
        t.kind === 'link' ? <TypeLink target={t.target} text={t.text} /> : t.kind === 'text' ? t.text : <span class={CLASS[t.kind]}>{t.text}</span>,
    );
}

/** Tokens for a signature; `wrap` lays long parameter lists out one per line. */
export function signatureTokens(signature: string, spans: ApiSpan[], wrap?: number): Token<Target>[] {
    const laid = wrap ? layoutSignature(signature, spans, wrap) : { text: signature, spans };
    return tokenize(laid.text, laid.spans);
}

export const SignatureBlock = component<{ signature: string; spans: ApiSpan[] }>(({ props }) => () => (
    <pre class="api-code api-signature" tabIndex={0}>
        <code>{render(signatureTokens(props.signature, props.spans, 76))}</code>
    </pre>
), { name: 'SignatureBlock' });

/** A member's or a field type's signature on one line (it wraps with the text). */
export const SignatureInline = component<{ signature: string; spans: ApiSpan[]; offset?: number }>(({ props }) => () => {
    const off = props.offset ?? 0;
    const spans = props.spans.filter((s) => s.start >= off).map((s) => ({ ...s, start: s.start - off, end: s.end - off }));
    return <code class="api-sig-inline">{render(signatureTokens(props.signature.slice(off), spans))}</code>;
}, { name: 'SignatureInline' });
