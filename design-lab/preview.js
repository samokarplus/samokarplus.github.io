// Renders the real Samo Karplus content in whichever look the Design Lab sends it.
(function () {
  const root = document.getElementById("root");
  const html = document.documentElement;
  const BASE = "../"; // the live site's files live one level up
  const ed = window.editableTextData || {};

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const text = (key, fallback) => (ed[key] && ed[key].text != null ? ed[key].text : fallback);
  const paras = (key, fallback) => (ed[key] && ed[key].paragraphs ? ed[key].paragraphs : fallback);
  const items = (key, fallback) => (ed[key] && ed[key].items ? ed[key].items : fallback);
  const img = (src) => (/^https?:/.test(src) ? src : BASE + src);

  const NAV = [
    ["about", "About Me"],
    ["gallery", "Photos"],
    ["media", "Media & Projects"],
    ["journal", "Journal"],
    ["crazy8s", "Crazy Eights"],
    ["dinosaur-facts", "Dinosaur Facts"],
    ["prompts", "Words to Sit With"],
    ["contact", "Contact"],
  ];
  const SECTION_IDS = ["home", "about", "gallery", "media", "journal", "crazy8s", "dinosaur-facts", "prompts", "contact"];

  // Photo bands that can head each section (all of these are your own photos)
  const BANDS = {
    about: ["assets/images/about-mountain.jpeg", "50% 30%"],
    gallery: ["assets/images/beach-child.jpeg", "50% 40%"],
    media: ["assets/images/about-trail.jpg", "50% 35%"],
    journal: ["assets/images/hero-mountain.jpg", "50% 28%"],
    crazy8s: ["assets/images/about-track-hug.jpeg", "50% 40%"],
    "dinosaur-facts": ["assets/images/about-dinosaur.jpg", "50% 45%"],
    prompts: ["assets/images/about-ocean.jpeg", "50% 38%"],
    contact: ["assets/images/about-runner.jpg", "50% 40%"],
  };

  let state = { config: null, section: "all" };
  let dinoIndex = Math.floor(Math.random() * (window.dinosaurFactEntriesData || [1]).length);
  let quoteIndex = 0;

  /* ---------- section builders ---------- */

  function head(id, eyebrow, title) {
    const band = BANDS[id];
    const style = band ? ` style="--band:url('${img(band[0])}');--band-pos:${band[1]}"` : "";
    return `<header class="sec-head"${style}><div class="sec-head-in"><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2></div></header>`;
  }

  function buildNav() {
    const links = NAV.map(([id, label]) => `<a href="#${id}" data-go="${id}" data-label="${esc(label)}" title="${esc(label)}">${esc(label)}</a>`).join("");
    return `
    <a class="skip" href="#main">Skip to content</a>
    <header class="nav" id="nav">
      <a class="brand" href="#home" data-go="home">Samo Karplus</a>
      <nav class="nav-links" id="nav-links" aria-label="Main navigation">
        ${links}
      </nav>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">
        <span class="bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="nav-toggle-label">Menu</span>
      </button>
    </header>
    <div class="nav-scrim" hidden></div>`;
  }

  function buildHero() {
    const t1 = text("textbox1", "spirituality, memory, healing, films, photographs, and reflections");
    const quote = paras("textbox5", []);
    const stravaCards = [
      ["strava-run-miles", "run miles", "👟"],
      ["strava-walk-miles", "walk miles", "☀"],
      ["strava-run-elevation", "elevation gain", "↗"],
      ["strava-bike-miles", "bike miles", "🚲"],
      ["strava-swim-miles", "swim miles", "🏊"],
    ]
      .map(
        ([id, label, icon]) =>
          `<div class="stat"><span class="stat-value" id="${id}">--</span><span class="stat-label"><span aria-hidden="true">${icon}</span> ${label}</span></div>`,
      )
      .join("");
    const prs = (window.runningPrEntriesData || [])
      .map((p) => `<div class="pr"><span>${esc(p.distance)}</span><strong>${esc(p.time)}</strong></div>`)
      .join("");
    const races = (window.upcomingRaceEntriesData || [])
      .map(
        (r) =>
          `<div class="race"><strong>${esc(r.name)}</strong><span>${esc(r.distance)} · ${esc(r.location)} · ${esc(formatRaceDate(r.date))}</span></div>`,
      )
      .join("");
    return `
    <section class="hero" id="home" aria-labelledby="hero-title">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="palms palms-hero" aria-hidden="true"><i><svg viewBox="0 0 124 230" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M60 228 C58 170 68 118 62 72" stroke-width="7"/><path d="M62 72 C40 40 10 40 0 64" stroke-width="5"/><path d="M62 72 C42 62 20 72 8 102" stroke-width="5"/><path d="M62 72 C84 38 114 40 124 64" stroke-width="5"/><path d="M62 72 C82 62 104 72 116 102" stroke-width="5"/><path d="M62 72 C50 40 44 20 30 8" stroke-width="5"/><path d="M62 72 C74 40 80 20 94 8" stroke-width="5"/><path d="M62 72 C62 52 62 32 62 14" stroke-width="5"/></g><circle cx="58" cy="78" r="5" fill="currentColor"/><circle cx="68" cy="80" r="5" fill="currentColor"/></svg></i><i><svg viewBox="0 0 124 230" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M60 228 C58 170 68 118 62 72" stroke-width="7"/><path d="M62 72 C40 40 10 40 0 64" stroke-width="5"/><path d="M62 72 C42 62 20 72 8 102" stroke-width="5"/><path d="M62 72 C84 38 114 40 124 64" stroke-width="5"/><path d="M62 72 C82 62 104 72 116 102" stroke-width="5"/><path d="M62 72 C50 40 44 20 30 8" stroke-width="5"/><path d="M62 72 C74 40 80 20 94 8" stroke-width="5"/><path d="M62 72 C62 52 62 32 62 14" stroke-width="5"/></g><circle cx="58" cy="78" r="5" fill="currentColor"/><circle cx="68" cy="80" r="5" fill="currentColor"/></svg></i></div>
      <div class="hero-copy rise">
        <p class="hero-kicker">samo.karplus.org</p>
        <h1 id="hero-title">Samo Karplus</h1>
        <p class="hero-sub">${esc(t1)}</p>
        <div class="hero-actions">
          <a class="btn primary" href="#about" data-go="about">${esc(text("textbox2", "Begin Here"))}</a>
          <a class="btn" href="#journal" data-go="journal">${esc(text("textbox3", "Read Reflections"))}</a>
          <a class="btn" href="#contact" data-go="contact">${esc(text("textbox4", "Get in Touch"))}</a>
          <a class="btn" href="${BASE}crazy8s/" target="_blank" rel="noopener">Play Crazy Eights</a>
        </div>
      </div>
      <figure class="hero-figure rise">
        <div class="hero-frame"><img class="photo" src="${img("assets/images/hero-mountain.jpg")}" alt="Samo standing joyfully in an open mountain landscape at sunset." /></div>
        <figcaption class="hero-quote card">
          <blockquote>${quote.map((p) => `<p>${esc(p)}</p>`).join("")}</blockquote>
          <cite>${esc(text("textbox6", "-Swamiji"))}</cite>
        </figcaption>
      </figure>
      <div class="ticker" aria-hidden="true"><span>${esc(t1)} ✦ ${esc(t1)} ✦ ${esc(t1)} ✦ ${esc(t1)} ✦ </span></div>
      <div class="hero-data">
        <aside class="log card rise" aria-label="Strava training log">
          <p class="log-label"><span id="strava-year">2026</span> Training Log</p>
          <div class="stats">${stravaCards}</div>
          <p class="log-meta" id="strava-updated">Waiting for Strava sync</p>
        </aside>
        <aside class="log card rise" aria-label="Running personal records">
          <p class="log-label">Running PRs</p>
          <div class="prs">${prs}</div>
        </aside>
        <aside class="log card rise" aria-label="Upcoming races">
          <p class="log-label">Upcoming Races</p>
          <div class="races">${races}</div>
        </aside>
      </div>
    </section>`;
  }

  function buildAbout() {
    const bio = paras("textbox12", []);
    const spirit = paras("textbox14", []);
    const spiritClasses = (ed.textbox14 && ed.textbox14.paragraphClasses) || [];
    const mental = paras("textbox16", []);
    const hobbies = items("textbox18", []);
    const card = (n, title, body) =>
      `<article class="card about-card rise"><span class="num" aria-hidden="true">0${n}</span><h3>${esc(title)}</h3>${body}</article>`;
    return `
    <section class="section about" id="about" aria-labelledby="about-title">
      ${head("about", text("textbox9", "About Me"), text("textbox10", "About Me")).replace("<h2>", '<h2 id="about-title">')}
      <div class="about-grid">
        ${card(1, text("textbox11", "Personal Bio"), bio.map((p) => `<p>${esc(p)}</p>`).join(""))}
        ${card(
          2,
          text("textbox13", "Spiritual Journey"),
          spirit.map((p, i) => `<p class="${esc(spiritClasses[i] || "")}">${esc(p)}</p>`).join(""),
        )}
        ${card(3, text("textbox15", "Mental Health Reflections"), mental.map((p) => `<p>${esc(p)}</p>`).join(""))}
        ${card(4, text("textbox17", "Hobbies"), `<ul class="ticks">${hobbies.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`)}
      </div>
      <figure class="about-quote card rise">
        <blockquote>${esc(text("textbox7", ""))}</blockquote>
        <figcaption>${esc(text("textbox8", "-Rumi"))}</figcaption>
      </figure>
    </section>`;
  }

  function photoCard(p, i) {
    const tilt = [-2.2, 1.6, -1, 2.4, -1.8, 1.2][i % 6];
    return `<figure class="shot" style="--tilt:${tilt}deg"><img class="photo" loading="lazy" src="${img(p.src)}" alt="${esc(p.alt)}" /><figcaption>${esc(p.caption || "")}</figcaption></figure>`;
  }

  function buildGallery() {
    const baby = (window.photoEntriesData || []).map(photoCard).join("");
    const older = (window.aboutPhotoEntriesData || []).map(photoCard).join("");
    return `
    <section class="section gallery" id="gallery" aria-labelledby="gallery-title">
      ${head("gallery", text("textbox19", "Photo Archive"), text("textbox20", "Photos")).replace("<h2>", '<h2 id="gallery-title">')}
      <div class="shots-block"><h3 class="sub">${esc(text("textbox21", "Baby Samo"))}</h3><div class="shots">${baby}</div></div>
      <div class="shots-block"><h3 class="sub">${esc(text("textbox22", "Older Samo"))}</h3><div class="shots">${older}</div></div>
    </section>`;
  }

  function buildMedia() {
    const yt = (id, size = "hqdefault") => `https://img.youtube.com/vi/${id}/${size}.jpg`;
    const film = (id, url, title, label, alt) => `
      <article class="card media-card rise">
        <a class="thumb" href="${url}" target="_blank" rel="noreferrer"><img loading="lazy" src="${yt(id)}" alt="${esc(alt)}" /><span class="play" aria-hidden="true">▶</span></a>
        <div class="media-body"><h3>${esc(title)}</h3><a class="link" href="${url}" target="_blank" rel="noreferrer">${esc(label)}</a></div>
      </article>`;
    return `
    <section class="section media" id="media" aria-labelledby="media-title">
      ${head("media", text("textbox23", "Media & Projects"), text("textbox24", "Media & Projects")).replace("<h2>", '<h2 id="media-title">')}
      <div class="media-grid">
        <article class="card media-card media-main rise">
          <a class="thumb" href="https://www.youtube.com/watch?v=scl_oMkI7X8" target="_blank" rel="noreferrer"><img loading="lazy" src="${yt("scl_oMkI7X8", "maxresdefault")}" alt="Thumbnail for Samo's podcast appearance." /><span class="play" aria-hidden="true">▶</span></a>
          <div class="media-body">
            <p class="label">${esc(text("textbox25", "Featured Appearance"))}</p>
            <h3>${esc(text("textbox26", "Podcast Appearance"))}</h3>
            <p>${esc(text("textbox27", ""))}</p>
            <a class="btn primary" href="https://youtu.be/scl_oMkI7X8?si=7xoI7BtXRJIATrbC" target="_blank" rel="noreferrer">${esc(text("textbox28", "Watch on YouTube"))}</a>
          </div>
        </article>
        ${film("a8tAQ3XWytc", "https://youtu.be/a8tAQ3XWytc?si=LYR0cfweLzXfTHnZ", text("textbox30", "Media Appearance"), text("textbox31", "Watch on YouTube"), "Thumbnail for Samo's additional media appearance.")}
        ${film("_EqLPM9gnxw", "https://www.youtube.com/watch?v=_EqLPM9gnxw", text("textbox32", "Little CEO"), text("textbox33", "Open film"), "Thumbnail for Little CEO.")}
        ${film("lCXBr-DxbeU", "https://www.youtube.com/watch?v=lCXBr-DxbeU", text("textbox34", "Little CEO 2"), text("textbox35", "Open film"), "Thumbnail for Little CEO 2.")}
        ${film("99PNF2N0lw0", "https://youtu.be/99PNF2N0lw0?si=Oa6fY0BwUg4o3K9k", text("textbox36", "Little CEO 3"), text("textbox37", "Open film"), "Thumbnail for Little CEO 3.")}
      </div>
    </section>`;
  }

  /* journal: "MM-DD-YY" strings, grouped by month like the live site */
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function parseJournalDate(d) {
    const m = String(d || "").match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
    if (!m) return { month: "Undated", day: "", sort: 0 };
    const yr = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return { month: `${MONTHS[Number(m[1]) - 1] || "Month"} ${yr}`, day: `${MONTHS[Number(m[1]) - 1]?.slice(0, 3) || ""} ${Number(m[2])}`, sort: yr * 100 + Number(m[1]) };
  }
  function buildJournal() {
    const groups = [];
    (window.journalEntriesData || []).forEach((e) => {
      const p = parseJournalDate(e.date);
      let g = groups.find((x) => x.month === p.month);
      if (!g) groups.push((g = { month: p.month, entries: [] }));
      g.entries.push({ ...p, text: e.text || "" });
    });
    const body = groups
      .map(
        (g, gi) => `
      <details class="month rise"${gi === 0 ? " open" : ""}>
        <summary><span class="month-name">${esc(g.month)}</span><span class="month-count">${g.entries.length} ${g.entries.length === 1 ? "entry" : "entries"}</span><span class="chev" aria-hidden="true"></span></summary>
        <div class="month-entries">
          ${g.entries
            .map(
              (e, ei) => `
            <details class="entry"${gi === 0 && ei === 0 ? " open" : ""}>
              <summary><span class="entry-date">${esc(e.day)}</span><span class="entry-peek">${esc(String(e.text).trim().slice(0, 70))}${e.text.length > 70 ? "…" : ""}</span></summary>
              <div class="entry-text">${String(e.text)
                .trim()
                .split(/\n\s*\n/)
                .map((p) => `<p>${esc(p.trim())}</p>`)
                .join("")}</div>
            </details>`,
            )
            .join("")}
        </div>
      </details>`,
      )
      .join("");
    return `
    <section class="section journal" id="journal" aria-labelledby="journal-title">
      ${head("journal", text("textbox40", "Journal"), text("textbox41", "Reflections")).replace("<h2>", '<h2 id="journal-title">')}
      <div class="journal-list">${body}</div>
    </section>`;
  }

  function buildCrazy() {
    return `
    <section class="section crazy" id="crazy8s" aria-labelledby="crazy-title">
      ${head("crazy8s", "A game table", "Crazy Eights").replace("<h2>", '<h2 id="crazy-title">')}
      <div class="crazy-wrap card rise">
        <div class="crazy-cards" aria-hidden="true">
          <span class="pcard back" style="--r:-14deg;--x:-34px"></span>
          <span class="pcard face red" style="--r:-4deg;--x:-4px"><b>8</b><i>♥</i></span>
          <span class="pcard face" style="--r:7deg;--x:26px"><b>8</b><i>♠</i></span>
          <span class="pcard face red" style="--r:17deg;--x:56px"><b>K</b><i>♦</i></span>
        </div>
        <div class="crazy-copy">
          <h3>Play against Mr. Samo the bot, or with friends</h3>
          <p>A standard deck, wild eights and private tables for 2–4 players. Solo play, championships, taunts, and a dealer who has seen it all.</p>
          <a class="btn primary" href="${BASE}crazy8s/" target="_blank" rel="noopener">Play Crazy Eights</a>
        </div>
      </div>
    </section>`;
  }

  function buildDino() {
    return `
    <section class="section dino" id="dinosaur-facts" aria-labelledby="dino-title">
      ${head("dinosaur-facts", "Prehistoric Intermission", "Dinosaur Facts").replace("<h2>", '<h2 id="dino-title">')}
      <div class="showcase card rise" id="dino-box"></div>
    </section>`;
  }
  function renderDino() {
    const list = window.dinosaurFactEntriesData || [];
    const box = root.querySelector("#dino-box");
    if (!box || !list.length) return;
    const d = list[((dinoIndex % list.length) + list.length) % list.length];
    box.innerHTML = `
      <div class="showcase-copy">
        <p class="label">Dinosaur Fun Fact</p>
        <p class="who">${esc(d.title)}</p>
        <p class="said" aria-live="polite">${esc(d.fact)}</p>
        <div class="arrows"><button type="button" data-dino="-1" aria-label="Previous dinosaur fact">←</button><button type="button" data-dino="1" aria-label="Next dinosaur fact">→</button></div>
      </div>
      <figure class="showcase-fig"><img src="${img(d.image)}" alt="${esc(d.alt || d.title)}" /><figcaption>${esc(d.title)}</figcaption></figure>`;
  }

  function buildPrompts() {
    return `
    <section class="section prompts" id="prompts" aria-labelledby="prompts-title">
      ${head("prompts", text("textbox42", "Who Are You?"), text("textbox43", "Words to Sit With")).replace("<h2>", '<h2 id="prompts-title">')}
      <div class="showcase card rise" id="quote-box"></div>
    </section>`;
  }
  function renderQuote() {
    const list = window.quoteEntriesData || [];
    const box = root.querySelector("#quote-box");
    if (!box || !list.length) return;
    const q = list[((quoteIndex % list.length) + list.length) % list.length];
    box.innerHTML = `
      <div class="showcase-copy">
        <p class="label">${esc(text("textbox44", "Words from"))}</p>
        <p class="who">${esc(q.author)}</p>
        <p class="said big" aria-live="polite">“${esc(q.quote)}”</p>
        <div class="arrows"><button type="button" data-quote="-1" aria-label="Previous quote">←</button><button type="button" data-quote="1" aria-label="Next quote">→</button></div>
      </div>
      <figure class="showcase-fig"><img src="${img(q.image)}" alt="${esc(q.alt || q.author)}" /><figcaption>${esc(q.author)}</figcaption></figure>`;
  }

  function buildContact() {
    return `
    <section class="section contact" id="contact" aria-labelledby="contact-title">
      ${head("contact", text("textbox45", "Contact"), text("textbox46", "Contact")).replace("<h2>", '<h2 id="contact-title">')}
      <div class="contact-grid">
        <div class="card contact-card rise">
          <h3>${esc(text("textbox47", "Email"))}</h3>
          <p><a class="link" href="mailto:samokarplus@gmail.com">${esc(text("textbox48", "samokarplus@gmail.com"))}</a></p>
          <h3 class="mt">${esc(text("textbox49", "Find me on"))}</h3>
          <div class="socials">
            <a class="btn" href="https://www.strava.com/athletes/180152616" target="_blank" rel="noreferrer">${esc(text("textbox50", "Strava"))}</a>
            <a class="btn" href="https://open.spotify.com/user/samokarplus" target="_blank" rel="noreferrer">${esc(text("textbox51", "Spotify"))}</a>
          </div>
          <figure class="contact-photo"><img class="photo" loading="lazy" src="${img("assets/images/contact-highlight.png")}" alt="A highlighted portrait of Samo." /></figure>
        </div>
        <div class="card contact-card cal rise">
          <h3>${esc(text("textbox52", "Schedule a conversation"))}</h3>
          <p>${esc(text("textbox53", "Book a time directly if you’d like to connect."))}</p>
          <a class="btn primary" href="https://calendly.com/samokarplus/30min" target="_blank" rel="noreferrer">Open the calendar</a>
          <p class="note">The live site embeds Calendly here; the lab links out to keep previews light.</p>
        </div>
      </div>
    </section>`;
  }

  const BUILDERS = { home: buildHero, about: buildAbout, gallery: buildGallery, media: buildMedia, journal: buildJournal, crazy8s: buildCrazy, "dinosaur-facts": buildDino, prompts: buildPrompts, contact: buildContact };

  /* ---------- Strava / formatting ---------- */
  function formatRaceDate(v) {
    const m = String(v || "").match(/(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}` : v || "";
  }
  const nf = (n) => (typeof n === "number" ? n.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "--");
  async function loadStrava() {
    const set = (id, v) => {
      const el = root.querySelector("#" + id);
      if (el) el.textContent = v;
    };
    try {
      const r = await fetch(BASE + "strava-data.json", { cache: "no-store" });
      const s = await r.json();
      set("strava-year", s.year || new Date().getFullYear());
      set("strava-run-miles", nf(s.runMiles ?? s.miles));
      set("strava-walk-miles", nf(s.walkMiles ?? 0));
      set("strava-run-elevation", nf(s.totalElevationFeet ?? s.elevationFeet));
      set("strava-bike-miles", nf(s.bikeMiles ?? 0));
      set("strava-swim-miles", nf(s.swimMiles ?? 0));
      const d = s.updatedAt ? new Date(s.updatedAt) : null;
      set("strava-updated", d && !isNaN(d) ? "Synced " + d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "");
    } catch {
      set("strava-updated", "Strava sync unavailable");
    }
  }

  /* ---------- render + config ---------- */
  function render() {
    const only = state.section !== "all" && SECTION_IDS.includes(state.section) ? state.section : null;
    const ids = only ? [only] : SECTION_IDS;
    root.innerHTML = `${buildNav()}<main id="main">${ids.map((id) => BUILDERS[id]()).join("")}</main>
      <footer class="foot"><div class="palms palms-foot" aria-hidden="true"><i><svg viewBox="0 0 124 230" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M60 228 C58 170 68 118 62 72" stroke-width="7"/><path d="M62 72 C40 40 10 40 0 64" stroke-width="5"/><path d="M62 72 C42 62 20 72 8 102" stroke-width="5"/><path d="M62 72 C84 38 114 40 124 64" stroke-width="5"/><path d="M62 72 C82 62 104 72 116 102" stroke-width="5"/><path d="M62 72 C50 40 44 20 30 8" stroke-width="5"/><path d="M62 72 C74 40 80 20 94 8" stroke-width="5"/><path d="M62 72 C62 52 62 32 62 14" stroke-width="5"/></g><circle cx="58" cy="78" r="5" fill="currentColor"/><circle cx="68" cy="80" r="5" fill="currentColor"/></svg></i><i><svg viewBox="0 0 124 230" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M60 228 C58 170 68 118 62 72" stroke-width="7"/><path d="M62 72 C40 40 10 40 0 64" stroke-width="5"/><path d="M62 72 C42 62 20 72 8 102" stroke-width="5"/><path d="M62 72 C84 38 114 40 124 64" stroke-width="5"/><path d="M62 72 C82 62 104 72 116 102" stroke-width="5"/><path d="M62 72 C50 40 44 20 30 8" stroke-width="5"/><path d="M62 72 C74 40 80 20 94 8" stroke-width="5"/><path d="M62 72 C62 52 62 32 62 14" stroke-width="5"/></g><circle cx="58" cy="78" r="5" fill="currentColor"/><circle cx="68" cy="80" r="5" fill="currentColor"/></svg></i><i><svg viewBox="0 0 124 230" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M60 228 C58 170 68 118 62 72" stroke-width="7"/><path d="M62 72 C40 40 10 40 0 64" stroke-width="5"/><path d="M62 72 C42 62 20 72 8 102" stroke-width="5"/><path d="M62 72 C84 38 114 40 124 64" stroke-width="5"/><path d="M62 72 C82 62 104 72 116 102" stroke-width="5"/><path d="M62 72 C50 40 44 20 30 8" stroke-width="5"/><path d="M62 72 C74 40 80 20 94 8" stroke-width="5"/><path d="M62 72 C62 52 62 32 62 14" stroke-width="5"/></g><circle cx="58" cy="78" r="5" fill="currentColor"/><circle cx="68" cy="80" r="5" fill="currentColor"/></svg></i><i><svg viewBox="0 0 124 230" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M60 228 C58 170 68 118 62 72" stroke-width="7"/><path d="M62 72 C40 40 10 40 0 64" stroke-width="5"/><path d="M62 72 C42 62 20 72 8 102" stroke-width="5"/><path d="M62 72 C84 38 114 40 124 64" stroke-width="5"/><path d="M62 72 C82 62 104 72 116 102" stroke-width="5"/><path d="M62 72 C50 40 44 20 30 8" stroke-width="5"/><path d="M62 72 C74 40 80 20 94 8" stroke-width="5"/><path d="M62 72 C62 52 62 32 62 14" stroke-width="5"/></g><circle cx="58" cy="78" r="5" fill="currentColor"/><circle cx="68" cy="80" r="5" fill="currentColor"/></svg></i><i><svg viewBox="0 0 124 230" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M60 228 C58 170 68 118 62 72" stroke-width="7"/><path d="M62 72 C40 40 10 40 0 64" stroke-width="5"/><path d="M62 72 C42 62 20 72 8 102" stroke-width="5"/><path d="M62 72 C84 38 114 40 124 64" stroke-width="5"/><path d="M62 72 C82 62 104 72 116 102" stroke-width="5"/><path d="M62 72 C50 40 44 20 30 8" stroke-width="5"/><path d="M62 72 C74 40 80 20 94 8" stroke-width="5"/><path d="M62 72 C62 52 62 32 62 14" stroke-width="5"/></g><circle cx="58" cy="78" r="5" fill="currentColor"/><circle cx="68" cy="80" r="5" fill="currentColor"/></svg></i></div><p>Samo Karplus · design preview, not the live site</p></footer>`;
    html.dataset.view = only ? "single" : "all";
    renderDino();
    renderQuote();
    loadStrava();
    watchReveal();
    window.scrollTo(0, 0);
  }

  function luminance(hex) {
    const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function fontStack(name) {
    const f = (window.LAB_FONTS || []).find((x) => x.id === name);
    return f ? f.stack : `"${name}", system-ui, sans-serif`;
  }

  function applyConfig(cfg) {
    state.config = cfg;
    const s = html.style;
    const p = cfg.palette;
    s.setProperty("--bg", p.bg);
    s.setProperty("--surface", p.surface);
    s.setProperty("--ink", p.ink);
    s.setProperty("--muted", p.muted);
    s.setProperty("--accent", p.accent);
    s.setProperty("--accent-ink", p.accentInk);
    s.setProperty("--accent2", p.accent2);
    s.setProperty("--line", p.line);
    s.setProperty("--deep", p.deep);
    s.setProperty("--deep-ink", p.deepInk);
    const t = cfg.type;
    s.setProperty("--font-head", fontStack(t.head));
    s.setProperty("--font-body", fontStack(t.body));
    s.setProperty("--head-weight", t.weight);
    s.setProperty("--head-case", t.upper ? "uppercase" : "none");
    s.setProperty("--head-track", t.tracking + "em");
    s.setProperty("--head-scale", t.scale);
    s.setProperty("--body-scale", t.bodyScale);
    s.setProperty("--radius", cfg.shape.radius + "px");
    s.setProperty("--space", cfg.shape.space);
    s.setProperty("--shadow-k", cfg.shape.shadow);
    s.setProperty("--img-filter", cfg.filter || "none");
    const land = cfg.photos.landscape;
    s.setProperty("--landscape", land && land !== "none" ? `url('${img("assets/images/" + land)}')` : "none");
    s.setProperty("--landscape-pos", land === "about-ocean.jpeg" ? "50% 22%" : land === "hero-mountain.jpg" ? "50% 12%" : land === "about-mountain.jpeg" ? "50% 100%" : "50% 40%");
    s.setProperty("--hero-img", `url('${img("assets/images/" + (cfg.photos.hero || "hero-mountain.jpg"))}')`);
    Object.entries(cfg.layout).forEach(([k, v]) => (html.dataset[k] = v));
    html.dataset.flavor = cfg.flavor || "coastal";
    html.dataset.tone = luminance(p.bg) < 0.25 ? "dark" : "light";
    html.dataset.landscape = land && land !== "none" ? "on" : "off";
  }

  function setSection(id) {
    if (id === state.section) return;
    state.section = id || "all";
    render();
  }

  /* ---------- interactions ---------- */
  function closeNav() {
    const btn = root.querySelector(".nav-toggle");
    if (!btn) return;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Open menu");
    html.classList.remove("nav-open");
  }
  function openNav() {
    const btn = root.querySelector(".nav-toggle");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Close menu");
    html.classList.add("nav-open");
    root.querySelector(".nav-links a")?.focus({ preventScroll: true });
  }

  root.addEventListener("click", (e) => {
    const toggle = e.target.closest(".nav-toggle");
    if (toggle) {
      html.classList.contains("nav-open") ? closeNav() : openNav();
      return;
    }
    if (e.target.closest(".nav-scrim")) return closeNav();
    const go = e.target.closest("[data-go]");
    if (go) {
      e.preventDefault();
      const id = go.dataset.go;
      closeNav();
      if (html.dataset.view === "single") {
        setSection(id === "crazy8s" || SECTION_IDS.includes(id) ? id : "home");
        parent?.postMessage({ type: "section", section: id }, "*");
      } else document.getElementById(id)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      return;
    }
    const dino = e.target.closest("[data-dino]");
    if (dino) {
      dinoIndex += Number(dino.dataset.dino);
      renderDino();
    }
    const quote = e.target.closest("[data-quote]");
    if (quote) {
      quoteIndex += Number(quote.dataset.quote);
      renderQuote();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  let io;
  function watchReveal() {
    if (io) io.disconnect();
    const items = root.querySelectorAll(".rise");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
    );
    items.forEach((el) => io.observe(el));
    // never leave content hidden if the observer is slow (previews, thumbnails)
    setTimeout(() => root.querySelectorAll(".rise:not(.in)").forEach((el) => (el.getBoundingClientRect().top < innerHeight * 1.4 ? el.classList.add("in") : 0)), 700);
  }

  /* ---------- boot: query string presets + messages from the lab ---------- */
  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }
  const q = new URLSearchParams(location.search);
  let boot = clone(window.LAB_THEMES[q.get("theme")] || window.LAB_THEMES.coastal);
  if (q.get("c")) {
    try {
      boot = JSON.parse(decodeURIComponent(q.get("c")));
    } catch {}
  }
  ["nav", "hero", "about", "photos", "media", "journal", "cards", "btn", "headers"].forEach((k) => q.get(k) && (boot.layout[k] = q.get(k)));
  applyConfig(boot);
  state.section = q.get("section") || "all";
  if (q.get("static")) html.dataset.static = "1";
  render();

  window.addEventListener("message", (e) => {
    const m = e.data;
    if (!m || typeof m !== "object") return;
    if (m.type === "lab-config") {
      applyConfig(m.config);
      if (m.section && m.section !== state.section) setSection(m.section);
      if (m.nav === "close") closeNav();
    } else if (m.type === "lab-scroll") {
      window.scrollTo({ top: m.y || 0 });
    } else if (m.type === "lab-open-nav") {
      openNav();
    }
  });
  parent !== window && parent.postMessage({ type: "ready" }, "*");
})();
