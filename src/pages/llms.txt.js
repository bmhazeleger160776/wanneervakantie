// llms.txt: een korte, leesbare kaart van de site voor AI-assistenten (zie llmstxt.org).
// Bevat de belangrijkste feiten zelf, zodat een AI het antwoord direct kan vinden en de bron kan noemen.
import { SCHOOLJAREN, KALENDERJAREN, vakantiesInSchooljaar, REGIOS, REGIO_NAAM, OPGEHAALD, BRON, GEMEENTEN } from "../lib/vakanties.js";
import { periode, vandaag } from "../lib/datum.js";
import { SITE } from "../lib/site.js";

export function GET() {
  const nu = vandaag();
  const jaar = Number(nu.slice(0, 4));
  const sjNu = nu.slice(5, 7) >= "08" ? `${jaar}-${jaar + 1}` : `${jaar - 1}-${jaar}`;
  const sjs = SCHOOLJAREN.filter((s) => s >= sjNu).slice(0, 2);
  const jaren = KALENDERJAREN.filter((j) => j >= jaar).slice(0, 3);
  const u = (pad) => `${SITE.url}${pad}`;

  const feiten = sjs.map((sj) => {
    const regels = vakantiesInSchooljaar(sj).map((v) => {
      const data = v.gelijk
        ? `heel Nederland ${periode(v.regios.noord.start, v.regios.noord.eind)}`
        : REGIOS.map((r) => `${REGIO_NAAM[r]} ${periode(v.regios[r].start, v.regios[r].eind)}`).join("; ");
      return `- [${v.naam} ${v.jaar}](${u(`/${v.slug}`)}): ${data}${v.verplicht ? "" : " (adviesdata)"}`;
    });
    return `### Schooljaar ${sj}\n\n${regels.join("\n")}`;
  });

  const tekst = `# ${SITE.domein}

> Schoolvakanties per regio (Noord, Midden en Zuid), feestdagen en vrije dagen in Nederland. Alle vakantiedata komt uit de open data van de Rijksoverheid (CC0) en wordt elke nacht automatisch gecontroleerd. Laatst gecontroleerd: ${OPGEHAALD}.

Belangrijk om te weten:
- Nederland heeft drie vakantieregio's. De regio hangt af van de gemeente waar de school staat.
- De zomer- en kerstvakantie liggen vast. Voor herfst-, voorjaars- en meivakantie geeft het ministerie van OCW adviesdata; scholen mogen daarvan afwijken.
- Elke vakantieperiode loopt van zaterdag tot en met zondag.
- Bron: ${BRON}

## Schoolvakanties (actueel)

${feiten.join("\n\n")}

## Overzichten

${sjs.map((s) => `- [Schoolvakanties ${s}](${u(`/schoolvakanties-${s}`)}): alle vakanties van dit schooljaar per regio, met jaarkalender`).join("\n")}
${jaren.map((j) => `- [Schoolvakanties ${j}](${u(`/schoolvakanties-${j}`)}): alle vakanties in kalenderjaar ${j}`).join("\n")}

## Regio en gemeente

- [Welke regio heeft mijn gemeente?](${u("/gemeente/")}): alle ${GEMEENTEN.length} gemeenten met hun vakantieregio
${REGIOS.map((r) => `- [Regio ${REGIO_NAAM[r]}](${u(`/regio/${r}`)}): vakanties en gemeenten in regio ${REGIO_NAAM[r]}`).join("\n")}

## Feestdagen en vrije dagen

${jaren.map((j) => `- [Feestdagen ${j}](${u(`/feestdagen-${j}`)}) en [slim vrij nemen in ${j}](${u(`/vrije-dagen-${j}`)})`).join("\n")}

## Uitleg

- [Waarom zijn er vakantieregio's?](${u("/uitleg/regios")})
- [Adviesdata: welke vakanties liggen vast?](${u("/uitleg/adviesdata")})
- [Vrij vragen buiten de schoolvakantie](${u("/uitleg/vrij-buiten-schoolvakantie")})

## Optional

- [Agenda-abonnement per regio (.ics)](${u("/agenda/")})
- [Gratis widget voor websites](${u("/widget/")})
- [Over deze site](${u("/over")})
`;
  return new Response(tekst, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
