/**
 * Submit the live sitemap's URLs to IndexNow — instant indexing signal
 * for Bing, Yandex, Seznam and Naver (Google does not consume IndexNow; it
 * discovers via the sitemap + Search Console).
 *
 * Runs after each Pages deploy (see .github/workflows/deploy-docs.yml).
 * Failure-tolerant by design: a flaky endpoint must never fail the deploy.
 *
 * The key file lives at public/<key>.txt and is served from the site root,
 * which is how IndexNow verifies host ownership.
 */

const HOST = 'veltlang.com';
const KEY = '9cddd5a3b1fa2afbd71a408c7f7a4d5b';
const SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH = 10_000; // API maximum per request

try {
    const res = await fetch(SITEMAP);
    if (!res.ok) throw new Error(`sitemap fetch: HTTP ${res.status}`);
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    if (urls.length === 0) throw new Error('sitemap contained no <loc> entries');
    console.log(`Submitting ${urls.length} URL(s) from ${SITEMAP} to IndexNow…`);

    for (let i = 0; i < urls.length; i += BATCH) {
        const body = {
            host: HOST,
            key: KEY,
            keyLocation: `https://${HOST}/${KEY}.txt`,
            urlList: urls.slice(i, i + BATCH),
        };
        const ping = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(body),
        });
        // 200 = processed, 202 = accepted (key validation pending) — both fine.
        console.log(`  batch ${i / BATCH + 1}: HTTP ${ping.status}`);
        if (ping.status >= 400) {
            console.warn(`  IndexNow rejected the batch: ${await ping.text()}`);
        }
    }
} catch (err) {
    console.warn(`IndexNow ping skipped: ${err instanceof Error ? err.message : err}`);
}
