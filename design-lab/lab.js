// Design Lab controller: gallery, studio (mix & match), compare, menus, top 3.
(function () {
  const THEMES = window.LAB_THEMES;
  const ORDER = window.LAB_ORDER;
  const OPT = window.LAB_OPTIONS;
  const FONTS = window.LAB_FONTS;
  const PHOTOS = window.LAB_PHOTOS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const DEVICES = { desktop: 1360, tablet: 834, mobile: 390 };
  const SECTIONS = [
    ["all", "Full page"],
    ["home", "Homepage + Strava"],
    ["about", "About Me"],
    ["gallery", "Photos"],
    ["media", "Media & Projects"],
    ["journal", "Journal"],
    ["crazy8s", "Crazy Eights"],
    ["dinosaur-facts", "Dinosaur Facts"],
    ["prompts", "Words to Sit With"],
    ["contact", "Contact"],
  ];
  const FILTERS = [
    ["none", "Natural color"],
    ["grayscale(1) contrast(1.05)", "Black & white"],
    ["sepia(.22) saturate(1.1)", "Warm film"],
    ["saturate(.7) contrast(.96)", "Muted"],
    ["saturate(1.25) contrast(1.04)", "Vivid"],
    ["saturate(.85) brightness(.95)", "Moody"],
  ];

  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem("designlab:" + k);
        return v ? JSON.parse(v) : d;
      } catch {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem("designlab:" + k, JSON.stringify(v));
      } catch {}
    },
  };

  const S = {
    view: "gallery",
    device: store.get("device", "desktop"),
    section: "all",
    base: store.get("base", "coastal"),
    config: store.get("config", null) || clone(THEMES.coastal),
    compare: store.get("compare", ["current", "coastal"]),
    syncScroll: true,
    mix: { colors: "", type: "", layout: "", nav: "" },
  };
  const view = $("#view");
  const frames = new Set();

  /* ------------------------------------------------------------------ helpers */
  const themeName = (id) => (id === "current" ? "Your site today (live)" : id === "mix" ? "My Studio mix" : THEMES[id]?.name || id);
  function configFor(id) {
    return id === "mix" ? S.config : clone(THEMES[id]);
  }
  function swatches(p) {
    return [p.bg, p.surface, p.accent, p.accent2, p.ink].map((c) => `<i style="background:${c}" title="${c}"></i>`).join("");
  }
  function frameSrc(id, section, extra = "") {
    if (id === "current") return "../index.html";
    return `preview.html?theme=${id === "mix" ? "coastal" : id}&section=${section || "all"}${extra}`;
  }
  function makeFrame({ id, section = "all", title, cls = "", lazy = true, extra = "" }) {
    const f = document.createElement("iframe");
    f.className = "pv " + cls;
    f.title = title;
    if (lazy) f.loading = "lazy";
    f.src = frameSrc(id, section, extra);
    f.dataset.source = id;
    frames.add(f);
    f.addEventListener("load", () => push(f));
    return f;
  }
  function push(f) {
    const id = f.dataset.source;
    if (id === "current") return;
    try {
      f.contentWindow.postMessage({ type: "lab-config", config: id === "mix" ? S.config : clone(THEMES[id]), section: f.dataset.section || S.section }, "*");
    } catch {}
  }
  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "ready") {
      frames.forEach((f) => f.contentWindow === e.source && push(f));
    }
  });
  function refreshMix() {
    store.set("config", S.config);
    frames.forEach((f) => f.dataset.source === "mix" && push(f));
  }
  function fit() {
    $$(".stage-fit").forEach((box) => {
      const dev = box.querySelector(".device");
      if (!dev) return;
      const w = DEVICES[box.dataset.device || S.device];
      const avail = box.clientWidth;
      const scale = Math.min(1, avail / w);
      dev.style.width = w + "px";
      dev.style.height = box.clientHeight / scale + "px";
      dev.style.transform = `scale(${scale})`;
      box.dataset.scale = scale.toFixed(2);
    });
  }
  new ResizeObserver(fit).observe(document.body);

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function optionList(list, current) {
    return list.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(current) ? " selected" : ""}>${esc(l)}</option>`).join("");
  }
  const themeOptions = (selected, extra = []) =>
    [...extra, ...ORDER.map((id) => [id, THEMES[id].name])].map(([v, l]) => `<option value="${v}"${v === selected ? " selected" : ""}>${esc(l)}</option>`).join("");

  function deviceBar() {
    return `<div class="seg" role="group" aria-label="Device size">${Object.keys(DEVICES)
      .map((d) => `<button type="button" data-device="${d}" aria-pressed="${S.device === d}">${d[0].toUpperCase() + d.slice(1)} <small>${DEVICES[d]}</small></button>`)
      .join("")}</div>`;
  }
  function sectionSelect() {
    return `<label class="field inline"><span>Preview</span><select data-section>${optionList(SECTIONS, S.section)}</select></label>`;
  }
  function bindToolbar(root) {
    $$("[data-device]", root).forEach((b) =>
      b.addEventListener("click", () => {
        S.device = b.dataset.device;
        store.set("device", S.device);
        $$("[data-device]", root).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        $$(".stage-fit").forEach((s) => (s.dataset.device = S.device));
        fit();
      }),
    );
    const sel = $("[data-section]", root);
    sel?.addEventListener("change", () => {
      S.section = sel.value;
      frames.forEach((f) => {
        f.dataset.section = S.section;
        if (f.dataset.source === "current") {
          if (S.section !== "all") f.src = "../index.html#" + (S.section === "home" ? "home" : S.section);
        } else push(f);
      });
    });
  }

  /* ------------------------------------------------------------------ views */
  function show(name) {
    S.view = name;
    frames.clear();
    $$(".tabs [role=tab]").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.view === name)));
    view.innerHTML = "";
    view.className = "view-" + name;
    ({ gallery, studio, compare, menus, top3 })[name]();
    history.replaceState(null, "", "#" + name);
    fit();
  }
  $$(".tabs [role=tab]").forEach((t) => t.addEventListener("click", () => show(t.dataset.view)));

  /* ---- Gallery ---- */
  function gallery() {
    const intro = el(`<section class="intro">
      <h2>Ten ways your site could look</h2>
      <p>Every preview below is <strong>your real homepage</strong>: your portrait, Strava stats, About cards, photos, films, journal, games and contact. Open any one in the Studio to remix fonts, colors, corners, layout and menu style.</p>
    </section>`);
    const grid = el(`<div class="gallery-grid"></div>`);
    const live = el(`<article class="gcard live">
      <div class="gthumb"><div class="thumb-frame"></div></div>
      <div class="ginfo"><h3>Your site today</h3><p>The live design, for reference.</p>
      <div class="gbtns"><a class="btn" href="../index.html" target="_blank" rel="noopener">Open ↗</a><button class="btn ghost" data-compare="current">Compare</button></div></div></article>`);
    const lf = makeFrame({ id: "current", title: "Your current site", cls: "thumb-pv" });
    $(".thumb-frame", live).append(lf);
    lf.style.pointerEvents = "none";
    grid.append(live);
    ORDER.forEach((id, i) => {
      const t = THEMES[id];
      const card = el(`<article class="gcard" style="--i:${i}">
        <button class="gthumb" data-open="${id}" aria-label="Open ${esc(t.name)} in the Studio"><div class="thumb-frame"></div><span class="open-hint">Open in Studio →</span></button>
        <div class="ginfo">
          <div class="gtitle"><span class="gnum">${String(i + 1).padStart(2, "0")}</span><h3>${esc(t.name)}</h3></div>
          <p>${esc(t.tagline)}</p>
          <div class="sw">${swatches(t.palette)}</div>
          <p class="fonts"><b>${esc(t.type.head)}</b> + ${esc(t.type.body)}</p>
          <div class="tags">${t.tags.map((x) => `<span>${esc(x)}</span>`).join("")}<span>${esc(OPT.nav.find((o) => o[0] === t.layout.nav)[1].split(" →")[0])}</span></div>
          <div class="gbtns"><button class="btn primary" data-open="${id}">Open in Studio</button><button class="btn ghost" data-compare="${id}">Compare</button></div>
        </div></article>`);
      const f = makeFrame({ id, section: "all", title: `${t.name} preview`, cls: "thumb-pv", extra: "&static=1" });
      f.style.pointerEvents = "none";
      $(".thumb-frame", card).append(f);
      grid.append(card);
    });
    view.append(intro, grid);
    // scale thumbnails (1280 wide into the card)
    const scaleThumbs = () =>
      $$(".thumb-frame").forEach((tf) => {
        const s = tf.clientWidth / 1280;
        const f = tf.firstElementChild;
        f.style.width = "1280px";
        f.style.height = tf.clientHeight / s + "px";
        f.style.transform = `scale(${s})`;
      });
    scaleThumbs();
    new ResizeObserver(scaleThumbs).observe(grid);
    grid.addEventListener("click", (e) => {
      const o = e.target.closest("[data-open]");
      if (o) {
        S.base = o.dataset.open;
        S.config = clone(THEMES[S.base]);
        S.mix = { colors: "", type: "", layout: "", nav: "" };
        store.set("base", S.base);
        refreshMix();
        show("studio");
        return;
      }
      const c = e.target.closest("[data-compare]");
      if (c) {
        S.compare = [S.compare[1], c.dataset.compare];
        store.set("compare", S.compare);
        show("compare");
      }
    });
  }

  /* ---- Studio ---- */
  function colorField(key, label) {
    return `<label class="color"><input type="color" data-pal="${key}" value="${S.config.palette[key]}" /><span>${label}</span><code>${S.config.palette[key]}</code></label>`;
  }
  function range(id, label, min, max, step, value, unit = "") {
    return `<label class="field range"><span>${label} <output id="o-${id}">${value}${unit}</output></span><input type="range" id="r-${id}" min="${min}" max="${max}" step="${step}" value="${value}" /></label>`;
  }
  function mixSelect(group, label) {
    return `<label class="field"><span>${label}</span><select data-mix="${group}"><option value="">Keep current</option>${ORDER.map((id) => `<option value="${id}"${S.mix[group] === id ? " selected" : ""}>${esc(THEMES[id].name)}</option>`).join("")}</select></label>`;
  }
  function layoutSelect(key, label) {
    return `<label class="field"><span>${label}</span><select data-layout="${key}">${optionList(OPT[key], S.config.layout[key])}</select></label>`;
  }
  function studioControls() {
    const c = S.config;
    return `
    <form class="controls" onsubmit="return false">
      <details open><summary>Start from</summary>
        <label class="field"><span>Direction</span><select id="base">${themeOptions(S.base)}</select></label>
        <p class="hint">Picking a direction resets the controls below to that design.</p>
      </details>
      <details open><summary>Mix elements from other designs</summary>
        ${mixSelect("colors", "Colors from")}
        ${mixSelect("type", "Typography from")}
        ${mixSelect("layout", "Layout & cards from")}
        ${mixSelect("nav", "Menu from")}
        <p class="hint">Example: Coastal colors + Editorial typography + a minimal menu.</p>
      </details>
      <details><summary>Menu & navigation</summary>
        ${layoutSelect("nav", "Menu style")}
        <p class="hint">Tip: resize to Mobile, or use the Menus tab, to compare hamburgers.</p>
      </details>
      <details><summary>Layout</summary>
        ${layoutSelect("hero", "Homepage")}
        ${layoutSelect("about", "About Me")}
        ${layoutSelect("photos", "Photos")}
        ${layoutSelect("media", "Media & Projects")}
        ${layoutSelect("journal", "Journal")}
        ${layoutSelect("headers", "Section headers")}
      </details>
      <details><summary>Cards & buttons</summary>
        ${layoutSelect("cards", "Card style")}
        ${layoutSelect("btn", "Button shape")}
        ${range("radius", "Corner roundness", 0, 48, 1, c.shape.radius, "px")}
        ${range("shadow", "Shadow depth", 0, 2, 0.1, c.shape.shadow)}
      </details>
      <details><summary>Typography</summary>
        <label class="field"><span>Headings</span><select id="head">${FONTS.map((f) => `<option${f.id === c.type.head ? " selected" : ""}>${f.id}</option>`).join("")}</select></label>
        <label class="field"><span>Body</span><select id="body">${FONTS.map((f) => `<option${f.id === c.type.body ? " selected" : ""}>${f.id}</option>`).join("")}</select></label>
        <label class="field"><span>Heading weight</span><select id="weight">${[300, 400, 500, 600, 700, 800, 900].map((w) => `<option${w === c.type.weight ? " selected" : ""}>${w}</option>`).join("")}</select></label>
        <label class="check"><input type="checkbox" id="upper"${c.type.upper ? " checked" : ""}/> UPPERCASE headings</label>
        ${range("hscale", "Heading size", 0.7, 1.8, 0.05, c.type.scale, "×")}
        ${range("track", "Heading tracking", -0.06, 0.3, 0.005, c.type.tracking, "em")}
        ${range("bscale", "Body size", 0.85, 1.25, 0.01, c.type.bodyScale, "×")}
      </details>
      <details><summary>Colors</summary>
        <div class="colors">${colorField("bg", "Background")}${colorField("surface", "Cards")}${colorField("ink", "Text")}${colorField("muted", "Soft text")}${colorField("accent", "Accent")}${colorField("accent2", "Accent 2")}${colorField("deep", "Deep / overlay")}${colorField("line", "Lines")}</div>
      </details>
      <details><summary>Photography</summary>
        <label class="field"><span>Landscape behind cards</span><select id="landscape">${optionList(Object.entries(PHOTOS), c.photos.landscape)}</select></label>
        <label class="field"><span>Photo treatment</span><select id="filter">${optionList(FILTERS, c.filter || "none")}</select></label>
      </details>
      <details><summary>Spacing</summary>
        ${range("space", "Section spacing", 0.5, 1.9, 0.05, c.shape.space, "×")}
      </details>
      <div class="ctl-btns">
        <button type="button" class="btn ghost" id="reset">Reset</button>
        <button type="button" class="btn ghost" id="copy">Copy settings</button>
        <button type="button" class="btn ghost" id="paste">Paste</button>
      </div>
      <p class="hint" id="note" role="status"></p>
    </form>`;
  }
  function studio() {
    view.innerHTML = `<div class="studio">
      <aside class="side" aria-label="Design controls">${studioControls()}</aside>
      <section class="stage-col">
        <div class="bar">
          <div class="bar-title"><strong>${esc(themeName(S.base))}</strong> <span class="pill">live mix</span></div>
          ${sectionSelect()}
          ${deviceBar()}
          <a class="btn ghost" id="newtab" href="#" target="_blank" rel="noopener">Open full size ↗</a>
        </div>
        <div class="stage-fit" data-device="${S.device}"><div class="device"></div></div>
      </section>
    </div>`;
    const f = makeFrame({ id: "mix", section: S.section, title: "Studio preview of your site", lazy: false });
    f.dataset.section = S.section;
    $(".device").append(f);
    bindToolbar(view);
    bindControls();
    $("#newtab").addEventListener("click", (e) => {
      e.currentTarget.href = `preview.html?c=${encodeURIComponent(JSON.stringify(S.config))}&section=${S.section}`;
    });
  }
  function bindControls() {
    const form = $(".controls");
    const note = $("#note");
    const flash = (m) => {
      note.textContent = m;
      clearTimeout(flash.t);
      flash.t = setTimeout(() => (note.textContent = ""), 2400);
    };
    const changed = () => refreshMix();
    $("#base").addEventListener("change", (e) => {
      S.base = e.target.value;
      S.config = clone(THEMES[S.base]);
      S.mix = { colors: "", type: "", layout: "", nav: "" };
      store.set("base", S.base);
      refreshMix();
      show("studio");
    });
    $$("[data-mix]", form).forEach((s) =>
      s.addEventListener("change", () => {
        const g = s.dataset.mix;
        S.mix[g] = s.value;
        if (!s.value) return;
        const t = THEMES[s.value];
        if (g === "colors") S.config.palette = clone(t.palette), (S.config.filter = t.filter);
        if (g === "type") S.config.type = clone(t.type);
        if (g === "layout") {
          const keep = S.config.layout.nav;
          S.config.layout = { ...clone(t.layout), nav: keep };
          S.config.shape = clone(t.shape);
          S.config.photos = clone(t.photos);
          S.config.flavor = t.flavor;
        }
        if (g === "nav") S.config.layout.nav = t.layout.nav;
        changed();
        const keepScroll = $(".side").scrollTop;
        const open = $$("details", form).map((d) => d.open);
        $(".side").innerHTML = studioControls();
        $$("details", $(".side")).forEach((d, i) => (d.open = open[i]));
        $(".side").scrollTop = keepScroll;
        bindControls();
        flash("Mixed.");
      }),
    );
    $$("[data-layout]", form).forEach((s) =>
      s.addEventListener("change", () => {
        S.config.layout[s.dataset.layout] = s.value;
        changed();
      }),
    );
    $$("[data-pal]", form).forEach((i) =>
      i.addEventListener("input", () => {
        S.config.palette[i.dataset.pal] = i.value;
        i.parentElement.querySelector("code").textContent = i.value;
        if (i.dataset.pal === "accent") S.config.palette.accentInk = readable(i.value);
        changed();
      }),
    );
    const bindRange = (id, apply) => {
      const r = $("#r-" + id);
      r.addEventListener("input", () => {
        const v = Number(r.value);
        $("#o-" + id).textContent = r.value + ({ radius: "px", hscale: "×", bscale: "×", space: "×", track: "em" }[id] || "");
        apply(v);
        changed();
      });
    };
    bindRange("radius", (v) => (S.config.shape.radius = v));
    bindRange("shadow", (v) => (S.config.shape.shadow = v));
    bindRange("space", (v) => (S.config.shape.space = v));
    bindRange("hscale", (v) => (S.config.type.scale = v));
    bindRange("track", (v) => (S.config.type.tracking = v));
    bindRange("bscale", (v) => (S.config.type.bodyScale = v));
    $("#head").addEventListener("change", (e) => ((S.config.type.head = e.target.value), changed()));
    $("#body").addEventListener("change", (e) => ((S.config.type.body = e.target.value), changed()));
    $("#weight").addEventListener("change", (e) => ((S.config.type.weight = Number(e.target.value)), changed()));
    $("#upper").addEventListener("change", (e) => ((S.config.type.upper = e.target.checked), changed()));
    $("#landscape").addEventListener("change", (e) => ((S.config.photos.landscape = e.target.value), changed()));
    $("#filter").addEventListener("change", (e) => ((S.config.filter = e.target.value === "none" ? "" : e.target.value), changed()));
    $("#reset").addEventListener("click", () => {
      S.config = clone(THEMES[S.base === "mix" ? "coastal" : S.base]);
      S.mix = { colors: "", type: "", layout: "", nav: "" };
      refreshMix();
      show("studio");
    });
    $("#copy").addEventListener("click", async () => {
      const json = JSON.stringify(S.config, null, 2);
      try {
        await navigator.clipboard.writeText(json);
        flash("Settings copied. Paste them back any time.");
      } catch {
        prompt("Copy these settings:", json);
      }
    });
    $("#paste").addEventListener("click", () => {
      const json = prompt("Paste settings copied from the Studio:");
      if (!json) return;
      try {
        const c = JSON.parse(json);
        if (!c.palette || !c.type || !c.layout) throw new Error("bad");
        S.config = c;
        refreshMix();
        show("studio");
      } catch {
        flash("That doesn't look like Studio settings.");
      }
    });
  }
  function readable(hex) {
    const n = parseInt(hex.slice(1), 16);
    const l = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return l > 0.6 ? "#111111" : "#ffffff";
  }

  /* ---- Compare ---- */
  function compare() {
    const side = (i) => `
      <section class="cmp-pane" data-pane="${i}">
        <div class="cmp-head">
          <label class="field inline"><span>${i ? "B" : "A"}</span><select data-src="${i}">${themeOptions(S.compare[i], [["current", "Your site today (live)"], ["mix", "My Studio mix"]])}</select></label>
        </div>
        <div class="stage-fit" data-device="${S.device}"><div class="device"></div></div>
      </section>`;
    view.innerHTML = `
      <div class="bar wide">
        <div class="bar-title"><strong>Side by side</strong></div>
        ${sectionSelect()}
        ${deviceBar()}
        <label class="check"><input type="checkbox" id="sync" ${S.syncScroll ? "checked" : ""}/> Sync scrolling</label>
        <button class="btn ghost" id="swap">Swap A ↔ B</button>
      </div>
      <div class="cmp">${side(0)}${side(1)}</div>`;
    const panes = $$(".cmp-pane");
    const build = () =>
      panes.forEach((p, i) => {
        const dev = $(".device", p);
        dev.innerHTML = "";
        const f = makeFrame({ id: S.compare[i], section: S.section, title: `Preview ${i ? "B" : "A"}: ${themeName(S.compare[i])}`, lazy: false });
        f.dataset.section = S.section;
        dev.append(f);
        f.addEventListener("load", () => {
          try {
            f.contentWindow.addEventListener("scroll", () => {
              if (!S.syncScroll) return;
              const other = panes[1 - i].querySelector("iframe");
              const max = (w) => Math.max(1, w.document.documentElement.scrollHeight - w.innerHeight);
              const ratio = f.contentWindow.scrollY / max(f.contentWindow);
              if (other.contentWindow.__lock) return;
              f.contentWindow.__lock = true;
              other.contentWindow.scrollTo(0, ratio * max(other.contentWindow));
              requestAnimationFrame(() => (f.contentWindow.__lock = false));
            });
          } catch {}
        });
      });
    build();
    bindToolbar(view);
    $$("[data-src]").forEach((s) =>
      s.addEventListener("change", () => {
        S.compare[Number(s.dataset.src)] = s.value;
        store.set("compare", S.compare);
        build();
        fit();
      }),
    );
    $("#sync").addEventListener("change", (e) => (S.syncScroll = e.target.checked));
    $("#swap").addEventListener("click", () => {
      S.compare = [S.compare[1], S.compare[0]];
      store.set("compare", S.compare);
      show("compare");
    });
  }

  /* ---- Menus ---- */
  function menus() {
    view.innerHTML = `
      <div class="bar wide">
        <div class="bar-title"><strong>Menu styles</strong> <span class="pill">on ${esc(themeName(S.base))}</span></div>
        <label class="field inline"><span>Theme</span><select id="mtheme">${themeOptions(S.base)}</select></label>
        <p class="hint push">Every card is a live phone-width preview. Tap “Open menu” to see how each one opens.</p>
      </div>
      <div class="menu-grid"></div>`;
    const grid = $(".menu-grid");
    const render = (themeId) => {
      grid.innerHTML = "";
      OPT.nav.forEach(([key, label]) => {
        const cfg = clone(THEMES[themeId]);
        cfg.layout.nav = key;
        const card = el(`<article class="mcard"><h3>${esc(label)}</h3><div class="mphone"><div class="mscreen"></div></div><div class="gbtns"><button class="btn ghost" data-menu>Open menu</button><button class="btn" data-use>Use in Studio</button></div></article>`);
        const f = document.createElement("iframe");
        f.className = "pv";
        f.title = `${label} menu preview`;
        f.src = `preview.html?theme=${themeId}&section=home&static=1&nav=${key}`;
        f.width = 390;
        f.height = 760;
        f.loading = "lazy";
        f.addEventListener("load", () => f.contentWindow.postMessage({ type: "lab-config", config: cfg, section: "home" }, "*"));
        $(".mscreen", card).append(f);
        $("[data-menu]", card).addEventListener("click", (e) => {
          const open = f.contentDocument.documentElement.classList.contains("nav-open");
          f.contentWindow.postMessage(open ? { type: "lab-config", config: cfg, section: "home", nav: "close" } : { type: "lab-open-nav" }, "*");
          e.currentTarget.textContent = open ? "Open menu" : "Close menu";
        });
        $("[data-use]", card).addEventListener("click", () => {
          S.base = themeId;
          S.config = clone(THEMES[themeId]);
          S.config.layout.nav = key;
          store.set("base", S.base);
          refreshMix();
          show("studio");
        });
        grid.append(card);
      });
    };
    render(S.base);
    $("#mtheme").addEventListener("change", (e) => {
      S.base = e.target.value;
      store.set("base", S.base);
      render(S.base);
    });
  }

  /* ---- Top 3 ---- */
  function top3() {
    const recs = window.LAB_RECOMMENDATIONS;
    view.innerHTML = `
      <section class="intro"><h2>My three strongest picks for you</h2>
      <p>Based on what is actually on your site: serious, tender writing (journal, mental health, spiritual journey), big outdoor photos, running, a playful side (dinosaurs, Crazy Eights) and a calm, loving voice.</p></section>
      <div class="recs">${recs
        .map(
          (r, i) => `
        <article class="rec">
          <div class="rec-thumb"><div class="thumb-frame"></div></div>
          <div class="rec-body">
            <span class="rank">${i + 1}</span>
            <h3>${esc(r.title)}</h3>
            <p>${esc(r.why)}</p>
            <p class="mix"><b>Mix idea:</b> ${esc(r.mix)}</p>
            <div class="gbtns"><button class="btn primary" data-try="${r.id}">Open in Studio</button><button class="btn ghost" data-cmp="${r.id}">Compare with today</button></div>
          </div>
        </article>`,
        )
        .join("")}</div>`;
    $$(".rec").forEach((card, i) => {
      const f = makeFrame({ id: recs[i].id, title: `${THEMES[recs[i].id].name} preview`, cls: "thumb-pv", extra: "&static=1" });
      f.style.pointerEvents = "none";
      $(".thumb-frame", card).append(f);
    });
    const scale = () =>
      $$(".thumb-frame").forEach((tf) => {
        const s = tf.clientWidth / 1280;
        const f = tf.firstElementChild;
        f.style.width = "1280px";
        f.style.height = tf.clientHeight / s + "px";
        f.style.transform = `scale(${s})`;
      });
    scale();
    new ResizeObserver(scale).observe(view);
    view.addEventListener("click", (e) => {
      const t = e.target.closest("[data-try]");
      if (t) {
        S.base = t.dataset.try;
        S.config = clone(THEMES[S.base]);
        // apply the suggested mix touches
        if (S.base === "coastal") S.config.layout.nav = "drawer";
        if (S.base === "forest") S.config.layout.nav = "rail";
        store.set("base", S.base);
        refreshMix();
        return show("studio");
      }
      const c = e.target.closest("[data-cmp]");
      if (c) {
        S.compare = ["current", c.dataset.cmp];
        store.set("compare", S.compare);
        show("compare");
      }
    });
  }

  /* ------------------------------------------------------------------ boot */
  const start = (location.hash || "").replace("#", "");
  const VIEWS = ["gallery", "studio", "compare", "menus", "top3"];
  show(VIEWS.includes(start) ? start : "gallery");
  window.addEventListener("hashchange", () => {
    const v = location.hash.replace("#", "");
    if (VIEWS.includes(v) && v !== S.view) show(v);
  });
})();
