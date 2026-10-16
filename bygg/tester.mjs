/**
 * Testerna som körs innan något publiceras.
 * =========================================
 *
 *   node bygg/tester.mjs ut/
 *
 * De fem testerna finns för att de var och en har fångat ett riktigt fel
 * som annars hade nått en besökare. De är skrivna för att vara tråkiga:
 * varje test ställer en fråga som har ett rätt svar, och skriver ut vad
 * som är fel — inte hur mycket som är rätt.
 *
 *   menytest      Går menyn att fälla ut utan JavaScript?
 *   klicktest     Leder varje länk någonstans som finns?
 *   bannertest    Går cookiebannern att svara på?
 *   fonttest      Ritas sidan med rätt typsnitt?
 *   overflowtest  Scrollar något i sidled på mobil?
 *
 * Bakgrunden till menytestet är värd att minnas: Claude Design ritar
 * undermenyerna först när någon pekar på dem, så i en sparad HTML-fil
 * finns de inte alls. Sjutton av tjugotvå sidor tappade sina menylänkar
 * utan att det syntes på skärmen — menyn fanns ju, den var bara tom
 * inuti. Konverteraren öppnar därför varje meny på riktigt och sparar
 * ner innehållet. Det här testet bevisar att den gjorde det.
 */

import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { chromium } from "playwright";

const UT = path.resolve(process.argv[2] ?? "ut");
const PORT = 8240;

/* ------------------------------------------------------------------ */

async function filer(katalog, rot = katalog) {
  const ut = [];
  for (const p of await fs.readdir(katalog, { withFileTypes: true })) {
    const full = path.join(katalog, p.name);
    if (p.isDirectory()) ut.push(...(await filer(full, rot)));
    else if (p.name.endsWith(".html")) ut.push(path.relative(rot, full));
  }
  return ut.sort();
}

function servera(mapp, port) {
  const typer = { ".html": "text/html; charset=utf-8", ".js": "application/javascript",
                  ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json",
                  ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png",
                  ".ico": "image/x-icon", ".webp": "image/webp", ".xml": "application/xml" };
  const s = http.createServer((req, res) => {
    let p = path.join(mapp, decodeURIComponent(req.url.split("?")[0]));
    if (p.endsWith("/")) p += "index.html";
    if (!path.extname(p)) p += ".html";                 // sajten kör utan .html i adressen
    if (!p.startsWith(mapp)) { res.writeHead(403); return res.end(); }
    fs.readFile(p)
      .then((b) => { res.writeHead(200, { "Content-Type": typer[path.extname(p)] ?? "application/octet-stream" }); res.end(b); })
      .catch(() => { res.writeHead(404); res.end(); });
  });
  return new Promise((ok) => s.listen(port, "127.0.0.1", () => ok(s)));
}

const fel = [];
const anmärk = (test, sida, vad) => fel.push({ test, sida, vad });

/* --- 1. Menyn ------------------------------------------------------
   Utan JavaScript ska menyn ändå gå att fälla ut, och varje sida ska ha
   lika många länkar i den. En sida med färre har tappat en panel. */
async function menytest(sidor, ctx) {
  const sida = await ctx.newPage();
  const antal = new Map();
  for (const f of sidor) {
    await sida.goto(`http://127.0.0.1:${PORT}/${f}`, { waitUntil: "domcontentloaded" });
    const n = await sida.evaluate(() => ({
      paneler: document.querySelectorAll("[data-meny-panel]").length,
      länkar: document.querySelectorAll("[data-meny-panel] a").length,
      mobil: document.querySelectorAll("[data-mobil-panel], [data-mobile-panel]").length,
    }));
    if (!n.paneler) anmärk("meny", f, "inga utfällbara menypaneler alls");
    else if (!n.länkar) anmärk("meny", f, "menypaneler finns men är tomma");
    antal.set(f, n.länkar);
  }
  await sida.close();
  const vanligast = [...antal.values()].sort((a, b) =>
    [...antal.values()].filter((x) => x === b).length - [...antal.values()].filter((x) => x === a).length)[0];
  for (const [f, n] of antal)
    if (n !== vanligast) anmärk("meny", f, `${n} menylänkar, de flesta sidor har ${vanligast}`);
}

/* --- 2. Länkarna ---------------------------------------------------
   Varje intern länk ska leda till en fil som finns. Externa länkar och
   bokningslänkar kontrolleras bara till formen — vi vill inte ringa upp
   patient.nu varje gång någon bygger. */
async function klicktest(sidor) {
  const finns = new Set(sidor.map((f) => "/" + f.replace(/\\/g, "/").replace(/\.html$/, "").replace(/^index$/, "")));
  finns.add("/");
  const saknade = new Map();
  for (const f of sidor) {
    const html = await fs.readFile(path.join(UT, f), "utf8");
    for (const m of html.matchAll(/href="([^"#?]*)(?:[#?][^"]*)?"/g)) {
      const h = m[1];
      if (!h || !h.startsWith("/") || h.startsWith("//")) continue;
      if (/\.(css|js|png|svg|ico|webp|jpe?g|woff2?|xml|txt|avif)$/.test(h)) continue;
      if (h.startsWith("/material/") || h.startsWith("/bilder/") || h.startsWith("/typsnitt/")) continue;
      const mål = h.replace(/\/$/, "") || "/";
      if (!finns.has(mål)) {
        if (!saknade.has(mål)) saknade.set(mål, []);
        saknade.get(mål).push(f);
      }
    }
  }
  for (const [mål, varifrån] of saknade)
    anmärk("klick", varifrån[0] + (varifrån.length > 1 ? ` (+${varifrån.length - 1} till)` : ""),
           `länk till ${mål} — finns ingen sådan sida`);
}

/* --- 3. Cookiebannern ----------------------------------------------
   Bannern ska ha både sina svarsknappar och sina kategorireglage på
   plats i filen. Den fälls ut av JavaScript i designen, så det här är
   samma sorts fälla som menyn. */
async function bannertest(sidor) {
  for (const f of sidor) {
    const html = await fs.readFile(path.join(UT, f), "utf8");
    const knappar = (html.match(/data-samtycke="/g) ?? []).length;
    const kategorier = (html.match(/data-kategori="/g) ?? []).length;
    if (knappar < 4) anmärk("banner", f, `${knappar} svarsknappar, väntade minst 4`);
    if (kategorier < 2) anmärk("banner", f, `${kategorier} kategorireglage, väntade minst 2`);
  }
}

/* --- 4. Typsnitten -------------------------------------------------
   Att filen nämner rätt typsnitt räcker inte — det ska också vara det
   webbläsaren faktiskt ritar med. Testet frågar sidan, inte källkoden. */
async function fonttest(sidor, ctx) {
  const sida = await ctx.newPage();
  for (const f of sidor.slice(0, 6)) {
    await sida.goto(`http://127.0.0.1:${PORT}/${f}`, { waitUntil: "networkidle" });
    const ritat = await sida.evaluate(async () => {
      await document.fonts.ready;
      const brödtext = getComputedStyle(document.body).fontFamily;
      const laddade = [...document.fonts].filter((t) => t.status === "loaded").map((t) => t.family);
      return { brödtext, laddade: [...new Set(laddade)] };
    });
    if (!/Plus Jakarta Sans/.test(ritat.brödtext))
      anmärk("font", f, `brödtexten ritas med ${ritat.brödtext}`);
    if (!ritat.laddade.some((t) => /Plus Jakarta Sans/.test(t)))
      anmärk("font", f, "Plus Jakarta Sans laddades aldrig — sidan visar ett reservsnitt");
  }
  await sida.close();
}

/* --- 5. För brett innehåll -----------------------------------------
   Designen lägger `overflow-x: hidden` runt hela sidan. Det gör att ett
   för brett element inte ger någon scrollrad — innehållet klipps i
   stället, tyst, och texten som hamnar utanför syns aldrig på en
   telefon. Att mäta sidans scrollbredd skulle därför alltid svara "allt
   är bra", och det var precis så det här testet missade sitt eget
   sabotage första gången.

   Testet mäter i stället varje element mot skärmens bredd vid 390 px.
   Två saker får sticka ut med flit och räknas inte: det som ligger i en
   behållare som får scrolla i sidled (omdömeskarusellen), och det som
   är dolt. */
async function overflowtest(sidor, ctx) {
  const sida = await ctx.newPage();
  await sida.setViewportSize({ width: 390, height: 844 });
  for (const f of sidor) {
    await sida.goto(`http://127.0.0.1:${PORT}/${f}`, { waitUntil: "networkidle" });
    const bovar = await sida.evaluate(() => {
      const bredd = document.documentElement.clientWidth;
      const ut = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.right <= bredd + 1 && r.width <= bredd + 1) continue;

        let far = el.parentElement, iScroll = false;
        while (far && far !== document.body) {
          const o = getComputedStyle(far).overflowX;
          if (o === "auto" || o === "scroll") { iScroll = true; break; }
          far = far.parentElement;
        }
        if (iScroll) continue;
        if (getComputedStyle(el).visibility === "hidden") continue;

        ut.push(`<${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""}> `
          + `${Math.round(r.width)}px bred, går ut till ${Math.round(r.right)}px (skärmen är ${bredd}px)`);
        if (ut.length >= 2) break;
      }
      return ut;
    });
    for (const b of bovar) anmärk("overflow", f, b);
  }
  await sida.close();
}

/* ------------------------------------------------------------------ */

const alla = await filer(UT);

/* Sajten innehåller två sorters sidor. Våra egna byggs här och har meny,
   sidfot, cookiebanner och typsnitt. De trettioen sidorna under /blogs/
   och /products/ hör till Shopify och är bara vidarebefordringar — de
   skickar besökaren vidare till shop.fertilitetplus.se och har varken
   meny eller typsnitt. Att köra menytestet på dem hade gett trettioen
   falska larm, och eftersom de dessutom navigerar bort direkt kraschade
   testet i stället för att svara.

   Omdirigeringarna känns igen på vad de gör, inte på var de ligger: en
   sida som skickar vidare är en vidarebefordran oavsett adress. */
const ärVidare = async (f) => {
  const h = await fs.readFile(path.join(UT, f), "utf8");
  return /http-equiv="refresh"/i.test(h) || /location\.(replace|href\s*=)/.test(h);
};
const sidor = [], vidare = [];
for (const f of alla) ((await ärVidare(f)) ? vidare : sidor).push(f);

const server = await servera(UT, PORT);
const webbl = await chromium.launch();

console.log(`\n${sidor.length} egna sidor i ${UT}`
  + (vidare.length ? `, plus ${vidare.length} vidarebefordringar till Shopify\n` : "\n"));

await menytest(sidor, await webbl.newContext({ javaScriptEnabled: false }));
await klicktest(alla);                       // länkar kontrolleras överallt
await bannertest(sidor);
const medJs = await webbl.newContext({ viewport: { width: 1512, height: 900 } });
await fonttest(sidor, medJs);
await overflowtest(sidor, medJs);

await webbl.close();
server.close();

const grupper = {};
for (const f of fel) (grupper[f.test] ??= []).push(f);

for (const test of ["meny", "klick", "banner", "font", "overflow"]) {
  const g = grupper[test] ?? [];
  console.log(`${test.padEnd(10)} ${g.length ? `${g.length} ANMÄRKNINGAR` : "ok"}`);
  for (const f of g.slice(0, 12)) console.log(`   ${f.sida}\n      ${f.vad}`);
  if (g.length > 12) console.log(`   … och ${g.length - 12} till`);
}

console.log(fel.length ? `\n${fel.length} anmärkningar. Bygget ska inte publiceras så här.\n`
                       : "\nAlla fem testerna gick igenom.\n");
process.exit(fel.length ? 1 : 0);
