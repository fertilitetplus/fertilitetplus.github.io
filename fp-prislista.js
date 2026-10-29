/* =====================================================================
   FertilitetPlus — prislistan
   ---------------------------------------------------------------------
   Filtret Alla / Stockholm / Göteborg, och "Läs mer" per tjänst.

   I designen sköttes det av React. I den statiska sajten finns ingen
   React kvar, så det görs här i stället. Uppmärkningen läggs på vid
   bygget av bygg-prislista.mjs:

     [data-filter="alla|stockholm|goteborg"]   filterknapparna
     [data-aktiv]                              den valda knappen
     [data-antal]                              texten "16 tjänster"
     [data-grupp]                              en behandlingsgrupp
     [data-tjanst]                             ett tjänstekort
     [data-orter="Stockholm Göteborg"]         var tjänsten finns
     [data-mer-knapp] / [data-mer-panel]       utfällningen

   Allt innehåll ligger alltid i koden — filtret döljer bara med CSS.
   Det är avsiktligt: sökmotorer och AI-tjänster ska se alla 16 tjänster
   och alla priser, oavsett vilket filter en besökare råkar ha valt.
   ===================================================================== */

(function () {
  "use strict";

  var knappar = [].slice.call(document.querySelectorAll("[data-filter]"));
  var kort = [].slice.call(document.querySelectorAll("[data-tjanst]"));
  var grupper = [].slice.call(document.querySelectorAll("[data-grupp]"));
  var antal = document.querySelector("[data-antal]");

  /* --- Filtret ------------------------------------------------------- */
  if (knappar.length && kort.length) {
    var ETIKETT = { alla: null, stockholm: "Stockholm", goteborg: "Göteborg" };

    function filtrera(val) {
      var ort = ETIKETT[val];
      var synliga = 0;

      kort.forEach(function (k) {
        var orter = (k.getAttribute("data-orter") || "").split(" ");
        var visa = !ort || orter.indexOf(ort) !== -1;
        if (visa) { k.removeAttribute("hidden"); synliga++; }
        else k.setAttribute("hidden", "");
      });

      // En grupp utan kvarvarande tjänster ska inte stå kvar tom.
      grupper.forEach(function (g) {
        var kvar = g.querySelectorAll("[data-tjanst]:not([hidden])").length;
        if (kvar) g.removeAttribute("hidden");
        else g.setAttribute("hidden", "");
      });

      knappar.forEach(function (b) {
        var vald = b.getAttribute("data-filter") === val;
        if (vald) b.setAttribute("data-aktiv", "");
        else b.removeAttribute("data-aktiv");
        b.setAttribute("aria-pressed", String(vald));
      });

      if (antal) antal.textContent = synliga + (synliga === 1 ? " tjänst" : " tjänster");
    }

    knappar.forEach(function (b) {
      b.addEventListener("click", function () {
        filtrera(b.getAttribute("data-filter"));
      });
    });
  }

  /* --- Läs mer ------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var knapp = e.target.closest("[data-mer-knapp]");
    if (!knapp) return;

    var panel = knapp.nextElementSibling;
    if (!panel || !panel.hasAttribute("data-mer-panel")) return;

    var oppen = panel.hasAttribute("data-oppen");
    if (oppen) panel.removeAttribute("data-oppen");
    else panel.setAttribute("data-oppen", "");
    knapp.setAttribute("aria-expanded", String(!oppen));

    /* Knappen är <button><span>etikett</span><span aria-hidden>ikon</span></button>.
       Etiketten är alltså en span, inte en lös textnod. */
    var etikett = knapp.querySelector("span:not([aria-hidden])");
    var ikon = knapp.querySelector('[aria-hidden="true"]');
    if (etikett) etikett.textContent = oppen ? "Läs mer" : "Visa mindre";
    if (ikon) ikon.textContent = oppen ? "+" : "\u2212";
  });
})();
