# wanneervakantie

Schoolvakanties per regio, feestdagen en vrije dagen. Statische Astro-site, gebouwd op de open data van de Rijksoverheid.

## Wat zit erin

| Onderdeel | Pagina's |
| --- | --- |
| Homepage met aftellen per regio | `/` |
| Schoolvakanties per schooljaar en per kalenderjaar | `/schoolvakanties-2026-2027`, `/schoolvakanties-2027` |
| Per vakantie per jaar (data per regio, overlap, carnaval, FAQ) | `/zomervakantie-2027`, `/meivakantie-2027`, … |
| Per regio, met alle gemeenten | `/regio/noord`, `/regio/midden`, `/regio/zuid` |
| Per gemeente (342) | `/gemeente/ede`, … |
| Feestdagen, brugdagen en slim vrij nemen | `/feestdagen-2027`, `/vrije-dagen-2027` |
| Agenda-abonnementen (.ics) | `/agenda/` |
| Widget voor scholen en verenigingen | `/widget/` |
| Uitleg, over, privacy, sitemap | `/uitleg/`, `/over`, `/privacy`, `/sitemap.xml` |

## Data

- `data/schoolvakanties.json`: schoolvakanties uit `opendata.rijksoverheid.nl` (CC0). Wordt elke nacht bijgewerkt door `npm run fetch-data` in de GitHub Action. Lukt ophalen niet, dan blijft het bestaande bestand staan.
- `data/gemeenten.json`: alle 342 gemeenten met provincie en vakantieregio (regio-indeling Rijksoverheid). Gemeenten die over twee regio's verdeeld zijn hebben een `opmerking`.
- Feestdagen worden berekend in `src/lib/feestdagen.js`.

## Instellingen

- `src/lib/site.js`: naam, domein, mailadres en Umami-id. Pas dit aan zodra de domeinnaam vaststaat.
- `public/robots.txt` en `public/site.webmanifest`: bevatten de domeinnaam, ook daar aanpassen.
- `src/lib/partners.js`: affiliatelinks. Zolang de lijst leeg is, toont de site geen reisblok.

## Lokaal

```
npm install
npm run build
npm run preview
```

## Online zetten (GitHub Pages)

1. Maak een nieuwe repository op GitHub en push deze map.
2. Settings → Pages → Source: **GitHub Actions**.
3. Custom domain invullen en DNS bij je registrar instellen (zelfde als bij waterweer).
4. De workflow `.github/workflows/dagelijks.yml` bouwt bij elke push en elke nacht opnieuw.
