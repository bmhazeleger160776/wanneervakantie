import { VAKANTIES, SCHOOLJAREN, KALENDERJAREN, GEMEENTEN, REGIOS, OPGEHAALD } from "../lib/vakanties.js";
import { SITE } from "../lib/site.js";

export function GET() {
  const urls = [
    "/", "/regio/", "/gemeente/", "/agenda/", "/widget/", "/uitleg/", "/uitleg/regios", "/uitleg/adviesdata", "/uitleg/vrij-buiten-schoolvakantie", "/over", "/privacy",
    ...SCHOOLJAREN.map((s) => `/schoolvakanties-${s}`),
    ...KALENDERJAREN.flatMap((j) => [`/schoolvakanties-${j}`, `/feestdagen-${j}`, `/vrije-dagen-${j}`]),
    ...VAKANTIES.map((v) => `/${v.slug}`),
    ...REGIOS.map((r) => `/regio/${r}`),
    ...GEMEENTEN.map((g) => `/gemeente/${g.slug}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE.url}${u}</loc>${u.startsWith("/schoolvakanties") || /^\/[a-z]+vakantie-/.test(u) ? `<lastmod>${OPGEHAALD}</lastmod>` : ""}</url>`)
    .join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
