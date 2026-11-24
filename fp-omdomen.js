/**
 * Pilar till omdömeskarusellen.
 * =============================
 *
 * Karusellen scrollar i sidled på små skärmar, men ingenting berättade
 * det. Rullningslisten är dold (den såg skräpig ut mellan korten), det
 * fanns inga pilar och inga prickar. Den halvsynliga kanten av nästa kort
 * var tänkt som signalen — den lästes i stället som att sektionen var
 * avklippt.
 *
 * Skriptet lägger till två pilar under korten. De är riktiga knappar, så
 * att de går att nå med tangentbord och att en skärmläsare säger vad de
 * gör, och de släcks när det inte finns mer att scrolla åt det hållet.
 *
 * Inget av det här finns i markupen från Claude Design. Skriptet rör
 * därför bara sitt eget: hittar det ingen karusell gör det ingenting.
 */
(function () {
  "use strict";

  var STEG_MARGINAL = 24; // samma gap som i fp-fixar.css

  function pil(riktning) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("data-omdomespil", riktning);
    b.setAttribute("aria-label", riktning === "fram" ? "Nästa omdöme" : "Föregående omdöme");
    b.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true" focusable="false">' +
      '<path d="' +
      (riktning === "fram" ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7") +
      '" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
      "</svg>";
    return b;
  }

  function start() {
    var kar = document.querySelector("[data-karusell]");
    if (!kar || kar.querySelector("[data-omdomespil]")) return;

    var kort = kar.querySelector("[data-omdomeskort]");
    if (!kort) return;

    /* Pilarna hamnar på samma rad som "Läs alla omdömen", om den finns. */
    var lank = document.querySelector("[data-omdomeslank]");
    var rad = document.createElement("div");
    rad.setAttribute("data-omdomesrad", "");
    if (lank && lank.parentNode) {
      lank.parentNode.insertBefore(rad, lank);
      rad.appendChild(lank);
    } else if (kar.parentNode) {
      kar.parentNode.insertBefore(rad, kar.nextSibling);
    } else {
      return;
    }

    /* Pilarna ligger ovanpå kortens kanter, inte i raden under dem. De
       hängs därför i sektionen (som är position: relative) och inte i
       raden — men `data-kan-scrolla` sätts på raden, och CSS-regeln som
       döljer dem utgår från den, så raden måste vara deras förälder i
       DOM:en. Lösningen: de ligger i raden, men positioneras absolut mot
       sektionen. */
    var knappar = document.createElement("div");
    knappar.setAttribute("data-omdomesknappar", "");
    var bak = pil("bak");
    var fram = pil("fram");
    knappar.appendChild(bak);
    knappar.appendChild(fram);
    rad.appendChild(knappar);

    var yta = kar.closest("[data-karusell-yta]") || kar.parentNode;

    /* Lodrät placering: mitt för karusellen. Karusellen är olika hög i
       olika bredder, så höjden mäts i stället för att skrivas i CSS. */
    function placera() {
      var y = kar.getBoundingClientRect();
      var s = yta.getBoundingClientRect();
      knappar.style.top = Math.round(y.top - s.top + y.height / 2) + "px";
    }

    function steg() {
      var k = kar.querySelector("[data-omdomeskort]");
      return (k ? k.getBoundingClientRect().width : 300) + STEG_MARGINAL;
    }

    function uppdatera() {
      /* Kan inte scrollas alls — då ska pilarna inte synas. Det gäller
         på stora skärmar, där korten ligger i ett rutnät. */
      var gar = kar.scrollWidth - kar.clientWidth > 4;
      rad.setAttribute("data-kan-scrolla", gar ? "ja" : "nej");

      /* Karusellen har padding i kanterna, och snap-punkten för det
         första kortet ligger därför inte på 0 utan på paddingens bredd.
         Utan det här satt bakåtpilen tänd redan på första kortet.

         Samma sak i andra änden: snappningen stannar vid sista kortets
         vänsterkant, inte vid paddingens yttersta pixel, så framåtpilen
         slocknade aldrig. */
      var stil = getComputedStyle(kar);
      var vanster = parseFloat(stil.paddingLeft) || 0;
      var hoger = parseFloat(stil.paddingRight) || 0;
      bak.disabled = kar.scrollLeft <= vanster + 4;
      fram.disabled = kar.scrollLeft >= kar.scrollWidth - kar.clientWidth - hoger - 4;
    }

    function flytta(tecken) {
      kar.scrollBy({ left: tecken * steg(), behavior: "smooth" });
    }

    function allt() { uppdatera(); placera(); }

    bak.addEventListener("click", function () { flytta(-1); });
    fram.addEventListener("click", function () { flytta(1); });
    kar.addEventListener("scroll", uppdatera, { passive: true });
    window.addEventListener("resize", allt);
    /* Korten blir högre när bilderna laddat; placeringen mäts om då. */
    window.addEventListener("load", allt);
    if (window.ResizeObserver) new ResizeObserver(allt).observe(kar);
    allt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
