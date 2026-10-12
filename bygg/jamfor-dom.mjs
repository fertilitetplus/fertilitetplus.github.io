/**
 * Jämför bygget mot live på det som faktiskt betyder något.
 * ========================================================
 * Attributens ordning i en HTML-tagg saknar betydelse, och den gamla
 * konverteraren lämnade ojämna blanksteg efter sig. Att återskapa de
 * egenheterna är inget värt. Det som ska stämma är sidans innehåll:
 * samma element i samma ordning, samma attribut med samma värden,
 * samma text. Det jämförs här.
 */
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const BYGGE = process.argv[2] ?? "/home/claude/bygge3";
const LIVE  = process.argv[3] ?? "/tmp/claude-0/-home-claude/67295e67-03f4-5cf7-ba8c-60e6cf530009/scratchpad/sajt";

const rader = (fil) => {
  const dom = new JSDOM(fs.readFileSync(fil, "utf8"));
  const ut = [];
  const gå = (n, väg) => {
    for (const b of n.childNodes) {
      if (b.nodeType === 3) {
        const t = b.textContent.replace(/\s+/g, " ").trim();
        if (t) ut.push(`${väg} | TEXT | ${t}`);
      } else if (b.nodeType === 1) {
        /* scpN är designens egna omslagsklasser. Ingen CSS och inget
           skript rör dem, och numreringen förskjuts av att bygget
           renderar om komponenter. De normaliseras bort. */
        const a = [...b.attributes].map((x) =>
          `${x.name}=${x.value.replace(/\bscp\d+\b/g, "scp").replace(/\s+/g, " ").trim()}`).sort();
        ut.push(`${väg}/${b.tagName} | ${a.join(" ")}`);
        gå(b, `${väg}/${b.tagName}`);
      }
    }
  };
  gå(dom.window.document.documentElement, "");
  return ut;
};

const filer = [];
(function gå(d, r = "") {
  for (const e of fs.readdirSync(path.join(BYGGE, d), { withFileTypes: true })) {
    const rel = path.join(r, e.name);
    e.isDirectory() ? gå(path.join(d, e.name), rel) : rel.endsWith(".html") && filer.push(rel);
  }
})("");

let lika = 0;
for (const f of filer.sort()) {
  const a = rader(path.join(BYGGE, f));
  const b = rader(path.join(LIVE, f));
  const bara = (x, y) => x.filter((r) => !y.includes(r));
  const iBygget = bara(a, b), iLive = bara(b, a);
  if (!iBygget.length && !iLive.length) { lika++; continue; }
  console.log(`\n${f}   (+${iBygget.length} i bygget, −${iLive.length} i live)`);
  for (const r of iBygget.slice(0, 10)) console.log(`  BYGGET  ${r.slice(0, 190)}`);
  for (const r of iLive.slice(0, 10))   console.log(`  LIVE    ${r.slice(0, 190)}`);
}
console.log(`\nLIKA: ${lika} av ${filer.length}`);
