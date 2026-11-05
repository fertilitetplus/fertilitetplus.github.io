/* =====================================================================
   FertilitetPlus — chattknappen i vår egen branding
   ---------------------------------------------------------------------
   Chatten kommer från Vården.se. Den laddas av

     <script src="https://chatt.varden.se/widget-embed.js"
             widget-id="fertilitetplus.se"></script>

   som lägger en <iframe id="varden-chat-widget-iframe"> längst ner till
   höger. Ihopfälld är den 280×80 och visar en grön bubbla med texten
   "Behöver du hjälp?" och en tecknad läkare. Utfälld blir den 600×600
   och visar själva chatten.

   Varför den inte går att styla
   -----------------------------
   Allt man ser ligger INNE i ramen, på chatt.varden.se. En ram från en
   annan domän är stängd för oss: vår CSS når inte in, och vår JavaScript
   får inte läsa eller ändra något där. Det är webbläsarens säkerhets-
   gräns, inte något vi råkat ställa in fel. Hur mycket vi än skriver i
   fp-brand.css händer ingenting.

   Vad vi därför gör i stället
   ---------------------------
   Vi byter ut knappen, inte chatten. Ramen får stå kvar — skriptet
   behöver den — men göms medan den är ihopfälld, och ovanpå ritar vi vår
   egen knapp: logotypens cirkel med plustecken, Plus Jakarta Sans, och
   salvia i stället för den klargröna.

   Vården.se:s skript har ett dokumenterat API för just det här:

     window.postMessage({ type: "varden-widget", action: "expand"   }, "*")
     window.postMessage({ type: "varden-widget", action: "collapse" }, "*")

   Så vår knapp öppnar deras chatt på deras eget sätt. Inget hack, inget
   som går sönder vid nästa uppdatering av widgeten.

   Vad vi INTE kommer åt
   ---------------------
   Den utfällda panelen — gröna listen, den tecknade läkaren, typsnittet
   och "Starta röstsamtal" — ligger också inne i ramen. Den måste
   Vården.se ändra på sin sida, kopplat till widget-id fertilitetplus.se.

   Samma fil på båda domänerna
   ---------------------------
   Den här filen ligger hos GitHub och laddas av både fertilitetplus.se
   och Shopify-temat. En källa att ändra i, inte två som ska hållas i
   synk — samma skäl som för fp-korg.js.
   ===================================================================== */

(function () {
  "use strict";

  var RAM_ID = "varden-chat-widget-iframe";
  var KNAPP_ID = "fp-chatt-knapp";
  var TEXT = "Behöver du hjälp?";

  /* Logotypens märke, hämtat ur huvudet på sajten. Samma mått, samma
     streckbredder. Färgen sätts med currentColor så att knappen kan
     ändra den utan att märket behöver skrivas om. */
  var MARKE =
    '<svg viewBox="0 0 38 38" fill="none" aria-hidden="true" focusable="false">' +
    '<circle cx="19" cy="19" r="17.5" stroke="currentColor" stroke-width="1.2" fill="none"></circle>' +
    '<line x1="19" y1="10" x2="19" y2="28" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>' +
    '<line x1="10" y1="19" x2="28" y2="19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>' +
    "</svg>";

  var STIL = [
    /* Ramen göms medan den är ihopfälld, men tas inte bort och göms inte
       med display:none — skriptet mäter och flyttar den, och en ram utan
       layout räknar fel. opacity lämnar den på plats, osynlig.

       !important behövs: Vården.se:s skript sätter ramens stil direkt på
       elementet. En vanlig regel i ett stilark förlorar mot det, en med
       !important vinner. */
    "#" + RAM_ID + '[data-state="collapsed"]{opacity:0!important;pointer-events:none!important}',

    "#" + KNAPP_ID + "{" +
      "position:fixed;right:20px;bottom:20px;z-index:10000;" +
      "display:none;align-items:center;gap:10px;" +
      "margin:0;padding:0;border:0;background:none;cursor:pointer;" +
      "font-family:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',sans-serif;" +
      "-webkit-tap-highlight-color:transparent;" +
    "}",
    "#" + KNAPP_ID + "[data-synlig]{display:flex}",

    /* Texten. Salvia med vit text, samma par som "Lägg i varukorgen". */
    "#" + KNAPP_ID + " .fp-chatt-text{" +
      "display:block;padding:13px 20px;border-radius:999px;" +
      "background:#7E9680;color:#fff;" +
      "font-size:14px;font-weight:600;line-height:1;letter-spacing:0.01em;" +
      "white-space:nowrap;" +
      "box-shadow:0 4px 18px rgba(58,53,48,0.16);" +
      "transition:background-color .18s ease,transform .18s ease;" +
    "}",

    /* Märket. Ljus botten med salviagrön ring och plus, precis som i
       huvudet — det är logotypen, inte en ikon vi hittat på. */
    "#" + KNAPP_ID + " .fp-chatt-marke{" +
      "display:flex;align-items:center;justify-content:center;" +
      "width:52px;height:52px;flex:0 0 auto;border-radius:50%;" +
      "background:#F8F6F2;color:#7E9680;" +
      "box-shadow:0 4px 18px rgba(58,53,48,0.16);" +
      "transition:transform .18s ease;" +
    "}",
    "#" + KNAPP_ID + " .fp-chatt-marke svg{width:30px;height:30px;display:block}",

    "#" + KNAPP_ID + ":hover .fp-chatt-text{background:#6C8370}",
    "#" + KNAPP_ID + ":hover .fp-chatt-marke{transform:scale(1.04)}",
    "#" + KNAPP_ID + ":focus-visible{outline:none}",
    "#" + KNAPP_ID + ":focus-visible .fp-chatt-marke," +
      "#" + KNAPP_ID + ":focus-visible .fp-chatt-text{" +
      "box-shadow:0 0 0 3px rgba(126,150,128,0.45),0 4px 18px rgba(58,53,48,0.16)}",

    /* På telefon får texten inte äta halva skärmen. Märket ensamt räcker
       — det är samma mönster som alla andra chattknappar, och besökaren
       känner igen formen. */
    "@media (max-width:600px){#" + KNAPP_ID + " .fp-chatt-text{display:none}}",

    /* Respektera den som bett om mindre rörelse. */
    "@media (prefers-reduced-motion:reduce){#" + KNAPP_ID + " *{transition:none!important}}",
  ].join("\n");

  function stil() {
    if (document.getElementById("fp-chatt-stil")) return;
    var s = document.createElement("style");
    s.id = "fp-chatt-stil";
    s.textContent = STIL;
    (document.head || document.documentElement).appendChild(s);
  }

  function knapp() {
    var b = document.getElementById(KNAPP_ID);
    if (b) return b;

    b = document.createElement("button");
    b.id = KNAPP_ID;
    b.type = "button";
    b.setAttribute("aria-label", "Öppna chatten – " + TEXT);
    b.setAttribute("aria-expanded", "false");
    b.innerHTML =
      '<span class="fp-chatt-text">' + TEXT + "</span>" +
      '<span class="fp-chatt-marke">' + MARKE + "</span>";

    b.addEventListener("click", function () {
      window.postMessage({ type: "varden-widget", action: "expand" }, "*");
      /* Göm knappen direkt. Väntar vi på att ramen ska svara ligger vår
         knapp kvar ovanpå panelen i en kort stund, och det ser ut som
         ett fel. */
      visa(false, b);
    });

    document.body.appendChild(b);
    return b;
  }

  function visa(pa, b) {
    if (pa) b.setAttribute("data-synlig", "");
    else b.removeAttribute("data-synlig");
    b.setAttribute("aria-expanded", pa ? "false" : "true");
  }

  /** Ihopfälld?
   *
   *  data-state avgör. Det mättes: attributet vänder direkt när panelen
   *  öppnas eller stängs, medan ramens höjd släpar efter mer än en sekund
   *  — den animeras mellan 80 och 600 pixlar. Höjden som huvudsignal
   *  skulle alltså låta knappen blinka till vid varje öppning.
   *
   *  Men attributet kan vi inte lita blint på. Klick går inte att skicka
   *  in i en ram från en annan domän, så vi har aldrig kunnat prova att
   *  stänga panelen med krysset inne i chatten. Sätter inte Vården.se
   *  attributet i det fallet blir knappen borta för gott, och chatten går
   *  inte att öppna igen.
   *
   *  Därför: har ramen varit liten en stund medan attributet fortfarande
   *  påstår att den är öppen, så är det attributet som har fel. */
  var sedanLiten = 0;

  function ihopfalld(ram) {
    var h = ram.getBoundingClientRect().height;
    if (h < 200) { if (!sedanLiten) sedanLiten = Date.now(); }
    else { sedanLiten = 0; }

    var attr = ram.getAttribute("data-state");
    if (attr === "collapsed") return true;
    if (attr === "expanded") return sedanLiten !== 0 && Date.now() - sedanLiten > 1500;
    return h < 200;
  }

  function start(ram) {
    stil();
    var b = knapp();

    function synka() { visa(ihopfalld(ram), b); }

    synka();

    new MutationObserver(synka).observe(ram, {
      attributes: true,
      attributeFilter: ["data-state", "style"],
    });

    /* Reserv. Observatören ovan fångar både data-state och style, och
       ramen ändrar storlek via style — så stängningen syns normalt direkt.
       Kollen två gånger i sekunden finns för det vi inte tänkt på. Den
       läser en storlek och jämför två tal; det kostar ingenting, och den
       gör att knappen aldrig kan bli borta för gott. */
    setInterval(synka, 500);
  }

  /* Ramen skapas av Vården.se:s skript och finns inte när den här filen
     körs. Vi väntar in den, men inte i all evighet: är chatten avstängd
     för sidan ska vi inte lämna en observatör igång. */
  function vanta() {
    var ram = document.getElementById(RAM_ID);
    if (ram) return start(ram);

    var obs = new MutationObserver(function () {
      var r = document.getElementById(RAM_ID);
      if (!r) return;
      obs.disconnect();
      clearTimeout(tid);
      start(r);
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });

    var tid = setTimeout(function () { obs.disconnect(); }, 30000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", vanta);
  } else {
    vanta();
  }
})();
