// Mobile navigation
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const promptText = document.getElementById("prompt-text");
const promptAuthor = document.getElementById("prompt-author");
const promptImage = document.getElementById("prompt-image");
const promptImageName = document.getElementById("prompt-image-name");
const prevPromptButton = document.getElementById("prev-prompt");
const nextPromptButton = document.getElementById("next-prompt");
const dinosaurFactTitle = document.getElementById("dinosaur-fact-title");
const dinosaurFactText = document.getElementById("dinosaur-fact-text");
const dinosaurFactImage = document.getElementById("dinosaur-fact-image");
const dinosaurFactImageName = document.getElementById("dinosaur-fact-image-name");
const dinosaurImageCredit = document.getElementById("dinosaur-image-credit");
const prevDinosaurFactButton = document.getElementById("prev-dinosaur-fact");
const nextDinosaurFactButton = document.getElementById("next-dinosaur-fact");
const aboutPhotoTrack = document.getElementById("aboutPhotoTrack");
const couplePhotoTrack = document.getElementById("couplePhotoTrack");
const photoTrack = document.getElementById("photoTrack");
const journalList = document.getElementById("journalList");
const stravaYear = document.getElementById("strava-year");
const stravaRunMiles = document.getElementById("strava-run-miles");
const stravaWalkMiles = document.getElementById("strava-walk-miles");
const stravaRunElevation = document.getElementById("strava-run-elevation");
const stravaBikeMiles = document.getElementById("strava-bike-miles");
const stravaSwimMiles = document.getElementById("strava-swim-miles");
const stravaUpdated = document.getElementById("strava-updated");
const runningPrList = document.getElementById("runningPrList");
const upcomingRaceList = document.getElementById("upcomingRaceList");
const prompts = Array.isArray(window.quoteEntriesData) ? window.quoteEntriesData : [];
const dinosaurFacts = Array.isArray(window.dinosaurFactEntriesData) ? window.dinosaurFactEntriesData : [];
const editableTextData = window.editableTextData || {};
const siteDesignData = window.siteDesignData || {};

let promptIndex = 0;
let promptIntervalId = null;
let dinosaurFactIndex = 0;
let dinosaurFactIntervalId = null;

function applySiteDesign() {
  const root = document.documentElement;
  const designVariables = {
    backgroundColor: "--bg",
    pageTopColor: "--page-top",
    textColor: "--text",
    softTextColor: "--muted",
    accentColor: "--terracotta",
    buttonColor: "--gold",
    buttonHoverColor: "--button-hover",
    cardColor: "--surface",
    bodyFont: "--body-font",
    headingFont: "--heading-font",
    normalTextSize: "--normal-text-size",
    headingSize: "--heading-scale",
    heroQuoteSize: "--hero-quote-size",
    wordsQuoteSize: "--words-quote-size",
    pageWidth: "--content-width",
    sectionSpacing: "--section-spacing",
    heroTopSpacing: "--hero-top-spacing",
    heroBottomSpacing: "--hero-bottom-spacing",
    aboutTopSpacing: "--about-top-spacing",
    cardRoundness: "--radius-lg",
    imageRoundness: "--image-radius",
    buttonRoundness: "--button-radius",
    heroPictureWidth: "--hero-picture-width",
    heroPicturePosition: "--hero-picture-position",
    heroQuoteWidth: "--hero-quote-width"
  };

  Object.entries(designVariables).forEach(([setting, variable]) => {
    if (typeof siteDesignData[setting] === "string") {
      root.style.setProperty(variable, siteDesignData[setting]);
    }
  });

  if (typeof siteDesignData.heroQuotePosition === "string") {
    document.body.dataset.heroQuotePosition = siteDesignData.heroQuotePosition;
  }

  if (typeof siteDesignData.heroQuoteAlign === "string") {
    const flexAlignments = {
      left: "flex-start",
      center: "center",
      right: "flex-end"
    };
    const textAlign = siteDesignData.heroQuoteAlign;
    root.style.setProperty("--hero-quote-align", textAlign);
    root.style.setProperty("--hero-quote-flex-align", flexAlignments[textAlign] || "flex-start");
  }
}

function getEditableEntry(key) {
  return editableTextData[key];
}

function applyTextboxStyle(element, key) {
  const textboxStyles = siteDesignData.textboxes || {};
  const style = textboxStyles[key];

  if (!style || typeof style !== "object") {
    return;
  }

  const styleMap = {
    size: "fontSize",
    font: "fontFamily",
    weight: "fontWeight",
    style: "fontStyle",
    color: "color",
    align: "textAlign"
  };

  Object.entries(styleMap).forEach(([setting, property]) => {
    if (typeof style[setting] === "string") {
      element.style[property] = style[setting];
    }
  });
}

function renderEditableText() {
  document.querySelectorAll("[data-editable-text]").forEach((element) => {
    const key = element.dataset.editableText;
    const entry = getEditableEntry(key);

    applyTextboxStyle(element, key);

    if (!entry || typeof entry.text !== "string") {
      return;
    }

    element.textContent = entry.text;
  });

  document.querySelectorAll("[data-editable-paragraphs]").forEach((element) => {
    const key = element.dataset.editableParagraphs;
    const entry = getEditableEntry(key);

    applyTextboxStyle(element, key);

    if (!entry || !Array.isArray(entry.paragraphs)) {
      return;
    }

    element.replaceChildren();

    entry.paragraphs.forEach((paragraph, index) => {
      const paragraphElement = document.createElement("p");
      const className = Array.isArray(entry.paragraphClasses) ? entry.paragraphClasses[index] : "";

      if (className) {
        paragraphElement.className = className;
      }

      paragraphElement.textContent = paragraph;
      element.appendChild(paragraphElement);
    });
  });

  document.querySelectorAll("[data-editable-list]").forEach((element) => {
    const key = element.dataset.editableList;
    const entry = getEditableEntry(key);

    applyTextboxStyle(element, key);

    if (!entry || !Array.isArray(entry.items)) {
      return;
    }

    element.replaceChildren();

    entry.items.forEach((item) => {
      const itemElement = document.createElement("li");
      itemElement.textContent = item;
      element.appendChild(itemElement);
    });
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatUpdatedAt(value) {
  if (!value) {
    return "Waiting for Strava sync";
  }

  const updated = new Date(value);

  if (Number.isNaN(updated.getTime())) {
    return "Updated from Strava";
  }

  return `Updated ${updated.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  })} from Strava`;
}

function parseRaceDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRaceDate(value) {
  const date = parseRaceDate(value);

  if (!date) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

async function renderStravaStats() {
  if (!stravaYear || !stravaRunMiles || !stravaWalkMiles || !stravaRunElevation || !stravaBikeMiles || !stravaSwimMiles || !stravaUpdated) {
    return;
  }

  try {
    const response = await fetch("strava-data.json", { cache: "no-store" });
    const stats = await response.json();

    if (!stats.connected) {
      return;
    }

    stravaYear.textContent = stats.year || new Date().getFullYear();
    stravaRunMiles.textContent = formatNumber(stats.runMiles ?? stats.miles);
    stravaWalkMiles.textContent = formatNumber(stats.walkMiles ?? 0);
    stravaRunElevation.textContent = formatNumber(stats.totalElevationFeet ?? stats.elevationFeet);
    stravaBikeMiles.textContent = formatNumber(stats.bikeMiles ?? 0);
    stravaSwimMiles.textContent = formatNumber(stats.swimMiles ?? 0);
    stravaUpdated.textContent = formatUpdatedAt(stats.updatedAt);
  } catch {
    stravaUpdated.textContent = "Strava sync unavailable";
  }
}

function renderRunningPrs() {
  if (!runningPrList || !Array.isArray(window.runningPrEntriesData)) {
    return;
  }

  runningPrList.replaceChildren();

  window.runningPrEntriesData.forEach((pr) => {
    const item = document.createElement("div");
    const distance = document.createElement("span");
    const time = document.createElement("span");

    item.className = "pr-item";
    distance.className = "pr-distance";
    time.className = "pr-time";
    distance.textContent = pr.distance;
    time.textContent = pr.time;

    item.appendChild(distance);
    item.appendChild(time);
    runningPrList.appendChild(item);
  });
}

function renderUpcomingRaces() {
  if (!upcomingRaceList || !Array.isArray(window.upcomingRaceEntriesData)) {
    return;
  }

  upcomingRaceList.replaceChildren();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingRaces = window.upcomingRaceEntriesData.filter((race) => {
    const raceDate = parseRaceDate(race.date);
    return raceDate && raceDate >= today;
  });

  if (!upcomingRaces.length) {
    const empty = document.createElement("p");
    empty.className = "race-empty";
    empty.textContent = "No upcoming races listed yet.";
    upcomingRaceList.appendChild(empty);
    return;
  }

  upcomingRaces.forEach((race) => {
    const item = document.createElement("article");
    const date = document.createElement("p");
    const name = document.createElement("h3");
    const meta = document.createElement("p");
    const details = [race.distance, race.location].filter(Boolean).join(" · ");

    item.className = "race-item";
    date.className = "race-date";
    name.className = "race-name";
    meta.className = "race-meta";
    date.textContent = formatRaceDate(race.date);
    name.textContent = race.name;
    meta.textContent = details;

    item.append(date, name);

    if (details) {
      item.appendChild(meta);
    }

    upcomingRaceList.appendChild(item);
  });
}

function renderAboutPhotos() {
  if (!aboutPhotoTrack || !Array.isArray(window.aboutPhotoEntriesData)) {
    return;
  }

  aboutPhotoTrack.replaceChildren();

  const photos = [...window.aboutPhotoEntriesData, ...window.aboutPhotoEntriesData];

  photos.forEach((photo) => {
    aboutPhotoTrack.appendChild(createPhotoCard(photo));
  });
}

function renderCouplePhotos() {
  if (!couplePhotoTrack || !Array.isArray(window.couplePhotoEntriesData)) {
    return;
  }

  couplePhotoTrack.replaceChildren();

  const photos = [...window.couplePhotoEntriesData, ...window.couplePhotoEntriesData];

  photos.forEach((photo) => {
    couplePhotoTrack.appendChild(createPhotoCard(photo));
  });
}

function createPhotoCard(photo) {
  const figure = document.createElement("figure");
  const image = document.createElement("img");

  figure.className = "gallery-card";
  image.src = photo.src;
  image.alt = photo.alt;
  image.decoding = "async";

  figure.appendChild(image);

  return figure;
}

function renderPhotoGallery() {
  if (!photoTrack || !Array.isArray(window.photoEntriesData)) {
    return;
  }

  photoTrack.replaceChildren();

  const photos = [...window.photoEntriesData, ...window.photoEntriesData];

  photos.forEach((photo) => {
    photoTrack.appendChild(createPhotoCard(photo));
  });
}

function getJournalParagraphs(entry) {
  if (Array.isArray(entry.paragraphs)) {
    return entry.paragraphs;
  }

  if (typeof entry.text === "string") {
    return entry.text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  return [];
}

function getJournalMonthLabel(date) {
  const [month, , year] = date.split("-");
  const monthIndex = Number(month) - 1;
  const fullYear = Number(year) < 70 ? 2000 + Number(year) : 1900 + Number(year);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  if (!monthNames[monthIndex] || Number.isNaN(fullYear)) {
    return "Journal";
  }

  return `${monthNames[monthIndex]} ${fullYear}`;
}

function createJournalEntry(entry, isOpen) {
  const article = document.createElement("article");
  const toggle = document.createElement("button");
  const date = document.createElement("span");
  const chevron = document.createElement("span");
  const content = document.createElement("div");

  article.className = `journal-entry reveal${isOpen ? " is-open" : ""}`;
  toggle.className = "journal-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", String(isOpen));
  date.className = "entry-meta";
  date.textContent = entry.date;
  chevron.className = "journal-chevron";
  chevron.setAttribute("aria-hidden", "true");
  chevron.textContent = "▾";
  content.className = "journal-content";
  content.hidden = !isOpen;

  toggle.append(date, chevron);

  getJournalParagraphs(entry).forEach((paragraph) => {
    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = paragraph;
    content.appendChild(paragraphElement);
  });

  article.append(toggle, content);
  return article;
}

function renderJournalEntries() {
  if (!journalList || !Array.isArray(window.journalEntriesData)) {
    return;
  }

  journalList.replaceChildren();

  const monthGroups = [];

  window.journalEntriesData.forEach((entry) => {
    const monthLabel = getJournalMonthLabel(entry.date);
    const currentGroup = monthGroups[monthGroups.length - 1];

    if (currentGroup && currentGroup.label === monthLabel) {
      currentGroup.entries.push(entry);
      return;
    }

    monthGroups.push({
      label: monthLabel,
      entries: [entry]
    });
  });

  monthGroups.forEach((group, groupIndex) => {
    const isMonthOpen = groupIndex === 0;
    const section = document.createElement("section");
    const toggle = document.createElement("button");
    const label = document.createElement("span");
    const count = document.createElement("span");
    const chevron = document.createElement("span");
    const entries = document.createElement("div");

    section.className = `journal-month reveal${isMonthOpen ? " is-open" : ""}`;
    toggle.className = "journal-month-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", String(isMonthOpen));
    label.className = "journal-month-label";
    label.textContent = group.label;
    count.className = "journal-month-count";
    count.textContent = `${group.entries.length} ${group.entries.length === 1 ? "entry" : "entries"}`;
    chevron.className = "journal-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "▾";
    entries.className = "journal-month-entries";
    entries.hidden = !isMonthOpen;

    toggle.append(label, count, chevron);

    group.entries.forEach((entry, entryIndex) => {
      entries.appendChild(createJournalEntry(entry, isMonthOpen && entryIndex === 0));
    });

    section.append(toggle, entries);
    journalList.appendChild(section);
  });
}

applySiteDesign();
renderEditableText();
renderAboutPhotos();
renderCouplePhotos();
renderPhotoGallery();
renderJournalEntries();
renderRunningPrs();
renderUpcomingRaces();
renderStravaStats();

// ---------- Places I've been: world + US maps with pins ----------
const EA = { A1: 1.340264, A2: -0.081106, A3: 0.000893, A4: 0.003796 };

function equalEarth(lon, lat) {
  const l = (lon * Math.PI) / 180;
  const p = (lat * Math.PI) / 180;
  const t = Math.asin((Math.sqrt(3) / 2) * Math.sin(p));
  const t2 = t * t;
  const t6 = t2 * t2 * t2;
  const x = (2 * Math.sqrt(3) * l * Math.cos(t)) / (3 * (9 * EA.A4 * t6 * t2 + 7 * EA.A3 * t6 + 3 * EA.A2 * t2 + EA.A1));
  const y = t * (EA.A1 + EA.A2 * t2 + t6 * (EA.A3 + EA.A4 * t2));
  return [x, y];
}

const ALB = (() => {
  const r = (d) => (d * Math.PI) / 180;
  const phi1 = r(29.5);
  const phi2 = r(45.5);
  const n = (Math.sin(phi1) + Math.sin(phi2)) / 2;
  const c = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
  const rho0 = Math.sqrt(c - 2 * n * Math.sin(r(37.5))) / n;
  return { n, c, rho0, lam0: r(-96), r };
})();

function albersUsa(lon, lat) {
  const rho = Math.sqrt(ALB.c - 2 * ALB.n * Math.sin(ALB.r(lat))) / ALB.n;
  const th = ALB.n * (ALB.r(lon) - ALB.lam0);
  return [rho * Math.sin(th), ALB.rho0 - rho * Math.cos(th)];
}

const SVG_NS = "http://www.w3.org/2000/svg";
const PIN_PATH = "M0 0C-3 -4 -5 -6.5 -5 -9.5a5 5 0 1 1 10 0C5 -6.5 3 -4 0 0Z";

function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function buildMap(container, { width, height, viewBox, shapes, visitedIds, pins, label, pinScale }) {
  const svg = svgEl("svg", { viewBox: viewBox || `0 0 ${width} ${height}`, role: "img", "aria-label": label });
  const land = svgEl("g", { class: "map-land" });

  Object.entries(shapes).forEach(([id, shape]) => {
    const path = svgEl("path", { d: shape.d, class: visitedIds.has(id) ? "land visited" : "land" });
    const title = svgEl("title");
    title.textContent = shape.n;
    path.appendChild(title);
    land.appendChild(path);
  });

  svg.appendChild(land);

  const pinLayer = svgEl("g", { class: "map-pins" });

  pins.forEach((pin, index) => {
    const group = svgEl("g", {
      class: "pin",
      transform: `translate(${pin.x.toFixed(1)} ${pin.y.toFixed(1)})`,
      "data-place": pin.name
    });
    group.style.setProperty("--i", index);
    const inner = svgEl("g", { class: "pin-inner", transform: `scale(${pinScale})` });
    inner.appendChild(svgEl("circle", { class: "pin-pulse", r: 7, cy: -9.5 }));
    inner.appendChild(svgEl("path", { class: "pin-head", d: PIN_PATH }));
    inner.appendChild(svgEl("circle", { class: "pin-dot", r: 1.9, cy: -9.5 }));
    const title = svgEl("title");
    title.textContent = pin.name;
    group.append(inner, title);
    pinLayer.appendChild(group);
  });

  svg.appendChild(pinLayer);
  container.replaceChildren(svg);
}

function renderChips(list, items, labelFor) {
  list.replaceChildren();

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "chip";
    li.dataset.place = item.name;
    li.tabIndex = 0;

    if (item.flag) {
      const flag = document.createElement("span");
      flag.setAttribute("aria-hidden", "true");
      flag.textContent = item.flag;
      li.appendChild(flag);
    }

    li.appendChild(document.createTextNode(labelFor ? labelFor(item) : item.name));
    list.appendChild(li);
  });
}

function wireChipHover(section) {
  const toggle = (name, on) => {
    section.querySelectorAll(".pin").forEach((pin) => {
      if (pin.dataset.place === name) {
        pin.classList.toggle("is-hot", on);
      }
    });
  };

  section.querySelectorAll(".chip").forEach((chip) => {
    const name = chip.dataset.place;
    ["mouseenter", "focus"].forEach((type) => chip.addEventListener(type, () => toggle(name, true)));
    ["mouseleave", "blur"].forEach((type) => chip.addEventListener(type, () => toggle(name, false)));
  });
}

// ISO 3-letter -> 2-letter, so a country's flag can be worked out from its name alone
const ISO2 = {AFG:"AF",AGO:"AO",ALB:"AL",ARE:"AE",ARG:"AR",ARM:"AM",ATF:"TF",AUS:"AU",AUT:"AT",AZE:"AZ",BDI:"BI",BEL:"BE",BEN:"BJ",BFA:"BF",BGD:"BD",BGR:"BG",BHS:"BS",BIH:"BA",BLR:"BY",BLZ:"BZ",BOL:"BO",BRA:"BR",BRN:"BN",BTN:"BT",BWA:"BW",CAF:"CF",CAN:"CA",CHE:"CH",CHL:"CL",CHN:"CN",CIV:"CI",CMR:"CM",COD:"CD",COG:"CG",COL:"CO",CRI:"CR",CUB:"CU",CYP:"CY",CZE:"CZ",DEU:"DE",DJI:"DJ",DNK:"DK",DOM:"DO",DZA:"DZ",ECU:"EC",EGY:"EG",ERI:"ER",ESP:"ES",EST:"EE",ETH:"ET",FIN:"FI",FJI:"FJ",FLK:"FK",FRA:"FR",GAB:"GA",GBR:"GB",GEO:"GE",GHA:"GH",GIN:"GN",GMB:"GM",GNB:"GW",GNQ:"GQ",GRC:"GR",GRL:"GL",GTM:"GT",GUY:"GY",HND:"HN",HRV:"HR",HTI:"HT",HUN:"HU",IDN:"ID",IND:"IN",IRL:"IE",IRN:"IR",IRQ:"IQ",ISL:"IS",ISR:"IL",ITA:"IT",JAM:"JM",JOR:"JO",JPN:"JP",KAZ:"KZ",KEN:"KE",KGZ:"KG",KHM:"KH",KOR:"KR",KOS:"XK",KWT:"KW",LAO:"LA",LBN:"LB",LBR:"LR",LBY:"LY",LKA:"LK",LSO:"LS",LTU:"LT",LUX:"LU",LVA:"LV",MAR:"MA",MDA:"MD",MDG:"MG",MEX:"MX",MKD:"MK",MLI:"ML",MMR:"MM",MNE:"ME",MNG:"MN",MOZ:"MZ",MRT:"MR",MWI:"MW",MYS:"MY",NAM:"NA",NCL:"NC",NER:"NE",NGA:"NG",NIC:"NI",NLD:"NL",NOR:"NO",NPL:"NP",NZL:"NZ",OMN:"OM",PAK:"PK",PAN:"PA",PER:"PE",PHL:"PH",PNG:"PG",POL:"PL",PRI:"PR",PRK:"KP",PRT:"PT",PRY:"PY",PSX:"PS",QAT:"QA",ROU:"RO",RUS:"RU",RWA:"RW",SAH:"EH",SAU:"SA",SDN:"SD",SDS:"SS",SEN:"SN",SLB:"SB",SLE:"SL",SLV:"SV",SOM:"SO",SRB:"RS",SUR:"SR",SVK:"SK",SVN:"SI",SWE:"SE",SWZ:"SZ",SYR:"SY",TCD:"TD",TGO:"TG",THA:"TH",TJK:"TJ",TKM:"TM",TLS:"TL",TTO:"TT",TUN:"TN",TUR:"TR",TWN:"TW",TZA:"TZ",UGA:"UG",UKR:"UA",URY:"UY",USA:"US",UZB:"UZ",VEN:"VE",VNM:"VN",VUT:"VU",YEM:"YE",ZAF:"ZA",ZMB:"ZM",ZWE:"ZW"};

// nicknames people are likely to type
const COUNTRY_ALIASES = {
  "united states": "USA", "the united states": "USA", usa: "USA", us: "USA", america: "USA", "united states of america": "USA",
  uk: "GBR", england: "GBR", scotland: "GBR", wales: "GBR", britain: "GBR", "great britain": "GBR", london: "GBR",
  holland: "NLD", "the netherlands": "NLD", netherlands: "NLD",
  "the philippines": "PHL", philippines: "PHL",
  "czech republic": "CZE", "south korea": "KOR", korea: "KOR", russia: "RUS", "ivory coast": "CIV",
  "the bahamas": "BHS", bahamas: "BHS", "the gambia": "GMB", tanzania: "TZA", serbia: "SRB",
  "east timor": "TLS", "timor-leste": "TLS", uae: "ARE", swaziland: "SWZ", eswatini: "SWZ",
  "congo (drc)": "COD", drc: "COD", macedonia: "MKD"
};

const cleanName = (text) => String(text).toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9' -]/g, "").replace(/\s+/g, " ").trim();

function flagEmoji(iso3) {
  const iso2 = ISO2[iso3];
  return iso2 ? String.fromCodePoint(...[...iso2].map((char) => 127397 + char.charCodeAt(0))) : "";
}

// the middle of a shape's biggest outline, in map pixels (so the pin sits on the main landmass)
function shapeCenter(d) {
  let best = null;

  d.split("M").slice(1).forEach((ring) => {
    const nums = ring.replace(/[LZ]/g, " ").trim().split(/\s+/).map(Number);
    let area = 0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = nums[i], y = nums[i + 1];
      const nx = nums[(i + 2) % nums.length], ny = nums[(i + 3) % nums.length];
      area += x * ny - nx * y;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }

    area = Math.abs(area);

    if (!best || area > best.area) {
      best = { area, x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    }
  });

  return best ? { x: best.x, y: best.y } : { x: 0, y: 0 };
}

function renderPlaces() {
  const data = window.placesData;
  const mapData = window.placesMapData;
  const section = document.getElementById("places");
  const worldMap = document.getElementById("worldMap");
  const usMap = document.getElementById("usMap");

  if (!data || !mapData || !section || !worldMap || !usMap) {
    return;
  }

  const world = mapData.world;
  const us = mapData.us;
  const toWorld = (lon, lat) => {
    const [x, y] = equalEarth(lon, lat);
    return { x: x * world.scale + world.tx, y: -y * world.scale + world.ty };
  };

  // --- turn the simple lists in places-data.js into pins + chips ---
  const countryByName = {};
  Object.entries(world.countries).forEach(([iso, shape]) => {
    countryByName[cleanName(shape.n)] = iso;
    countryByName[iso.toLowerCase()] = iso;
  });

  const stateLookup = {};
  Object.entries(us.states).forEach(([code, shape]) => {
    stateLookup[cleanName(shape.n)] = code;
    stateLookup[code.toLowerCase()] = code;
  });

  const countries = [];
  (data.countries || []).forEach((entry) => {
    const label = typeof entry === "string" ? entry : entry.name;
    const key = cleanName(label);
    const iso = COUNTRY_ALIASES[key] ? COUNTRY_ALIASES[key] : countryByName[key] || countryByName[key.replace(/^the /, "")];

    if (!iso || !world.countries[iso]) {
      console.warn(`Places: could not find a country called "${label}". Check the spelling in places-data.js.`);
      return;
    }

    countries.push({ name: label, iso, flag: flagEmoji(iso), ...shapeCenter(world.countries[iso].d) });
  });

  const others = (data.otherPlaces || data.territories || []).map((place) => ({
    name: place.name,
    flag: place.flag || "",
    ...toWorld(place.lon, place.lat)
  }));

  const states = [];
  (data.states || []).forEach((entry) => {
    const label = typeof entry === "string" ? entry : entry.name;
    const code = stateLookup[cleanName(label)];

    if (!code) {
      console.warn(`Places: could not find a US state called "${label}". Check the spelling in places-data.js.`);
      return;
    }

    states.push({ name: us.states[code].n, code, ...shapeCenter(us.states[code].d) });
  });

  const summary = document.getElementById("placesSummary");

  if (summary) {
    const territoryText = others.length
      ? ` + ${others.length} ${others.length === 1 ? "territory" : "territories"}`
      : "";
    summary.textContent = `${countries.length} countries${territoryText} · ${states.length} US states`;
  }

  const visitedCountries = new Set(countries.map((country) => country.iso));

  buildMap(worldMap, {
    width: world.w,
    height: world.h,
    shapes: world.countries,
    visitedIds: visitedCountries,
    pins: [...countries, ...others],
    label: `World map with pins in ${countries.length} countries and ${others.length} territory`,
    pinScale: 1.35
  });

  // a close-up so the crowded European pins have room
  const europeMap = document.getElementById("europeMap");

  if (europeMap) {
    const topLeft = toWorld(-13, 61.5);
    const bottomRight = toWorld(33, 35.5);
    const inEurope = (place) => place.x > topLeft.x && place.x < bottomRight.x && place.y > topLeft.y && place.y < bottomRight.y;
    const europeanPlaces = [...countries, ...others].filter(inEurope);

    buildMap(europeMap, {
      width: world.w,
      height: world.h,
      viewBox: `${topLeft.x.toFixed(1)} ${topLeft.y.toFixed(1)} ${(bottomRight.x - topLeft.x).toFixed(1)} ${(bottomRight.y - topLeft.y).toFixed(1)}`,
      shapes: world.countries,
      visitedIds: visitedCountries,
      pins: europeanPlaces,
      label: `Close-up map of Europe with pins in ${europeanPlaces.length} countries`,
      pinScale: 0.42
    });
  }

  buildMap(usMap, {
    width: us.w,
    height: us.h,
    shapes: us.states,
    visitedIds: new Set(states.map((state) => state.code)),
    pins: states,
    label: `Map of the United States with pins in ${states.length} states`,
    pinScale: 1.7
  });

  renderChips(document.getElementById("countryList"), [...countries, ...others]);
  renderChips(document.getElementById("stateList"), states);
  wireChipHover(section);
}

// the map outlines are a sizeable file, so they load only when the section is about to be seen
function loadPlacesMaps() {
  const section = document.getElementById("places");

  if (!section) {
    return;
  }

  let started = false;

  const start = () => {
    if (started) {
      return;
    }

    started = true;
    const script = document.createElement("script");
    script.src = `places-map-data.js?v=${Date.now()}`;
    script.onload = renderPlaces;
    document.body.appendChild(script);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          start();
          observer.disconnect();
        }
      },
      { rootMargin: "900px 0px" }
    );
    observer.observe(section);
  } else {
    start();
  }
}

// ---------- easter egg: click the tooth in the hero photo to jump into Crazy Eights ----------
function positionToothEgg() {
  const image = document.querySelector(".hero-photo");
  const egg = document.querySelector(".tooth-egg");
  const hero = document.querySelector(".hero");

  if (!image || !egg || !hero || !image.naturalWidth) {
    return;
  }

  // where the front tooth sits inside the photo (fractions of its width and height)
  const TOOTH_X = 0.2219;
  const TOOTH_Y = 0.4265;

  const box = image.getBoundingClientRect();
  const scale = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight);
  const shownWidth = image.naturalWidth * scale;
  const shownHeight = image.naturalHeight * scale;
  const [posX, posY] = getComputedStyle(image).objectPosition.split(" ");
  const offset = (value, free) => (value.endsWith("%") ? (parseFloat(value) / 100) * free : parseFloat(value));
  const x = offset(posX, box.width - shownWidth) + shownWidth * TOOTH_X;
  const y = offset(posY, box.height - shownHeight) + shownHeight * TOOTH_Y;
  const heroBox = hero.getBoundingClientRect();
  const size = Math.max(24, shownWidth * 0.014);

  egg.style.left = `${box.left - heroBox.left + x}px`;
  egg.style.top = `${box.top - heroBox.top + y}px`;
  egg.style.width = `${size}px`;
  egg.style.height = `${size}px`;
  egg.classList.add("is-placed");
}

function setUpToothEgg() {
  const image = document.querySelector(".hero-photo");

  if (!image) {
    return;
  }

  const place = () => requestAnimationFrame(positionToothEgg);

  if (image.complete) {
    place();
  } else {
    image.addEventListener("load", place);
  }

  window.addEventListener("resize", place);
}

loadPlacesMaps();
setUpToothEgg();

if (navToggle && siteNav) {
  const setMenu = (open) => {
    siteNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    const label = navToggle.querySelector(".nav-label");
    if (label) {
      label.textContent = open ? "Close" : "Menu";
    }
  };

  navToggle.addEventListener("click", () => {
    setMenu(!siteNav.classList.contains("is-open"));
  });

  // with a mouse, the menu unfolds on hover and folds away when you leave it
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let closeTimer;
    const hold = () => {
      clearTimeout(closeTimer);
      setMenu(true);
    };
    const release = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => setMenu(false), 350);
    };
    [navToggle, siteNav].forEach((el) => {
      el.addEventListener("mouseenter", hold);
      el.addEventListener("mouseleave", release);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      setMenu(false);
      navToggle.focus();
    }
  });
}

// Gentle reveal animation as sections enter view
if ("IntersectionObserver" in window) {
  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  const revealItems = document.querySelectorAll(".reveal");
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function renderPrompt(index) {
  const prompt = prompts[index];

  if (!prompt || !promptText || !promptAuthor || !promptImage || !promptImageName) {
    return;
  }

  promptAuthor.textContent = prompt.author;
  promptText.textContent = "“" + prompt.quote + "”";
  promptImage.src = prompt.image;
  promptImage.alt = prompt.alt;
  promptImageName.textContent = prompt.author;
}

function startPromptRotation() {
  if (!prompts.length) {
    return;
  }

  if (promptIntervalId) {
    window.clearInterval(promptIntervalId);
  }

  promptIntervalId = window.setInterval(() => {
    promptIndex = (promptIndex + 1) % prompts.length;
    renderPrompt(promptIndex);
  }, 6000);
}

// Reflective prompt rotation
if (prompts.length && prevPromptButton && nextPromptButton && promptText && promptAuthor && promptImage) {
  renderPrompt(promptIndex);
  startPromptRotation();

  prevPromptButton.addEventListener("click", () => {
    promptIndex = (promptIndex - 1 + prompts.length) % prompts.length;
    renderPrompt(promptIndex);
    startPromptRotation();
  });

  nextPromptButton.addEventListener("click", () => {
    promptIndex = (promptIndex + 1) % prompts.length;
    renderPrompt(promptIndex);
    startPromptRotation();
  });
}

function renderDinosaurFact(index) {
  const dinosaurFact = dinosaurFacts[index];

  if (!dinosaurFact || !dinosaurFactTitle || !dinosaurFactText || !dinosaurFactImage || !dinosaurFactImageName) {
    return;
  }

  dinosaurFactTitle.textContent = dinosaurFact.title;
  dinosaurFactText.textContent = dinosaurFact.fact;
  dinosaurFactImage.src = dinosaurFact.image;
  dinosaurFactImage.alt = dinosaurFact.alt;
  dinosaurFactImageName.textContent = dinosaurFact.title;
  if (dinosaurImageCredit) {
    const sourceLink = document.createElement("a");
    sourceLink.href = dinosaurFact.imageSource;
    sourceLink.textContent = new DOMParser().parseFromString(dinosaurFact.imageCredit, "text/html").body.textContent;
    const licenseLink = document.createElement("a");
    licenseLink.href = dinosaurFact.imageLicenseUrl;
    licenseLink.textContent = dinosaurFact.imageLicense;
    dinosaurImageCredit.replaceChildren(sourceLink, document.createTextNode(" / "), licenseLink);
  }
}

function startDinosaurFactRotation() {
  if (!dinosaurFacts.length) {
    return;
  }

  if (dinosaurFactIntervalId) {
    window.clearInterval(dinosaurFactIntervalId);
  }

  dinosaurFactIntervalId = window.setInterval(() => {
    dinosaurFactIndex = (dinosaurFactIndex + 1) % dinosaurFacts.length;
    renderDinosaurFact(dinosaurFactIndex);
  }, 6000);
}

if (
  dinosaurFacts.length &&
  prevDinosaurFactButton &&
  nextDinosaurFactButton &&
  dinosaurFactTitle &&
  dinosaurFactText &&
  dinosaurFactImage
) {
  renderDinosaurFact(dinosaurFactIndex);
  startDinosaurFactRotation();

  prevDinosaurFactButton.addEventListener("click", () => {
    dinosaurFactIndex = (dinosaurFactIndex - 1 + dinosaurFacts.length) % dinosaurFacts.length;
    renderDinosaurFact(dinosaurFactIndex);
    startDinosaurFactRotation();
  });

  nextDinosaurFactButton.addEventListener("click", () => {
    dinosaurFactIndex = (dinosaurFactIndex + 1) % dinosaurFacts.length;
    renderDinosaurFact(dinosaurFactIndex);
    startDinosaurFactRotation();
  });
}

// Expand and collapse journal entries so long reflections stay easy to browse.
document.querySelectorAll(".journal-month").forEach((month) => {
  const toggle = month.querySelector(".journal-month-toggle");
  const content = month.querySelector(".journal-month-entries");

  if (!toggle || !content) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    month.classList.toggle("is-open", !isOpen);
    content.hidden = isOpen;
  });
});

document.querySelectorAll(".journal-entry").forEach((entry) => {
  const toggle = entry.querySelector(".journal-toggle");
  const content = entry.querySelector(".journal-content");

  if (!toggle || !content) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    entry.classList.toggle("is-open", !isOpen);
    content.hidden = isOpen;
  });
});
