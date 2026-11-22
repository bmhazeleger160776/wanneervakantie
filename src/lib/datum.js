// Datumhulpjes. Alle datums zijn kalenderdatums ("2027-07-17") en worden als UTC-middernacht behandeld,
// zodat er nooit tijdzone- of zomertijdverschuivingen optreden.
const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const MAAND_KORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const DAGEN = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

export const d = (iso) => new Date(`${iso}T00:00:00Z`);
export const iso = (date) => date.toISOString().slice(0, 10);
export const plus = (isoStr, dagen) => iso(new Date(d(isoStr).getTime() + dagen * 86400000));
export const verschil = (a, b) => Math.round((d(b) - d(a)) / 86400000); // b - a in dagen
export const weekdag = (isoStr) => d(isoStr).getUTCDay(); // 0 = zondag

export const dagNaam = (isoStr) => DAGEN[weekdag(isoStr)];
export const maandNaam = (m) => MAANDEN[m];

// "17 juli 2027"
export function lang(isoStr, metJaar = true) {
  const x = d(isoStr);
  return `${x.getUTCDate()} ${MAANDEN[x.getUTCMonth()]}${metJaar ? ` ${x.getUTCFullYear()}` : ""}`;
}
// "za 17 jul"
export function kort(isoStr) {
  const x = d(isoStr);
  return `${DAGEN[x.getUTCDay()].slice(0, 2)} ${x.getUTCDate()} ${MAAND_KORT[x.getUTCMonth()]}`;
}
// "zaterdag 17 juli 2027"
export const volledig = (isoStr) => `${dagNaam(isoStr)} ${lang(isoStr)}`;

// "17 juli t/m 29 augustus 2027" — jaar alleen aan het eind, tenzij de periode over de jaargrens loopt
export function periode(start, eind) {
  const a = d(start), b = d(eind);
  if (a.getUTCFullYear() !== b.getUTCFullYear()) return `${lang(start)} t/m ${lang(eind)}`;
  return `${lang(start, false)} t/m ${lang(eind)}`;
}

// Vandaag als kalenderdatum in Nederland (op het moment van bouwen)
export const vandaag = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date());

// ISO-weeknummer
export function weeknummer(isoStr) {
  const x = d(isoStr);
  const dag = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - dag + 3);
  const eersteDonderdag = new Date(Date.UTC(x.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((x - eersteDonderdag) / 86400000 - 3 + ((eersteDonderdag.getUTCDay() + 6) % 7)) / 7);
}
