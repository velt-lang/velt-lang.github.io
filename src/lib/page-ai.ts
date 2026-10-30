/** Page → AI helpers shared by the page actions and "On this page". Client-side only. */
import { LLMS_URL, SITE_URL } from './site';

/** The page's `.md` rendition as an absolute URL. */
export const absoluteMd = (md: string) => `${SITE_URL}${md}`;

/** The prompt "Ask an AI" / "Open in Claude" hands over: the page and the index. */
export const pagePrompt = (md: string) =>
    `Read ${absoluteMd(md)} (Velt docs; the full index is ${LLMS_URL}) and help me with my questions about it.`;

/** Fetches the page's `.md` and copies it. Returns whether it worked. */
export async function copyPageMarkdown(md: string): Promise<boolean> {
    try {
        const res = await fetch(md);
        if (!res.ok) return false;
        await navigator.clipboard.writeText(await res.text());
        return true;
    } catch {
        return false;
    }
}

export async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
