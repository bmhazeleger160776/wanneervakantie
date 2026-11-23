import { VAKANTIES, SCHOOLJAREN, KALENDERJAREN, GEMEENTEN, REGIOS, GEWIJZIGD } from "../lib/vakanties.js";
import { SITE } from "../lib/site.js";

// Pagina's met vakantiedata krijgen de datum van de laatste datawijziging, de rest de datum van de laatste tekstwijziging
const metData = (u) => u === "/" || u.startsWith("/schoolvakanties") || /^\/[a-z]+vakantie-/.test(u) || /^\/(regio|gemeente)\/./.test(u);
const lastmod = (u) => (metData(u) ? [GEWIJZIGD, SITE.bijgewerkt].sort().at(-1) : SITE.bijgewerkt);

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
    .map((u) => `  <url><loc>${SITE.url}${u}</loc><lastmod>${lastmod(u)}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
