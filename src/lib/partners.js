// Affiliatelinks voor het reisblok (component Reistip.astro).
//
// Zo werkt het:
// - Een partner verschijnt pas op de site zodra "url" is ingevuld. Lege url = onzichtbaar.
// - Plak bij "url" de tracking- of deeplink uit Daisycon of TradeTracker (begint met https://).
// - "types" bepaalt op welke pagina's de partner staat:
//     zomervakantie, meivakantie, herfstvakantie, kerstvakantie, voorjaarsvakantie  -> de vakantiepagina's
//     overzicht   -> de jaaroverzichten (/schoolvakanties-2027 enz.)
//     vrije-dagen -> de pagina's "slim vrij nemen" (/vrije-dagen-2027 enz.)
//   Laat je "types" weg, dan staat de partner overal.
// - Er worden maximaal 3 partners per blok getoond, in de volgorde van deze lijst.
//
// Zoeken op de laptop: elke regel url heeft een unieke code (PLAK_TUI enz.), zodat je hem
// met PowerShell -replace kunt invullen zonder dit bestand te openen.

const VAKANTIES = ["zomervakantie", "meivakantie", "herfstvakantie", "kerstvakantie", "voorjaarsvakantie"];

export const PARTNERS = [
  // ---- TradeTracker ----
  { naam: "Landal GreenParks", netwerk: "TradeTracker", tekst: "Vakantieparken in Nederland, België en Duitsland", url: "PLAK_LANDAL", types: [...VAKANTIES, "overzicht", "vrije-dagen"] },
  { naam: "EuroParcs", netwerk: "TradeTracker", tekst: "Vakantieparken aan het water en in de natuur", url: "PLAK_EUROPARCS", types: [...VAKANTIES, "overzicht", "vrije-dagen"] },
  { naam: "Roompot", netwerk: "TradeTracker", tekst: "Bungalows en vakantieparken aan de kust", url: "PLAK_ROOMPOT", types: [...VAKANTIES, "overzicht", "vrije-dagen"] },
  { naam: "TUI", netwerk: "TradeTracker", tekst: "Zonvakanties en vliegvakanties in de schoolvakantie", url: "PLAK_TUI", types: ["zomervakantie", "meivakantie", "herfstvakantie", "kerstvakantie", "voorjaarsvakantie", "overzicht"] },
  // ---- Daisycon ----
  { naam: "Bungalows.nl", netwerk: "Daisycon", tekst: "Vakantiehuizen en bungalows vergelijken", url: "PLAK_BUNGALOWS", types: [...VAKANTIES, "overzicht", "vrije-dagen"] },
  { naam: "Campings.com", netwerk: "Daisycon", tekst: "Campings met zwembad, ideaal voor de zomervakantie", url: "PLAK_CAMPINGS", types: ["zomervakantie", "meivakantie", "overzicht"] },
  { naam: "De Vakantiediscounter", netwerk: "Daisycon", tekst: "Voordelige vakanties en last minutes", url: "PLAK_VAKANTIEDISCOUNTER", types: [...VAKANTIES, "overzicht"] },
];

const MAX = 3;
const ingevuld = (p) => typeof p.url === "string" && p.url.startsWith("https://");

export const partnersVoor = (type) =>
  PARTNERS.filter((p) => ingevuld(p) && (!p.types || p.types.includes(type))).slice(0, MAX);
