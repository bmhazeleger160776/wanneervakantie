// Affiliate- of advertentiepartners. Zolang deze lijst leeg is, tonen de pagina's geen reisblok.
// Vul hier je eigen affiliatelinks in (bijvoorbeeld van Daisycon of TradeTracker) zodra je goedgekeurd bent.
// Voorbeeld:
// { naam: "Vakantiepark X", tekst: "Last minute vakantieparken in de zomervakantie", url: "https://...", types: ["zomervakantie", "meivakantie"] }
export const PARTNERS = [];
export const partnersVoor = (type) => PARTNERS.filter((p) => !p.types || p.types.includes(type));
