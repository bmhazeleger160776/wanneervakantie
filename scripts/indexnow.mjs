// Meldt alle URL's uit de live sitemap bij IndexNow (Bing, Yandex, Seznam, Naver e.a.).
// Draait in de GitHub Action na het publiceren, alleen als er iets veranderd is.
import { SITE } from "../src/lib/site.js";

const host = new URL(SITE.url).host;
const key = SITE.indexNowKey;
if (!key) {
  console.log("Geen IndexNow-sleutel ingesteld; overslaan.");
  process.exit(0);
}

// Even wachten tot GitHub Pages de nieuwe versie overal serveert
await new Promise((r) => setTimeout(r, 30000));

const sitemap = await (await fetch(`${SITE.url}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) {
  console.log("::warning::Geen URL's in de sitemap gevonden; IndexNow overgeslagen.");
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `${SITE.url}/${key}.txt`, urlList }),
});
if (res.ok) console.log(`IndexNow: ${urlList.length} URL's gemeld (status ${res.status}).`);
else console.log(`::warning::IndexNow gaf status ${res.status}: ${await res.text()}`);
