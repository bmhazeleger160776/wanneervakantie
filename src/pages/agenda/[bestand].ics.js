// iCal-agenda's: één per regio met alle schoolvakanties, plus één met de feestdagen.
import { VAKANTIES, REGIOS, REGIO_NAAM, KALENDERJAREN } from "../../lib/vakanties.js";
import { feestdagen } from "../../lib/feestdagen.js";
import { plus } from "../../lib/datum.js";
import { SITE } from "../../lib/site.js";

export function getStaticPaths() {
  return [...REGIOS.map((r) => ({ params: { bestand: `schoolvakanties-${r}` } })), { params: { bestand: "feestdagen" } }];
}

const esc = (s) => String(s).replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
const dt = (iso) => iso.replaceAll("-", "");
// Regels langer dan 75 tekens vouwen volgens RFC 5545
const vouw = (r) => r.length <= 74 ? r : r.match(/.{1,73}/g).join("\r\n ");

function agenda(naam, items) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const r = [
    "BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${SITE.domein}//Schoolvakanties//NL`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(naam)}`, "X-WR-TIMEZONE:Europe/Amsterdam", "REFRESH-INTERVAL;VALUE=DURATION:P1D", "X-PUBLISHED-TTL:P1D",
  ];
  for (const it of items) {
    r.push("BEGIN:VEVENT", `UID:${it.uid}@${SITE.domein}`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${dt(it.start)}`, `DTEND;VALUE=DATE:${dt(plus(it.eind, 1))}`,
      `SUMMARY:${esc(it.titel)}`, `DESCRIPTION:${esc(it.omschrijving)}`, `URL:${SITE.url}${it.url}`, "TRANSP:TRANSPARENT", "END:VEVENT");
  }
  r.push("END:VCALENDAR");
  return r.map(vouw).join("\r\n") + "\r\n";
}

export function GET({ params }) {
  let body;
  if (params.bestand === "feestdagen") {
    const items = KALENDERJAREN.flatMap((j) => feestdagen(j).map((f) => ({
      uid: `feest-${f.datum}`, start: f.datum, eind: f.datum, titel: f.naam,
      omschrijving: f.uitleg ?? (f.vrij ? "Feestdag, voor de meeste mensen een vrije dag." : "Feestdag."), url: `/feestdagen-${j}`,
    })));
    body = agenda("Feestdagen Nederland", items);
  } else {
    const regio = params.bestand.replace("schoolvakanties-", "");
    const items = VAKANTIES.map((v) => ({
      uid: `${v.slug}-${regio}`, start: v.regios[regio].start, eind: v.regios[regio].eind,
      titel: `${v.naam} (regio ${REGIO_NAAM[regio]})`,
      omschrijving: v.verplicht ? `Schoolvakantie regio ${REGIO_NAAM[regio]}.` : `Schoolvakantie regio ${REGIO_NAAM[regio]}. Adviesdata: scholen mogen afwijken, check de schoolgids.`,
      url: `/${v.slug}`,
    }));
    body = agenda(`Schoolvakanties regio ${REGIO_NAAM[regio]}`, items);
  }
  return new Response(body, { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
}
