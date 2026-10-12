/**
 * sitemap.xml och robots.txt
 * ==========================
 *
 * Kartan skrivs ur url-kartan, inte ur mappen med färdiga filer. Skälet
 * är att de två inte är samma sak: remissidorna byggs av ett eget skript
 * och ligger med i kartan, medan 404-sidan ligger i mappen men inte ska
 * stå med. Står en adress i `url-karta.json` finns det också ett beslut
 * bakom den; en fil som råkar ligga i mappen är inget beslut.
 *
 * `lastmod` sätts till det datum filen senast ändrades, inte till i dag.
 * En sökmotor som ser att allt ändrades samma dag slutar lita på fältet.
 */

import fs from "node:fs/promises";
import path from "node:path";

const DOMÄN = "https://fertilitetplus.se";

/** Datumet då filen för `adress` senast ändrades, som ÅÅÅÅ-MM-DD. */
async function ändrad(rot, adress) {
  const fil = path.join(rot, adress === "/" ? "index.html" : adress.replace(/^\//, "") + ".html");
  try {
    return (await fs.stat(fil)).mtime.toISOString().slice(0, 10);
  } catch {
    return null;                 // sidan är inte byggd ännu
  }
}

/**
 * Skriver `sitemap.xml` och `robots.txt` i `rot`.
 * Returnerar adresserna som kom med, och de som hoppades över.
 */
export async function skrivSitemap(rot, karta) {
  const adresser = [
    ...Object.values(karta.sidor),
    ...(karta.utanfor?.remissidor ?? []),  // byggs av bygg-utlandssidorna.mjs
  ].filter((a, i, alla) => alla.indexOf(a) === i).sort((a, b) => a.localeCompare(b, "sv"));

  const med = [], utan = [];
  const rader = [];
  for (const adress of adresser) {
    const datum = await ändrad(rot, adress);
    if (!datum) { utan.push(adress); continue; }
    med.push(adress);
    rader.push(`  <url>\n    <loc>${DOMÄN}${adress}</loc>\n    <lastmod>${datum}</lastmod>\n  </url>`);
  }

  await fs.writeFile(path.join(rot, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rader.join("\n")}\n</urlset>\n`,
    "utf8");

  await fs.writeFile(path.join(rot, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${DOMÄN}/sitemap.xml\n`, "utf8");

  return { med, utan };
}
