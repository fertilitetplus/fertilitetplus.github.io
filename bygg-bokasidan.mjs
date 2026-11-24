/**
 * Nya bokningssidan — /pages/boka-tid
 * ===================================
 *
 * Förslag A ur Claude Design-ytan "FertilitetPlus – Boka tid, nytt förslag"
 * (artboards A1 Main, A2 Valt och A Desktop), byggd 24 november 2026.
 *
 * Varför sidan byggs här och inte i Claude Design
 * -----------------------------------------------
 * Claude Design stänger 14 december 2026 och projekten följer inte med.
 * Sidan behöver dessutom beteende som en frusen designexport inte kan bära:
 * klinikväljaren, bottenarket på mobil och dragspelet på dator. Därför
 * byggs den som utlandssidorna: skalet (huvud, meny, sidfot, typsnitt,
 * cookiebanner, mätning, chatt) klipps ur den redan byggda Boka tid-sidan
 * och bara mittpartiet byts ut.
 *
 * Fakta
 * -----
 * Layouten följer förslaget. Texter och priser är kontrollerade mot
 * prislistan (design/behandlingar-data.js) och patient.nu 24 november.
 * Där förslaget sa något annat står ändringen i ANDRINGAR längst ner.
 *
 * Bokningslänkarna
 * ----------------
 * patient.nu sparar vald tidstyp i en kaka, inte i adressen. En länk till
 * "#step-3" visar därför "Inga bokningsbara tider" för en ny besökare.
 * Varje tjänst behöver en egen webbtidbok med bara den tjänsten. Linnea
 * skapar dem. Tills de finns och är provade pekar varje tjänst på stadens
 * gemensamma tidbok, där tjänsten heter exakt det som står i calNamn.
 * Länkarna ligger i BOKNING. Det är det enda som behöver röras om de ändras.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { bytMitten } from "./bygg-utlandssidorna.mjs";

const DOMAN = "https://fertilitetplus.se";
export const ADRESS = "/pages/boka-tid";

const TITEL = "Boka tid | FertilitetPlus";
const BESKRIVNING =
  "Välj klinik och tjänst och boka direkt i vår kalender. Ingen remiss, inga väntetider.";

/* --- Bokningslänkar ------------------------------------------------ */

/* Linneas direktlänkar, 24 november 2026. Adressen väljer tidstypen
   själv (…/calendar/<tidbok>/<tidstyp>#step-3), så patienten kommer rakt
   till lediga tider. Varje länk är provad som ny besökare (utan kaka):
   rätt tidstyp väljs. bygg/bokningslankar.mjs låter #step-3 stå kvar på
   sådana länkar. */
const STHLM = "0379a26c-f48f-4891-b471-6cae888ed84f";
const GBG = "748d53eb-37d6-4359-9a49-2b2f62b73245";
const typ = (tidbok, id) => `https://patient.nu/portal/public/calendar/${tidbok}/${id}#step-3`;

/* BOKNING — per tjänst och stad en lista med bokningsval.
     text – vad knappen på vår sida heter när det finns flera val
     url  – direktlänken till tidstypen
   Ett val ger knappen "Välj tid i Stockholm/Göteborg". Flera val ger en
   knapp per val. null = tjänsten finns inte på den kliniken. */
const hart = (s) => s.replace(/(\d) (\d)/g, "$1\u00a0$2").replace(/ kr\b/g, "\u00a0kr");
const val = (url, text = "") => ({ text: hart(text), url });
export const BOKNING = {
  fert:    { sthlm: [val(typ(STHLM, 10292))], gbg: [val(typ(GBG, 10168))] },
  sperma:  { sthlm: [val(typ(STHLM, 10305), "Spermaprov, 2 200 kr"),
                     val(typ(STHLM, 12529), "Spermaprov + DNA-fragmentering, 7 900 kr")],
             gbg:   [val(typ(GBG, 10162), "Spermaprov, 2 200 kr"),
                     val(typ(GBG, 12546), "Spermaprov + oxidativ stress, 3 800 kr")] },
  immun:   { sthlm: [val(typ(STHLM, 10311))], gbg: [val(typ(GBG, 10147))] },
  lakare:  { sthlm: [val(typ(STHLM, 10301))], gbg: null },
  utland:  { sthlm: [val(typ(STHLM, 10308))], gbg: [val(typ(GBG, 12376))] },
  nipt:    { sthlm: [val(typ(STHLM, 10293))], gbg: null },
  dropp:   { sthlm: [val(typ(STHLM, 10299), "Intralipid, 1 600 kr"),
                     val(typ(STHLM, 10298), "Intralipid helg, 2 200 kr"),
                     val(typ(STHLM, 10304), "IVIG, 2 500 kr"),
                     val(typ(STHLM, 10319), "Multivitamin, 900 kr"),
                     val(typ(STHLM, 10317), "C-vitamin, 850 kr")],
             gbg:   [val(typ(GBG, 10149), "Intralipid, 1 600 kr"),
                     val(typ(GBG, 10150), "Intralipid helg, 2 200 kr"),
                     val(typ(GBG, 10156), "IVIG, 2 500 kr"),
                     val(typ(GBG, 10171), "Multivitamin, 900 kr"),
                     val(typ(GBG, 10169), "C-vitamin, 850 kr")] },
  bm:      { sthlm: [val(typ(STHLM, 10300))], gbg: [val(typ(GBG, 12375))] },
  telefon: { sthlm: [val(typ(STHLM, 10306))], gbg: [val(typ(GBG, 12371))] },
};
const forsta = (id, k) => (BOKNING[id][k] ? BOKNING[id][k][0].url : null);

/* --- Innehållet ---------------------------------------------------- */
/* Texterna är sajtens egna: Boka tid-sidan, prislistan och tjänstesidorna
   som de ligger live 24 november. */

const KLINIK = {
  sthlm: {
    namn: "Stockholm",
    adress: "Värtavägen 30, 115 53 Stockholm",
    kort: "Värtavägen 30, Stockholm",
    tider: "Mån–tors 09:00–17:00, fre 09:00–16:00",
    extra: "Lunch 12:00–12:30. Lör–sön efter förfrågan.",
    karta: "https://www.google.com/maps/search/?api=1&query=V%C3%A4rtav%C3%A4gen+30%2C+115+53+Stockholm",
  },
  gbg: {
    namn: "Göteborg",
    adress: "Askims kyrkväg 46, 436 42 Askim",
    kort: "Askims kyrkväg 46, Askim",
    tider: "Mån–fre efter förfrågan, lör–sön efter förfrågan",
    extra: "",
    karta: "https://www.google.com/maps/search/?api=1&query=Askims+kyrkv%C3%A4g+46%2C+436+42+Askim",
  },
};

/* Ordningen är Sophies: de vanligaste först, dropp sist. */
const TJANSTER = [
  {
    id: "fert", namn: "Fertilitetsutredning",
    kort: "Konsultation, hormonprover, sköldkörtelprov och telefonuppföljning.",
    pris: "från 2 900 kr", tid: "30 min",
    ingar: "En utredning med konsultation, hormonprover, sköldkörtelprov och uppföljning av blodprov via telefon. Om ultraljud/läkarkonsultation rekommenderas i förlängningen tillkommer 1 900 kr.",
    regel: "Fertilitetsprover tas dag 2–4 i cykeln. Du får remiss vid besöket så att proverna kan tas när det är rätt tid i cykeln.",
  },
  {
    id: "sperma", namn: "Spermaprov",
    kort: "Antal, rörlighet och utseende. Uppföljning sker oftast samma dag eller dagen efter.",
    pris: "från 2 200 kr", tid: "30 min",
    ingar: {
      sthlm: "Spermaprovsanalys 2 200 kr: bestämning av antal och koncentration, klassificering av rörlighet och bedömning av spermiernas utseende. Spermaprov + DNA-fragmentering 7 900 kr: fördjupat prov av spermiernas DNA-kvalitet, svar nästa dag.",
      gbg: "Spermaprovsanalys 2 200 kr: bestämning av antal och koncentration, klassificering av rörlighet och bedömning av spermiernas utseende. Spermaprov + oxidativ stress 3 800 kr: utökad analys där även mätning av oxidativ stress ingår.",
    },
    regel: "Avhållsamhet inför provet är 2–5 dagar. Provet lämnas på kliniken, eller medhavt hemifrån – då behöver det vara hos oss senast en timme efter provtagning.",
  },
  {
    id: "immun", namn: "Immunologisk utredning",
    kort: "För dig med upprepade missfall eller IVF utan resultat. NK-celler, sköldkörtel och koagulation.",
    pris: "från 5 000 kr", tid: "30 min",
    ingar: "Konsultation på kliniken med immunologiska prover (bl.a. NK-celler), sköldkörtelprover och koagulationsprover, samt uppföljning av blodprov via telefon. Om ultraljud/läkarkonsultation rekommenderas i förlängningen tillkommer 1 900 kr.",
    regel: "Provtagning kan inte ske på fredagar, dag före röd dag eller på röd dag, på grund av bestämmelser från labbet.",
  },
  {
    id: "lakare", namn: "Läkarbesök med ultraljud",
    kort: "Inför eller under graviditet, hos läkare på kliniken i Stockholm.",
    pris: "1 900 kr", tid: "30 min",
    ingar: "Ett fysiskt besök hos vår läkare där både läkarkonsultation och ultraljud ingår. Passar dig som vill ha en kontroll inför en graviditet (livmoder och äggstockar, planering inför t.ex. IVF) eller extra trygghet under graviditeten. Ingen remiss behövs.",
    regel: "",
  },
  {
    id: "utland", namn: "Konsultation vid utlandsbehandling",
    kort: "Genomgång av klinikens provprotokoll, remisser och bokning av ultraljud.",
    pris: "1 200 kr", tid: "30 min",
    ingar: "För dig som genomgår fertilitetsbehandling utomlands och vill göra undersökningar och provtagning i Sverige. Konsultation på kliniken eller via telefon där en barnmorska går igenom ditt protokoll och skriver blodprovsremisser, med uppföljning via telefon. Kostnad för blodprover eller ultraljud tillkommer.",
    regel: "",
    mer: { text: "Mer om IVF och utlandsbehandlingar", href: "/pages/provtagning-infor-behandling-utomlands" },
  },
  {
    id: "nipt", namn: "Fostertest Harmony NIPT",
    kort: "Från graviditetsvecka 11. Blodprov som kompletteras med ett ultraljud.",
    pris: "6 500 kr", tid: "30 min",
    ingar: "Blodprovtagning, ultraljud utfört av läkare och uppföljning av testet via telefon.",
    regel: "",
  },
  {
    id: "dropp", namn: "Droppbehandling",
    kort: "Immunologiska dropp och vitamindropp.",
    pris: "från 850 kr", tid: "45–120 min",
    ingar: "Intralipid 1 600 kr (vardag) / 2 200 kr (helg), du behöver tåla ägg och soja. IVIG 2 500 kr, för dig som fått det utskrivet av läkare – du tar med ditt eget preparat. Multivitamindropp 900 kr. C-vitamindropp 850 kr. Alla dropp ges av barnmorska eller sjuksköterska.",
    regel: "",
  },
];

const OSAKER = [
  { id: "bm", namn: "Konsultation med barnmorska", pris: "900 kr", fyllt: true,
    rubrik: "Konsultation med barnmorska", tid: "30 min",
    ingar: "Ett första besök på kliniken för att påbörja en utredning eller undersökning, eller för att få kontakt med läkare. Den som tar emot dig är barnmorska eller sjuksköterska.", },
  { id: "telefon", namn: "Telefonkonsultation, 15 min", pris: "250 kr", fyllt: false,
    rubrik: "Telefonkonsultation med barnmorska", tid: "15 min",
    ingar: "Ett telefonsamtal med en barnmorska för råd och vägledning kring din fertilitet och dina nästa steg, utan att du behöver besöka kliniken. Vid konsultation på telefon betalar du med Swish innan samtalet.", },
];

const VETA = [
  ["Ingen remiss behövs", "Du bokar själv, direkt. Vi har ingen åldersgräns och alla är välkomna, oavsett relation eller livssituation."],
  ["Rätt dag i cykeln", "Fertilitetsprover tas dag 2–4 i cykeln. Du får remiss vid besöket så att proverna kan tas när det är rätt tid i cykeln."],
  ["Immunologiska prover", "Provtagning kan inte ske på fredagar, dag före röd dag eller på röd dag, på grund av bestämmelser från labbet."],
  ["Betalning", "Vid konsultation på telefon betalar du med Swish innan samtalet. På kliniken kan du dela upp betalningen med Klarna – meddela oss vid ditt besök."],
];

/* Ändringar mot förslagets texter, för granskningen före publicering. */
export const ANDRINGAR = [
  "Alla texter är sajtens egna (Boka tid-sidan, prislistan, tjänstesidorna, sidfoten) i stället för förslagets.",
  "Inte på sajten i dag, därför borttaget: \"Vi är en privat fertilitetsklinik …\" och \"Räkna första mensdagen som dag 1\".",
  "Avbokningsregeln står med, ordagrant som i patient.nu: \"Avbokning sker senast 24 timmar innan ditt bokade besöks starttid. Vid uteblivet besök debiteras en kostnad på 450 kr via faktura.\" (Jonna 24/11).",
  "\"Delbetala med Klarna\" står kvar som trygghetspunkt eftersom Sophie bad om det. Sajten säger annars \"dela upp betalningen med Klarna\".",
  "Rubrikerna använder Cormorant 400 kursiv. Förslaget anger 500 kursiv, men den vikten finns inte bland sajtens typsnitt.",
  "Den flytande chattknappen (+) står kvar.",
];

/* --- HTML ---------------------------------------------------------- */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const pil = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`;
const ut = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>`;

function ingarFor(t, k) { return typeof t.ingar === "string" ? t.ingar : t.ingar[k]; }

/* All data som skriptet behöver, i en JSON-ö. */
function data() {
  const alla = {};
  for (const t of [...TJANSTER, ...OSAKER]) {
    alla[t.id] = {
      namn: t.rubrik || t.namn, pris: t.pris, tid: t.tid,
      ingar: { sthlm: ingarFor(t, "sthlm"), gbg: ingarFor(t, "gbg") },
      regel: t.regel || "", bokning: BOKNING[t.id], mer: t.mer || null,
    };
  }
  return { tjanster: alla, klinik: KLINIK };
}

function rad(t) {
  const baraSthlm = !BOKNING[t.id].gbg;
  return `
      <li class="fpb-rad"${baraSthlm ? ' data-bara-sthlm' : ""}>
        <a class="fpb-radknapp" href="${esc(forsta(t.id, "sthlm"))}" data-tjanst="${t.id}" data-lank-sthlm="${esc(forsta(t.id, "sthlm"))}"${forsta(t.id, "gbg") ? ` data-lank-gbg="${esc(forsta(t.id, "gbg"))}"` : ""} aria-expanded="false" aria-controls="fpb-panel-${t.id}">
          <span class="fpb-radtext">
            <span class="fpb-namn">${esc(t.namn)}</span>
            <span class="fpb-kort">${esc(t.kort)}</span>
            <span class="fpb-pris"><strong>${esc(t.pris)}</strong><span>${esc(t.tid)}</span></span>
            ${baraSthlm ? '<span class="fpb-bara">Endast i Stockholm</span>' : ""}
          </span>
          <span class="fpb-ikon" aria-hidden="true"><span class="fpb-pil">${pil}</span><span class="fpb-plus"></span></span>
        </a>
        <div class="fpb-panel" id="fpb-panel-${t.id}" hidden></div>
      </li>`;
}

function innehall() {
  const k = KLINIK;
  return `
<div id="fp-boka" data-klinik="sthlm">
<style>
#fp-boka{--kol:#3A3530;--linne:#F8F6F2;--sten:#EBE7E1;--salvia:#7E9680;--morksalvia:#566B59;--text2:#57524D;--text3:#615B55;--linje:#E4E1DB;font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:var(--kol);background:var(--linne)}
#fp-boka *{box-sizing:border-box}
#fp-boka a{color:var(--kol)}
#fp-boka .fpb-wrap{max-width:1200px;margin:0 auto;padding:28px 20px 8px}
#fp-boka .fpb-etikett{margin:0;font-size:12px;letter-spacing:.18em;font-weight:600;color:var(--morksalvia);text-transform:uppercase}
#fp-boka h1{margin:10px 0 0;font-family:Cormorant,Georgia,serif;font-style:italic;font-weight:400;font-size:40px!important;line-height:1.05!important;letter-spacing:-.01em}
#fp-boka .fpb-intro{margin:10px 0 0;font-size:16px;line-height:1.5;color:var(--text2);max-width:36em}
#fp-boka .fpb-steg{margin:16px 0 0;padding:0;list-style:none;display:flex;gap:6px;font-size:13px;color:#3E3934}
#fp-boka .fpb-steg li{flex:1;padding:8px 10px;background:var(--sten);border-radius:8px}
#fp-boka .fpb-steg strong{font-weight:600}
#fp-boka .fpb-klinik{margin-top:18px;display:flex;flex-direction:column;gap:10px}
#fp-boka .fpb-klinikrubrik{display:none;font-size:14px;font-weight:600}
#fp-boka .fpb-seg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;padding:4px;background:var(--sten);border-radius:12px}
#fp-boka .fpb-seg button{min-height:44px;border:0;border-radius:9px;font:inherit;font-size:15px;font-weight:500;cursor:pointer;background:transparent;color:var(--text2)}
#fp-boka .fpb-seg button[aria-pressed="true"]{background:#fff;color:var(--kol);box-shadow:0 1px 2px rgba(0,0,0,.08)}
#fp-boka .fpb-seg button:focus-visible,#fp-boka a:focus-visible,#fp-boka summary:focus-visible{outline:2px solid var(--kol);outline-offset:2px}
#fp-boka .fpb-plats{display:flex;gap:8px;font-size:14px;line-height:1.45;color:var(--text2)}
#fp-boka .fpb-plats svg{flex:none;margin-top:2px}
#fp-boka[data-klinik="sthlm"] [data-visa="gbg"],#fp-boka[data-klinik="gbg"] [data-visa="sthlm"]{display:none}
#fp-boka .fpb-lista{margin-top:24px}
#fp-boka h2.fpb-sm{margin:0 0 6px;font-size:13px!important;line-height:1.4!important;letter-spacing:.14em;font-weight:600;color:var(--morksalvia);text-transform:uppercase}
#fp-boka .fpb-rader{list-style:none;margin:0;padding:0;border-top:1px solid var(--linje)}
#fp-boka .fpb-rad{border-bottom:1px solid var(--linje)}
#fp-boka .fpb-radknapp{display:flex;align-items:center;gap:14px;padding:18px 0;text-decoration:none;min-height:44px}
#fp-boka .fpb-radtext{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}
#fp-boka .fpb-namn{font-size:17px;font-weight:500}
#fp-boka .fpb-kort{font-size:14px;line-height:1.4;color:var(--text3)}
#fp-boka .fpb-pris{font-size:14px;margin-top:2px}
#fp-boka .fpb-pris strong{font-weight:600}
#fp-boka .fpb-pris span{color:var(--text3);margin-left:8px}
#fp-boka .fpb-bara{display:none;align-self:flex-start;margin-top:4px;font-size:12px;font-weight:500;color:#8A4B2E;background:#F4E6DD;padding:3px 8px;border-radius:99px}
#fp-boka[data-klinik="gbg"] [data-bara-sthlm]{opacity:.6}
#fp-boka[data-klinik="gbg"] [data-bara-sthlm] .fpb-bara{display:inline-block}
#fp-boka[data-klinik="gbg"] [data-bara-sthlm] .fpb-radknapp{pointer-events:none;cursor:default}
#fp-boka[data-klinik="gbg"] [data-bara-sthlm] .fpb-pil{visibility:hidden}
#fp-boka .fpb-ikon{flex:none;display:flex}
#fp-boka .fpb-plus{display:none;width:20px;text-align:center;font-size:22px;font-weight:300;color:var(--morksalvia)}
#fp-boka .fpb-plus::before{content:"+"}
#fp-boka [aria-expanded="true"] .fpb-plus::before{content:"–"}
#fp-boka .fpb-allalank{margin-top:14px;font-size:15px;font-weight:500;min-height:44px;display:inline-flex;align-items:center;text-underline-offset:4px}
#fp-boka .fpb-osaker{margin-top:16px;padding:22px 20px;background:#E6ECE5;border-radius:16px;display:flex;flex-direction:column;gap:12px}
#fp-boka .fpb-osaker h2{margin:0;font-family:Cormorant,Georgia,serif;font-style:italic;font-weight:400;font-size:28px!important;line-height:1.1!important}
#fp-boka .fpb-osaker p{margin:0;font-size:15px;line-height:1.5;color:#3E4A40}
#fp-boka .fpb-knapp{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:52px;padding:0 18px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:500;border:1px solid var(--kol)}
#fp-boka .fpb-knapp.fyllt{background:var(--kol);color:#F8F6F2}
#fp-boka .fpb-knapp.fyllt span:last-child{opacity:.85;font-weight:400}
#fp-boka .fpb-knapp:not(.fyllt) span:last-child{font-weight:400}
#fp-boka .fpb-veta{margin-top:32px}
#fp-boka .fpb-veta details{border-bottom:1px solid var(--linje)}
#fp-boka .fpb-veta summary{list-style:none;min-height:56px;padding:14px 0;display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:16px;font-weight:500;cursor:pointer}
#fp-boka .fpb-veta summary::-webkit-details-marker{display:none}
#fp-boka .fpb-veta summary::after{content:"+";font-size:20px;font-weight:300;color:var(--morksalvia)}
#fp-boka .fpb-veta details[open] summary::after{content:"–"}
#fp-boka .fpb-veta details p{margin:0 0 16px;font-size:15px;line-height:1.55;color:var(--text2)}
#fp-boka .fpb-trygg{margin-top:28px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
#fp-boka .fpb-trygg div{display:flex;flex-direction:column;gap:6px;align-items:center;text-align:center;font-size:13px;line-height:1.35;color:#3E3934}
#fp-boka .fpb-kliniker{margin-top:32px;padding-bottom:40px;display:flex;flex-direction:column;gap:12px}
#fp-boka .fpb-kortklinik{padding:18px;background:#fff;border:1px solid var(--linje);border-radius:14px;display:flex;flex-direction:column;gap:4px;font-size:14px;line-height:1.5;color:var(--text2)}
#fp-boka .fpb-kortklinik strong{font-size:17px;font-weight:500;color:var(--kol)}
#fp-boka .fpb-kortklinik a{margin-top:6px;font-weight:500;min-height:44px;display:inline-flex;align-items:center}
#fp-boka .fpb-betala{margin:8px 0 0;font-size:14px;line-height:1.5;color:var(--text2)}
#fp-boka .fpb-betala a{font-weight:500}
/* Panelinnehåll, används både i arket och i dragspelet */
#fp-boka .fpb-info{display:flex;flex-direction:column;gap:14px}
#fp-boka .fpb-fakta{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:15px}
#fp-boka .fpb-fakta strong{font-weight:600}
#fp-boka .fpb-fakta span{color:var(--text3)}
#fp-boka .fpb-info h3{margin:0 0 6px;font-size:15px!important;font-weight:600}
#fp-boka .fpb-knapp span:last-child{white-space:nowrap}
#fp-boka .fpb-knapp{padding-top:10px;padding-bottom:10px}
#fp-boka .fpb-dator{display:none}
#fp-boka .fpb-info p{margin:0;font-size:15px;line-height:1.5;color:var(--text2)}
#fp-boka .fpb-regel{padding:14px 16px;background:#FBF1E8;border-radius:12px;display:flex;gap:12px;align-items:flex-start}
#fp-boka .fpb-regel p{color:#4A2A1B}
#fp-boka .fpb-regel strong{font-weight:600}
#fp-boka .fpb-info ol{margin:0;padding-left:20px;font-size:15px;line-height:1.55;color:var(--text2)}
#fp-boka .fpb-info ol strong{font-weight:600;color:var(--kol)}
#fp-boka .fpb-villkor{font-size:13px!important;color:var(--text3)!important;margin-top:4px!important}
#fp-boka .fpb-boka svg{flex:none}
#fp-boka .fpb-boka{display:flex;align-items:center;justify-content:center;gap:8px;min-height:56px;padding:0 24px;background:var(--kol);color:#fff!important;border-radius:12px;text-decoration:none;font-size:16px;font-weight:500}
#fp-boka .fpb-ring{margin:-4px 0 0;text-align:center;font-size:14px;color:var(--text3)}
#fp-boka .fpb-bokval{display:flex;flex-direction:column;gap:8px}
#fp-boka .fpb-knappnamn{margin:-2px 0 6px!important;font-size:13px!important;color:var(--text3)!important;text-align:center}
#fp-boka .fpb-knappnamn strong{color:var(--kol)}
#fp-boka .fpb-ring a{font-weight:600}
/* Bottenarket på mobil */
#fp-boka dialog.fpb-ark{margin:auto 0 0;padding:0;width:100%;max-width:100%;max-height:calc(100dvh - 40px);border:0;border-radius:20px 20px 0 0;background:#fff;color:var(--kol)}
#fp-boka dialog.fpb-ark::backdrop{background:rgba(47,43,40,.45)}
#fp-boka .fpb-arkinre{padding:10px 20px calc(24px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:16px}
#fp-boka .fpb-handtag{align-self:center;width:40px;height:4px;border-radius:4px;background:#D6D2CB}
#fp-boka .fpb-arktopp{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
#fp-boka .fpb-arktopp h2{margin:4px 0 0;font-family:Cormorant,Georgia,serif;font-style:italic;font-weight:400;font-size:32px!important;line-height:1.05!important}
#fp-boka .fpb-stang{width:44px;height:44px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:22px;background:#F1EFEA;border:0;cursor:pointer}
@media (min-width:900px){
  #fp-boka .fpb-wrap{padding:56px 32px 8px}
  #fp-boka .fpb-topp{display:flex;gap:56px;align-items:flex-start}
  #fp-boka .fpb-vanster{flex:1 1 320px;min-width:0}
  #fp-boka .fpb-hoger{flex:999 1 560px;min-width:0}
  #fp-boka h1{font-size:56px!important;line-height:1!important}
  #fp-boka .fpb-mobil{display:none}
  #fp-boka .fpb-dator{display:inline}
  #fp-boka p.fpb-dator{display:block}
  #fp-boka .fpb-knapp{font-size:14px;padding:0 16px}
  #fp-boka .fpb-intro{font-size:17px;line-height:1.55}
  #fp-boka .fpb-steg{display:none}
  #fp-boka .fpb-klinikrubrik{display:block}
  #fp-boka .fpb-lista{margin-top:0}
  #fp-boka .fpb-radknapp{padding:18px 20px;min-height:72px}
  #fp-boka .fpb-radknapp .fpb-radtext{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:24px}
  #fp-boka .fpb-namn{font-size:18px;grid-column:1}
  #fp-boka .fpb-kort{grid-column:1}
  #fp-boka .fpb-pris{grid-column:2;grid-row:1 / span 2;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;margin:0;white-space:nowrap}
  #fp-boka .fpb-pris strong{font-size:16px}
  #fp-boka .fpb-pris span{margin:0;font-size:13px}
  #fp-boka .fpb-bara{grid-column:1}
  #fp-boka .fpb-pil{display:none}
  #fp-boka .fpb-plus{display:block}
  #fp-boka[data-klinik="gbg"] [data-bara-sthlm] .fpb-plus{visibility:hidden}
  #fp-boka .fpb-rad.oppen{background:#fff}
  #fp-boka .fpb-panel{padding:0 20px 22px}
  #fp-boka .fpb-panel .fpb-info{flex-direction:row;flex-wrap:wrap;gap:24px;align-items:flex-end}
  #fp-boka .fpb-panel .fpb-infotext{flex:1 1 320px;display:flex;flex-direction:column;gap:10px}
  #fp-boka .fpb-panel .fpb-fakta,#fp-boka .fpb-panel .fpb-ring,#fp-boka .fpb-panel .fpb-steglista{display:none}
  #fp-boka .fpb-panel .fpb-boka{flex:none;min-height:52px;font-size:15px;border-radius:10px}
  #fp-boka .fpb-panel .fpb-bokval{flex:0 0 340px}
  #fp-boka .fpb-panel .fpb-bokval .fpb-boka{justify-content:space-between;text-align:left;padding:10px 18px}
  #fp-boka .fpb-panel .fpb-fakta{display:none}
  #fp-boka .fpb-panel .fpb-regel{padding:10px 14px;border-radius:10px}
  #fp-boka .fpb-panel .fpb-regel svg{display:none}
  #fp-boka .fpb-osaker{margin-top:24px;padding:24px}
  #fp-boka .fpb-veta{margin-top:40px}
  #fp-boka .fpb-veta .fpb-vetagrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
  #fp-boka .fpb-veta details{padding:20px;background:#fff;border:1px solid var(--linje);border-radius:14px}
  #fp-boka .fpb-veta summary{min-height:0;padding:0 0 6px;font-weight:600;cursor:default;pointer-events:none}
  #fp-boka .fpb-veta summary::after{display:none}
  #fp-boka .fpb-veta details p{margin:0;font-size:14px}
  #fp-boka .fpb-trygg{max-width:640px}
  #fp-boka .fpb-kliniker .fpb-klinikgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
}
</style>

<div class="fpb-wrap">
  <div class="fpb-topp">
    <div class="fpb-vanster">
      <p class="fpb-etikett">Boka tid</p>
      <h1>Vad vill du boka?</h1>
      <p class="fpb-intro">Ingen remiss och inga väntetider. Välj klinik och tjänst och boka direkt i vårt bokningssystem. Är du osäker på vilken bokning som passar dig, ring eller mejla oss – vi hjälper dig att hitta rätt.</p>
      <ol class="fpb-steg">
        <li><strong>1</strong> Välj klinik</li>
        <li><strong>2</strong> Välj tjänst</li>
        <li><strong>3</strong> Välj tid</li>
      </ol>
      <div class="fpb-klinik">
        <span class="fpb-klinikrubrik" id="fpb-klinikrubrik">Klinik</span>
        <div class="fpb-seg" role="group" aria-label="Välj klinik">
          <button type="button" data-valj="sthlm" aria-pressed="true">Stockholm</button>
          <button type="button" data-valj="gbg" aria-pressed="false">Göteborg</button>
        </div>
        <div class="fpb-plats">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#566B59" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>
          <span data-visa="sthlm">${esc(k.sthlm.kort)}<br>${esc(k.sthlm.tider)}</span>
          <span data-visa="gbg">${esc(k.gbg.kort)}<br>${esc(k.gbg.tider)}</span>
        </div>
      </div>
      <div class="fpb-osaker fpb-osaker-dator" hidden></div>
    </div>

    <div class="fpb-hoger">
      <div class="fpb-lista" aria-labelledby="fpb-listrubrik">
        <h2 class="fpb-sm" id="fpb-listrubrik"><span class="fpb-mobilrubrik">Vanligaste bokningarna</span></h2>
        <ul class="fpb-rader">${TJANSTER.map(rad).join("")}
        </ul>
        <a class="fpb-allalank" href="/pages/prislista">Se alla tjänster och priser</a>
      </div>
    </div>
  </div>

  <div class="fpb-osaker" aria-labelledby="fpb-osakerrubrik">
    <h2 id="fpb-osakerrubrik">Osäker på vad du ska boka?</h2>
    <p>Börja med en konsultation med barnmorska – ett första besök för att påbörja en utredning eller få kontakt med läkare. Du kan också ringa eller mejla oss, så hjälper vi dig att hitta rätt.</p>
    ${OSAKER.map((o) => `<a class="fpb-knapp${o.fyllt ? " fyllt" : ""}" href="${esc(forsta(o.id, "sthlm"))}" data-tjanst="${o.id}" data-lank-sthlm="${esc(forsta(o.id, "sthlm"))}" data-lank-gbg="${esc(forsta(o.id, "gbg"))}"><span>${esc(o.namn)}</span><span>${esc(o.pris)}</span></a>`).join("\n    ")}
    <p style="font-size:14px">Eller ring oss på <a href="tel:+46101903690" style="font-weight:600">010 190 36 90</a></p>
  </div>

  <div class="fpb-veta" aria-labelledby="fpb-vetarubrik">
    <h2 class="fpb-sm" id="fpb-vetarubrik">Bra att veta innan du bokar</h2>
    <div class="fpb-vetagrid">
      ${VETA.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n      ")}
    </div>
  </div>

  <div class="fpb-trygg">
    <div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#566B59" stroke-width="1.5" aria-hidden="true"><path d="M5 12l4 4 10-10"/></svg>Ingen remiss</div>
    <div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#566B59" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>Inga väntetider</div>
    <div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#566B59" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16v10H4z"/><path d="M4 11h16"/></svg>Delbetala med Klarna</div>
  </div>

  <div class="fpb-kliniker" aria-labelledby="fpb-klinikerrubrik">
    <h2 class="fpb-sm" id="fpb-klinikerrubrik">Våra kliniker</h2>
    <div class="fpb-klinikgrid">
      ${["sthlm", "gbg"].map((id) => `<div class="fpb-kortklinik"><strong>${esc(k[id].namn)}</strong><span>${esc(k[id].adress)}</span><span>${esc(k[id].tider)}</span>${k[id].extra ? `<span>${esc(k[id].extra)}</span>` : ""}<a href="${esc(k[id].karta)}" target="_blank" rel="noopener">Vägbeskrivning</a></div>`).join("\n      ")}
    </div>
    <p class="fpb-betala">Ska du betala för ett besök du redan gjort? <a href="/collections/betala-pa-klinik">Betala här</a></p>
  </div>
</div>

<dialog class="fpb-ark" aria-labelledby="fpb-arkrubrik">
  <div class="fpb-arkinre">
    <div class="fpb-handtag" aria-hidden="true"></div>
    <div class="fpb-arktopp">
      <div><p class="fpb-etikett" id="fpb-arkplats"></p><h2 id="fpb-arkrubrik"></h2></div>
      <button type="button" class="fpb-stang" aria-label="Stäng"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A3530" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <div class="fpb-arkinnehall"></div>
  </div>
</dialog>

<script type="application/json" id="fpb-data">${JSON.stringify(data()).replace(/</g, "\\u003c")}</script>
<script>
(function(){
  var rot=document.getElementById('fp-boka'); if(!rot) return;
  var D=JSON.parse(document.getElementById('fpb-data').textContent);
  var ark=rot.querySelector('dialog.fpb-ark');
  var dator=window.matchMedia('(min-width: 900px)');
  function klinik(){return rot.getAttribute('data-klinik');}
  function e(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  var kal='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A4B2E" stroke-width="1.6" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>';
  var utpil='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  function info(id){
    var t=D.tjanster[id], k=klinik(), K=D.klinik[k], v=t.bokning[k]||[], en=v.length===1;
    var h='<div class="fpb-info"><div class="fpb-infotext">';
    h+='<div class="fpb-fakta"><strong>'+e(t.pris)+'</strong><span>'+e(t.tid)+'</span><span>Delbetala med Klarna</span></div>';
    h+='<div><h3>Det här ingår</h3><p>'+e(t.ingar[k]||t.ingar.sthlm)+'</p></div>';
    if(t.regel) h+='<div class="fpb-regel">'+kal+'<p><strong>Tänk på:</strong> '+e(t.regel)+'</p></div>';
    h+='<div><div class="fpb-steglista"><h3>Så går bokningen till</h3><ol><li>Du kommer direkt till lediga tider i vår bokningskalender (patient.nu).</li>';
    h+= en ? '<li>Välj en av de lediga tiderna.</li>' : '<li>Tryck på det du vill boka nedan och välj en av de lediga tiderna.</li>';
    h+='<li>Fyll i dina uppgifter och bekräfta.</li></ol></div>';
    h+='<p class="fpb-villkor">'+'Avbokning sker senast 24 timmar innan ditt bokade besöks starttid. Vid uteblivet besök debiteras en kostnad på 450 kr via faktura.</p></div>';
    if(t.mer) h+='<p><a href="'+e(t.mer.href)+'">'+e(t.mer.text)+'</a></p>';
    h+='</div><div class="fpb-bokval">';
    v.forEach(function(o){
      h+='<a class="fpb-boka" href="'+e(o.url)+'" target="_blank" rel="noopener" data-bokning="'+e(id)+'">'+(en?'Välj tid i '+e(K.namn):e(o.text))+' '+utpil+'</a>';
    });
    h+='</div><p class="fpb-ring">Frågor? Ring <a href="tel:+46101903690">010 190 36 90</a></p>';
    return h+'</div>';
  }
  function stangPaneler(){
    rot.querySelectorAll('.fpb-rad.oppen').forEach(function(r){r.classList.remove('oppen');var p=r.querySelector('.fpb-panel');p.hidden=true;p.innerHTML='';r.querySelector('.fpb-radknapp').setAttribute('aria-expanded','false');});
  }
  function oppnaArk(id){
    var t=D.tjanster[id], K=D.klinik[klinik()];
    ark.querySelector('#fpb-arkplats').textContent=(K.namn+', '+K.kort.split(',')[0]).toUpperCase();
    ark.querySelector('#fpb-arkrubrik').textContent=t.namn;
    ark.querySelector('.fpb-arkinnehall').innerHTML=info(id);
    if(typeof ark.showModal==='function'){ark.showModal();}else{return false;}
    return true;
  }
  rot.addEventListener('click',function(ev){
    var val=ev.target.closest('[data-valj]');
    if(val){var k=val.getAttribute('data-valj');rot.setAttribute('data-klinik',k);
      rot.querySelectorAll('[data-valj]').forEach(function(b){b.setAttribute('aria-pressed',String(b===val));});
      rot.querySelectorAll('[data-lank-sthlm]').forEach(function(a){var l=a.getAttribute('data-lank-'+k);if(l)a.setAttribute('href',l);});
      rot.querySelectorAll('.fpb-rad.oppen').forEach(function(r){var id=r.querySelector('[data-tjanst]').getAttribute('data-tjanst');if(r.hasAttribute('data-bara-sthlm')&&k==='gbg'){stangPaneler();}else{r.querySelector('.fpb-panel').innerHTML=info(id);}});
      return;}
    if(ev.target.closest('.fpb-stang')){ark.close();return;}
    var a=ev.target.closest('a[data-tjanst]');
    if(!a) return;
    var id=a.getAttribute('data-tjanst'), rad=a.closest('.fpb-rad');
    if(rad&&rad.hasAttribute('data-bara-sthlm')&&klinik()==='gbg'){ev.preventDefault();return;}
    if(dator.matches&&rad){
      ev.preventDefault();
      var var_oppen=rad.classList.contains('oppen'); stangPaneler();
      if(!var_oppen){rad.classList.add('oppen');var p=rad.querySelector('.fpb-panel');p.innerHTML=info(id);p.hidden=false;a.setAttribute('aria-expanded','true');}
      return;
    }
    if(oppnaArk(id)) ev.preventDefault();
  });
  ark.addEventListener('click',function(ev){if(ev.target===ark) ark.close();});
  /* Bra att veta: på dator syns allt, som i förslaget */
  function vetaLage(){rot.querySelectorAll('.fpb-veta details').forEach(function(d,i){if(dator.matches)d.open=true;});}
  vetaLage(); if(dator.addEventListener) dator.addEventListener('change',function(){vetaLage();if(!dator.matches)stangPaneler();else if(ark.open)ark.close();});
  /* Osäker-rutan ligger i vänsterspalten på dator */
  var osaker=rot.querySelector('.fpb-osaker:not(.fpb-osaker-dator)'), vanster=rot.querySelector('.fpb-vanster'), plats=rot.querySelector('.fpb-osaker-dator');
  function flytta(){ if(dator.matches){ if(osaker.parentNode!==vanster) vanster.appendChild(osaker); } else { var wrap=rot.querySelector('.fpb-wrap'); var veta=rot.querySelector('.fpb-veta'); if(osaker.parentNode!==wrap) wrap.insertBefore(osaker,veta);} }
  plats.remove(); flytta(); if(dator.addEventListener) dator.addEventListener('change',flytta);
  /* Rubriken på listan heter "Välj tjänst" på dator */
  var lr=rot.querySelector('.fpb-mobilrubrik'); function rubrik(){lr.textContent=dator.matches?'Välj tjänst':'Vanligaste bokningarna';} rubrik(); if(dator.addEventListener) dator.addEventListener('change',rubrik);
})();
</script>
<style>
/* Boka här-knappen i sidhuvudet behövs inte på bokningssidan */
[data-book]{display:none!important}
</style>
</div>
`;
}

function sattHuvud(h) {
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${TITEL}</title>`);
  h = h.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${BESKRIVNING}">`);
  h = h.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${DOMAN}${ADRESS}">`);
  h = h.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${BESKRIVNING}">`);
  return h;
}

/**
 * Bygger sidan. Skalet tas ur den byggda Boka tid-sidan, så att huvud,
 * meny och sidfot alltid är desamma som på resten av sajten.
 */
export async function byggBokasidan(utkatalog, skalfil = "pages/boka-tid.html") {
  const skal = await fs.readFile(path.join(utkatalog, skalfil), "utf8");
  let h = bytMitten(skal, innehall());
  h = sattHuvud(h);
  const fil = path.join(utkatalog, ADRESS.replace(/^\//, "") + ".html");
  await fs.writeFile(fil, h, "utf8");
  return { fil: path.relative(utkatalog, fil), storlek: h.length };
}

/* Kör direkt: node bygg-bokasidan.mjs ut */
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await byggBokasidan(process.argv[2] || "ut");
  console.log(`bokningssidan: ${r.fil}, ${r.storlek} tecken`);
}
