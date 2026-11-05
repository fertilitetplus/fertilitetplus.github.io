/* =====================================================================
   FertilitetPlus — varukorgens antal på huvudsajten
   ---------------------------------------------------------------------
   Varukorgen bor hos Shopify på shop.fertilitetplus.se. Den här sajten är
   statiska filer hos GitHub och kan inte fråga Shopify hur många varor
   besökaren har lagt i den.

   Varför inte bara hämta /cart.js
   -------------------------------
   Det var första försöket. Shopify skickar inga CORS-huvuden på
   /cart.js, så en förfrågan härifrån blockeras av webbläsaren — både med
   och utan kakor. Mätt, inte antaget.

   Lösningen
   ---------
   Shopify-temat skriver antalet till en kaka på den gemensamma
   föräldradomänen .fertilitetplus.se. Båda sajterna ligger under samma
   domän, så kakan är förstapartskaka på båda — den överlever alltså även
   i webbläsare som blockerar tredjepartskakor, vilket en lösning med
   iframe inte hade gjort.

   Om samtycke
   -----------
   Kakan bär ett antal, inget som identifierar besökaren, och den finns
   till för att varukorgen ska fungera. Den hör därmed till samma
   kategori som varukorgskakan själv — nödvändig funktion, inte statistik
   eller marknadsföring. Den är det enda vi sätter utan att fråga, och
   det är samma gräns som fp-samtycke.js drar med functionality_storage.
   ===================================================================== */

(function () {
  "use strict";

  var NYCKEL = /(?:^|;\s*)fp_korg=(\d+)/;

  function las() {
    try {
      var m = document.cookie.match(NYCKEL);
      return m ? parseInt(m[1], 10) : 0;
    } catch (e) {
      return 0; // blockerad lagring — visa hellre inget än fel siffra
    }
  }

  /** Varukorgslänken i huvudet. Kan peka på shop-domänen eller vara relativ. */
  function lank() {
    return document.querySelector(
      'a[href*="shop.fertilitetplus.se/cart"], a[href$="/cart"]'
    );
  }

  function rita(antal) {
    var l = lank();
    if (!l) return;

    var m = l.querySelector("[data-fp-korgantal]");

    if (!antal) {
      // Noll visas inte. En tom varukorg behöver ingen påminnelse.
      if (m) m.remove();
      return;
    }

    if (!m) {
      m = document.createElement("span");
      m.setAttribute("data-fp-korgantal", "");
      l.appendChild(m);
    }
    m.textContent = antal > 99 ? "99+" : String(antal);
    m.setAttribute("aria-label", antal + " i varukorgen");
  }

  function uppdatera() { rita(las()); }

  uppdatera();

  /* Besökaren rör sig fram och tillbaka mellan domänerna. Kommer hon
     tillbaka med bakåtknappen serveras sidan ur webbläsarens cache och
     skripten körs inte om — pageshow fångar det fallet. visibilitychange
     fångar att hon lagt något i korgen i en annan flik. */
  window.addEventListener("pageshow", uppdatera);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) uppdatera();
  });
})();
