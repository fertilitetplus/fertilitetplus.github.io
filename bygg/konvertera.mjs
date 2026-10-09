#!/usr/bin/env node
/* ====================================================================
   OBS — DET HÄR ÄR EN ÖGONBLICKSBILD FRÅN 30 SEPTEMBER 2026.
   Den är INTE den konverterare som byggde sajten som ligger live.

   Den riktiga versionen fanns bara på två ställen, och båda är borta:
   molnmiljön som rensades, och Linux-miljön på Maries dator som slutade
   starta 8 oktober. Det här är det närmaste vi kommer.

   Vad den här versionen saknar jämfört med den som byggde live-sajten:

     - skriver pages/kontakt/index.html i stället för pages/kontakt.html
     - inget LAGE=forhandsvisning / LAGE=live (noindex, robots.txt)
     - sätter inte lang="sv"
     - skriver relativ canonical i stället för fullständig adress
     - länkar inte in fp-omdomen.js, fp-korg.js, fp-chatt.js, fp-prislista.js
     - saknar favicon- och apple-touch-taggarna
     - känner inte till blogg- och produktsidorna
     - anropar inte textbyten, innehållsfixar, utlandssidorna eller
       bokningslankar

   url-karta.json, som den läser på rad 37, finns inte heller kvar.

   Läs bygg/LAS-MIG.md innan du kör något av det här.
   ==================================================================== */

/**
 * FertilitetPlus — Claude Design → statisk HTML för GitHub Pages
 * =====================================================================
 *
 * Claude Design äger utseendet. Den här filen äger allt som inte går att
 * uttrycka där: adresser, metadata, responsivitet, samtycke, bildmått.
 *
 * Körs om varje gång designen exporteras på nytt. Därför kan
 * rättningarna här inte regrera — de appliceras alltid.
 *
 *   node konvertera.mjs <export-mapp> <ut-mapp>
 */

import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const EXPORT = process.argv[2] ?? "/home/claude/design30";
const UT = process.argv[3] ?? "/home/claude/site";
const HAR = path.dirname(new URL(import.meta.url).pathname);
const CHROME = process.env.CHROME_PATH;
const PORT = 8123;

const BIBLIOTEK = {
  "react@18.3.1/umd/react.production.min.js": "/home/claude/fp-code/node_modules/react/umd/react.production.min.js",
  "react-dom@18.3.1/umd/react-dom.production.min.js": "/home/claude/fp-code/node_modules/react-dom/umd/react-dom.production.min.js",
  "@babel/standalone@7.29.0/babel.min.js": "/home/claude/fp-code/node_modules/@babel/standalone/babel.min.js",
};

const karta = JSON.parse(fs.readFileSync(path.join(EXPORT, "url-karta.json"), "utf8"));
const ADRESSER = karta.sidor;

/* --- sidspecifik metadata -------------------------------------------
   Claude Design skriver ingen <head>. Titlarna hålls under 60 tecken och
   beskrivningarna under 155, annars klipper Google av dem.            */
const META = {
  "/": ["Fertilitetsklinik i Stockholm & Göteborg | FertilitetPlus",
    "Utredning och behandling vid utebliven graviditet och upprepade missfall. Ingen remiss, inga väntetider. Boka tid direkt."],
  "/pages/fertilitetplus": ["Om FertilitetPlus – 30 års erfarenhet",
    "Vi är specialister på immunologi och upprepade missfall. Möt teamet bakom kliniken i Stockholm och Göteborg."],
  "/pages/samarbeten": ["Våra samarbetspartners | FertilitetPlus",
    "Vi samarbetar med ledande laboratorier och kliniker i Sverige och utomlands för att ge dig hela bilden."],
  "/pages/omdomen": ["Omdömen från våra patienter | FertilitetPlus",
    "Läs vad patienter berättar om sin utredning och behandling hos FertilitetPlus."],
  "/pages/fertilitetsutredning": ["Fertilitetsutredning – så går det till | FertilitetPlus",
    "Hormonprover, ultraljud och spermaanalys ger svar på varför graviditeten uteblir. Från 2 900 kr, ingen remiss."],
  "/pages/immunsuppression": ["Immunologisk utredning vid upprepade missfall",
    "Vid återkommande missfall och misslyckade IVF-försök utreder vi immunförsvarets roll. Stockholm och Göteborg."],
  "/pages/lakarkonsultation-och-ultraljud": ["Ultraljud under graviditet | FertilitetPlus",
    "Ultraljud och läkarkonsultation under graviditeten, utfört av läkare på vår klinik."],
  "/pages/autoimmuna-sjukdomar-och-graviditet": ["Sköldkörtel och autoimmuna sjukdomar vid graviditet",
    "Sköldkörtelrubbning påverkar fertiliteten. Vi utreder med blodprover och följer upp med läkare."],
  "/pages/lakarkonsultation-och-ultraljud-infor-graviditet": ["Ultraljud inför graviditet | FertilitetPlus",
    "Ultraljud och läkarkonsultation inför en graviditet, som del av din fertilitetsutredning."],
  "/pages/spermaprov": ["Spermaprov och spermaanalys | FertilitetPlus",
    "Spermaprov är en enkel och viktig del av fertilitetsutredningen. Från 2 200 kr i Stockholm och Göteborg."],
  "/pages/provtagning-infor-behandling-utomlands": ["IVF och behandling utomlands – provtagning i Sverige",
    "Gör ultraljud och blodprover hos oss medan din behandling sköts av en klinik utomlands."],
  "/pages/nipt-test": ["Fostertest NIPT (Harmony) | FertilitetPlus",
    "Icke-invasivt fosterdiagnostiskt blodprov från vecka 10. Utförs på vår klinik i Stockholm."],
  "/pages/nyhet-dropp": ["Vitamindropp och immunologiska dropp | FertilitetPlus",
    "Intralipid, IVIG och vitamindropp som del av fertilitetsbehandling. Ges av barnmorska eller sjuksköterska."],
  "/pages/prislista": ["Priser och tjänster | FertilitetPlus",
    "Alla utredningar och behandlingar med pris, plats och tidsåtgång. Bokas utan remiss."],
  "/pages/om-fertilitet": ["Vanliga frågor om fertilitet | FertilitetPlus",
    "Svar på de vanligaste frågorna om fertilitetsutredning, missfall, provsvar och behandling."],
  "/pages/fertilitet-efter-40": ["Barnlängtan efter 40 | FertilitetPlus",
    "Vad som är möjligt efter 40, vad utredningen visar och vilka vägar som finns."],
  "/pages/skaffa-barn-sjalv": ["Skaffa barn på egen hand | FertilitetPlus",
    "Utredning och stöd för dig som vill bli förälder på egen hand. Ingen remiss krävs."],
  "/pages/kontakt": ["Kontakta oss | FertilitetPlus",
    "Klinik i Stockholm och Göteborg. Mejla, ring eller boka tid direkt i vår kalender."],
  "/pages/boka-tid": ["Boka tid | FertilitetPlus",
    "Välj utredning eller behandling och boka direkt i vår kalender. Ingen remiss, inga väntetider."],
  "/collections/all": ["Produkter | FertilitetPlus",
    "Kosttillskott och produkter som stöttar fertiliteten. Betalas säkert via Shopify med Klarna."],
  "/collections/betala-pa-klinik": ["Betala på klinik | FertilitetPlus",
    "Betalningssidor för behandlingar som bokats på plats hos oss."],
  "/policies/privacy-policy": ["Integritetspolicy | FertilitetPlus",
    "Hur vi behandlar dina personuppgifter, vilka cookies vi använder och vilka rättigheter du har."],
};

const DOMAN = "https://fertilitetplus.se";

/* --- filserver för exportmappen -------------------------------------- */
function servera(mapp, port) {
  const typer = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
                  ".json": "application/json", ".svg": "image/svg+xml" };
  const s = http.createServer((req, res) => {
    const p = path.join(mapp, decodeURIComponent(req.url.split("?")[0]));
    if (!p.startsWith(path.resolve(mapp)) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
      res.writeHead(404); return res.end();
    }
    res.writeHead(200, { "Content-Type": typer[path.extname(p)] ?? "application/octet-stream" });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise((ok) => s.listen(port, "127.0.0.1", () => ok(s)));
}

/* --- DOM-ingrepp som körs i sidan innan den fryses -------------------- */
function ingrepp() {
  const R = (e) => e.getBoundingClientRect();

  /* 1. Cookietabellen: rubrikraden blir en lös lista när rutnätet faller
        till en spalt på mobil. Märk upp rubriken så den kan döljas, och
        ge varje värde sin etikett inline i stället. */
  const RUTNAT = "180px 150px minmax(0, 1fr) 120px";
  const rader = [...document.querySelectorAll("div")].filter(
    (e) => getComputedStyle(e).gridTemplateColumns && e.style.gridTemplateColumns
           && e.style.gridTemplateColumns.replace(/\s+/g, " ").includes("180px 150px")
  );
  if (rader.length) {
    const etiketter = [...rader[0].children].map((c) => c.textContent.trim());
    rader[0].setAttribute("data-tabellrubrik", "");
    rader.slice(1).forEach((rad) => {
      rad.setAttribute("data-tabellrad", "");
      [...rad.children].forEach((cell, i) => {
        if (etiketter[i]) cell.setAttribute("data-etikett", etiketter[i]);
      });
    });
  }

  /* 2. Omdömen: ta bort rubriken "Recensioner" (ögonbrynet OMDÖMEN står
        kvar) och gör kortraden till en karusell. */
  const rec = [...document.querySelectorAll("h1,h2,h3")].find(
    (h) => h.textContent.trim().toLowerCase() === "recensioner"
  );
  if (rec) {
    const sektion = rec.closest("section") || rec.parentElement;
    rec.remove();
    // kortraden = det rutnät i sektionen som har flest direkta barn
    const kandidater = [...sektion.querySelectorAll("div")].filter(
      (d) => d.children.length >= 2 && getComputedStyle(d).display.includes("grid")
    );
    const rad = kandidater.sort((a, b) => b.children.length - a.children.length)[0];
    if (rad) {
      rad.setAttribute("data-karusell", "");
      const yta = rad.parentElement;
      if (yta) yta.setAttribute("data-karusell-yta", "");
    }
  }

  /* 3. Bildmått. Utan width och height hoppar sidan när bilderna laddar,
        vilket Google mäter som CLS. Vi skriver in de renderade måtten. */
  let matt = 0;
  document.querySelectorAll("img").forEach((img) => {
    const b = R(img);
    if (b.width > 0 && !img.getAttribute("width")) {
      img.setAttribute("width", Math.round(b.width));
      img.setAttribute("height", Math.round(b.height));
      matt++;
    }
    if (!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
    if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");
  });
  // Första bilden ska inte vara lazy — den är oftast sidans LCP.
  const forsta = document.querySelector("img");
  if (forsta) { forsta.removeAttribute("loading"); forsta.setAttribute("fetchpriority", "high"); }

  /* 4. Claude Designs egna spår behövs inte i resultatet. */
  document.querySelectorAll("[data-dc-tpl]").forEach((e) => e.removeAttribute("data-dc-tpl"));

  return { matt, tabellrader: rader.length, karusell: !!rec };
}

async function main() {
  const filer = fs.readdirSync(EXPORT).filter((f) => f.endsWith(".dc.html"));
  const server = await servera(path.resolve(EXPORT), PORT);
  const webbl = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
  const ctx = await webbl.newContext({ viewport: { width: 1512, height: 900 } });

  await ctx.route("https://unpkg.com/**", (r) => {
    const k = Object.keys(BIBLIOTEK).find((k) => r.request().url().includes(k));
    k ? r.fulfill({ contentType: "application/javascript", body: fs.readFileSync(BIBLIOTEK[k]) }) : r.abort();
  });
  await ctx.route("https://fonts.googleapis.com/**", (r) => r.fulfill({ contentType: "text/css", body: "" }));
  await ctx.route("**/cdn/shop/**", (r) => r.abort()); // bilderna laddas hos besökaren

  const sida = await ctx.newPage();
  const fixar = fs.readFileSync("/home/claude/fp-code/fp-fixar.css", "utf8");
  const samtycke = fs.readFileSync("/home/claude/fp-samtycke.js", "utf8");

  fs.mkdirSync(UT, { recursive: true });
  fs.writeFileSync(path.join(UT, "fp-fixar.css"), fixar);
  fs.writeFileSync(path.join(UT, "fp-samtycke.js"), samtycke);

  const rapport = [];

  for (const f of filer) {
    const namn = f.replace(".dc.html", "");
    const adress = ADRESSER[f];
    if (!adress) { rapport.push({ namn, adress: "(delkomponent, hoppas över)" }); continue; }

    await sida.goto(`http://127.0.0.1:${PORT}/${encodeURIComponent(f)}`, { waitUntil: "networkidle" });
    await sida.waitForTimeout(1400);
    const info = await sida.evaluate(ingrepp);

    let html = await sida.evaluate(() => {
      document.querySelectorAll("script").forEach((s) => s.remove());
      document.querySelectorAll('link[href*="fonts.googleapis"], link[href*="fonts.gstatic"]').forEach((l) => l.remove());
      const x = document.querySelector("x-dc");
      if (x) { const d = document.createElement("div"); d.innerHTML = x.innerHTML; x.replaceWith(...d.childNodes); }
      return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
    });

    /* --- länkar: .dc.html → sajtens riktiga adresser ------------------ */
    for (const [fil, till] of Object.entries(ADRESSER)) {
      const m = fil.replace(".dc.html", "").replace(/ /g, "(?: |%20)");
      html = html.replace(new RegExp(`(?:\\./)?${m}\\.dc\\.html`, "g"), till);
    }
    html = html.replace(/https?:\/\/(?:www\.)?fertilitetplus\.se(?=\/(?:pages|blogs|collections|products|policies)\/)/g, "");

    /* --- head: det Claude Design inte kan skriva ---------------------- */
    const [titel, beskrivning] = META[adress] ?? [`FertilitetPlus`, ""];
    const kanonisk = DOMAN + adress;
    const head = `
<title>${titel}</title>
<meta name="description" content="${beskrivning}">
<link rel="canonical" href="${kanonisk}">
<meta property="og:type" content="website">
<meta property="og:locale" content="sv_SE">
<meta property="og:site_name" content="FertilitetPlus">
<meta property="og:title" content="${titel}">
<meta property="og:description" content="${beskrivning}">
<meta property="og:url" content="${kanonisk}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/fp-fixar.css">
<script src="/fp-samtycke.js"></script>`;
    html = html.replace("</head>", head + "\n</head>");

    /* --- skriv på rätt plats i mappstrukturen ------------------------- */
    const mapp = adress === "/" ? UT : path.join(UT, adress.replace(/^\/|\/$/g, ""));
    fs.mkdirSync(mapp, { recursive: true });
    fs.writeFileSync(path.join(mapp, "index.html"), html);

    rapport.push({
      namn, adress, kb: Math.round(html.length / 1024),
      bildmatt: info.matt, tabellrader: info.tabellrader, karusell: info.karusell ? "ja" : "",
      kvarDc: (html.match(/\.dc\.html/g) ?? []).length,
      skript: (html.match(/<script/g) ?? []).length - 1, // samtyckesskriptet ska finnas
    });
  }

  await webbl.close();
  server.close();

  console.table(rapport);
  const fel = rapport.filter((r) => r.kvarDc > 0);
  if (fel.length) { console.error("\nKVARVARANDE .dc.html-länkar:", fel.map((f) => f.namn).join(", ")); process.exitCode = 1; }
  else console.log(`\n${rapport.filter((r) => r.kb).length} sidor skrivna till ${UT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
