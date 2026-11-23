import fs from "node:fs";
import path from "node:path";
import { verschil, plus, weeknummer } from "./datum.js";

const lees = (f) => JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", f), "utf8"));
const data = lees("schoolvakanties.json");
const gemData = lees("gemeenten.json");

export const BRON = data.bron;
export const OPGEHAALD = data.opgehaald; // laatste controle bij de Rijksoverheid (elke nacht)
export const GEWIJZIGD = data.gewijzigd ?? data.opgehaald; // laatste keer dat de vakantiedata echt veranderde
export const REGIOS = ["noord", "midden", "zuid"];
export const REGIO_NAAM = { noord: "Noord", midden: "Midden", zuid: "Zuid" };

// Vaste informatie per type vakantie
export const TYPES = {
  herfstvakantie: { naam: "Herfstvakantie", kort: "herfst", emoji: "🍂", seizoen: "oktober" },
  kerstvakantie: { naam: "Kerstvakantie", kort: "kerst", emoji: "🎄", seizoen: "december en januari" },
  voorjaarsvakantie: { naam: "Voorjaarsvakantie", kort: "voorjaar", emoji: "🌷", seizoen: "februari" },
  meivakantie: { naam: "Meivakantie", kort: "mei", emoji: "🌸", seizoen: "eind april en begin mei" },
  zomervakantie: { naam: "Zomervakantie", kort: "zomer", emoji: "☀️", seizoen: "juli en augustus" },
};
export const TYPE_VOLGORDE = ["herfstvakantie", "kerstvakantie", "voorjaarsvakantie", "meivakantie", "zomervakantie"];

// Platte lijst van alle vakanties, met handige extra velden
export const VAKANTIES = data.schooljaren.flatMap((s) =>
  s.vakanties.map((v) => {
    const type = v.type.toLowerCase();
    const jaar = Number(v.regios.noord.start.slice(0, 4));
    const gelijk = REGIOS.every((r) => v.regios[r].start === v.regios.noord.start && v.regios[r].eind === v.regios.noord.eind);
    const start = REGIOS.map((r) => v.regios[r].start).sort()[0];
    const eind = REGIOS.map((r) => v.regios[r].eind).sort().at(-1);
    return {
      ...v,
      type,
      info: TYPES[type],
      naam: TYPES[type].naam,
      schooljaar: s.schooljaar,
      jaar, // kalenderjaar waarin de vakantie begint
      slug: `${type}-${jaar}`,
      gelijk, // overal in Nederland dezelfde data
      start, // vroegste start over alle regio's
      eind, // laatste einddag over alle regio's
      dagen: verschil(v.regios.noord.start, v.regios.noord.eind) + 1,
    };
  })
);

export const SCHOOLJAREN = data.schooljaren.map((s) => s.schooljaar);
export const KALENDERJAREN = [...new Set(VAKANTIES.map((v) => v.jaar))].filter((j) => VAKANTIES.filter((v) => v.jaar === j).length >= 4).sort();

export const vakantieVanSlug = (slug) => VAKANTIES.find((v) => v.slug === slug);
export const vakantiesInSchooljaar = (sj) => VAKANTIES.filter((v) => v.schooljaar === sj);
// Alle vakanties die in een kalenderjaar beginnen (kerstvakantie telt bij het jaar waarin hij begint)
export const vakantiesInJaar = (j) => VAKANTIES.filter((v) => v.jaar === j);
export const vanType = (type) => VAKANTIES.filter((v) => v.type === type);

// Dezelfde vakantie in andere jaren (voor interne links)
export const andereJaren = (v) => vanType(v.type).filter((x) => x.slug !== v.slug);

// De eerstvolgende (of huidige) vakanties vanaf een datum, per regio
export function komende(vanaf, regio, aantal = 5) {
  return VAKANTIES.filter((v) => v.regios[regio].eind >= vanaf)
    .sort((a, b) => a.regios[regio].start.localeCompare(b.regios[regio].start))
    .slice(0, aantal);
}
export function komendeAlle(vanaf, aantal = 6) {
  return VAKANTIES.filter((v) => v.eind >= vanaf).sort((a, b) => a.start.localeCompare(b.start)).slice(0, aantal);
}

// Weeknummers van een periode, bijvoorbeeld "29–34"
export function weken(start, eind) {
  const a = weeknummer(plus(start, 2)); // maandag na de startzaterdag
  const b = weeknummer(eind);
  return a === b ? `${a}` : `${a}–${b}`;
}

// Gemeenten
export const GEMEENTEN = gemData.gemeenten;
export const gemeenteVanSlug = (slug) => GEMEENTEN.find((g) => g.slug === slug);
export const gemeentenInRegio = (r) => GEMEENTEN.filter((g) => g.regio === r);
export const PROVINCIES = [...new Set(GEMEENTEN.map((g) => g.provincie))].sort((a, b) => a.localeCompare(b, "nl"));

// Bekende grote gemeenten, voor korte lijstjes en links
export const GROTE_GEMEENTEN = ["amsterdam", "rotterdam", "den-haag", "utrecht", "eindhoven", "groningen", "tilburg", "almere", "breda", "nijmegen", "apeldoorn", "arnhem", "haarlem", "enschede", "amersfoort", "zaanstad", "s-hertogenbosch", "zwolle", "leiden", "maastricht"];

// Welke regio's vallen samen? Bijvoorbeeld "Noord en Midden" voor een gelijke periode.
export function groepen(v) {
  const g = [];
  for (const r of REGIOS) {
    const p = v.regios[r];
    const bestaand = g.find((x) => x.start === p.start && x.eind === p.eind);
    if (bestaand) bestaand.regios.push(r);
    else g.push({ ...p, regios: [r] });
  }
  return g;
}
export const regioLijst = (rs) => {
  const namen = rs.map((r) => REGIO_NAAM[r]);
  return namen.length === 3 ? "heel Nederland" : namen.length === 1 ? `regio ${namen[0]}` : `regio ${namen.slice(0, -1).join(", ")} en ${namen.at(-1)}`;
};
