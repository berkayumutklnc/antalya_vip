/**
 * Structured transfer route data for landing pages.
 *
 * All destination landing pages are driven from this config.
 * Pricing references come from the canonical pricing matrix.
 *
 * To add a new destination:
 * 1. Add an entry here
 * 2. Create src/app/<slug>/page.tsx using the template pattern
 * 3. The sitemap, internal links, and metadata auto-update
 */

export interface TransferRoute {
  /** URL slug, e.g. "belek-transfer" */
  slug: string;
  /** Canonical place key matching pricing matrix */
  priceKey: string;
  /** Region grouping for internal links */
  region: "east" | "west" | "central" | "airport";
  /** Distance from AYT in km (approximate) */
  distanceKm: number;
  /** Typical travel time range */
  durationMin: string;
  /** Sub-destinations with times */
  distances: Array<{ to: string; minutes: string }>;
  /** Related route slugs for cross-linking */
  related: string[];
  /** i18n content keys per language */
  content: {
    tr: TransferContent;
    de: TransferContent;
    en: TransferContent;
    ru: TransferContent;
  };
}

export interface TransferContent {
  /** Meta title for <title> tag */
  metaTitle: string;
  /** Meta description for search results */
  metaDescription: string;
  /** Visible H1 */
  h1: string;
  /** Intro paragraph text */
  intro: string;
  /** "Why Zenturo?" bullet points */
  whyUs: string[];
  /** FAQ pairs */
  faqs: Array<{ q: string; a: string }>;
}

export const TRANSFER_ROUTES: TransferRoute[] = [
  {
    slug: "antalya-havalimani-transfer",
    priceKey: "Antalya Airport (AYT)",
    region: "airport",
    distanceKm: 0,
    durationMin: "—",
    distances: [
      { to: "Lara / Kundu", minutes: "20–30 dk" },
      { to: "Belek", minutes: "35–45 dk" },
      { to: "Kemer", minutes: "55–70 dk" },
      { to: "Side / Manavgat", minutes: "60–75 dk" },
      { to: "Alanya", minutes: "120–140 dk" },
      { to: "Antalya Merkez", minutes: "15–25 dk" },
    ],
    related: ["belek-transfer", "lara-transfer", "kemer-transfer", "side-transfer"],
    content: {
      tr: {
        metaTitle: "Antalya Havalimanı Transfer | VIP Karşılama & Özel Şoför",
        metaDescription: "AYT havalimanından otelinize VIP transfer. Uçuş takibi, isim panosuyla karşılama, ücretsiz bebek koltuğu, 7/24 sabit fiyat.",
        h1: "Antalya Havalimanı VIP Transfer",
        intro: "Antalya Havalimanı'ndan (AYT) otellerinize ve tüm tatil bölgelerine özel şoförlü VIP transfer hizmeti. Uçuş takip sistemiyle gecikmelerde bile kapıda karşılama garantisi.",
        whyUs: [
          "Uçuş takibi — gecikmelerde ek ücret yok",
          "Terminal çıkışında isim panosuyla karşılama",
          "Ücretsiz bebek koltuğu ve Wi-Fi",
          "7/24 sabit fiyat, gizli masraf yok",
          "Sigortalı araçlar, deneyimli şoförler",
        ],
        faqs: [
          { q: "Karşılama noktası neresi?", a: "İç/dış hatlar terminal çıkışında şoförünüz isim panosuyla bekler." },
          { q: "Uçuşum gecikirse ne olur?", a: "Uçuşunuzu anlık takip ederiz; gecikme durumunda ek ücret yansıtmayız." },
          { q: "Gece uçuşlarında fark var mı?", a: "Hayır, 7/24 aynı sabit fiyat geçerlidir." },
        ],
      },
      de: {
        metaTitle: "Antalya Flughafen Transfer | VIP Empfang & Privatfahrer",
        metaDescription: "VIP-Transfer vom Flughafen AYT zu Ihrem Hotel. Flugverfolgung, Namensschild-Empfang, kostenloser Kindersitz, 24/7 Festpreis.",
        h1: "Antalya Flughafen VIP Transfer",
        intro: "Privater VIP-Transfer vom Flughafen Antalya (AYT) zu allen Hotels und Ferienorten. Durch unsere Flugverfolgung garantieren wir pünktlichen Empfang – auch bei Verspätungen.",
        whyUs: [
          "Flugverfolgung – kein Aufpreis bei Verspätung",
          "Empfang mit Namensschild am Terminalausgang",
          "Kostenloser Kindersitz & WLAN",
          "24/7 Festpreis, keine versteckten Kosten",
          "Versicherte Fahrzeuge, erfahrene Fahrer",
        ],
        faqs: [
          { q: "Wo ist der Treffpunkt?", a: "Ihr Fahrer erwartet Sie am Terminalausgang mit Namensschild." },
          { q: "Was passiert bei Flugverspätung?", a: "Wir verfolgen Ihren Flug in Echtzeit – keine Mehrkosten." },
          { q: "Gibt es einen Nachtzuschlag?", a: "Nein, 24/7 gilt der gleiche Festpreis." },
        ],
      },
      en: {
        metaTitle: "Antalya Airport Transfer | VIP Meet & Greet Service",
        metaDescription: "VIP transfer from AYT airport to your hotel. Flight tracking, name-sign greeting, free child seat, 24/7 fixed pricing.",
        h1: "Antalya Airport VIP Transfer",
        intro: "Private VIP transfer from Antalya Airport (AYT) to all hotels and resort areas. Our live flight tracking ensures on-time pickup — even when flights are delayed.",
        whyUs: [
          "Live flight tracking — no extra charge for delays",
          "Name-sign meet & greet at terminal exit",
          "Free child seat & Wi-Fi on board",
          "24/7 fixed pricing, no hidden fees",
          "Insured vehicles, professional drivers",
        ],
        faqs: [
          { q: "Where is the meeting point?", a: "Your driver will wait at the terminal exit with a name sign." },
          { q: "What if my flight is delayed?", a: "We track your flight in real time — no extra charges for delays." },
          { q: "Is there a night surcharge?", a: "No, the same fixed price applies 24/7." },
        ],
      },
      ru: {
        metaTitle: "Трансфер из аэропорта Анталии | VIP встреча и личный водитель",
        metaDescription: "VIP-трансфер из аэропорта AYT в отель. Отслеживание рейса, именная табличка, бесплатное детское кресло, фиксированная цена 24/7.",
        h1: "VIP трансфер из аэропорта Анталии",
        intro: "Частный VIP-трансфер из аэропорта Анталии (AYT) во все отели и курортные зоны. Мы отслеживаем ваш рейс в реальном времени и гарантируем встречу — даже при задержках.",
        whyUs: [
          "Отслеживание рейса — без доплат за задержки",
          "Встреча с именной табличкой у выхода из терминала",
          "Бесплатное детское кресло и Wi-Fi",
          "Фиксированная цена 24/7, без скрытых платежей",
          "Застрахованные автомобили, опытные водители",
        ],
        faqs: [
          { q: "Где точка встречи?", a: "Водитель встретит вас у выхода из терминала с именной табличкой." },
          { q: "Что будет, если рейс задержится?", a: "Мы отслеживаем рейс в реальном времени — доплат не будет." },
          { q: "Есть ли ночная наценка?", a: "Нет, одна фиксированная цена действует 24/7." },
        ],
      },
    },
  },
  {
    slug: "belek-transfer",
    priceKey: "Belek",
    region: "east",
    distanceKm: 35,
    durationMin: "35–45 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "35–45 dk" },
      { to: "Belek Otelleri", minutes: "5–10 dk" },
      { to: "Kadriye", minutes: "10–15 dk" },
    ],
    related: ["antalya-havalimani-transfer", "side-transfer", "lara-transfer"],
    content: {
      tr: {
        metaTitle: "Belek Transfer | Antalya Havalimanı → Belek VIP Transfer",
        metaDescription: "AYT havalimanından Belek otellerine VIP transfer. 35-45 dk, sabit fiyat, ücretsiz bebek koltuğu, uçuş takibi.",
        h1: "Belek VIP Transfer",
        intro: "Antalya Havalimanı'ndan Belek'e özel şoförlü VIP transfer. Belek'in lüks otellerine ve golf sahalarına rahat ve güvenli ulaşım.",
        whyUs: [
          "Uçuş takibi ile kapıda karşılama",
          "Deneyimli şoförler, sigortalı taşımacılık",
          "Ücretsiz çocuk koltuğu, Wi-Fi, soğuk içecek",
          "7/24 sabit fiyat, gizli ücret yok",
        ],
        faqs: [
          { q: "Belek'e transfer ne kadar sürer?", a: "Antalya Havalimanı'ndan Belek'e yaklaşık 35-45 dakikadır." },
          { q: "Otel kapısına bırakıyor musunuz?", a: "Evet, doğrudan otel lobisine kadar götürüyoruz." },
          { q: "Bebek koltuğu var mı?", a: "Evet, ücretsiz çocuk koltuğu sağlıyoruz." },
        ],
      },
      de: {
        metaTitle: "Belek Transfer | Flughafen Antalya → Belek VIP Transfer",
        metaDescription: "VIP-Transfer vom Flughafen AYT nach Belek. 35-45 Min., Festpreis, kostenloser Kindersitz, Flugverfolgung.",
        h1: "Belek VIP Transfer",
        intro: "Privater VIP-Transfer vom Flughafen Antalya nach Belek. Komfortabler und sicherer Transport zu Beleks Luxushotels und Golfplätzen.",
        whyUs: [
          "Flugverfolgung & Empfang mit Namensschild",
          "Erfahrene Fahrer, versicherte Fahrzeuge",
          "Kostenloser Kindersitz, WLAN, Erfrischungen",
          "24/7 Festpreis, keine versteckten Kosten",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer nach Belek?", a: "Vom Flughafen Antalya nach Belek ca. 35-45 Minuten." },
          { q: "Fahren Sie direkt zum Hotel?", a: "Ja, wir bringen Sie direkt zur Hotellobby." },
          { q: "Gibt es einen Kindersitz?", a: "Ja, kostenloser Kindersitz auf Anfrage." },
        ],
      },
      en: {
        metaTitle: "Belek Transfer | Antalya Airport → Belek VIP Transfer",
        metaDescription: "VIP transfer from AYT airport to Belek hotels. 35-45 min, fixed price, free child seat, flight tracking.",
        h1: "Belek VIP Transfer",
        intro: "Private VIP transfer from Antalya Airport to Belek. Comfortable and safe transport to Belek's luxury hotels and golf courses.",
        whyUs: [
          "Flight tracking & name-sign meet at terminal",
          "Professional drivers, insured vehicles",
          "Free child seat, Wi-Fi, refreshments",
          "24/7 fixed pricing, no hidden fees",
        ],
        faqs: [
          { q: "How long is the transfer to Belek?", a: "From Antalya Airport to Belek is approximately 35-45 minutes." },
          { q: "Do you drop off at the hotel door?", a: "Yes, we take you directly to the hotel lobby." },
          { q: "Is a child seat available?", a: "Yes, free child seat provided on request." },
        ],
      },
      ru: {
        metaTitle: "Трансфер в Белек | Аэропорт Анталия → Белек VIP-трансфер",
        metaDescription: "VIP-трансфер из аэропорта AYT в отели Белека. 35-45 мин., фиксированная цена, бесплатное детское кресло.",
        h1: "VIP трансфер в Белек",
        intro: "Частный VIP-трансфер из аэропорта Анталии в Белек. Комфортная и безопасная доставка к роскошным отелям и гольф-курортам Белека.",
        whyUs: [
          "Отслеживание рейса и встреча с табличкой",
          "Опытные водители, застрахованные автомобили",
          "Бесплатное детское кресло, Wi-Fi, напитки",
          "Фиксированная цена 24/7, без скрытых платежей",
        ],
        faqs: [
          { q: "Сколько длится трансфер в Белек?", a: "Из аэропорта Анталии в Белек — примерно 35-45 минут." },
          { q: "Вы довозите прямо до отеля?", a: "Да, доставляем прямо до лобби отеля." },
          { q: "Есть ли детское кресло?", a: "Да, бесплатное детское кресло по запросу." },
        ],
      },
    },
  },
  {
    slug: "lara-transfer",
    priceKey: "Lara",
    region: "central",
    distanceKm: 15,
    durationMin: "20–30 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "20–30 dk" },
      { to: "Lara Otelleri", minutes: "5–10 dk" },
      { to: "Kundu", minutes: "10–15 dk" },
    ],
    related: ["antalya-havalimani-transfer", "belek-transfer", "vip-transfer-antalya"],
    content: {
      tr: {
        metaTitle: "Lara Transfer | Antalya Havalimanı → Lara / Kundu VIP Transfer",
        metaDescription: "AYT havalimanından Lara ve Kundu otellerine VIP transfer. 20-30 dk, sabit fiyat, 7/24 hizmet.",
        h1: "Lara & Kundu VIP Transfer",
        intro: "Antalya Havalimanı'ndan Lara ve Kundu bölgesine özel şoförlü VIP transfer. Havalimanına en yakın tatil bölgelerinden biri olan Lara'ya sadece 20-30 dakikada ulaşın.",
        whyUs: [
          "Havalimanına en yakın bölge — 20-30 dakika",
          "Terminal çıkışında isim panosuyla karşılama",
          "Ücretsiz bebek koltuğu ve Wi-Fi",
          "7/24 sabit fiyat, gizli masraf yok",
        ],
        faqs: [
          { q: "Lara'ya transfer ne kadar sürer?", a: "Antalya Havalimanı'ndan Lara'ya yaklaşık 20-30 dakikadır." },
          { q: "Kundu otellerine de gidiyor musunuz?", a: "Evet, Kundu ve Lara bölgesindeki tüm otellere transfer yapıyoruz." },
          { q: "Gece uçuşlarında ek ücret var mı?", a: "Hayır, 7/24 aynı sabit fiyat geçerlidir." },
        ],
      },
      de: {
        metaTitle: "Lara Transfer | Flughafen Antalya → Lara / Kundu VIP Transfer",
        metaDescription: "VIP-Transfer vom AYT Flughafen zu Hotels in Lara und Kundu. 20-30 Min., Festpreis, 24/7 Service.",
        h1: "Lara & Kundu VIP Transfer",
        intro: "Privater VIP-Transfer vom Flughafen Antalya in die Region Lara und Kundu. In nur 20-30 Minuten erreichen Sie eines der nächstgelegenen Feriengebiete.",
        whyUs: [
          "Nächste Region zum Flughafen – 20-30 Minuten",
          "Empfang mit Namensschild am Terminalausgang",
          "Kostenloser Kindersitz & WLAN",
          "24/7 Festpreis, keine versteckten Kosten",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer nach Lara?", a: "Vom Flughafen Antalya nach Lara ca. 20-30 Minuten." },
          { q: "Fahren Sie auch nach Kundu?", a: "Ja, wir fahren zu allen Hotels in Lara und Kundu." },
          { q: "Gibt es einen Nachtzuschlag?", a: "Nein, 24/7 gilt der gleiche Festpreis." },
        ],
      },
      en: {
        metaTitle: "Lara Transfer | Antalya Airport → Lara / Kundu VIP Transfer",
        metaDescription: "VIP transfer from AYT airport to Lara and Kundu hotels. 20-30 min, fixed price, 24/7 service.",
        h1: "Lara & Kundu VIP Transfer",
        intro: "Private VIP transfer from Antalya Airport to the Lara and Kundu area. One of the closest resort areas to the airport — just 20-30 minutes away.",
        whyUs: [
          "Closest resort area to the airport – 20-30 minutes",
          "Name-sign meet & greet at terminal exit",
          "Free child seat & Wi-Fi on board",
          "24/7 fixed pricing, no hidden fees",
        ],
        faqs: [
          { q: "How long is the transfer to Lara?", a: "From Antalya Airport to Lara is approximately 20-30 minutes." },
          { q: "Do you also go to Kundu?", a: "Yes, we serve all hotels in the Lara and Kundu area." },
          { q: "Is there a night surcharge?", a: "No, the same fixed price applies 24/7." },
        ],
      },
      ru: {
        metaTitle: "Трансфер в Лару | Аэропорт Анталия → Лара / Кунду VIP-трансфер",
        metaDescription: "VIP-трансфер из аэропорта AYT в отели Лары и Кунду. 20-30 мин., фиксированная цена, 24/7.",
        h1: "VIP трансфер в Лару и Кунду",
        intro: "Частный VIP-трансфер из аэропорта Анталии в район Лара и Кунду. Один из ближайших курортных районов — всего 20-30 минут от аэропорта.",
        whyUs: [
          "Ближайший курорт к аэропорту — 20-30 минут",
          "Встреча с табличкой у выхода из терминала",
          "Бесплатное детское кресло и Wi-Fi",
          "Фиксированная цена 24/7, без скрытых платежей",
        ],
        faqs: [
          { q: "Сколько длится трансфер в Лару?", a: "Из аэропорта Анталии в Лару — примерно 20-30 минут." },
          { q: "Вы также едете в Кунду?", a: "Да, мы обслуживаем все отели в районе Лара и Кунду." },
          { q: "Есть ли ночная наценка?", a: "Нет, одна фиксированная цена действует 24/7." },
        ],
      },
    },
  },
  {
    slug: "kemer-transfer",
    priceKey: "Kemer",
    region: "west",
    distanceKm: 55,
    durationMin: "55–70 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "55–70 dk" },
      { to: "Kemer Merkez", minutes: "5–10 dk" },
      { to: "Beldibi", minutes: "10–15 dk" },
      { to: "Göynük", minutes: "15–20 dk" },
    ],
    related: ["antalya-havalimani-transfer", "tekirova-transfer", "beldibi-transfer", "vip-transfer-antalya"],
    content: {
      tr: {
        metaTitle: "Kemer Transfer | Antalya Havalimanı → Kemer VIP Transfer",
        metaDescription: "AYT havalimanından Kemer, Beldibi ve Göynük otellerine VIP transfer. 55-70 dk, sabit fiyat, 7/24 hizmet.",
        h1: "Kemer VIP Transfer",
        intro: "Antalya Havalimanı'ndan Kemer ve çevresine özel şoförlü VIP transfer. Beldibi, Göynük, Çamyuva ve Kemer merkezindeki otellere güvenli ulaşım.",
        whyUs: [
          "Beldibi, Göynük, Çamyuva ve Kemer merkez dahil",
          "Terminal çıkışında isim panosuyla karşılama",
          "Ücretsiz bebek koltuğu ve Wi-Fi",
          "7/24 sabit fiyat, gizli masraf yok",
        ],
        faqs: [
          { q: "Kemer'e transfer ne kadar sürer?", a: "Antalya Havalimanı'ndan Kemer'e yaklaşık 55-70 dakikadır." },
          { q: "Beldibi veya Göynük'e de gidiyor musunuz?", a: "Evet, Kemer bölgesindeki tüm destinasyonlara transfer sağlıyoruz." },
          { q: "Araçta internet var mı?", a: "Evet, tüm araçlarımızda ücretsiz Wi-Fi mevcuttur." },
        ],
      },
      de: {
        metaTitle: "Kemer Transfer | Flughafen Antalya → Kemer VIP Transfer",
        metaDescription: "VIP-Transfer vom AYT Flughafen nach Kemer, Beldibi und Göynük. 55-70 Min., Festpreis, 24/7 Service.",
        h1: "Kemer VIP Transfer",
        intro: "Privater VIP-Transfer vom Flughafen Antalya nach Kemer und Umgebung. Sicherer Transport zu Hotels in Beldibi, Göynük, Çamyuva und Kemer Zentrum.",
        whyUs: [
          "Beldibi, Göynük, Çamyuva & Kemer Zentrum inklusive",
          "Empfang mit Namensschild am Terminalausgang",
          "Kostenloser Kindersitz & WLAN",
          "24/7 Festpreis, keine versteckten Kosten",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer nach Kemer?", a: "Vom Flughafen Antalya nach Kemer ca. 55-70 Minuten." },
          { q: "Fahren Sie auch nach Beldibi oder Göynük?", a: "Ja, wir bedienen alle Ziele in der Region Kemer." },
          { q: "Gibt es WLAN im Fahrzeug?", a: "Ja, kostenloses WLAN in allen unseren Fahrzeugen." },
        ],
      },
      en: {
        metaTitle: "Kemer Transfer | Antalya Airport → Kemer VIP Transfer",
        metaDescription: "VIP transfer from AYT airport to Kemer, Beldibi and Göynük hotels. 55-70 min, fixed price, 24/7 service.",
        h1: "Kemer VIP Transfer",
        intro: "Private VIP transfer from Antalya Airport to Kemer and surroundings. Safe transport to hotels in Beldibi, Göynük, Çamyuva, and Kemer centre.",
        whyUs: [
          "Covers Beldibi, Göynük, Çamyuva & Kemer centre",
          "Name-sign meet & greet at terminal exit",
          "Free child seat & Wi-Fi on board",
          "24/7 fixed pricing, no hidden fees",
        ],
        faqs: [
          { q: "How long is the transfer to Kemer?", a: "From Antalya Airport to Kemer is approximately 55-70 minutes." },
          { q: "Do you also serve Beldibi and Göynük?", a: "Yes, we cover all destinations in the Kemer region." },
          { q: "Is there Wi-Fi in the vehicle?", a: "Yes, free Wi-Fi is available in all our vehicles." },
        ],
      },
      ru: {
        metaTitle: "Трансфер в Кемер | Аэропорт Анталия → Кемер VIP-трансфер",
        metaDescription: "VIP-трансфер из аэропорта AYT в Кемер, Бельдиби и Гёйнюк. 55-70 мин., фиксированная цена, 24/7.",
        h1: "VIP трансфер в Кемер",
        intro: "Частный VIP-трансфер из аэропорта Анталии в Кемер и окрестности. Безопасная доставка в отели Бельдиби, Гёйнюк, Чамьювы и центра Кемера.",
        whyUs: [
          "Бельдиби, Гёйнюк, Чамьюва и центр Кемера",
          "Встреча с табличкой у выхода из терминала",
          "Бесплатное детское кресло и Wi-Fi",
          "Фиксированная цена 24/7, без скрытых платежей",
        ],
        faqs: [
          { q: "Сколько длится трансфер в Кемер?", a: "Из аэропорта Анталии в Кемер — примерно 55-70 минут." },
          { q: "Вы ездите в Бельдиби и Гёйнюк?", a: "Да, мы обслуживаем все направления в районе Кемера." },
          { q: "Есть ли Wi-Fi в автомобиле?", a: "Да, бесплатный Wi-Fi во всех наших автомобилях." },
        ],
      },
    },
  },
  {
    slug: "side-transfer",
    priceKey: "Side",
    region: "east",
    distanceKm: 70,
    durationMin: "60–75 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "60–75 dk" },
      { to: "Side Merkez", minutes: "5–10 dk" },
      { to: "Manavgat", minutes: "10–15 dk" },
      { to: "Titreyengöl", minutes: "10–15 dk" },
    ],
    related: ["antalya-havalimani-transfer", "gundogdu-transfer", "kizilagac-transfer", "alanya-transfer"],
    content: {
      tr: {
        metaTitle: "Side Transfer | Antalya Havalimanı → Side VIP Transfer",
        metaDescription: "AYT havalimanından Side ve Manavgat otellerine VIP transfer. 60-75 dk, sabit fiyat, uçuş takibi.",
        h1: "Side & Manavgat VIP Transfer",
        intro: "Antalya Havalimanı'ndan Side ve Manavgat bölgesine özel şoförlü VIP transfer. Antik Side şehrine ve Manavgat sahil otellerine rahat ulaşım.",
        whyUs: [
          "Side, Manavgat ve Titreyengöl dahil",
          "Terminal çıkışında isim panosuyla karşılama",
          "Ücretsiz bebek koltuğu ve Wi-Fi",
          "7/24 sabit fiyat, gizli masraf yok",
        ],
        faqs: [
          { q: "Side'ye transfer ne kadar sürer?", a: "Antalya Havalimanı'ndan Side'ye yaklaşık 60-75 dakikadır." },
          { q: "Manavgat'a da gidiyor musunuz?", a: "Evet, Side ve Manavgat bölgesindeki tüm otellere transfer yapıyoruz." },
          { q: "Grup transferi mümkün mü?", a: "Evet, 16 kişiye kadar araç seçeneklerimiz mevcuttur." },
        ],
      },
      de: {
        metaTitle: "Side Transfer | Flughafen Antalya → Side VIP Transfer",
        metaDescription: "VIP-Transfer vom AYT Flughafen nach Side und Manavgat. 60-75 Min., Festpreis, Flugverfolgung.",
        h1: "Side & Manavgat VIP Transfer",
        intro: "Privater VIP-Transfer vom Flughafen Antalya in die Region Side und Manavgat. Komfortabler Transport zur antiken Stadt Side und zu den Strandhotels von Manavgat.",
        whyUs: [
          "Side, Manavgat & Titreyengöl inklusive",
          "Empfang mit Namensschild am Terminalausgang",
          "Kostenloser Kindersitz & WLAN",
          "24/7 Festpreis, keine versteckten Kosten",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer nach Side?", a: "Vom Flughafen Antalya nach Side ca. 60-75 Minuten." },
          { q: "Fahren Sie auch nach Manavgat?", a: "Ja, wir bedienen alle Hotels in Side und Manavgat." },
          { q: "Ist Gruppentransfer möglich?", a: "Ja, wir haben Fahrzeuge für bis zu 16 Personen." },
        ],
      },
      en: {
        metaTitle: "Side Transfer | Antalya Airport → Side VIP Transfer",
        metaDescription: "VIP transfer from AYT airport to Side and Manavgat hotels. 60-75 min, fixed price, flight tracking.",
        h1: "Side & Manavgat VIP Transfer",
        intro: "Private VIP transfer from Antalya Airport to the Side and Manavgat area. Comfortable transport to the ancient city of Side and Manavgat beach hotels.",
        whyUs: [
          "Covers Side, Manavgat & Titreyengöl",
          "Name-sign meet & greet at terminal exit",
          "Free child seat & Wi-Fi on board",
          "24/7 fixed pricing, no hidden fees",
        ],
        faqs: [
          { q: "How long is the transfer to Side?", a: "From Antalya Airport to Side is approximately 60-75 minutes." },
          { q: "Do you also serve Manavgat?", a: "Yes, we cover all hotels in the Side and Manavgat area." },
          { q: "Is group transfer possible?", a: "Yes, we have vehicles for up to 16 passengers." },
        ],
      },
      ru: {
        metaTitle: "Трансфер в Сиде | Аэропорт Анталия → Сиде VIP-трансфер",
        metaDescription: "VIP-трансфер из аэропорта AYT в отели Сиде и Манавгата. 60-75 мин., фиксированная цена.",
        h1: "VIP трансфер в Сиде и Манавгат",
        intro: "Частный VIP-трансфер из аэропорта Анталии в район Сиде и Манавгат. Комфортная доставка к античному городу Сиде и пляжным отелям Манавгата.",
        whyUs: [
          "Сиде, Манавгат и Титреенгёль",
          "Встреча с табличкой у выхода из терминала",
          "Бесплатное детское кресло и Wi-Fi",
          "Фиксированная цена 24/7, без скрытых платежей",
        ],
        faqs: [
          { q: "Сколько длится трансфер в Сиде?", a: "Из аэропорта Анталии в Сиде — примерно 60-75 минут." },
          { q: "Вы ездите в Манавгат?", a: "Да, мы обслуживаем все отели района Сиде и Манавгат." },
          { q: "Возможен ли групповой трансфер?", a: "Да, у нас есть автомобили до 16 пассажиров." },
        ],
      },
    },
  },
  {
    slug: "alanya-transfer",
    priceKey: "Alanya",
    region: "east",
    distanceKm: 130,
    durationMin: "120–140 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "120–140 dk" },
      { to: "Alanya Merkez", minutes: "5–10 dk" },
      { to: "Mahmutlar", minutes: "15–20 dk" },
      { to: "Okurcalar", minutes: "20–30 dk" },
    ],
    related: ["antalya-havalimani-transfer", "okurcalar-transfer", "konakli-transfer", "side-transfer"],
    content: {
      tr: {
        metaTitle: "Alanya Transfer | Antalya Havalimanı → Alanya VIP Transfer",
        metaDescription: "AYT havalimanından Alanya'ya VIP transfer. 120-140 dk, sabit fiyat, uçuş takibi, 7/24 hizmet.",
        h1: "Alanya VIP Transfer",
        intro: "Antalya Havalimanı'ndan Alanya'ya ve çevresine özel şoförlü VIP transfer. Mahmutlar, Okurcalar ve Alanya merkezindeki otellere güvenli ve konforlu ulaşım.",
        whyUs: [
          "Alanya, Mahmutlar ve Okurcalar dahil",
          "Uzun yolculukta konforlu araçlar",
          "Ücretsiz bebek koltuğu ve Wi-Fi",
          "7/24 sabit fiyat, gizli masraf yok",
        ],
        faqs: [
          { q: "Alanya'ya transfer ne kadar sürer?", a: "Antalya Havalimanı'ndan Alanya'ya yaklaşık 2 saat (120-140 dk) sürer." },
          { q: "Mahmutlar'a da transfer var mı?", a: "Evet, Alanya bölgesindeki tüm destinasyonlara transfer sağlıyoruz." },
          { q: "Uzun yolda mola veriyor musunuz?", a: "Talep üzerine kısa mola imkanı sunabiliriz." },
        ],
      },
      de: {
        metaTitle: "Alanya Transfer | Flughafen Antalya → Alanya VIP Transfer",
        metaDescription: "VIP-Transfer vom AYT Flughafen nach Alanya. 120-140 Min., Festpreis, Flugverfolgung, 24/7 Service.",
        h1: "Alanya VIP Transfer",
        intro: "Privater VIP-Transfer vom Flughafen Antalya nach Alanya und Umgebung. Sicherer und komfortabler Transport nach Mahmutlar, Okurcalar und Alanya Zentrum.",
        whyUs: [
          "Alanya, Mahmutlar & Okurcalar inklusive",
          "Komfortable Fahrzeuge für lange Strecken",
          "Kostenloser Kindersitz & WLAN",
          "24/7 Festpreis, keine versteckten Kosten",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer nach Alanya?", a: "Vom Flughafen Antalya nach Alanya ca. 2 Stunden (120-140 Min.)." },
          { q: "Fahren Sie auch nach Mahmutlar?", a: "Ja, wir bedienen alle Ziele in der Region Alanya." },
          { q: "Gibt es eine Pause bei langen Fahrten?", a: "Auf Wunsch bieten wir eine kurze Pause an." },
        ],
      },
      en: {
        metaTitle: "Alanya Transfer | Antalya Airport → Alanya VIP Transfer",
        metaDescription: "VIP transfer from AYT airport to Alanya. 120-140 min, fixed price, flight tracking, 24/7 service.",
        h1: "Alanya VIP Transfer",
        intro: "Private VIP transfer from Antalya Airport to Alanya and surroundings. Safe and comfortable transport to Mahmutlar, Okurcalar, and Alanya centre hotels.",
        whyUs: [
          "Covers Alanya, Mahmutlar & Okurcalar",
          "Comfortable vehicles for long-distance travel",
          "Free child seat & Wi-Fi on board",
          "24/7 fixed pricing, no hidden fees",
        ],
        faqs: [
          { q: "How long is the transfer to Alanya?", a: "From Antalya Airport to Alanya is approximately 2 hours (120-140 min)." },
          { q: "Do you also go to Mahmutlar?", a: "Yes, we cover all destinations in the Alanya region." },
          { q: "Is there a stop on long journeys?", a: "We can offer a short break on request." },
        ],
      },
      ru: {
        metaTitle: "Трансфер в Аланию | Аэропорт Анталия → Алания VIP-трансфер",
        metaDescription: "VIP-трансфер из аэропорта AYT в Аланию. 120-140 мин., фиксированная цена, 24/7.",
        h1: "VIP трансфер в Аланию",
        intro: "Частный VIP-трансфер из аэропорта Анталии в Аланию и окрестности. Безопасная и комфортная доставка в Махмутлар, Окурджалар и центр Алании.",
        whyUs: [
          "Алания, Махмутлар и Окурджалар",
          "Комфортные автомобили для дальних поездок",
          "Бесплатное детское кресло и Wi-Fi",
          "Фиксированная цена 24/7, без скрытых платежей",
        ],
        faqs: [
          { q: "Сколько длится трансфер в Аланию?", a: "Из аэропорта Анталии в Аланию — примерно 2 часа (120-140 мин)." },
          { q: "Вы ездите в Махмутлар?", a: "Да, мы обслуживаем все направления в районе Алании." },
          { q: "Есть ли остановка на длинном маршруте?", a: "По запросу мы можем сделать короткую остановку." },
        ],
      },
    },
  },
  {
    slug: "tekirova-transfer",
    priceKey: "Tekirova",
    region: "west",
    distanceKm: 75,
    durationMin: "80–95 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "80–95 dk" },
      { to: "Kemer Merkez", minutes: "20–30 dk" },
      { to: "Çamyuva", minutes: "10–15 dk" },
    ],
    related: ["kemer-transfer", "beldibi-transfer", "antalya-havalimani-transfer"],
    content: {
      tr: {
        metaTitle: "Tekirova Transfer | Antalya Havalimanı → Tekirova VIP Transfer",
        metaDescription: "AYT havalimanından Tekirova otellerine VIP transfer. Uzun rota için konforlu araçlar, canlı teklif, 7/24 operasyon.",
        h1: "Tekirova VIP Transfer",
        intro: "Antalya Havalimanı'ndan Tekirova'ya özel şoförlü VIP transfer ile resort bölgesine kesintisiz ulaşın. Özellikle uzun mesafe operasyonlarında zamanlama ve konfor odaklı planlama yapıyoruz.",
        whyUs: [
          "Tekirova rotasında uzun yol konforuna uygun VIP araçlar",
          "Uçuş takibine göre canlı karşılama planı",
          "Rota + servis tipi + paket bazlı şeffaf teklif",
          "Online ödeme yok, rezervasyon sonrası operasyon teyidi",
        ],
        faqs: [
          { q: "Tekirova transfer süresi ne kadar?", a: "Trafik ve uçuş saatine bağlı olarak ortalama 80-95 dakika sürer." },
          { q: "Gece inişlerinde transfer yapılır mı?", a: "Evet, 7/24 operasyonla gece varışlarında da karşılama sağlıyoruz." },
          { q: "Dönüş transferini de aynı anda planlayabilir miyim?", a: "Evet, gidiş-dönüş transferinizi aynı rezervasyon sürecinde planlayabilirsiniz." },
        ],
      },
      de: {
        metaTitle: "Tekirova Transfer | Flughafen Antalya → Tekirova VIP Transfer",
        metaDescription: "VIP-Transfer vom Flughafen AYT nach Tekirova. Komfortable Fahrzeuge für lange Strecke, Live-Angebot, 24/7 Betrieb.",
        h1: "Tekirova VIP Transfer",
        intro: "Mit unserem privaten VIP-Transfer vom Flughafen Antalya nach Tekirova erreichen Sie Ihr Resort ohne Umwege. Gerade auf längeren Strecken planen wir Abholung und Komfort besonders präzise.",
        whyUs: [
          "VIP-Fahrzeuge für komfortable Langstrecke nach Tekirova",
          "Live-Abholplanung mit Flugverfolgung",
          "Transparentes Angebot nach Route + Service-Typ + Paket",
          "Keine Online-Zahlung, finale Bestätigung durch Operationsteam",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer nach Tekirova?", a: "Je nach Verkehr und Ankunftszeit etwa 80-95 Minuten." },
          { q: "Fahren Sie auch bei Nachtankünften?", a: "Ja, wir arbeiten 24/7 und bedienen auch späte Ankünfte." },
          { q: "Kann ich Hin- und Rückfahrt gemeinsam buchen?", a: "Ja, Hin- und Rücktransfer können im selben Ablauf geplant werden." },
        ],
      },
      en: {
        metaTitle: "Tekirova Transfer | Antalya Airport → Tekirova VIP Transfer",
        metaDescription: "VIP transfer from AYT airport to Tekirova resorts. Comfortable long-route service, live quote logic, 24/7 operations.",
        h1: "Tekirova VIP Transfer",
        intro: "Travel from Antalya Airport to Tekirova with a private VIP transfer designed for resort arrivals. For this longer corridor, we focus on timing reliability and onboard comfort.",
        whyUs: [
          "Comfort-focused VIP vehicles for the Tekirova long route",
          "Flight-tracked pickup coordination",
          "Transparent quote based on route + service type + package",
          "No online payment, final confirmation by operations team",
        ],
        faqs: [
          { q: "How long is the transfer to Tekirova?", a: "Typically around 80-95 minutes depending on traffic and arrival time." },
          { q: "Do you operate for late-night arrivals?", a: "Yes, our transfer operation runs 24/7 including late arrivals." },
          { q: "Can I arrange return transfer together?", a: "Yes, outbound and return legs can be planned in one booking flow." },
        ],
      },
      ru: {
        metaTitle: "Трансфер в Текирову | Аэропорт Анталия → Текирова VIP-трансфер",
        metaDescription: "VIP-трансфер из аэропорта AYT в Текирову. Комфорт на длинном маршруте, онлайн-расчет, работа 24/7.",
        h1: "VIP трансфер в Текирову",
        intro: "Частный VIP-трансфер из аэропорта Анталии в Текирову подходит для комфортного заезда в отели курортной зоны. На длинном маршруте мы делаем акцент на точной подаче и удобстве поездки.",
        whyUs: [
          "Комфортные VIP-автомобили для длинного маршрута",
          "Встреча с учетом отслеживания рейса",
          "Прозрачный расчет по маршруту, типу сервиса и пакету",
          "Без онлайн-оплаты, финальное подтверждение от операционного отдела",
        ],
        faqs: [
          { q: "Сколько длится трансфер в Текирову?", a: "В среднем 80-95 минут в зависимости от трафика и времени прилета." },
          { q: "Работаете ли вы ночью?", a: "Да, трансферы выполняются круглосуточно, включая поздние прилеты." },
          { q: "Можно ли сразу оформить обратный трансфер?", a: "Да, поездку туда и обратно можно согласовать в одном бронировании." },
        ],
      },
    },
  },
  {
    slug: "beldibi-transfer",
    priceKey: "Beldibi",
    region: "west",
    distanceKm: 45,
    durationMin: "50–65 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "50–65 dk" },
      { to: "Kemer", minutes: "15–25 dk" },
      { to: "Göynük", minutes: "10–15 dk" },
    ],
    related: ["kemer-transfer", "tekirova-transfer", "antalya-havalimani-transfer"],
    content: {
      tr: {
        metaTitle: "Beldibi Transfer | Antalya Havalimanı → Beldibi VIP Transfer",
        metaDescription: "AYT havalimanından Beldibi otellerine VIP transfer. Kemer koridorunda hızlı planlama, canlı teklif ve 7/24 destek.",
        h1: "Beldibi VIP Transfer",
        intro: "Antalya Havalimanı'ndan Beldibi'ne özel şoförlü transfer ile Kemer hattına dengeli süre ve konforla ulaşın. Otel check-in saatine göre operasyonu önceden planlıyoruz.",
        whyUs: [
          "Beldibi otelleri için doğrudan transfer operasyonu",
          "Uçuş saatinize göre optimize edilen buluşma planı",
          "Canlı teklif: rota + servis tipi + paket modeli",
          "Online ödeme yok, operasyon ekibinden net teyit",
        ],
        faqs: [
          { q: "Beldibi transferi ne kadar sürer?", a: "Genellikle 50-65 dakika aralığında tamamlanır." },
          { q: "Kemer ve Beldibi aynı transfer hattında mı?", a: "Evet, Kemer bölgesi operasyonunda Beldibi önemli bir duraktır." },
          { q: "Aile rezervasyonlarında çocuk koltuğu sağlanıyor mu?", a: "Evet, talep edildiğinde çocuk koltuğu planlamaya dahil edilir." },
        ],
      },
      de: {
        metaTitle: "Beldibi Transfer | Flughafen Antalya → Beldibi VIP Transfer",
        metaDescription: "VIP-Transfer vom Flughafen AYT nach Beldibi. Effiziente Planung im Kemer-Korridor, Live-Angebot und 24/7 Support.",
        h1: "Beldibi VIP Transfer",
        intro: "Mit unserem privaten Transfer vom Flughafen Antalya nach Beldibi reisen Sie komfortabel in die Kemer-Region. Die Abholung wird passend zu Ihrer Hotel-Ankunftszeit geplant.",
        whyUs: [
          "Direkte Transfers zu Hotels in Beldibi",
          "Treffpunktplanung nach Ihrer Flugzeit",
          "Live-Angebot nach Route + Service-Typ + Paket",
          "Keine Online-Zahlung, klare Bestätigung durch Operations",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer nach Beldibi?", a: "In der Regel etwa 50-65 Minuten." },
          { q: "Liegt Beldibi im gleichen Korridor wie Kemer?", a: "Ja, Beldibi gehört operativ zum Kemer-Korridor." },
          { q: "Gibt es Kindersitz-Optionen für Familien?", a: "Ja, Kindersitze können bei der Planung berücksichtigt werden." },
        ],
      },
      en: {
        metaTitle: "Beldibi Transfer | Antalya Airport → Beldibi VIP Transfer",
        metaDescription: "VIP transfer from AYT airport to Beldibi hotels. Efficient Kemer-corridor routing, live quote model, 24/7 support.",
        h1: "Beldibi VIP Transfer",
        intro: "Reach Beldibi from Antalya Airport with a private VIP transfer tuned for resort arrivals on the Kemer corridor. Pickup timing is planned around your check-in window.",
        whyUs: [
          "Direct transfers to Beldibi hotels",
          "Pickup timing aligned with your flight",
          "Live quote model: route + service type + package",
          "No online payment, clear post-booking confirmation",
        ],
        faqs: [
          { q: "How long is the transfer to Beldibi?", a: "Usually around 50-65 minutes." },
          { q: "Is Beldibi on the same corridor as Kemer?", a: "Yes, operationally it is part of the Kemer transfer corridor." },
          { q: "Can family bookings include child seat planning?", a: "Yes, child seat requests can be included in booking details." },
        ],
      },
      ru: {
        metaTitle: "Трансфер в Бельдиби | Аэропорт Анталия → Бельдиби VIP-трансфер",
        metaDescription: "VIP-трансфер из аэропорта AYT в Бельдиби. Удобный маршрут по коридору Кемера, онлайн-расчет, поддержка 24/7.",
        h1: "VIP трансфер в Бельдиби",
        intro: "Частный VIP-трансфер из аэропорта Анталии в Бельдиби обеспечивает комфортный заезд в отели на направлении Кемера. Время подачи согласуется с вашим прилетом и заселением.",
        whyUs: [
          "Прямые трансферы в отели Бельдиби",
          "Планирование встречи по времени рейса",
          "Прозрачный расчет: маршрут + тип сервиса + пакет",
          "Без онлайн-оплаты, финальное подтверждение от операций",
        ],
        faqs: [
          { q: "Сколько длится трансфер в Бельдиби?", a: "Обычно около 50-65 минут." },
          { q: "Бельдиби относится к направлению Кемера?", a: "Да, это часть операционного коридора Кемера." },
          { q: "Можно ли указать детское кресло?", a: "Да, запрос на детское кресло можно добавить при бронировании." },
        ],
      },
    },
  },
  {
    slug: "gundogdu-transfer",
    priceKey: "Gündoğdu",
    region: "east",
    distanceKm: 62,
    durationMin: "65–80 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "65–80 dk" },
      { to: "Side", minutes: "10–15 dk" },
      { to: "Çolaklı", minutes: "5–10 dk" },
    ],
    related: ["side-transfer", "kizilagac-transfer", "belek-transfer"],
    content: {
      tr: {
        metaTitle: "Gündoğdu Transfer | Antalya Havalimanı → Gündoğdu VIP Transfer",
        metaDescription: "AYT havalimanından Gündoğdu resort bölgesine VIP transfer. Side hattında canlı teklif, doğru rota planı, 7/24 operasyon.",
        h1: "Gündoğdu VIP Transfer",
        intro: "Antalya Havalimanı'ndan Gündoğdu'ya özel VIP transfer ile Side bölgesindeki resort otellere zamanında ulaşın. Özellikle yoğun giriş-çıkış saatlerinde rota planlamasını önceliklendiriyoruz.",
        whyUs: [
          "Gündoğdu ve Side resort bölgesi için hedefli transfer",
          "Yoğun saatlerde gecikmeyi azaltan rota planı",
          "Canlı teklif sistemiyle net fiyat görünürlüğü",
          "Online ödeme yok, operasyon ekibinden rezervasyon teyidi",
        ],
        faqs: [
          { q: "Gündoğdu'ya transfer ne kadar sürer?", a: "Genellikle 65-80 dakika aralığında tamamlanır." },
          { q: "Side otellerine de aynı rezervasyonla ulaşım olur mu?", a: "Evet, Side-Gündoğdu hattındaki oteller için aynı operasyon yapısı kullanılır." },
          { q: "Uçuş gecikirse transfer yanar mı?", a: "Hayır, uçuş bilgisi takip edilerek karşılama saatiniz güncellenir." },
        ],
      },
      de: {
        metaTitle: "Gündoğdu Transfer | Flughafen Antalya → Gündoğdu VIP Transfer",
        metaDescription: "VIP-Transfer vom Flughafen AYT nach Gündoğdu. Live-Angebot im Side-Korridor, saubere Routenplanung, 24/7 Betrieb.",
        h1: "Gündoğdu VIP Transfer",
        intro: "Mit unserem privaten VIP-Transfer vom Flughafen Antalya nach Gündoğdu erreichen Sie die Resorts im Side-Gebiet zuverlässig. Besonders in Spitzenzeiten optimieren wir die Fahrtroute vorab.",
        whyUs: [
          "Zielgerichteter Transfer für Gündoğdu und Side-Resorts",
          "Routenplanung zur Reduktion von Verzögerungen",
          "Transparente Preise über das Live-Angebotsmodell",
          "Keine Online-Zahlung, verbindliche Bestätigung durch Operations",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer nach Gündoğdu?", a: "Meist zwischen 65 und 80 Minuten." },
          { q: "Ist Side über dieselbe Buchung möglich?", a: "Ja, die Side-Gündoğdu Region läuft unter derselben Operationsstruktur." },
          { q: "Was passiert bei Flugverspätung?", a: "Wir aktualisieren die Abholung anhand der Flugzeiten." },
        ],
      },
      en: {
        metaTitle: "Gündoğdu Transfer | Antalya Airport → Gündoğdu VIP Transfer",
        metaDescription: "VIP transfer from AYT airport to Gündoğdu resorts. Side-corridor live quote, practical routing, 24/7 operations.",
        h1: "Gündoğdu VIP Transfer",
        intro: "Use our private VIP transfer from Antalya Airport to Gündoğdu for reliable arrival to the Side resort belt. We prioritize route planning for peak arrival windows.",
        whyUs: [
          "Targeted transfer flow for Gündoğdu and Side resorts",
          "Route planning that reduces peak-time delays",
          "Clear pricing visibility through live quote logic",
          "No online payment, booking confirmation by operations",
        ],
        faqs: [
          { q: "How long is transfer to Gündoğdu?", a: "Usually around 65-80 minutes." },
          { q: "Can Side hotels be handled in the same flow?", a: "Yes, Side and Gündoğdu are handled within the same transfer corridor." },
          { q: "What if my flight is delayed?", a: "Pickup timing is adjusted using flight tracking." },
        ],
      },
      ru: {
        metaTitle: "Трансфер в Гюндогду | Аэропорт Анталия → Гюндогду VIP-трансфер",
        metaDescription: "VIP-трансфер из аэропорта AYT в Гюндогду. Направление Сиде, прозрачный расчет, круглосуточная операция.",
        h1: "VIP трансфер в Гюндогду",
        intro: "Частный VIP-трансфер из аэропорта Анталии в Гюндогду подходит для удобного заезда в отели курортной линии Сиде. На пиковых заездах заранее выстраивается оптимальный маршрут.",
        whyUs: [
          "Целевой трансфер для зоны Гюндогду и Сиде",
          "Маршрутная оптимизация в часы высокой загрузки",
          "Прозрачный онлайн-расчет по коммерческой модели",
          "Без онлайн-оплаты, подтверждение от операционного отдела",
        ],
        faqs: [
          { q: "Сколько длится трансфер в Гюндогду?", a: "Обычно 65-80 минут." },
          { q: "Можно ли в том же потоке оформить Сиде?", a: "Да, Гюндогду и Сиде обслуживаются в одном коридоре." },
          { q: "Что при задержке рейса?", a: "Время подачи корректируется по данным отслеживания рейса." },
        ],
      },
    },
  },
  {
    slug: "kizilagac-transfer",
    priceKey: "Kızılağaç",
    region: "east",
    distanceKm: 82,
    durationMin: "80–95 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "80–95 dk" },
      { to: "Manavgat", minutes: "15–20 dk" },
      { to: "Side", minutes: "20–30 dk" },
    ],
    related: ["side-transfer", "gundogdu-transfer", "okurcalar-transfer"],
    content: {
      tr: {
        metaTitle: "Kızılağaç Transfer | Antalya Havalimanı → Kızılağaç VIP Transfer",
        metaDescription: "AYT havalimanından Kızılağaç otellerine VIP transfer. Manavgat hattında güvenilir operasyon, canlı teklif, 7/24 destek.",
        h1: "Kızılağaç VIP Transfer",
        intro: "Kızılağaç bölgesine havalimanı transferinde özel şoförlü VIP seçeneklerle kesintisiz ulaşım sunuyoruz. Manavgat-Side koridorunda rota ve varış saati yönetimini ön planda tutuyoruz.",
        whyUs: [
          "Kızılağaç resort bölgesi için planlı transfer yapısı",
          "Uzun rota için operasyonel zaman yönetimi",
          "Rota + servis tipi + paket bazında canlı teklif",
          "Online ödeme yok, teyit sonrası net operasyon akışı",
        ],
        faqs: [
          { q: "Kızılağaç transferi kaç dakika sürer?", a: "Ortalama 80-95 dakika aralığında sürer." },
          { q: "Manavgat bölgesindeki otellere de hizmet veriyor musunuz?", a: "Evet, Kızılağaç ve Manavgat çevresindeki otellerde aktif operasyonumuz var." },
          { q: "Dönüşte erken saat transferi planlanabilir mi?", a: "Evet, dönüş transferleri uçuş saatine göre önceden planlanır." },
        ],
      },
      de: {
        metaTitle: "Kızılağaç Transfer | Flughafen Antalya → Kızılağaç VIP Transfer",
        metaDescription: "VIP-Transfer vom Flughafen AYT nach Kızılağaç. Zuverlässige Operation im Manavgat-Korridor, Live-Angebot, 24/7 Support.",
        h1: "Kızılağaç VIP Transfer",
        intro: "Für Transfers nach Kızılağaç bieten wir private VIP-Fahrten mit stabiler Ablaufplanung. Im Manavgat-Side Korridor priorisieren wir eine präzise Steuerung von Route und Ankunft.",
        whyUs: [
          "Geplante Transfers speziell für Kızılağaç-Resorts",
          "Zeitmanagement für längere Fahrtrouten",
          "Live-Angebot nach Route + Service-Typ + Paket",
          "Keine Online-Zahlung, klare Ablaufbestätigung nach Buchung",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer nach Kızılağaç?", a: "Im Schnitt etwa 80-95 Minuten." },
          { q: "Bedienen Sie auch Hotels in Manavgat?", a: "Ja, wir sind in Kızılağaç und der Manavgat-Region operativ aktiv." },
          { q: "Kann ein sehr früher Rücktransfer geplant werden?", a: "Ja, Rücktransfers werden anhand Ihrer Abflugzeit vorgeplant." },
        ],
      },
      en: {
        metaTitle: "Kızılağaç Transfer | Antalya Airport → Kızılağaç VIP Transfer",
        metaDescription: "VIP transfer from AYT airport to Kızılağaç hotels. Reliable Manavgat corridor operations, live quote pricing, 24/7 support.",
        h1: "Kızılağaç VIP Transfer",
        intro: "For Kızılağaç arrivals, we provide private VIP transfer service with reliable route execution. On the Manavgat-Side corridor, timing control is a core operational priority.",
        whyUs: [
          "Planned transfer operation for Kızılağaç resort area",
          "Long-route timing discipline",
          "Live quote model by route + service type + package",
          "No online payment, clear post-booking confirmation",
        ],
        faqs: [
          { q: "How long is transfer to Kızılağaç?", a: "Typically around 80-95 minutes." },
          { q: "Do you serve Manavgat hotels as well?", a: "Yes, we actively serve Kızılağaç and nearby Manavgat properties." },
          { q: "Can very early return pickups be arranged?", a: "Yes, return transfers are planned according to your departure schedule." },
        ],
      },
      ru: {
        metaTitle: "Трансфер в Кызылагач | Аэропорт Анталия → Кызылагач VIP-трансфер",
        metaDescription: "VIP-трансфер из аэропорта AYT в Кызылагач. Надежная работа по коридору Манавгат, прозрачный расчет, поддержка 24/7.",
        h1: "VIP трансфер в Кызылагач",
        intro: "Для заезда в Кызылагач мы предлагаем частный VIP-трансфер с устойчивой операционной логикой. На направлении Манавгат-Сиде особое внимание уделяется точному времени подачи.",
        whyUs: [
          "Плановый трансфер для курортной зоны Кызылагач",
          "Контроль времени на длинном маршруте",
          "Прозрачный расчет по маршруту, типу сервиса и пакету",
          "Без онлайн-оплаты, подтверждение после брони",
        ],
        faqs: [
          { q: "Сколько длится трансфер в Кызылагач?", a: "Обычно около 80-95 минут." },
          { q: "Вы обслуживаете отели Манавгата?", a: "Да, мы работаем по Кызылагачу и прилегающей зоне Манавгата." },
          { q: "Можно ли запланировать очень ранний обратный выезд?", a: "Да, обратный трансфер строится по вашему графику вылета." },
        ],
      },
    },
  },
  {
    slug: "okurcalar-transfer",
    priceKey: "Okurcalar",
    region: "east",
    distanceKm: 95,
    durationMin: "95–110 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "95–110 dk" },
      { to: "Alanya", minutes: "25–35 dk" },
      { to: "Avsallar", minutes: "10–15 dk" },
    ],
    related: ["alanya-transfer", "konakli-transfer", "kizilagac-transfer"],
    content: {
      tr: {
        metaTitle: "Okurcalar Transfer | Antalya Havalimanı → Okurcalar VIP Transfer",
        metaDescription: "AYT havalimanından Okurcalar otellerine VIP transfer. Alanya batı hattında canlı teklif, konforlu uzun yol ve 7/24 destek.",
        h1: "Okurcalar VIP Transfer",
        intro: "Okurcalar bölgesine havalimanı transferini uzun yol konforu ve operasyon güvenilirliği ile planlıyoruz. Alanya batı hattında özellikle varış saatine duyarlı bir akış kuruyoruz.",
        whyUs: [
          "Okurcalar resortleri için hedefli transfer",
          "Uzun mesafede konfor odaklı araç seçimi",
          "Canlı teklif modeliyle şeffaf fiyatlama",
          "Online ödeme yok, rezervasyon sonrası operasyon teyidi",
        ],
        faqs: [
          { q: "Okurcalar transfer süresi ne kadar?", a: "Genellikle 95-110 dakika aralığında sürer." },
          { q: "Alanya merkez için de aynı sistem kullanılıyor mu?", a: "Evet, Alanya hattı için benzer planlama modeli kullanıyoruz." },
          { q: "Paket farkları nasıl yansıyor?", a: "Teklifte servis tipi ve paket seçimine göre farklar canlı olarak hesaplanır." },
        ],
      },
      de: {
        metaTitle: "Okurcalar Transfer | Flughafen Antalya → Okurcalar VIP Transfer",
        metaDescription: "VIP-Transfer vom Flughafen AYT nach Okurcalar. Live-Angebot im westlichen Alanya-Korridor, komfortable Langstrecke, 24/7 Support.",
        h1: "Okurcalar VIP Transfer",
        intro: "Wir planen den Flughafentransfer nach Okurcalar mit Fokus auf Langstreckenkomfort und stabile Operations. Für den westlichen Alanya-Korridor ist eine präzise Ankunftssteuerung entscheidend.",
        whyUs: [
          "Zielgerichtete Transfers für Okurcalar-Resorts",
          "Komfortorientierte Fahrzeugwahl für lange Strecke",
          "Transparente Preislogik durch Live-Angebote",
          "Keine Online-Zahlung, verbindliche Bestätigung nach Buchung",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer nach Okurcalar?", a: "Meist etwa 95-110 Minuten." },
          { q: "Gilt das gleiche System auch für Alanya Zentrum?", a: "Ja, der Alanya-Korridor folgt derselben Planungslogik." },
          { q: "Wie werden Paketunterschiede berechnet?", a: "Im Angebot werden Service-Typ und Paket live eingerechnet." },
        ],
      },
      en: {
        metaTitle: "Okurcalar Transfer | Antalya Airport → Okurcalar VIP Transfer",
        metaDescription: "VIP transfer from AYT airport to Okurcalar hotels. West-Alanya corridor live quote model, long-route comfort, 24/7 support.",
        h1: "Okurcalar VIP Transfer",
        intro: "Airport transfer to Okurcalar is managed with long-route comfort and reliable operations. On the west Alanya corridor, arrival-time precision is part of the service design.",
        whyUs: [
          "Targeted transfer operations for Okurcalar resorts",
          "Comfort-oriented vehicle setup for long routes",
          "Transparent pricing through live quote model",
          "No online payment, confirmed by operations after booking",
        ],
        faqs: [
          { q: "How long is transfer to Okurcalar?", a: "Typically around 95-110 minutes." },
          { q: "Is the same model used for Alanya centre?", a: "Yes, the broader Alanya corridor uses the same planning model." },
          { q: "How are package differences reflected?", a: "Service type and package differences are calculated live in the quote." },
        ],
      },
      ru: {
        metaTitle: "Трансфер в Окурджалар | Аэропорт Анталия → Окурджалар VIP-трансфер",
        metaDescription: "VIP-трансфер из аэропорта AYT в Окурджалар. Коридор западной Алании, прозрачный расчет, комфорт на длинном маршруте.",
        h1: "VIP трансфер в Окурджалар",
        intro: "Трансфер из аэропорта в Окурджалар организуется с упором на комфорт дальней поездки и надежную операцию. Для западного направления Алании критично точное время прибытия.",
        whyUs: [
          "Целевые трансферы для отелей Окурджалара",
          "Комфортная конфигурация поездки на длинной дистанции",
          "Прозрачная стоимость через модель онлайн-расчета",
          "Без онлайн-оплаты, подтверждение после оформления",
        ],
        faqs: [
          { q: "Сколько длится трансфер в Окурджалар?", a: "Обычно около 95-110 минут." },
          { q: "Для центра Алании действует та же логика?", a: "Да, на всем направлении Алании используется единая схема планирования." },
          { q: "Как учитываются отличия пакетов?", a: "Разница по типу сервиса и пакету рассчитывается в живом расчете." },
        ],
      },
    },
  },
  {
    slug: "konakli-transfer",
    priceKey: "Konaklı",
    region: "east",
    distanceKm: 115,
    durationMin: "110–125 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "110–125 dk" },
      { to: "Alanya Merkez", minutes: "15–20 dk" },
      { to: "Türkler", minutes: "10–15 dk" },
    ],
    related: ["alanya-transfer", "okurcalar-transfer", "side-transfer"],
    content: {
      tr: {
        metaTitle: "Konaklı Transfer | Antalya Havalimanı → Konaklı VIP Transfer",
        metaDescription: "AYT havalimanından Konaklı otellerine VIP transfer. Alanya yakın çevresi için canlı teklif modeli, 7/24 güvenilir operasyon.",
        h1: "Konaklı VIP Transfer",
        intro: "Konaklı'ya transfer taleplerinde Alanya yakın çevresine uygun operasyon planı sunuyoruz. Uzun mesafe havalimanı transferinde canlı teklif ve net varış planı ile çalışıyoruz.",
        whyUs: [
          "Konaklı ve Alanya yakın çevresine odaklı operasyon",
          "Uzun rota için zamanlama ve karşılama optimizasyonu",
          "Canlı teklifte paket farklarının şeffaf gösterimi",
          "Online ödeme yok, rezervasyon sonrası net teyit süreci",
        ],
        faqs: [
          { q: "Konaklı transferi ne kadar sürer?", a: "Ortalama 110-125 dakika aralığındadır." },
          { q: "Konaklı ve Alanya merkez arası transfer planlanabilir mi?", a: "Evet, bölge içi talepler için ek planlama yapılabilir." },
          { q: "Maybach paketi fiyatı nasıl etkiler?", a: "Standart teklif üzerine Maybach paketi için +10 EUR eklenir." },
        ],
      },
      de: {
        metaTitle: "Konaklı Transfer | Flughafen Antalya → Konaklı VIP Transfer",
        metaDescription: "VIP-Transfer vom Flughafen AYT nach Konaklı. Live-Angebotsmodell für die Alanya-Umgebung, 24/7 verlässliche Operation.",
        h1: "Konaklı VIP Transfer",
        intro: "Für Konaklı-Transfers bieten wir eine auf die Alanya-Umgebung abgestimmte Operationsplanung. Auf der langen Flughafentransferstrecke kombinieren wir Live-Angebot und klare Ankunftssteuerung.",
        whyUs: [
          "Operativer Fokus auf Konaklı und Alanya-Umgebung",
          "Zeit- und Empfangsoptimierung für lange Route",
          "Transparente Paketdifferenzen im Live-Angebot",
          "Keine Online-Zahlung, klare Bestätigung nach Buchung",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer nach Konaklı?", a: "Im Schnitt etwa 110-125 Minuten." },
          { q: "Kann Konaklı mit Alanya Zentrum kombiniert werden?", a: "Ja, regionale Zusatzplanung ist möglich." },
          { q: "Wie beeinflusst das Maybach-Paket den Preis?", a: "Auf das Standardangebot werden fuer Maybach +10 EUR berechnet." },
        ],
      },
      en: {
        metaTitle: "Konaklı Transfer | Antalya Airport → Konaklı VIP Transfer",
        metaDescription: "VIP transfer from AYT airport to Konaklı hotels. Live quote model for the Alanya vicinity, 24/7 reliable operations.",
        h1: "Konaklı VIP Transfer",
        intro: "For Konaklı arrivals, we run a transfer plan aligned with the wider Alanya area. On this longer airport route, live quote transparency and timing control are both prioritized.",
        whyUs: [
          "Operations focused on Konaklı and nearby Alanya belt",
          "Timing and meet-point optimization on long routes",
          "Clear package differentials in live quote display",
          "No online payment, clear post-booking confirmation",
        ],
        faqs: [
          { q: "How long is transfer to Konaklı?", a: "On average around 110-125 minutes." },
          { q: "Can Konaklı and Alanya centre be planned together?", a: "Yes, regional planning can include both locations." },
          { q: "How does Maybach package affect quote?", a: "Maybach adds +10 EUR on top of the standard quote." },
        ],
      },
      ru: {
        metaTitle: "Трансфер в Конаклы | Аэропорт Анталия → Конаклы VIP-трансфер",
        metaDescription: "VIP-трансфер из аэропорта AYT в Конаклы. Онлайн-расчет для зоны Алании, надежная операция 24/7.",
        h1: "VIP трансфер в Конаклы",
        intro: "Для поездок в Конаклы мы используем операционную схему, адаптированную под зону Алании. На длинном маршруте из аэропорта приоритетом остаются прозрачный расчет и точная подача.",
        whyUs: [
          "Фокус на Конаклы и прилегающий пояс Алании",
          "Оптимизация времени и точки встречи на длинном маршруте",
          "Понятное отображение различий пакетов в расчете",
          "Без онлайн-оплаты, четкое подтверждение после брони",
        ],
        faqs: [
          { q: "Сколько длится трансфер в Конаклы?", a: "В среднем около 110-125 минут." },
          { q: "Можно ли совместить Конаклы и центр Алании?", a: "Да, по запросу возможно объединенное планирование по району." },
          { q: "Как пакет Maybach влияет на стоимость?", a: "Для пакета Maybach к стандартному расчету добавляется +10 EUR." },
        ],
      },
    },
  },
  {
    slug: "vip-transfer-antalya",
    priceKey: "Antalya City Center",
    region: "central",
    distanceKm: 12,
    durationMin: "15–25 dk",
    distances: [
      { to: "Antalya Havalimanı", minutes: "15–25 dk" },
      { to: "Kaleiçi / Old Town", minutes: "20–30 dk" },
      { to: "Lara / Kundu", minutes: "15–25 dk" },
    ],
    related: ["antalya-havalimani-transfer", "lara-transfer", "belek-transfer"],
    content: {
      tr: {
        metaTitle: "VIP Transfer Antalya | Özel Şoför & Havalimanı Transferi",
        metaDescription: "Antalya şehir içi ve havalimanı VIP transfer. Kaleiçi, merkez, Lara bağlantısı, sabit fiyat, 7/24 hizmet.",
        h1: "VIP Transfer Antalya",
        intro: "Antalya şehir merkezi, Kaleiçi ve çevresine özel şoförlü VIP transfer hizmetleri. Havalimanı bağlantısı, şehiriçi taşımacılık ve özel turlar.",
        whyUs: [
          "Havalimanı ↔ şehir merkezi hızlı bağlantı",
          "Kaleiçi, sahil ve alışveriş bölgeleri dahil",
          "Ücretsiz bebek koltuğu ve Wi-Fi",
          "7/24 sabit fiyat, gizli masraf yok",
        ],
        faqs: [
          { q: "Antalya şehir merkezine ne kadar sürer?", a: "Havalimanından Antalya merkezine yaklaşık 15-25 dakikadır." },
          { q: "Kaleiçi'ne transfer var mı?", a: "Evet, Kaleiçi dahil Antalya'nın tüm bölgelerine transfer sağlıyoruz." },
          { q: "Saatlik kiralama mümkün mü?", a: "Şehiriçi özel kullanım için bizimle WhatsApp'tan iletişime geçebilirsiniz." },
        ],
      },
      de: {
        metaTitle: "VIP Transfer Antalya | Privatfahrer & Flughafentransfer",
        metaDescription: "VIP-Transfer in Antalya Stadt und Flughafen. Kaleiçi, Zentrum, Lara-Verbindung, Festpreis, 24/7 Service.",
        h1: "VIP Transfer Antalya",
        intro: "VIP-Transferservice in Antalya Stadtzentrum, Kaleiçi und Umgebung. Flughafenanbindung, Stadttransfers und private Touren.",
        whyUs: [
          "Schnelle Verbindung Flughafen ↔ Stadtzentrum",
          "Kaleiçi, Strand und Einkaufsviertel inklusive",
          "Kostenloser Kindersitz & WLAN",
          "24/7 Festpreis, keine versteckten Kosten",
        ],
        faqs: [
          { q: "Wie lange dauert der Transfer ins Stadtzentrum?", a: "Vom Flughafen ins Zentrum ca. 15-25 Minuten." },
          { q: "Fahren Sie nach Kaleiçi?", a: "Ja, wir bedienen alle Stadtteile von Antalya." },
          { q: "Ist stundenweise Miete möglich?", a: "Kontaktieren Sie uns per WhatsApp für Stadttransfers." },
        ],
      },
      en: {
        metaTitle: "VIP Transfer Antalya | Private Driver & Airport Connection",
        metaDescription: "VIP transfer in Antalya city and airport. Kaleiçi, centre, Lara connection, fixed price, 24/7 service.",
        h1: "VIP Transfer Antalya",
        intro: "VIP transfer service in Antalya city centre, Kaleiçi, and surroundings. Airport connection, city transfers, and private tours.",
        whyUs: [
          "Fast airport ↔ city centre connection",
          "Covers Kaleiçi, beachfront & shopping districts",
          "Free child seat & Wi-Fi on board",
          "24/7 fixed pricing, no hidden fees",
        ],
        faqs: [
          { q: "How long is the transfer to the city centre?", a: "From the airport to Antalya centre is approximately 15-25 minutes." },
          { q: "Do you go to Kaleiçi?", a: "Yes, we serve all areas of Antalya city." },
          { q: "Is hourly rental available?", a: "Contact us via WhatsApp for city transfer arrangements." },
        ],
      },
      ru: {
        metaTitle: "VIP трансфер Анталия | Личный водитель и аэропорт",
        metaDescription: "VIP-трансфер по Анталии и из аэропорта. Калеичи, центр, связь с Ларой, фиксированная цена, 24/7.",
        h1: "VIP трансфер Анталия",
        intro: "VIP-трансфер по центру Анталии, Калеичи и окрестностям. Связь с аэропортом, городские трансферы и индивидуальные экскурсии.",
        whyUs: [
          "Быстрая связь аэропорт ↔ центр города",
          "Калеичи, набережная и торговые районы",
          "Бесплатное детское кресло и Wi-Fi",
          "Фиксированная цена 24/7, без скрытых платежей",
        ],
        faqs: [
          { q: "Сколько длится трансфер в центр города?", a: "Из аэропорта в центр Анталии — примерно 15-25 минут." },
          { q: "Вы ездите в Калеичи?", a: "Да, мы обслуживаем все районы города Анталия." },
          { q: "Возможна ли почасовая аренда?", a: "Свяжитесь с нами через WhatsApp для городских трансферов." },
        ],
      },
    },
  },
];

/** Helper to find a route config by slug */
export function getTransferBySlug(slug: string): TransferRoute | undefined {
  return TRANSFER_ROUTES.find((r) => r.slug === slug);
}

/** All route slugs for sitemap generation */
export function getAllTransferSlugs(): string[] {
  return TRANSFER_ROUTES.map((r) => r.slug);
}
