/**
 * FertilitetPlus — Claude Design → statisk HTML
 * =============================================
 *
 * Claude Design äger utseendet. Den här filen äger allt som inte går att
 * uttrycka där: adresser, metadata, menyer som fungerar utan JavaScript,
 * samtycke, bildmått.
 *
 *   node konvertera.mjs <exportmapp> <utmapp>
 *
 * Skrivs om från grunden 10 oktober 2026. Den tidigare versionen fanns
 * bara i en molnmiljö som rensades och en Linux-miljö som slutade starta.
 * Facit är sajten som ligger live: ett bygge är rätt när det ger samma
 * filer som redan finns i repot.
 */

import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const HÄR = path.dirname(new URL(import.meta.url).pathname);
const EXPORT = path.resolve(process.argv[2] ?? "/home/claude/design3");
const UT = path.resolve(process.argv[3] ?? "/home/claude/bygge");
const PORT = 8232;
const DOMÄN = "https://fertilitetplus.se";

const karta = JSON.parse(fs.readFileSync(path.join(HÄR, "..", "data", "url-karta.json"), "utf8"));
const ADRESSER = karta.sidor;
const META = JSON.parse(fs.readFileSync(path.join(HÄR, "..", "data", "sidmeta.json"), "utf8")).sidor;

/* Mätkoden. Villkoret på hostname gör att förhandsvisningar och lokala
   bygg inte skickar trafik till Analytics — bara den riktiga domänen gör. */
const GTM = `<script>(function(w,d,s,l,i){if(["fertilitetplus.se","www.fertilitetplus.se"].indexOf(location.hostname)<0)return;
w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KVBBJLL');</script>`;
const GTM_NOSCRIPT = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KVBBJLL"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;

/* Designen hämtar React och Babel från unpkg. Ett bygge ska inte hänga på
   att någon annans server svarar, så biblioteken serveras lokalt. */
/* Designen hämtar React och Babel från unpkg. Ett bygge ska inte vara
   beroende av att någon annans server svarar, så anropen fångas och
   besvaras ur node_modules. Paketen slås upp med Nodes egen upplösning
   i stället för med en sökväg: då spelar det ingen roll om node_modules
   ligger bredvid den här filen eller i repots rot. */
const slåUpp = createRequire(import.meta.url);
const BIBLIOTEK = {
  "react@18.3.1/umd/react.production.min.js": ["react", "umd/react.production.min.js"],
  "react-dom@18.3.1/umd/react-dom.production.min.js": ["react-dom", "umd/react-dom.production.min.js"],
  "@babel/standalone@7.29.0/babel.min.js": ["@babel/standalone", "babel.min.js"],
};

/* Vägen till en fil inne i ett paket. Den går via paketets package.json
   och inte via filen direkt: React 18 listar inte sina umd-filer under
   "exports", och en direkt uppslagning avvisas därför av Node. */
const paketfil = ([paket, fil]) =>
  path.join(path.dirname(slåUpp.resolve(`${paket}/package.json`)), fil);

function servera(mapp, port) {
  const typer = { ".html": "text/html", ".js": "application/javascript",
                  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
  const s = http.createServer((req, res) => {
    const p = path.join(mapp, decodeURIComponent(req.url.split("?")[0]));
    if (!p.startsWith(mapp) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
      res.writeHead(404); return res.end();
    }
    res.writeHead(200, { "Content-Type": typer[path.extname(p)] ?? "application/octet-stream" });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise((ok) => s.listen(port, "127.0.0.1", () => ok(s)));
}

/**
 * Packar ut de utfällbara menyerna.
 *
 * Sidhuvudet bygger menyerna med <sc-if> — innehållet ritas först när man
 * för muspekaren över rubriken eller trycker på hamburgaren. I en statisk
 * sida finns ingen React kvar som kan rita dem, så utan det här steget
 * blir "Om oss", "Utredning & behandling" och "Kunskap & stöd" tomma
 * rubriker, och hamburgaren en knapp som inte gör något. 17 av 22 sidor
 * skulle sakna länk från menyn.
 *
 * Metoden: öppna varje meny på riktigt, spara undan den färdigritade
 * panelen, och lägg sedan tillbaka panelerna permanent. Därefter styrs de
 * av CSS och några rader vanlig JavaScript för mobilen — och länkarna
 * ligger i koden hela tiden, vilket är det sökmotorer läser.
 */
async function packaUtMenyer(sida) {
  const paneler = [];

  for (const [i, grupp] of (await sida.$$("[data-desktop-nav] > div")).entries()) {
    const knapp = await grupp.$("button");
    if (!knapp) continue;              // vanlig länk, ingen utfällbar meny
    await knapp.hover();
    await sida.waitForTimeout(220);
    const html = await grupp.evaluate((g) => {
      const p = g.querySelector(":scope > div");
      return p ? p.outerHTML : null;
    });
    if (html) paneler.push({ index: i, html });
  }

  /* Hamburgaren går bara att trycka på i mobilbredd. */
  await sida.setViewportSize({ width: 390, height: 844 });
  await sida.waitForTimeout(150);
  let mobil = null;
  const hamburgare = await sida.$("[data-mobile-toggle]");
  if (hamburgare) {
    await hamburgare.click();
    await sida.waitForTimeout(260);
    mobil = await sida.evaluate(() => {
      const p = document.querySelector("[data-mobile-panel]");
      return p ? p.outerHTML : null;
    });
  }
  await sida.setViewportSize({ width: 1512, height: 900 });
  await sida.waitForTimeout(200);

  return await sida.evaluate(({ paneler, mobil }) => {
    const grupper = [...document.querySelectorAll("[data-desktop-nav] > div")];
    let lagda = 0, länkar = 0;

    for (const { index, html } of paneler) {
      const g = grupper[index];
      if (!g) continue;
      if (!g.querySelector(":scope > div")) g.insertAdjacentHTML("beforeend", html);
      const panel = g.querySelector(":scope > div");
      if (!panel) continue;
      g.setAttribute("data-meny-grupp", "");
      panel.setAttribute("data-meny-panel", "");
      const k = g.querySelector("button");
      if (k) { k.setAttribute("aria-haspopup", "true"); k.setAttribute("aria-expanded", "false"); }
      lagda++;
      länkar += panel.querySelectorAll("a[href]").length;
    }

    if (mobil && !document.querySelector("[data-mobile-panel]")) {
      const h = document.querySelector("header");
      if (h) h.insertAdjacentHTML("beforeend", mobil);
    }
    const mp = document.querySelector("[data-mobile-panel]");
    return { paneler: lagda, panellänkar: länkar, mobillänkar: mp ? mp.querySelectorAll("a[href]").length : 0 };
  }, { paneler, mobil });
}

/**
 * Kopplar cookiebannern.
 *
 * Bannern har två vyer. Först syns bara "Acceptera alla", "Endast
 * nödvändiga" och "Anpassa". Trycker man Anpassa byts hela innehållet ut
 * mot kategorierna med sina reglage. I en statisk sida finns ingen React
 * som kan byta vy, så båda måste finnas i koden samtidigt — annars når
 * besökaren aldrig inställningarna, och samtycket blir inte giltigt.
 *
 * Metoden är densamma som för menyerna: öppna på riktigt, spara undan,
 * lägg tillbaka. Därefter märks knapparna så att fp-samtycke.js hittar
 * dem, och bannern döljs tills skriptet visar den.
 */
async function kopplaCookiebanner(sida) {
  const före = await sida.evaluate(() => {
    const el = document.querySelector("[data-cookie-banner]");
    if (!el) return null;
    const anpassa = [...el.querySelectorAll("button")].find((b) => b.textContent.trim() === "Anpassa");
    return {
      huvudval: anpassa?.previousElementSibling?.outerHTML ?? null,
      anpassa: anpassa?.outerHTML ?? null,
    };
  });
  if (!före?.anpassa) return { kopplad: false };

  for (const k of await sida.$$("[data-cookie-banner] button")) {
    if ((await k.textContent()).trim() === "Anpassa") { await k.click(); break; }
  }
  await sida.waitForTimeout(400);

  return await sida.evaluate(({ huvudval, anpassa }) => {
    const el = document.querySelector("[data-cookie-banner]");
    if (!el) return { kopplad: false };

    /* Svenska tecken i aria-etiketten blir nyckeln skriptet läser.
       "Marknadsföring" måste bli marknadsforing, inte marknadsf%C3%B6ring. */
    const nyckel = (s) => s.toLowerCase()
      .replace(/å|ä/g, "a").replace(/ö/g, "o").replace(/[^a-z0-9]+/g, "");

    const reglage = [...el.querySelectorAll('button[role="switch"]')];
    reglage.forEach((b) => b.setAttribute("data-kategori", nyckel(b.getAttribute("aria-label") ?? "")));

    /* Kategoriblocket är den närmaste gemensamma rutan runt reglagen.
       Det letas upp i stället för att pekas ut, så att en ändrad
       layout i designen inte tyst slutar märkas. */
    if (reglage.length) {
      let block = reglage[0].closest("div");
      while (block && block.parentElement !== el.firstElementChild
             && !reglage.every((r) => block.contains(r))) block = block.parentElement;
      while (block && !reglage.every((r) => block.contains(r))) block = block.parentElement;
      if (block && block !== el) block.setAttribute("data-kategorier", "");
    }

    const spara = [...el.querySelectorAll("button")].find((b) => b.textContent.trim() === "Spara mina val");
    if (spara) {
      spara.setAttribute("data-samtycke", "spara");
      const rad = spara.parentElement;
      if (rad) rad.setAttribute("data-kategorier-knappar", "");
      [...(rad?.querySelectorAll("button") ?? [])].forEach((b) => {
        if (b.textContent.trim() === "Acceptera alla") b.setAttribute("data-samtycke", "alla");
      });
    }

    /* Förstavyn läggs tillbaka under kategorierna. */
    const värd = el.firstElementChild ?? el;
    if (huvudval) {
      värd.insertAdjacentHTML("beforeend", huvudval);
      const hv = värd.lastElementChild;
      hv.setAttribute("data-huvudval", "");
      [...hv.querySelectorAll("button")].forEach((b) => {
        const t = b.textContent.trim();
        if (t === "Acceptera alla") b.setAttribute("data-samtycke", "alla");
        if (t === "Endast nödvändiga") b.setAttribute("data-samtycke", "nodvandiga");
      });
    }
    if (anpassa) {
      värd.insertAdjacentHTML("beforeend", anpassa);
      värd.lastElementChild.setAttribute("data-samtycke", "anpassa");
    }

    /* Bannern ska inte blinka förbi innan skriptet hunnit avgöra om
       besökaren redan svarat. */
    el.setAttribute("hidden", "");
    el.setAttribute("data-kopplad", "");

    return {
      kopplad: true,
      kategorier: reglage.length,
      knappar: el.querySelectorAll("[data-samtycke]").length,
    };
  }, före);
}

/**
 * Kopplar prislistan.
 *
 * Varje behandling har en "Läs mer"-panel med den längre texten och
 * länken till behandlingssidan. Panelen ritas först när man klickar, så i
 * en statisk sida finns den inte alls — och då försvinner både texten och
 * länken, på alla sexton behandlingarna.
 *
 * Samma metod som menyerna och bannern: öppna varje panel på riktigt,
 * spara undan den, lägg tillbaka den permanent och stäng knappen igen.
 * Sedan märks korten så att filtret och utfällningen hittar dem.
 */
async function kopplaPrislistan(sida) {
  const knappar = await sida.$$("article button[aria-expanded]");
  if (!knappar.length) return null;

  const paneler = [];
  for (const k of knappar) {
    await k.click();
    await sida.waitForTimeout(110);
    paneler.push(await k.evaluate((b) => {
      const p = b.nextElementSibling;
      /* Panelen skjuts in mellan knappen och bokningsrutan. Den känns
         igen på vad den INTE är: bokningsrutan innehåller alltid en länk
         till patient.nu. Tre av behandlingarna har ingen egen sida och
         därför ingen länk alls i panelen — den regeln måste tåla det. */
      return p && !p.querySelector('a[href*="patient.nu"]') ? p.outerHTML : null;
    }));
    await k.click();
    await sida.waitForTimeout(60);
  }

  return await sida.evaluate((paneler) => {
    const kort = [...document.querySelectorAll("article")];
    let lagda = 0;

    kort.forEach((a, i) => {
      const knapp = a.querySelector("button[aria-expanded]");
      if (!knapp) return;
      knapp.setAttribute("data-mer-knapp", "");
      knapp.setAttribute("aria-expanded", "false");
      /* Plustecknet ritas av designen som ett eget spann inuti ikonen.
         `fp-prislista.js` byter tecknet genom att skriva om ikonens
         textinnehåll, så det inre spannet försvinner ändå vid första
         klicket. Det plattas ut här i stället, så att sidan ser likadan
         ut före och efter.

         Bara ikonen. Etikettens spann måste stå kvar: skriptet hittar
         den på `span:not([aria-hidden])` och skulle annars inte kunna
         växla texten mellan "Läs mer" och "Visa mindre". */
      knapp.querySelectorAll('[aria-hidden="true"] span.sc-interp')
        .forEach((sp) => sp.replaceWith(sp.textContent));
      if (paneler[i] && !a.querySelector("[data-mer-panel]")) {
        knapp.insertAdjacentHTML("afterend", paneler[i]);
        knapp.nextElementSibling.setAttribute("data-mer-panel", "");
        lagda++;
      }
      a.setAttribute("data-tjanst", "");
      /* Orterna står som små etiketter överst i kortet. Filtret läser dem
         från attributet i stället för att gräva i texten vid varje klick. */
      const orter = [...a.querySelectorAll(":scope > div:first-child span")]
        .map((s) => s.textContent.trim()).filter((t) => t && !t.includes(" "));
      a.setAttribute("data-orter", [...new Set(orter)].join(" "));
    });

    /* Grupprutorna: varje block som innehåller en kortrad. */
    document.querySelectorAll("[data-cards]").forEach((c) => {
      const grupp = c.parentElement;
      if (grupp) grupp.setAttribute("data-grupp", "");
    });

    /* Filterknapparna känns igen på sin text, inte på sin ordning. */
    const nyckel = (s) => s.toLowerCase().replace(/å|ä/g, "a").replace(/ö/g, "o").replace(/[^a-z]/g, "");
    const filter = [...document.querySelectorAll("button")]
      .filter((b) => ["Alla", "Stockholm", "Göteborg"].includes(b.textContent.trim()));
    filter.forEach((b, i) => {
      b.setAttribute("data-filter", nyckel(b.textContent.trim()));
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      if (i === 0) b.setAttribute("data-aktiv", "");
    });

    /* Räknaren "16 tjänster" uppdateras av filtret. */
    const räknare = [...document.querySelectorAll("p")]
      .find((p) => /^\d+\s+tjänster$/.test(p.textContent.trim()));
    if (räknare) räknare.setAttribute("data-antal", "");

    return { paneler: lagda, kort: kort.length, filter: filter.length, räknare: !!räknare };
  }, paneler);
}

/* ------------------------------------------------------------------ */

const filer = fs.readdirSync(EXPORT).filter((f) => f.endsWith(".dc.html") && ADRESSER[f]);
const server = await servera(EXPORT, PORT);
const webbl = await chromium.launch();
const ctx = await webbl.newContext({ viewport: { width: 1512, height: 900 } });

await ctx.route("https://unpkg.com/**", (r) => {
  const nyckel = Object.keys(BIBLIOTEK).find((k) => r.request().url().includes(k));
  nyckel
    ? r.fulfill({ contentType: "application/javascript", body: fs.readFileSync(paketfil(BIBLIOTEK[nyckel])) })
    : r.abort();
});
await ctx.route("https://fonts.googleapis.com/**", (r) => r.fulfill({ contentType: "text/css", body: "" }));
await ctx.route("**/cdn/shop/**", (r) => r.abort());

const sida = await ctx.newPage();
/**
 * Märkningar som stilmallen och skripten hakar i.
 * ==============================================
 *
 * `fp-fixar.css` rättar några saker som designen inte kan uttrycka: en
 * bokningsrad som sitter kant i kant mot texten ovanför, en tabell som
 * måste staplas om på mobil, ett porträtt som fått en ram det inte ska
 * ha. Stilmallen hittar dem på `data-`-attribut. Attributen finns inte i
 * designen — de sätts här, vid bygget.
 *
 * Varje regel nedan är avläst ur sajten som ligger live och provad mot
 * alla 22 sidorna: den träffar exakt det live har märkt, varken mer
 * eller mindre. Det är avsiktligt att reglerna beskriver *vad* ett
 * element är och inte *var* det står — en lista över positioner hade
 * gått sönder första gången någon flyttade ett stycke i Claude Design.
 */
async function markera(sida, adress) {
  return await sida.evaluate((adress) => {
    const räknare = {};
    const sätt = (el, namn, värde = "") => {
      if (!el || el.hasAttribute(namn)) return;
      el.setAttribute(namn, värde);
      räknare[namn] = (räknare[namn] ?? 0) + 1;
    };
    const stil = (el) => el.getAttribute("style") ?? "";

    /* --- Bokningsraden ------------------------------------------------
       Ett prisblock är det innersta elementet som innehåller både ett
       pris och en bokningslänk. Två saker ser likadana ut men är det
       inte: sidans yttersta omslag (det innehåller också båda, fast i
       olika barn) och sektionernas mittställda band. Båda känns igen på
       att de är layout, inte innehåll. */
    for (const el of document.querySelectorAll("*")) {
      if (!el.querySelector('a[href*="patient.nu"]')) continue;
      if (!/Pris/.test(el.textContent)) continue;
      if ([...el.children].some((b) => b.querySelector('a[href*="patient.nu"]') && /Pris/.test(b.textContent))) continue;
      if (el.querySelector("section, header, footer, nav")) continue;
      if (/margin: 0px auto/.test(stil(el))) continue;
      sätt(el, "data-prisrad");
    }

    /* --- Det stora citatet --------------------------------------------
       Citatet sätts i Cormorant kursiv och krymps på mobil. Brödtext i
       samma snitt ska inte krympas, och skillnaden är citattecknet. */
    for (const p of document.querySelectorAll("p")) {
      const st = stil(p);
      if (!/Cormorant/.test(st) || !/font-style: italic/.test(st)) continue;
      if (!/font-size: (2[6-9]|[3-9]\d)px/.test(st)) continue;
      if (!/^["“»]/.test(p.textContent.trim())) continue;
      sätt(p, "data-stortcitat");
    }

    /* --- Partnerkorten -------------------------------------------------
       Logga till vänster, text till höger: 150 px plus resten. */
    document.querySelectorAll("article").forEach((a) => {
      if (!/grid-template-columns: 150px 1fr/.test(stil(a))) return;
      const logga = a.querySelector(":scope > img");
      if (!logga) return;
      sätt(a, "data-partnerkort");
      sätt(logga, "data-partnerlogga");
    });

    /* --- Tabellen i integritetspolicyn ---------------------------------
       En tabell byggd av rutnätsrader. Raderna känns igen på att de
       delar spaltindelning med varandra; den första är rubrikraden.
       Varje cell får rubrikens text med sig, för på mobil staplas
       raderna och då är rubrikraden inte längre i närheten. */
    const grupper = new Map();
    for (const d of document.querySelectorAll("div")) {
      const m = /grid-template-columns: ([^;]+)/.exec(stil(d));
      if (!m || !/display: grid/.test(stil(d)) || m[1].trim().split(/\s+(?![^(]*\))/).length < 3) continue;
      const nyckel = (d.parentElement?.tagName ?? "") + "|" + m[1];
      if (!grupper.has(nyckel)) grupper.set(nyckel, []);
      grupper.get(nyckel).push(d);
    }
    for (const rader of grupper.values()) {
      if (rader.length < 3) continue;
      if (new Set(rader.map((r) => r.parentElement)).size !== 1) continue;
      const [rubrik, ...resten] = rader;
      sätt(rubrik, "data-tabellrubrik");
      const etiketter = [...rubrik.children].map((c) => c.textContent.trim());
      for (const rad of resten) {
        sätt(rad, "data-tabellrad");
        [...rad.children].forEach((c, i) => etiketter[i] && sätt(c, "data-etikett", etiketter[i]));
      }
    }

    /* --- Omdömeskarusellen ---------------------------------------------
       På stora skärmar ett rutnät, på små en karusell som `fp-omdomen.js`
       sätter ihop. Sektionen hittas på sin egen rubrik. */
    for (const p of document.querySelectorAll("p")) {
      if (p.textContent.trim() !== "Omdömen") continue;
      const yta = p.closest("section");
      if (!yta) continue;
      const spår = [...yta.querySelectorAll("div")].find(
        (d) => /display: grid/.test(stil(d)) && d.querySelector(":scope > article"));
      if (!spår) continue;
      sätt(yta, "data-karusell-yta");
      sätt(p, "data-karusell-rubrik");
      sätt(spår, "data-karusell");
      for (const kort of spår.querySelectorAll(":scope > article")) {
        sätt(kort, "data-omdomeskort");
        sätt(kort.querySelector(":scope > img"), "data-omdomesbild");
        sätt(kort.querySelector(":scope > div"), "data-omdomestext");
      }
      break;
    }

    /* --- Porträtt ------------------------------------------------------
       Bilden som fyller bredden av ett kort ska inte ha ram. Omdömenas
       och partnernas bilder är undantagna — de har egna regler — och
       små porträttvinjetter räknas inte, de känns igen på att de har en
       egen bredd i stället för kortets. Ordningen spelar roll: den här
       regeln måste köras efter omdömena och partnerkorten. */
    document.querySelectorAll("article > img").forEach((b) => {
      if (!/width: 100%/.test(stil(b))) return;        // porträttvinjetter, inte kortbilder
      if (b.hasAttribute("data-omdomesbild") || b.hasAttribute("data-partnerlogga")) return;
      sätt(b, "data-personbild");
    });

    /* --- Formulären -----------------------------------------------------
       Designen ritar formuläret men kan inte posta det någonstans.
       Mottagaren är Shopifys kontaktfunktion, och den ställer krav på
       hur fälten heter. Kopplingen görs här, vid bygget, av två skäl:
       den är beteende och inte innehåll, och ett formulär som tappar
       sin mottagare märks inte förrän någon undrar varför det slutat
       komma meddelanden.

       Namnet följer med utskicket så att det går att se vilket formulär
       ett meddelande kom ifrån. Båda har rubriken "Kontaktformulär", så
       namnet kan inte läsas ur sidan — det står här. */
    const FORMULÄR = { "/pages/kontakt": "Kontakt", "/pages/omdomen": "Omdöme" };
    const FÄLT = { namn: "contact[name]", epost: "contact[email]",
                   telefon: "contact[phone]", kommentar: "contact[body]" };
    if (FORMULÄR[adress]) {
      for (const f of document.querySelectorAll("form")) {
        sätt(f, "data-fp-formular", FORMULÄR[adress]);
        f.setAttribute("action", "https://shop.fertilitetplus.se/contact");
        f.setAttribute("method", "post");
        f.setAttribute("accept-charset", "UTF-8");

        /* Shopify känner igen ett kontaktformulär på fälten `form_type`
           och `utf8`. `contact[formular]` är vårt eget tillägg och är
           det enda som skiljer de två formulären åt i inkorgen. */
        const dolda = [["contact[formular]", FORMULÄR[adress]], ["utf8", "\u2713"],
                       ["form_type", "contact"]];
        if (!f.querySelector('input[name="form_type"]'))
          for (const [namn, värde] of dolda.reverse()) {
            const i = document.createElement("input");
            i.type = "hidden"; i.name = namn; i.value = värde;
            f.prepend(i);
          }

        for (const fält of f.querySelectorAll("input[name], textarea[name]"))
          if (FÄLT[fält.name]) fält.name = FÄLT[fält.name];

        räknare["formulär"] = (räknare["formulär"] ?? 0) + 1;
      }
    }

    /* --- Bildernas laddning ---------------------------------------------
       Den första bilden på sidan är den besökaren ser direkt; den hämtas
       med förtur. Övriga väntar tills de behövs. */
    const bilder = [...document.querySelectorAll("img")];
    bilder.forEach((b, i) => {
      b.removeAttribute("loading");
      b.removeAttribute("fetchpriority");
      if (i === 0) b.setAttribute("fetchpriority", "high");
      else b.setAttribute("loading", "lazy");
    });
    räknare["bilder"] = bilder.length;

    return räknare;
  }, adress);
}

fs.mkdirSync(UT, { recursive: true });
const rapport = [];

for (const f of filer) {
  const adress = ADRESSER[f];
  await sida.goto(`http://127.0.0.1:${PORT}/${encodeURIComponent(f)}`, { waitUntil: "networkidle" });
  await sida.waitForTimeout(1400);

  const meny = await packaUtMenyer(sida);
  const banner = await kopplaCookiebanner(sida);
  const prislista = await kopplaPrislistan(sida);
  const märken = await markera(sida, adress);

  let html = await sida.evaluate(() => {
    document.querySelectorAll("script").forEach((s) => s.remove());
    document.querySelectorAll('link[href*="fonts.googleapis"], link[href*="fonts.gstatic"]')
      .forEach((l) => l.remove());
    document.querySelectorAll("[data-dc-tpl]").forEach((e) => e.removeAttribute("data-dc-tpl"));
    const x = document.querySelector("x-dc");
    if (x) { const d = document.createElement("div"); d.innerHTML = x.innerHTML; x.replaceWith(...d.childNodes); }
    if (!document.documentElement.getAttribute("lang")) document.documentElement.setAttribute("lang", "sv");
    return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
  });

  /* Länkar: designens filnamn byts mot sajtens adresser. */
  for (const [fil, till] of Object.entries(ADRESSER)) {
    const m = fil.replace(".dc.html", "").replace(/ /g, "(?: |%20)");
    html = html.replace(new RegExp(`(?:\\./)?${m}\\.dc\\.html`, "g"), till);
  }
  /* Sajten bor på två domäner. Allt som Shopify äger ligger kvar på
     shop.fertilitetplus.se — bloggen, varukorgen, produkterna och
     bildernas CDN. Allt som bygget självt lägger ut serveras från
     huvuddomänen och skrivs rotrelativt, så att en sida fungerar
     likadant i förhandsvisningen som live. Regeln är avläst ur live. */
  html = html.replace(
    /https?:\/\/(?:www\.)?fertilitetplus\.se(?=\/(?:blogs|cart|cdn|products)(?:[/?#"]|$))/g,
    "https://shop.fertilitetplus.se");
  html = html.replace(
    /https?:\/\/(?:www\.)?fertilitetplus\.se(?=\/(?:pages|collections|policies|bilder)\/)/g, "");
  html = html.replace(/((?:href|src)=")(?:\.\/)?material\//g, "$1/material/");

  /* --- head: allt Claude Design inte kan skriva --------------------
     Titlar och beskrivningar bor i sidmeta.json. Resten är sig likt på
     varje sida och skrivs här. Ordningen är densamma som på den
     publicerade sajten, så att en jämförelse mellan bygge och live går
     att läsa rad för rad. */
  const [titel, beskrivning] = META[adress] ?? ["FertilitetPlus", ""];
  const kanonisk = DOMÄN + adress;
  const extra = adress === "/" ? ['<script src="/fp-omdomen.js" defer></script>']
              : adress === "/pages/prislista" ? ['<script src="/fp-prislista.js" defer></script>']
              : [];
  const head = [
    `<title>${titel}</title>`,
    `<meta name="description" content="${beskrivning}">`,
    `<link rel="canonical" href="${kanonisk}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="sv_SE">`,
    `<meta property="og:site_name" content="FertilitetPlus">`,
    `<meta property="og:title" content="${titel}">`,
    `<meta property="og:description" content="${beskrivning}">`,
    `<meta property="og:url" content="${kanonisk}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    /* Typsnitten laddas från vår egen domän, inte från Google. Det är ett
       GDPR-beslut: en förfrågan till fonts.gstatic.com lämnar besökarens
       IP-adress hos Google innan någon hunnit samtycka till något. */
    `<link rel="preload" href="/typsnitt/plus-jakarta-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>`,
    `<link rel="preload" href="/typsnitt/cormorant-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>`,
    `<link rel="stylesheet" href="/fp-typsnitt.css">`,
    `<link rel="stylesheet" href="/fp-fixar.css">`,
    /* Samtycket måste köras före allt som sätter cookies, därför utan defer. */
    `<script src="/fp-samtycke.js"></script>`,
    GTM,
    `<script src="/fp-meny.js" defer></script>`,
    `<script src="/fp-korg.js" defer></script>`,
    `<script src="https://chatt.varden.se/widget-embed.js" widget-id="fertilitetplus.se"></script>`,
    `<script src="/fp-chatt.js" defer></script>`,
    ...extra,
    `<link rel="icon" href="/favicon.ico" sizes="any">`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
  ].join("\n");
  html = html.replace("</head>", "\n" + head + "\n</head>");

  /* Tagghanteraren behöver en reserv för besökare utan JavaScript. Den
     ligger först i body, precis som på live. */
  html = html.replace("<body>", "<body>\n" + GTM_NOSCRIPT);

  /* Platta filnamn. Med mappstruktur svarar GitHub Pages på /pages/kontakt
     med en omdirigering till /pages/kontakt/, och varje indexerad adress
     skulle byta form. */
  const ut = adress === "/" ? "index.html" : adress.replace(/^\//, "") + ".html";
  fs.mkdirSync(path.join(UT, path.dirname(ut)), { recursive: true });
  fs.writeFileSync(path.join(UT, ut), html);

  rapport.push({
    fil: f.replace(".dc.html", ""), adress, kb: Math.round(html.length / 1024),
    menyer: meny.paneler, menylänkar: meny.panellänkar, mobil: meny.mobillänkar,
    banner: banner.kopplad ? `${banner.kategorier} kat, ${banner.knappar} knappar` : "EJ KOPPLAD",
    prislista: prislista ? `${prislista.paneler}/${prislista.kort} paneler, ${prislista.filter} filter` : "",
    kvarDc: (html.match(/\.dc\.html/g) ?? []).length,
  });
}

await webbl.close();
server.close();
console.table(rapport);
const trasiga = rapport.filter((r) => r.kvarDc > 0 || r.menyer < 3);
if (trasiga.length) {
  console.error("\nSIDOR ATT TITTA PÅ:", trasiga.map((t) => `${t.adress} (menyer ${t.menyer}, kvar ${t.kvarDc})`).join(", "));
  process.exitCode = 1;
} else {
  console.log(`\n${rapport.length} sidor skrivna till ${UT}`);
}
