import { iso, plus, weekdag, verschil } from "./datum.js";

// Paasdatum volgens het gregoriaanse algoritme (Meeus/Jones/Butcher)
export function pasen(jaar) {
  const a = jaar % 19, b = Math.floor(jaar / 100), c = jaar % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const maand = Math.floor((h + l - 7 * m + 114) / 31), dag = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(new Date(Date.UTC(jaar, maand - 1, dag)));
}

// Feestdagen in Nederland. "vrij" = algemeen erkende feestdag waarop de meeste mensen vrij zijn.
// Goede Vrijdag en Bevrijdingsdag zijn alleen vrij als je cao of werkgever dat regelt.
export function feestdagen(jaar) {
  const p = pasen(jaar);
  let koningsdag = `${jaar}-04-27`;
  if (weekdag(koningsdag) === 0) koningsdag = `${jaar}-04-26`; // valt 27 april op zondag, dan zaterdag 26 april
  const lijst = [
    { naam: "Nieuwjaarsdag", datum: `${jaar}-01-01`, vrij: true },
    { naam: "Goede Vrijdag", datum: plus(p, -2), vrij: false, uitleg: "Geen algemene vrije dag; vrij als je cao of werkgever dat regelt." },
    { naam: "Eerste Paasdag", datum: p, vrij: true },
    { naam: "Tweede Paasdag", datum: plus(p, 1), vrij: true },
    { naam: "Koningsdag", datum: koningsdag, vrij: true },
    {
      naam: "Bevrijdingsdag", datum: `${jaar}-05-05`, vrij: jaar % 5 === 0,
      uitleg: jaar % 5 === 0 ? "Lustrumjaar: in veel cao's een vrije dag." : "Officiële feestdag, maar alleen vrij als je cao of werkgever dat regelt. In veel cao's is dat eens per vijf jaar (2025, 2030).",
    },
    { naam: "Hemelvaartsdag", datum: plus(p, 39), vrij: true },
    { naam: "Eerste Pinksterdag", datum: plus(p, 49), vrij: true },
    { naam: "Tweede Pinksterdag", datum: plus(p, 50), vrij: true },
    { naam: "Eerste Kerstdag", datum: `${jaar}-12-25`, vrij: true },
    { naam: "Tweede Kerstdag", datum: `${jaar}-12-26`, vrij: true },
  ];
  return lijst.map((f) => ({ ...f, weekend: [0, 6].includes(weekdag(f.datum)) }));
}

const isWeekend = (x) => [0, 6].includes(weekdag(x));

// Vrije dagen in een jaar die door werkgevers vaak worden gegeven (feestdagen met vrij = true)
function vrijeSet(jaren) {
  const s = new Set();
  for (const j of jaren) for (const f of feestdagen(j)) if (f.vrij) s.add(f.datum);
  return s;
}

// Brugdagen: een werkdag tussen een vrije feestdag en het weekend
export function brugdagen(jaar) {
  const vrij = vrijeSet([jaar]);
  const res = [];
  for (const f of feestdagen(jaar).filter((x) => x.vrij)) {
    const wd = weekdag(f.datum);
    if (wd === 2) res.push({ datum: plus(f.datum, -1), bij: f.naam });
    if (wd === 4) res.push({ datum: plus(f.datum, 1), bij: f.naam });
  }
  return res.filter((b) => !vrij.has(b.datum) && !isWeekend(b.datum))
    .filter((b, i, a) => a.findIndex((x) => x.datum === b.datum) === i)
    .sort((a, b) => a.datum.localeCompare(b.datum));
}

// Slim vrij nemen: per feestdagenblok hoeveel vakantiedagen je nodig hebt voor een aaneengesloten periode vrij.
// Voor elk blok kijken we naar de kortste en een langere variant.
export function vrijPlannen(jaar) {
  const vrij = vrijeSet([jaar, jaar + 1]);
  const isVrij = (x) => isWeekend(x) || vrij.has(x);
  // Verleng een periode naar voren en achteren zolang de dagen al vrij zijn
  function verleng(van, tot) {
    while (isVrij(plus(van, -1))) van = plus(van, -1);
    while (isVrij(plus(tot, 1))) tot = plus(tot, 1);
    return { van, tot };
  }
  function tel(van, tot) {
    let nodig = 0;
    for (let x = van; x <= tot; x = plus(x, 1)) if (!isVrij(x)) nodig++;
    return { van, tot, nodig, totaal: verschil(van, tot) + 1 };
  }
  const p = pasen(jaar);
  const fd = Object.fromEntries(feestdagen(jaar).map((f) => [f.naam, f.datum]));
  const maandagVan = (x) => plus(x, -((weekdag(x) + 6) % 7));
  const opties = [];
  // Pasen: de week voor of na Pasen
  opties.push({ naam: "Pasen", ...tel(...Object.values(verleng(plus(p, -6), plus(p, 1)))) });
  opties.push({ naam: "Pasen (week erna)", ...tel(...Object.values(verleng(plus(p, 1), plus(p, 7)))) });
  // Koningsdag: alleen de brugdag, of de hele week
  const kd = fd.Koningsdag;
  const kdBlok = verleng(kd, kd);
  if (tel(kdBlok.van, kdBlok.tot).totaal < 3) {
    const wd = weekdag(kd);
    if (wd === 2) opties.push({ naam: "Koningsdag", ...tel(...Object.values(verleng(plus(kd, -1), kd))) });
    else if (wd === 4) opties.push({ naam: "Koningsdag", ...tel(...Object.values(verleng(kd, plus(kd, 1)))) });
  }
  opties.push({ naam: "Week van Koningsdag", ...tel(...Object.values(verleng(maandagVan(kd), plus(maandagVan(kd), 4)))) });
  // Hemelvaart: de vrijdag erna
  const hv = fd.Hemelvaartsdag;
  opties.push({ naam: "Hemelvaart", ...tel(...Object.values(verleng(hv, plus(hv, 1)))) });
  opties.push({ naam: "Week van Hemelvaart", ...tel(...Object.values(verleng(maandagVan(hv), plus(maandagVan(hv), 4)))) });
  // Pinksteren: week na Pinksteren
  const pi = fd["Tweede Pinksterdag"];
  opties.push({ naam: "Week na Pinksteren", ...tel(...Object.values(verleng(pi, plus(pi, 4)))) });
  // Kerst en oud en nieuw
  opties.push({ naam: "Kerst tot en met Nieuwjaar", ...tel(...Object.values(verleng(`${jaar}-12-24`, `${jaar + 1}-01-01`))) });
  return opties
    .filter((o) => o.nodig > 0)
    .map((o) => ({ ...o, rendement: o.totaal / o.nodig }))
    .filter((o, i, a) => a.findIndex((x) => x.van === o.van && x.tot === o.tot) === i);
}
