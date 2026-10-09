# bygg/ — vad som finns, vad som saknas, och vad som ska byggas

Skrivet 9 oktober 2026.

Den här mappen finns för att byggkedjan inte ska kunna försvinna igen.
Den försvann nästan den 8 oktober, och det är värt att förstå varför
innan något annat görs.

---

## Vad som hände

Sajten byggs från Claude Design av en konverterare. Konverteraren har
aldrig legat i det här repot. Den fanns på två ställen:

- molnmiljön i Claude-sessionen, som rensas när sessionen tar slut
- `$HOME/sajt` i Linux-miljön på Maries dator

Den 8 oktober slutade Linux-miljön starta (*"Workspace unavailable"*) och
molnmiljön hade redan rensats. Därmed fanns det ingen plats kvar där
sajten gick att bygga om. Repot innehöll den färdiga sajten, men inte
maskinen som gjorde den.

Det är därför en enskild trasig bokningslänk den dagen fick rättas för
hand genom GitHubs webbgränssnitt. Det fungerade, men det är inte ett
sätt att driva en sajt.

**Lärdomen:** det som bygger sajten ska ligga i repot, inte hos en person.

---

## Vad som finns

| Var | Vad |
|---|---|
| Repot (roten) | Den färdiga sajten, 63 HTML-filer, plus `fp-fixar.css`, `fp-typsnitt.css`, `fp-meny.js`, `fp-samtycke.js`, `fp-korg.js`, `fp-chatt.js`, `fp-omdomen.js`, `fp-prislista.js`, typsnitt, material, ikoner |
| Repot (roten) | Efterbehandlingsskripten: `bygg-innehallsfixar.mjs`, `bygg-utlandssidorna.mjs`, `bygg-utlandssidan-allman.mjs`, `kor-sprak.mjs`, `textbyten.mjs`, `bokningslankar.mjs` |
| `bygg/konvertera.mjs` | Konverteraren **som den såg ut 30 september**. Se varningen överst i filen. |
| Projektet i Claude | Regelboken, behandlingsmatrisen, SEO-baslinjen, lanseringschecklistan och ett tjugotal andra dokument |
| `Documents/fp-bygg/` på Maries dator | Versionskedjan av allt jag skickat under bygget |
| `Documents/fp-bygg/arkiv/` | Designexporten från 8 september (delad i två filer), de byggda paketen, de gamla Lovable-ändringarna |

## Vad som saknas

| Saknas | Vad den gjorde | Går den att få tillbaka? |
|---|---|---|
| Konverteraren i aktuell version | Allt `konvertera.mjs` gör, plus det som listas i varningen överst i den filen | Skrivs om. Ögonblicksbilden från 30 september är en användbar stomme. |
| `url-karta.json` | Kopplar `<Sidnamn>.dc.html` till sajtens adress, och håller 301-listan | Behöver en färsk export för att kunna skrivas rätt. Adresserna finns i `sitemap.xml`. |
| `bygg-live.mjs` / `kor-live.mjs` | Växlar mellan förhandsvisning och skarpt läge: `noindex`, `robots.txt`, fullständiga canonical-adresser, `lang="sv"` | Skrivs om. Beteendet går att läsa av på de byggda sidorna. |
| `klicktest.mjs`, `menytest.mjs`, `overflowtest.mjs`, `bannertest.mjs`, `fonttest.mjs` | Bevisade före varje leverans att alla sidor går att nå, att menyerna öppnas utan JavaScript, att inget scrollar i sidled, att cookiebannern fungerar och att typsnitten faktiskt renderas | Skrivs om. Det här är den dyraste posten — och den som hindrade flest fel. |

**Designen själv är inte borta.** Den ligger i Claude Design och är
oersättlig. Exporten i arkivet är från 8 september och visar hur det såg
ut innan sajten byggdes färdigt — den duger som referens, inte som källa.

---

## Vad som ska byggas

Målet: Marie, Magnus och Linnea ska kunna ändra var sin sak, oberoende av
varandra, utan att någon behöver ha något installerat.

```
CLAUDE DESIGN                 GITHUB                        LIVE
─────────────                 ──────                        ────
Marie, Magnus            design/   exporten, orörd      fertilitetplus.se
utseende, texter,        bygg/     konverteraren,
bilder, menyn                      fixarna, testerna
                         data/     adresser, SEO,
Linnea                             bokningskalendrar
kalendrar i              .github/  kör bygget vid
patient.nu                         varje ändring
```

### Varför `data/`

Det som ändras ofta men inte är design bryts ut till egna filer:

| Fil | Vem rör den | Innehåll |
|---|---|---|
| `data/url-karta.json` | den som lägger till en sida | adresser och omdirigeringar |
| `data/sidmeta.json` | den som jobbar med SEO | titel och beskrivning per sida |
| `data/bokningar.json` | den som sköter bokningarna | behandling → kalender-ID |

Tre personer som rör tre olika filer kan inte kollidera. Och felet den
8 oktober — tre knappar som pekade på fel kalender och fel steg — blir en
rad att rätta i stället för något en patient upptäcker.

### Så går en ändring till

1. Någon ändrar: exporterar från Claude Design, eller redigerar en fil i `data/`.
2. GitHub bygger automatiskt och kör testerna.
3. Resultatet går att titta på innan det publiceras.
4. Någon godkänner. Sajten uppdateras.

Alla med tillgång får göra alla stegen. Spärren ligger på att *något*
måste godkännas, inte på *vem* som godkänner.

### Var den byggda HTML:en ska ligga

`main` innehåller källorna — designexporten, bygget, datafilerna. Den
färdiga HTML:en skrivs av bygget till en egen gren, `live`, och det är
den grenen GitHub Pages serverar.

Det ger tre saker på en gång:

- **Ingen råkar handredigera sajten.** HTML:en finns inte i `main`, så
  frestelsen finns inte där man arbetar.
- **Varje publicering syns som en skillnad.** Ändrade bygget 40 sidor när
  du bara rörde en rubrik? Det står i `live`-grenens historik.
- **Nödutgången finns kvar.** Går allt annat sönder går det att rätta
  direkt i `live`, precis som den 8 oktober. Nästa bygge skriver över —
  men det är då väntat och synligt, inte en tyst fälla.

---

## Ordning att göra det i

1. **Färsk export från Claude Design.** Allt annat behöver den för att
   kunna testas mot. Den läggs i `design/`.
2. **`data/url-karta.json`** skrivs mot exportens filnamn och
   `sitemap.xml`.
3. **Konverteraren** skrivs om i `bygg/`, mot exporten, tills den
   återskapar sajten som ligger live. Jämförelsen är enkel: bygget ska ge
   samma filer som redan finns i repot.
4. **Testerna** skrivs om.
5. **GitHub Actions** kopplas på och tar över bygget.
6. **`data/bokningar.json`** bryts ut, och kalender-ID:na försvinner ur
   designen.

Steg 3 är klart när ett bygge ger samma resultat som dagens sajt. Det är
ett hårt kvitto och värt att hålla fast vid: då, och först då, vet vi att
kedjan är hel igen.

---

## Regler som gäller oavsett

- Innehåll bor i Claude Design. Konverteraren rör aldrig innehåll.
- Beteende bor i bygget. Det är därför en fix inte kan regrera.
- Rättningar i `bygg-innehallsfixar.mjs` är **skulder**, inte lösningar.
  När samma ändring är gjord i designen ska regeln bort.
- Ingen adress ändras utan en 301 i `url-karta.json`.
- Ett bygge är inte verifierat förrän någon klickat sig igenom det.
