// Haalt de schoolvakanties op bij de open data van de Rijksoverheid (CC0) en schrijft data/schoolvakanties.json.
// Gaat er iets mis, dan blijft het bestaande bestand staan, zodat de site altijd kan bouwen.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAD = path.join(ROOT, "data/schoolvakanties.json");
const BRON = "https://opendata.rijksoverheid.nl/v1/infotypes/schoolholidays";

const schoon = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
// De API geeft tijden in UTC; omrekenen naar de Nederlandse kalenderdatum.
const F = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" });
const datum = (iso) => F.format(new Date(iso));
const TYPES = ["Herfstvakantie", "Kerstvakantie", "Voorjaarsvakantie", "Meivakantie", "Zomervakantie"];

async function haal(url) {
  for (let poging = 1; poging <= 3; poging++) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
      if (res.ok) return await res.json();
      console.warn(`HTTP ${res.status} voor ${url}`);
    } catch (e) { console.warn(`Fout bij ${url}: ${e.message}`); }
    await new Promise((r) => setTimeout(r, 2000 * poging));
  }
  return null;
}

function normaliseer(item) {
  const c = item?.content?.[0];
  if (!c) return null;
  const schooljaar = schoon(c.schoolyear);
  if (!/^\d{4}-\d{4}$/.test(schooljaar)) return null;
  const vakanties = [];
  for (const v of c.vacations ?? []) {
    const type = schoon(v.type);
    if (!TYPES.includes(type)) continue;
    const regios = {};
    for (const r of v.regions ?? []) {
      const naam = schoon(r.region).toLowerCase();
      const periode = { start: datum(r.startdate), eind: datum(r.enddate) };
      if (naam === "heel nederland") for (const k of ["noord", "midden", "zuid"]) regios[k] = periode;
      else if (["noord", "midden", "zuid"].includes(naam)) regios[naam] = periode;
    }
    if (!regios.noord || !regios.midden || !regios.zuid) continue;
    vakanties.push({ type, verplicht: String(v.compulsorydates) === "true", regios });
  }
  vakanties.sort((a, b) => a.regios.noord.start.localeCompare(b.regios.noord.start));
  return vakanties.length === 5 ? { schooljaar, vakanties } : null;
}

const bestaand = JSON.parse(fs.readFileSync(PAD, "utf8"));
const lijst = await haal(`${BRON}?output=json`);
if (!Array.isArray(lijst)) {
  console.warn("Geen bruikbare data van de Rijksoverheid; bestaand bestand blijft staan.");
  process.exit(0);
}
const opgehaald = lijst.map(normaliseer).filter(Boolean);
const perJaar = new Map(bestaand.schooljaren.map((s) => [s.schooljaar, s]));
for (const s of opgehaald) perJaar.set(s.schooljaar, s); // nieuwe of bijgewerkte schooljaren
const jaarNu = new Date().getFullYear();
const schooljaren = [...perJaar.values()]
  .filter((s) => Number(s.schooljaar.slice(5)) >= jaarNu - 1) // oude jaren laten vallen
  .sort((a, b) => a.schooljaar.localeCompare(b.schooljaar));

const vandaag = new Date().toISOString().slice(0, 10);
// "gewijzigd" schuift alleen op als de vakantiedata zelf verandert (voor lastmod, dateModified en IndexNow)
const veranderd = JSON.stringify(schooljaren) !== JSON.stringify(bestaand.schooljaren);
const gewijzigd = veranderd || !bestaand.gewijzigd ? vandaag : bestaand.gewijzigd;
fs.writeFileSync(PAD, JSON.stringify({ bron: BRON, licentie: "CC0 1.0", opgehaald: vandaag, gewijzigd, schooljaren }, null, 1) + "\n");
if (veranderd) console.log("De vakantiedata is veranderd.");
console.log(`Schoolvakanties bijgewerkt: ${schooljaren.map((s) => s.schooljaar).join(", ")}`);
