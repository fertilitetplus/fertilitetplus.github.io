/**
 * Hela bygget, i ett kommando.
 * ============================
 *
 *   node bygg/bygg.mjs design/ ut/
 *
 * Kedjan har fyra steg och de går bara åt ett håll:
 *
 *   1. Konverteraren gör om designexporten till sidor.
 *   2. Remissidorna byggs, med en färdig sida som skal.
 *   3. Bokningslänkarna normaliseras.
 *   4. sitemap.xml och robots.txt skrivs.
 *
 * Efter det kommer testerna (`node bygg/tester.mjs ut/`). De ingår
 * medvetet inte här: ett bygge som inte går att titta på är inte värt
 * något, och ett bygge som stannar mitt i är svårare att felsöka än ett
 * som blir klart och sedan underkänns.
 *
 * DET SOM INTE LÄNGRE INGÅR
 * -------------------------
 * `bygg-innehallsfixar.mjs` och `textbyten.mjs` rättade innehåll efter
 * bygget. Varje sådan regel var en skuld mot Claude Design, och alla
 * sju är betalda: körda mot dagens bygge träffar ingen borttagning och
 * varje infogning hoppas över. De ändrar inte en enda byte. De ligger
 * kvar i repot som historik men körs inte, och de ska inte heller köras
 * igen — en infogning vars text numera finns i designen skulle lägga in
 * den en andra gång om spärren någon gång togs bort.
 *
 * `bygg-utlandssidan-allman.mjs` byggde om den allmänna utlandssidan
 * från grunden. Den texten finns i designen nu, och sidan byggs som alla
 * andra.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { normaliseraBokningslankar } from "./bokningslankar.mjs";
import { skrivSitemap } from "./sitemap.mjs";

const HÄR = path.dirname(fileURLToPath(import.meta.url));

const kör = (fil, args) =>
  new Promise((ok, fel) => {
    const p = spawn(process.execPath, [path.join(HÄR, fil), ...args], { stdio: "inherit" });
    p.on("exit", (kod) => (kod === 0 ? ok() : fel(new Error(`${fil} avbröts med kod ${kod}`))));
  });

const DESIGN = process.argv[2] ?? path.join(HÄR, "..", "design");
const UT = process.argv[3] ?? path.join(HÄR, "..", "ut");

console.log(`\ndesign  ${DESIGN}\nut      ${UT}\n`);

/* 0. Det som inte byggs -------------------------------------------
   Bygget gör HTML av designen. Allt annat sajten består av ligger redan
   i repot och kopieras bara med: skripten och stilmallen, typsnitten,
   bilderna, ikonerna, domännamnet — och de trettiotvå sidorna som
   Shopify äger (bloggen och produkterna). Listan är skriven för hand
   med flit. Ett bygge som sveper med allt i repot skulle förr eller
   senare publicera `design/`, och då hade hela designexporten legat
   öppen på fertilitetplus.se. */
const STATISKT = [
  "CNAME", "favicon.ico", "favicon.svg", "apple-touch-icon.png",
  "fp-chatt.js", "fp-korg.js", "fp-meny.js", "fp-omdomen.js",
  "fp-prislista.js", "fp-samtycke.js", "fp-fixar.css", "fp-typsnitt.css",
  "typsnitt", "material", "bilder",
  "blogs", "products",          // 16 + 16 sidor som ligger hos Shopify
];

await fs.mkdir(UT, { recursive: true });
let kopierat = 0, saknade = [];
for (const namn of STATISKT) {
  const från = path.join(HÄR, "..", namn);
  try {
    await fs.cp(från, path.join(UT, namn), { recursive: true });
    kopierat++;
  } catch {
    saknade.push(namn);
  }
}
console.log(`statiska filer:      ${kopierat} av ${STATISKT.length} kopierade`);
if (saknade.length) console.log(`   SAKNAS I REPOT:   ${saknade.join(", ")}`);

/* 1. Sidorna ------------------------------------------------------- */
await kör("konvertera.mjs", [DESIGN, UT]);

/* 2. Remissidorna --------------------------------------------------
   De finns inte i Claude Design. Innehållet kommer ur det gamla
   Shopify-temat och ligger i projektets anteckningar; skriptet klipper
   in det i skalet från en redan byggd sida, så att meny och sidfot
   följer med av sig själva nästa gång någon ändrar menyn. */
try {
  const { byggUtlandssidorna } = await import(path.join(HÄR, "..", "bygg-utlandssidorna.mjs"));
  const r = await byggUtlandssidorna(UT);
  console.log(`remissidor:          ${Array.isArray(r) ? r.length : 2} byggda`);
} catch (e) {
  console.log(`remissidor:          HOPPADES ÖVER — ${e.message}`);
}

/* 3. Bokningslänkarna ----------------------------------------------- */
const bokningar = await normaliseraBokningslankar(UT);
if (!bokningar.length) {
  console.log("bokningslänkar:      alla pekar redan på #step-1");
} else {
  console.log(`bokningslänkar:      ${bokningar.length} RÄTTADE — felet står kvar i Claude Design:`);
  for (const b of bokningar) console.log(`   ${b.fil}  ${b.kalender}  ${b.fran} → #step-1`);
}

/* 4. Kartan --------------------------------------------------------- */
const karta = JSON.parse(await fs.readFile(path.join(HÄR, "..", "data", "url-karta.json"), "utf8"));
const sm = await skrivSitemap(UT, karta);
console.log(`sitemap.xml:         ${sm.med.length} adresser`);
if (sm.utan.length) console.log(`   UTAN FIL, utelämnade: ${sm.utan.join(", ")}`);

console.log(`\nKlart. Granska med:  node bygg/tester.mjs ${UT}\n`);
