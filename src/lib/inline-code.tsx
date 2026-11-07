/** `code` spans in plain data strings (roadmap and release notes) as <code class="c">. */
export function ic(text: string): (string | JSX.Element)[] {
    return text.split('`').map((part, i) => (i % 2 ? <code key={i} class="c text-[0.88em]">{part}</code> : part));
}
