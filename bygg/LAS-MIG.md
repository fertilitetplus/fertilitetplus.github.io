# Byggkedjan — klar att lägga i repot

Skriven 12 oktober 2026.

Det här är maskinen som gör om Claude Design till sajten. Den försvann
den 8 oktober och är nu återskapad, provad mot sajten som ligger live,
och utbyggd med det som saknades.

**Inget här rör live-sajten.** Arbetsflödet publicerar först när en
människa godkänt, och GitHub Pages pekar fortfarande på `main` tills
någon aktivt ändrar det.

---

## Var filerna ska ligga

```
repots rot
├── .github/workflows/bygg-och-granska.yml   bygger och testar vid varje ändring
├── package.json
├── bygg/
│   ├── bygg.mjs            hela kedjan i ett kommando
│   ├── konvertera.mjs      designen → sidor
│   ├── tester.mjs          de fem testerna
│   ├── sitemap.mjs         sitemap.xml och robots.txt
│   ├── bokningslankar.mjs  (flyttas hit från roten)
│   └── jamfor-dom.mjs      jämför ett bygge mot en annan version
├── data/
│   ├── url-karta.json      adresser och omdirigeringar
│   └── sidmeta.json        titel och beskrivning per sida
└── design/                 designexporten, orörd
```

Att köra det:

```
npm install
npx playwright install --with-deps chromium
node bygg/bygg.mjs design ut
node bygg/tester.mjs ut
```

---

## Vad bygget gör, i ordning

| Steg | Vad |
|---|---|
| 0 | Kopierar det som inte byggs: skript, stilmall, typsnitt, bilder, ikoner, och Shopifys 32 sidor |
| 1 | Gör om designen till 22 sidor |
| 2 | Bygger de två remissidorna, med en färdig sida som skal |
| 3 | Sätter `#step-1` på varje bokningslänk |
| 4 | Skriver `sitemap.xml` (24 adresser) och `robots.txt` |

Testerna körs separat, med flit: ett bygge som stannar mitt i är svårare
att felsöka än ett som blir klart och sedan underkänns.

---

## Vad bygget lägger till som designen inte kan uttrycka

Det här är gränsen mellan innehåll och beteende, och den är värd att
hålla ren. Allt nedan är **beteende** och hör hemma här, inte i designen.

| Vad | Varför det inte kan bo i designen |
|---|---|
| Menyerna fälls ut och sparas ner | Designen ritar dem först när någon pekar — i en sparad fil finns de inte |
| Cookiebannerns båda vyer | Samma sak: inställningsvyn ritas först vid klick |
| Prislistans "Läs mer"-paneler | Samma sak, sexton stycken |
| `<head>`: titlar, canonical, ikoner, mätning, skript | Claude Design skriver ingen head |
| Kontaktformulärens koppling till Shopify | Designen ritar formuläret men kan inte posta det |
| Märkningar som stilmallen hakar i | `data-prisrad`, `data-tabellrad`, `data-personbild` med flera |
| Bildernas laddningsprioritet | Första bilden med förtur, resten väntar |
| `#step-1` på bokningslänkar | En felskriven siffra ska inte kunna nå en patient |

**Kontaktformulären är värda en extra rad.** Kopplingen till Shopify
fanns bara i den försvunna konverteraren. Hade bygget körts utan den
hade formulären på Kontakt och Omdömen ritats precis som vanligt och
slutat skicka — utan felmeddelande, utan att något syntes.

---

## Vad som INTE längre körs

`bygg-innehallsfixar.mjs`, `textbyten.mjs` och
`bygg-utlandssidan-allman.mjs` rättade innehåll efter bygget. Varje
sådan regel var en skuld mot Claude Design.

**Alla sju är betalda.** Körda mot dagens bygge: fyra borttagningar
träffar ingenting, tre infogningar hoppas över, och inte en byte ändras.

De ligger kvar i repot som historik men ingår inte i kedjan. De ska
heller inte köras igen — en infogning vars text numera finns i designen
skulle lägga in den en andra gång om spärren någon gång togs bort.

---

## Kvittot

Bygget jämfört mot sajten som ligger live, element för element och
attribut för attribut:

**52 av 56 sidor är identiska.**

De fyra som skiljer sig gör det för att de ska:

| Sida | Skillnad |
|---|---|
| Startsidan | "Läs alla omdömen"-länken kommer nu från designen i stället för att klistras på efteråt |
| Samarbeten | Partnerkorten UR Vistahermosa och Aagaard likadant |
| Utlandssidan | Hela sidan kommer från designen i stället för att byggas av ett skript. Texten är ordagrant densamma |
| Om FertilitetPlus | **Kvar att rätta:** Maries porträtt pekar mot Shopify i designen men ligger som fil på sajten (`/bilder/marie-antonsson.webp`) |

Testerna är provade åt båda hållen: de går igenom på bygget, och var
och en fångar ett påhittat fel. Overflowtestet missade sitt eget
sabotage första gången — designen har `overflow-x: hidden` runt hela
sidan, så ett för brett element klipps i stället för att ge en
scrollrad. Det mäter numera elementen mot skärmen i stället för sidans
bredd.

---

## Två inställningar som måste göras för hand

1. **Settings → Environments → New environment → `live`**, kryssa i
   *Required reviewers*, lägg till Marie, Magnus och Linnea.
   Utan det steget publicerar arbetsflödet utan att fråga.

2. **Settings → Pages → gren `live`, mapp `/ (root)`.**
   Gör inte det förrän ett bygge har granskats och godkänts. Fram till
   dess serveras sajten från `main` precis som i dag, och ingenting som
   händer i arbetsflödet kan röra den.

---

## Kvar att göra

- Porträttlänken i designen (raden ovan).
- Bryt ut kalender-ID:na till `data/bokningar.json`, så att Linnea kan
  ändra en bokning utan att gå in i designen.
- Fråga till Linnea: konsultationen vid utlandsbehandling, 1 200 kr,
  bokas via `dbd1fde4…` från prislistan och `290c221b…` från IVF-sidan.
  Samma både live och i designen, men två kalendrar för samma tjänst.
