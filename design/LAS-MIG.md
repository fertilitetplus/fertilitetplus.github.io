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
