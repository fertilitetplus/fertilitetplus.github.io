/* =====================================================================
   FertilitetPlus — meny
   ---------------------------------------------------------------------
   Sidhuvudet ritades i Claude Design med React. I den statiska sajten
   finns ingen React kvar, så menyerna behöver styras här i stället.

   Datormenyerna sköts helt av CSS (hover och focus-within i
   fp-fixar.css) och fungerar även om den här filen aldrig laddas.
   Det enda som kräver JavaScript är hamburgaren på mobil.

   Länkarna ligger alltid i koden, bara dolda med CSS. Det är viktigt:
   sökmotorer och AI-tjänster läser koden, inte vad som råkar synas.
   ===================================================================== */

(function () {
  "use strict";

  var knapp = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (!knapp || !panel) return;

  knapp.setAttribute("aria-expanded", "false");
  knapp.setAttribute("aria-controls", "fp-mobilmeny");
  panel.id = "fp-mobilmeny";

  function satt(oppen) {
    if (oppen) panel.setAttribute("data-oppen", "");
    else panel.removeAttribute("data-oppen");
    knapp.setAttribute("aria-expanded", String(oppen));
  }

  knapp.addEventListener("click", function () {
    satt(!panel.hasAttribute("data-oppen"));
  });

  // Escape stänger — förväntat beteende, och ett krav för tangentbord.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.hasAttribute("data-oppen")) {
      satt(false);
      knapp.focus();
    }
  });

  // Klick på en länk i menyn stänger den, annars ligger den kvar öppen
  // när man kommer till nästa sida via bakåtknappen.
  panel.addEventListener("click", function (e) {
    if (e.target.closest("a[href]")) satt(false);
  });
})();
