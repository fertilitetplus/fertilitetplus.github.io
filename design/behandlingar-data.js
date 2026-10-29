// Källa: "FertilitetPlus – Bokningssidetexter", uppdaterad 2026-09-09. Namn och texter ordagrant; ska matcha patient.nu.
export const LANKAR = {
 "FERT": "https://patient.nu/portal/public/calendar/44752d1b-7097-499b-8f1a-ee2eafa21127#step-1",
 "IMMUN": "https://patient.nu/portal/public/calendar/57662b62-9c62-44e2-9995-ca1cbb2793f6#step-1",
 "SKOLD": "https://patient.nu/portal/public/calendar/268b81a6-cc1f-4694-b2ee-feefea24b5a1#step-1",
 "KONS": "https://patient.nu/portal/public/calendar/3210099f-2fa3-492d-8d51-d9b4088e4118#step-1",
 "LAKARE": "https://patient.nu/portal/public/calendar/d7162ceb-033b-49f1-9930-00da8c210fd3#step-1",
 "SPERMA": "https://patient.nu/portal/public/calendar/690a767f-9a5c-40c3-bc44-036307741fb4#step-1",
 "NIPT": "https://patient.nu/portal/public/calendar/0bf464f8-e019-4766-ad1d-caa0f7baf613#step-1",
 "UTLAND": "https://patient.nu/portal/public/calendar/dbd1fde4-26a3-47d1-8fd6-bd271e01e411#step-1",
 "DROPP": "https://patient.nu/portal/public/calendar/3eb5d1d9-153b-46bc-bc11-7e8c84fd6e0d#step-1"
};
export const GRUPPER = [
 {
  "id": "fert",
  "titel": "Fertilitetsutredning",
  "plats": [
   "Göteborg",
   "Stockholm"
  ],
  "lank": "https://patient.nu/portal/public/calendar/44752d1b-7097-499b-8f1a-ee2eafa21127#step-1",
  "info": "Fertilitetsutredning.dc.html",
  "intro": "Här bokar du en fertilitetsutredning – för dig med utebliven graviditet eller för dig som vill ta reda på din fertila status. Med hjälp av blodprover tar vi reda på hur stora dina chanser till graviditet är. Vi har ingen åldersgräns och du behöver ingen remiss. Den som tar emot dig är barnmorska eller sjuksköterska.",
  "tjanster": [
   {
    "namn": "Fertilitetsutredning",
    "pris": "från 2 900 kr",
    "stader": [
     "Göteborg",
     "Stockholm"
    ],
    "tid": "30 min",
    "text": "En utredning med konsultation, hormonprover, sköldkörtelprov och uppföljning av blodprov via telefon. Fertilitetsprover tas dag 2–4 i cykeln – du får remiss för de prover som behöver tas vid rätt tid. Om ultraljud/läkarkonsultation rekommenderas i förlängningen tillkommer 1 900 kr."
   }
  ]
 },
 {
  "id": "immun",
  "titel": "Immunologisk utredning",
  "plats": [
   "Göteborg",
   "Stockholm"
  ],
  "lank": "https://patient.nu/portal/public/calendar/57662b62-9c62-44e2-9995-ca1cbb2793f6#step-1",
  "info": "Immunologisk-utredning.dc.html",
  "intro": "Här bokar du en immunologisk utredning – för dig som har svårt att bli gravid, haft upprepade missfall eller genomgått IVF utan att graviditeten fortsatt. Ibland kan ett överaktivt immunförsvar påverka möjligheten att bli eller förbli gravid, och här analyserar vi om immunförsvaret spelar en roll i din fertilitet. Den som hjälper dig är barnmorska eller sjuksköterska.",
  "tjanster": [
   {
    "namn": "Immunologisk utredning",
    "pris": "från 5 000 kr",
    "stader": [
     "Göteborg",
     "Stockholm"
    ],
    "tid": "30 min",
    "text": "Konsultation på kliniken med immunologiska prover (bl.a. NK-celler), sköldkörtelprover och koagulationsprover, samt uppföljning av blodprov via telefon. Provtagning kan inte ske på fredagar, dag före röd dag eller på röd dag. Om ultraljud/läkarkonsultation rekommenderas i förlängningen tillkommer 1 900 kr."
   }
  ]
 },
 {
  "id": "skold",
  "titel": "Sköldkörtelutredning",
  "plats": [
   "Stockholm"
  ],
  "lank": "https://patient.nu/portal/public/calendar/268b81a6-cc1f-4694-b2ee-feefea24b5a1#step-1",
  "info": "Skoldkortelproblematik.dc.html",
  "intro": "Här bokar du en sköldkörtelutredning – för dig som vill bli gravid och har misstänkt eller bekräftad sköldkörtelrubbning. Vi gör en grundlig utredning av din sköldkörtel med hjälp av blodprover.",
  "tjanster": [
   {
    "namn": "Sköldkörtelutredning i fertil ålder",
    "pris": "3 000 kr",
    "stader": [
     "Stockholm"
    ],
    "tid": "30 + 30 min",
    "text": "Första konsultation på kliniken med sjuksköterska eller barnmorska, utökad sköldkörtelanalys och ett uppföljande besök med läkare."
   }
  ]
 },
 {
  "id": "kons",
  "titel": "Konsultationer",
  "plats": [
   "Göteborg",
   "Stockholm"
  ],
  "lank": "https://patient.nu/portal/public/calendar/3210099f-2fa3-492d-8d51-d9b4088e4118#step-1",
  "info": null,
  "intro": "Här bokar du en konsultation med oss – på plats eller via telefon. Välj det som passar dig bäst.",
  "tjanster": [
   {
    "namn": "Konsultation med barnmorska",
    "pris": "900 kr",
    "stader": [
     "Göteborg",
     "Stockholm"
    ],
    "tid": "30 min",
    "text": "Ett första besök på kliniken för att påbörja en utredning eller undersökning, eller för att få kontakt med läkare. Den som tar emot dig är barnmorska eller sjuksköterska."
   },
   {
    "namn": "Telefonkonsultation med barnmorska",
    "pris": "250 kr",
    "stader": [
     "Göteborg",
     "Stockholm"
    ],
    "tid": "15 min",
    "text": "Ett telefonsamtal med en barnmorska för råd och vägledning kring din fertilitet och dina nästa steg, utan att du behöver besöka kliniken. Vi kan svara på mycket per telefon, men önskar du en utredning, undersökning eller behandling behöver du vid något tillfälle besöka oss i Stockholm eller Göteborg."
   },
   {
    "namn": "Telefonkonsultation med läkare",
    "pris": "1 200 kr",
    "stader": [
     "Stockholm"
    ],
    "tid": "20 min",
    "text": "Ett telefonsamtal med vår läkare, t.ex. om läkemedel, blodprovssvar, fortsatt behandling eller receptförnyelse. Läkaren ringer upp dig på avtalad tid."
   }
  ]
 },
 {
  "id": "lakare",
  "titel": "Läkarbesök med ultraljud",
  "plats": [
   "Stockholm"
  ],
  "lank": "https://patient.nu/portal/public/calendar/d7162ceb-033b-49f1-9930-00da8c210fd3#step-1",
  "info": "Ultraljud-infor-graviditet.dc.html",
  "intro": "Här bokar du ett läkarbesök med ultraljud – inför eller under en graviditet. Ett fysiskt besök hos vår fertilitetsläkare, utan remiss.",
  "tjanster": [
   {
    "namn": "Läkarbesök med ultraljud",
    "pris": "1 900 kr",
    "stader": [
     "Stockholm"
    ],
    "tid": "30 min",
    "text": "Ett fysiskt besök hos vår läkare där både läkarkonsultation och ultraljud ingår. Passar dig som vill ha en kontroll inför en graviditet (livmoder och äggstockar, planering inför t.ex. IVF) eller extra trygghet under graviditeten. Ingen remiss behövs."
   }
  ]
 },
 {
  "id": "sperma",
  "titel": "Spermaprov",
  "plats": [
   "Göteborg",
   "Stockholm"
  ],
  "lank": "https://patient.nu/portal/public/calendar/690a767f-9a5c-40c3-bc44-036307741fb4#step-1",
  "info": "Spermaprov.dc.html",
  "intro": "Här bokar du ett spermaprov – en enkel och viktig del i en fertilitetsutredning. Provet lämnas på kliniken samma dag, eller medhavt hemifrån (då behöver det vara hos oss senast en timme efter provtagning). Uppföljning sker oftast samma dag eller dagen efter. Avhållsamhet inför provet är 2–5 dagar och därmed inte mer än 5 dagar. Välj det som passar dig.",
  "tjanster": [
   {
    "namn": "Spermaprovsanalys",
    "pris": "2 200 kr",
    "stader": [
     "Göteborg",
     "Stockholm"
    ],
    "tid": "30 min",
    "text": "Vårt klassiska spermaprov: bestämning av antal och koncentration, klassificering av rörlighet och bedömning av spermiernas utseende. Avhållsamhet 2–5 dagar (inte längre än 5) inför provet."
   },
   {
    "namn": "Spermaprov + oxidativ stress",
    "pris": "3 800 kr",
    "stader": [
     "Göteborg"
    ],
    "tid": "30 min",
    "text": "Ett fullständigt spermaprov med konsultation samt analys av volym, rörelse och utseende – och dessutom analys av oxidativ stress, som kan påverka spermiekvaliteten även vid normala värden i ett vanligt prov. Referensvärden enligt WHO:s riktlinjer. Avhållsamhet 2–5 dagar (inte längre än 5)."
   },
   {
    "namn": "Spermaprov + DNA-fragmentering",
    "pris": "7 900 kr",
    "stader": [
     "Stockholm"
    ],
    "tid": "30 min",
    "text": "Fördjupat prov av spermiernas DNA-kvalitet. DNA-fragmentering betyder att arvsmassan i spermierna har skador. Det kan påverka möjligheten att bli gravid och risken för missfall, även när ett vanligt spermaprov ser normalt ut.",
    "kort": "Fördjupat prov av spermiernas DNA-kvalitet. DNA-fragmentering betyder att arvsmassan i spermierna har skador. Det kan påverka möjligheten att bli gravid och risken för missfall, även när ett vanligt spermaprov ser normalt ut.",
    "mer": [
     "Ingår: konsultation, klassiskt spermaprov och två DNA-tester.",
     "SCD (Sperm Chromatin Dispersion) mäter den totala DNA-skadan, brott på en eller båda DNA-strängarna.",
     "SDFR (Sperm DNA Fragmentation Releasing) mäter brott på båda DNA-strängarna, de allvarligaste skadorna.",
     "Resultatet bedöms tillsammans med spermaprovet.",
     "Avstå från utlösning 2 till 5 dagar före provet, inte längre."
    ]
   }
  ]
 },
 {
  "id": "nipt",
  "titel": "Fostertest Harmony NIPT",
  "plats": [
   "Stockholm"
  ],
  "lank": "https://patient.nu/portal/public/calendar/0bf464f8-e019-4766-ad1d-caa0f7baf613#step-1",
  "info": "Fostertest-NIPT.dc.html",
  "intro": "Här bokar du ett Harmony NIPT-fostertest, från graviditetsvecka 11. Testet görs via blodprov på den som är gravid och kompletteras med ett ultraljud.",
  "tjanster": [
   {
    "namn": "Fostertest Harmony NIPT",
    "pris": "6 500 kr",
    "stader": [
     "Stockholm"
    ],
    "tid": "30 min",
    "text": "Blodprovtagning, ultraljud utfört av läkare och uppföljning av testet via telefon."
   }
  ]
 },
 {
  "id": "utland",
  "titel": "Provtagning inför behandling utomlands",
  "plats": [
   "Göteborg",
   "Stockholm"
  ],
  "lank": "https://patient.nu/portal/public/calendar/dbd1fde4-26a3-47d1-8fd6-bd271e01e411#step-1",
  "info": "IVF-och-utlandsbehandlingar.dc.html",
  "intro": "Här bokar du din provtagning inför en fertilitetsbehandling utomlands. Vi gör dina undersökningar och provtagningar här i Sverige så att du slipper resa fram och tillbaka. Börja med en konsultation där vi går igenom ditt protokoll och planerar din provtagning.",
  "tjanster": [
   {
    "namn": "Konsultation vid utlandsbehandling",
    "pris": "1 200 kr",
    "stader": [
     "Göteborg",
     "Stockholm"
    ],
    "tid": "30 min",
    "text": "För dig som genomgår fertilitetsbehandling utomlands och vill göra undersökningar och provtagning i Sverige. Konsultation på kliniken eller via telefon där en barnmorska går igenom ditt protokoll och skriver blodprovsremisser, med uppföljning via telefon. Kostnad för blodprover eller ultraljud tillkommer."
   }
  ]
 },
 {
  "id": "dropp",
  "titel": "Droppbehandlingar",
  "plats": [
   "Göteborg",
   "Stockholm"
  ],
  "lank": "https://patient.nu/portal/public/calendar/3eb5d1d9-153b-46bc-bc11-7e8c84fd6e0d#step-1",
  "info": "Vitamindropp.dc.html",
  "intro": "Här bokar du ett dropp. Vi erbjuder immunologiska dropp som en del av fertilitetsbehandling, och vitamindropp för energi och välmående. Alla dropp ges av barnmorska eller sjuksköterska. Välj det som passar dig.",
  "tjanster": [
   {
    "namn": "Droppbehandling med Intralipid",
    "pris": "1 600 kr",
    "stader": [
     "Göteborg",
     "Stockholm"
    ],
    "tid": "60 min",
    "text": "Intralipidbehandling i form av dropp, t.ex. vid upprepade missfall eller immunologiska orsaker. Du behöver tåla ägg och soja."
   },
   {
    "namn": "Droppbehandling med Intralipid, helg",
    "pris": "2 200 kr",
    "stader": [
     "Göteborg",
     "Stockholm"
    ],
    "tid": "60 min",
    "text": "Samma behandling som ovan, men på helger. Du behöver tåla ägg och soja. Hittar du ingen ledig tid är du välkommen att mejla oss så hittar vi en tid."
   },
   {
    "namn": "Droppbehandling med IVIG (specialdropp)",
    "pris": "2 500 kr",
    "stader": [
     "Göteborg",
     "Stockholm"
    ],
    "tid": "120 min",
    "text": "Behandling med IVIG-dropp för dig som fått det utskrivet av läkare. Du tar med ditt eget preparat."
   },
   {
    "namn": "Multivitamindropp",
    "pris": "900 kr",
    "stader": [
     "Göteborg",
     "Stockholm"
    ],
    "tid": "ca 45 min",
    "text": "Vitaminer och näring direkt i blodet – för ökad energi, hormonell balans och bättre förutsättningar inför och under graviditet."
   },
   {
    "namn": "C-vitamindropp",
    "pris": "850 kr",
    "stader": [
     "Göteborg",
     "Stockholm"
    ],
    "tid": "ca 45 min",
    "text": "Skyddar cellerna mot oxidativ stress, minskar trötthet, främjar järnupptag och stöttar kroppen inför och under graviditet."
   }
  ]
 }
];
