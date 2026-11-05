/* =====================================================================
   FertilitetPlus — cookiesamtycke
   ---------------------------------------------------------------------
   Laddas i <head> PÅ VARJE SIDA, före Google Tag Manager.

   Varför före: GTM får inte sätta statistik- eller marknadsföringskakor
   innan besökaren sagt ja. Lösningen är Googles Consent Mode v2 — GTM
   laddas, men alla samtyckessignaler står på "denied" tills besökaren
   valt. Taggar som kräver samtycke håller då tillbaka av sig själva.

   Det här är inte en formalitet. FertilitetPlus besökare läser om
   ofrivillig barnlöshet, missfall och immunologisk utredning. Att en
   annonsplattform får veta att någon läst de sidorna är precis det
   GDPR och ePrivacy är skrivna för att hindra.

   Standardläget är nej till allt. Ingen förvald ruta, ingen "genom att
   fortsätta surfa godkänner du". Båda knapparna är lika framträdande.

   Markupen kommer från Cookiebanner.dc.html och märks upp av
   bygg-banner.mjs vid bygget:
     [data-cookie-banner]        hela bannern
     [data-huvudval]             raden med Acceptera alla / Endast nödvändiga / Anpassa
     [data-kategorier]           reglagen, dolda tills man trycker Anpassa
     [data-kategorier-knappar]   Spara mina val / Acceptera alla
     [data-samtycke="..."]       alla / nodvandiga / anpassa / spara
     [data-kategori="..."]       statistik / marknadsforing (button role="switch")
   ===================================================================== */

(function () {
  "use strict";

  var NYCKEL = "fp-samtycke";
  var VERSION = 1; // höj om kategorierna ändras — då frågar vi om

  /* --- 1. Consent Mode måste sättas FÖRE GTM laddas ------------------ */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted", // varukorg och bokning måste fungera
    personalization_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500,
  });

  /* --- 2. Läs och spara tidigare val ---------------------------------- */
  function las() {
    try {
      var r = window.localStorage.getItem(NYCKEL);
      if (!r) return null;
      var v = JSON.parse(r);
      return v && v.version === VERSION ? v : null;
    } catch (e) {
      return null; // privat läge eller blockerad lagring
    }
  }

  function spara(val) {
    try {
      window.localStorage.setItem(NYCKEL, JSON.stringify({
        version: VERSION,
        statistik: !!val.statistik,
        marknadsforing: !!val.marknadsforing,
        tid: new Date().toISOString(),
      }));
    } catch (e) {
      /* Kan inte sparas — besökaren får frågan igen nästa gång.
         Det är rätt beteende: hellre fråga igen än anta ja. */
    }
  }

  /* --- 3. Skicka valet vidare till GTM -------------------------------- */
  function tillampa(val) {
    gtag("consent", "update", {
      analytics_storage: val.statistik ? "granted" : "denied",
      ad_storage: val.marknadsforing ? "granted" : "denied",
      ad_user_data: val.marknadsforing ? "granted" : "denied",
      ad_personalization: val.marknadsforing ? "granted" : "denied",
      personalization_storage: val.marknadsforing ? "granted" : "denied",
    });
    window.dataLayer.push({
      event: "samtycke_uppdaterat",
      samtycke_statistik: !!val.statistik,
      samtycke_marknadsforing: !!val.marknadsforing,
    });
  }

  /* --- 4. Bannern ------------------------------------------------------ */
  function banner() { return document.querySelector("[data-cookie-banner]"); }

  function visa() {
    var b = banner();
    if (!b) return;
    b.removeAttribute("hidden");
    b.setAttribute("data-synlig", "");
    var f = b.querySelector("[data-samtycke]");
    if (f) f.focus(); // tangentbord och skärmläsare ska hitta den
  }

  function dolj() {
    var b = banner();
    if (!b) return;
    b.setAttribute("hidden", "");
    b.removeAttribute("data-synlig");
    b.removeAttribute("data-lage");
  }

  function installningar(pa) {
    var b = banner();
    if (!b) return;
    if (pa) b.setAttribute("data-lage", "installningar");
    else b.removeAttribute("data-lage");
  }

  /** Reglagen är knappar med role="switch", inte kryssrutor. */
  function reglage(namn) {
    var b = banner();
    return b ? b.querySelector('[data-kategori="' + namn + '"]') : null;
  }

  function avlast(namn) {
    var r = reglage(namn);
    return !!r && r.getAttribute("aria-checked") === "true";
  }

  function stallIn(namn, pa) {
    var r = reglage(namn);
    if (r) r.setAttribute("aria-checked", pa ? "true" : "false");
  }

  function svara(val) {
    spara(val);
    tillampa(val);
    dolj();
  }

  /* --- 5. Koppla knapparna -------------------------------------------- */
  function koppla() {
    var b = banner();
    if (!b) return;

    b.addEventListener("click", function (e) {
      // Reglage: vippa av och på
      var r = e.target.closest("[data-kategori]");
      if (r) {
        var pa = r.getAttribute("aria-checked") === "true";
        r.setAttribute("aria-checked", pa ? "false" : "true");
        return;
      }

      var k = e.target.closest("[data-samtycke]");
      if (!k) return;
      var v = k.getAttribute("data-samtycke");

      if (v === "alla") {
        svara({ statistik: true, marknadsforing: true });
      } else if (v === "nodvandiga") {
        svara({ statistik: false, marknadsforing: false });
      } else if (v === "anpassa") {
        installningar(true);
      } else if (v === "spara") {
        svara({ statistik: avlast("statistik"), marknadsforing: avlast("marknadsforing") });
      }
    });

    // Länk var som helst på sajten som öppnar valet igen.
    // Krav: samtycke ska gå att ta tillbaka lika lätt som att ge.
    document.addEventListener("click", function (e) {
      var l = e.target.closest("[data-oppna-samtycke]");
      if (!l) return;
      e.preventDefault();
      var val = las();
      if (val) {
        stallIn("statistik", val.statistik);
        stallIn("marknadsforing", val.marknadsforing);
      }
      installningar(true);
      visa();
    });
  }

  /* --- 6. Start -------------------------------------------------------- */
  function start() {
    koppla();
    var val = las();
    if (val) tillampa(val); // tidigare val gäller, ingen banner
    else visa();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  // Gör valet åtkomligt utifrån, t.ex. från en länk i sidfoten.
  window.fpSamtycke = { visa: visa, las: las };
})();
