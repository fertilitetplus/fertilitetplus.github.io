/**
 * Bokningslänkar — alla ska peka på #step-1.
 * ==========================================
 *
 * Körs i sajtens rot:  node bokningslankar.mjs .
 * Eller importeras:    import { normaliseraBokningslankar } from "./bokningslankar.mjs";
 *
 * BAKGRUND
 * --------
 * Bokningssidan på patient.nu är en flerstegsguide. Adressen slutar med
 * #step-N, och N är vilket steg guiden ska öppnas på. Steg 1 är början:
 * där väljer besökaren tid och guiden fungerar. Högre steg förutsätter att
 * de tidigare stegen redan är ifyllda — öppnar man direkt på #step-4 visar
 * sidan inga bokningsalternativ alls. Den ser inte trasig ut, den är bara
 * tom, så felet upptäcks först när någon faktiskt försöker boka.
 *
 * Det hände 2026-10-08: tre länkar för immunologisk utredning låg på
 * #step-4 — två på /pages/immunsuppression och en på /pages/prislista.
 * Sajtens övriga 44 bokningslänkar låg på #step-1.
 *
 * Samma tre länkar pekade dessutom på fel kalender (b2453040-… i stället
 * för 57662b62-…). Det kan den här filen inte upptäcka: vilken kalender
 * en behandling hör till är innehåll, inte beteende. Den rättningen
 * gjordes för hand och hör hemma i behandlingsmatrisen och i Claude
 * Design.
 *
 * VARFÖR STEGET HÖR HEMMA I BYGGET
 * --------------------------------
 * Till skillnad från kalendern är steget alltid detsamma: #step-1, för
 * varje bokningslänk på sajten, utan undantag. Besökaren ser aldrig
 * skillnaden förrän den är fel, och en enskild felskriven siffra i
 * designen ska inte kunna nå live. Därför normaliseras varje
 * bokningslänk vid bygget, varje gång, i stället för att någon ska
 * behöva upptäcka det.
 *
 * Rapporten ska läsas. Noll rättade är det normala och betyder att
 * designen är i ordning. Rättade länkar betyder att någon skrivit fel
 * steg i Claude Design — bygget räddar besökaren, men felet står kvar i
 * designen och ska lagas där också.
 *
 * Idempotent: körs den två gånger händer inget andra gången.
 */

import fs from "node:fs/promises";
import path from "node:path";

/** Bokningsadress med valfritt #step-N på slutet. */
const BOKNING = /(https:\/\/patient\.nu\/portal\/public\/calendar\/[0-9a-fA-F-]{36})(#step-\d+)?/g;
const RATT = "#step-1";

async function* filer(katalog) {
  for (const p of await fs.readdir(katalog, { withFileTypes: true })) {
    if (p.name === ".git" || p.name === "node_modules") continue;
    const full = path.join(katalog, p.name);
    if (p.isDirectory()) yield* filer(full);
    else if (/\.(html|js|mjs)$/.test(p.name)) yield full;
  }
}

/**
 * Sätter #step-1 på varje bokningslänk under `rot`.
 * Returnerar en rad per rättad länk: { fil, kalender, fran }.
 */
export async function normaliseraBokningslankar(rot = ".") {
  const rapport = [];

  for await (const fil of filer(rot)) {
    const fore = await fs.readFile(fil, "utf8");

    const efter = fore.replace(BOKNING, (hel, adress, steg) => {
      if (steg === RATT) return hel;
      rapport.push({
        fil: path.relative(rot, fil),
        kalender: adress.slice(-36),
        fran: steg ?? "(inget steg)",
      });
      return adress + RATT;
    });

    if (efter !== fore) await fs.writeFile(fil, efter, "utf8");
  }

  return rapport;
}

/* Körs filen direkt? Då skriver den sin egen rapport. */
if (import.meta.url === `file://${process.argv[1]}`) {
  const rapport = await normaliseraBokningslankar(process.argv[2] ?? ".");
  if (!rapport.length) {
    console.log("bokningslänkar:      alla pekar redan på #step-1");
  } else {
    console.log(`bokningslänkar:      ${rapport.length} rättade till #step-1`);
    for (const r of rapport) {
      console.log(`  ${r.fil}  ${r.kalender}  ${r.fran} → ${RATT}`);
    }
    console.log("  Felet står kvar i Claude Design — laga det där också.");
  }
}
