# design/ — exporten från Claude Design

Det här är sajtens innehåll. Allt som en besökare läser, ser och klickar
på kommer härifrån. Bygget lägger bara till beteende.

## Vad som ska ligga här

Exporten från Claude Design innehåller mycket mer än bygget behöver.
Det som ska in är **bara filerna som ligger direkt i exportens rot**:

| Fil | Antal | Vad |
|---|---|---|
| `*.dc.html` | 25 | de 22 sidorna plus Sidhuvud, Sidfot och Cookiebanner |
| `support.js` | 1 | designens runtime — utan den ritas ingenting |
| `behandlingar-data.js` | 1 | behandlingarna och deras bokningskalendrar |

Tillsammans ungefär en halv megabyte.

## Vad som INTE ska in

Exporten är omkring 68 MB. Resten är:

- **`Utkast/`** — tidigare versioner av samma sidor, med bilderna
  inbakade. Filerna heter likadant som de riktiga och är tio gånger
  större. Kopierar man `*.dc.html` rekursivt får man med dem, och då
  bygger konverteraren från fel version. Ta bara rotens filer.
- **`uploads/`, `arkiv/`, `material/`, `.thumbnail`** — bilder, PDF:er
  och Claude Designs egna arbetsfiler. Ingen av sidorna refererar till
  dem; bilderna hämtas från Shopifys CDN när besökaren laddar sidan.

Hela exporten sparas i arkivet på datorn, inte här. Skälet är inte bara
storleken: så länge GitHub Pages serverar `main` är allt som ligger där
offentligt läsbart, och designutkast hör inte hemma på en publik adress.

## Bilder som ligger i repot

Några bilder serveras från repot i stället för från Shopifys CDN — Maries
porträtt och Aagaard-loggan är två. De refereras i designen med den
**fullständiga adressen**:

```
https://fertilitetplus.se/bilder/marie-antonsson.webp
```

inte med `/bilder/marie-antonsson.webp`.

Skälet är att båda ställena ska stämma. En rotrelativ adress fungerar på
den byggda sajten men inte i Claude Designs förhandsvisning, där det inte
finns någon sajt att vara relativ mot — bilden blir en tom ruta och
designen slutar likna verkligheten. Den fullständiga adressen hämtas över
nätet och syns i förhandsvisningen, och konverteraren skriver om den till
den rotrelativa formen vid bygget. Resultatet blir identiskt med live.

Samma sak gäller inte Shopifys bilder: de ligger på
`shop.fertilitetplus.se/cdn/…` och ska stå kvar som de är.

Har en `<img>` både `src` och `srcset` vinner `srcset`. Byter man bara
`src` händer därför ingenting. Sajtens bilder har ingen `srcset` — finns
det en, ta bort den.

## Att byta ut exporten

1. Claude Design → Share → Project HTML → Project archive → Export.
2. Packa upp. Gå **inte** in i `Utkast/`.
3. Ersätt filerna här med rotens `*.dc.html`, `support.js` och
   `behandlingar-data.js`.
4. Antalet ska bli 27 filer. Blir det fler eller färre har något gått
   snett — jämför med tabellen ovan innan du laddar upp.

Bygget startar av sig självt när något här ändras, och testerna säger
ifrån om en sida tappat sin meny eller sitt innehåll.

## Varför exporten ligger i repot

Claude Design stänger **14 december 2026**. Designsystem flyttas över
automatiskt, men projekt gör det inte — de raderas. Exporten här är
därför inte bara byggets indata, den är den enda kvarvarande kopian av
designen efter det datumet.
