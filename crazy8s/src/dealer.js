export const DEALER_INTRO_MS = 2900;

const DEALER_SVG = `<svg class="dealer-svg" viewBox="0 0 320 360" aria-hidden="true">
<defs>
<linearGradient id="d-suit" x1="0" x2="1"><stop offset="0" stop-color="#3a3f58"/><stop offset=".5" stop-color="#252a40"/><stop offset="1" stop-color="#151827"/></linearGradient>
<linearGradient id="d-skin" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ffd2ae"/><stop offset=".6" stop-color="#f1a97c"/><stop offset="1" stop-color="#d98b63"/></linearGradient>
<linearGradient id="d-shirt" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d9dcea"/></linearGradient>
<linearGradient id="d-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4f6a"/><stop offset=".4" stop-color="#15172a"/><stop offset="1" stop-color="#05060d"/></linearGradient>
<linearGradient id="d-lens" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b4a78"/><stop offset=".45" stop-color="#0b0e1e"/><stop offset="1" stop-color="#000"/></linearGradient>
<radialGradient id="d-cheek"><stop offset="0" stop-color="#ff7d7d" stop-opacity=".55"/><stop offset="1" stop-color="#ff7d7d" stop-opacity="0"/></radialGradient>
<linearGradient id="d-bow" x1="0" x2="1"><stop offset="0" stop-color="#ff6b8e"/><stop offset="1" stop-color="#b3133f"/></linearGradient>
</defs>
<ellipse cx="160" cy="352" rx="150" ry="14" fill="#0006"/>
<g class="dealer-body">
<path d="M52 360 Q56 252 118 232 L202 232 Q264 252 268 360Z" fill="url(#d-suit)"/>
<path d="M118 232 L160 340 L202 232Z" fill="url(#d-shirt)"/>
<path d="M118 232 L142 360 L96 360 Q96 262 118 232Z M202 232 L178 360 L224 360 Q224 262 202 232Z" fill="#0b0d19" opacity=".55"/>
<path d="M118 232 L150 296 L132 248Z M202 232 L170 296 L188 248Z" fill="#fff" opacity=".18"/>
<g class="dealer-bow"><path d="M160 244 L122 226 Q114 244 122 262Z" fill="url(#d-bow)"/><path d="M160 244 L198 226 Q206 244 198 262Z" fill="url(#d-bow)"/><rect x="151" y="233" width="18" height="22" rx="6" fill="#8e0f33"/><path d="M126 232 Q138 236 148 240" stroke="#fff5" stroke-width="2" fill="none"/></g>
<circle cx="160" cy="284" r="3.6" fill="#f2c452"/><circle cx="160" cy="312" r="3.6" fill="#f2c452"/>
<rect x="146" y="206" width="28" height="32" rx="12" fill="url(#d-skin)"/>
<path d="M146 224 Q160 238 174 224 L174 232 Q160 246 146 232Z" fill="#0004"/>
<g class="dealer-head">
<ellipse cx="94" cy="162" rx="11" ry="17" fill="url(#d-skin)"/><ellipse cx="226" cy="162" rx="11" ry="17" fill="url(#d-skin)"/>
<path d="M98 120 Q96 214 160 222 Q224 214 222 120 Q222 62 160 60 Q98 62 98 120Z" fill="url(#d-skin)"/>
<ellipse cx="116" cy="188" rx="22" ry="14" fill="url(#d-cheek)"/><ellipse cx="204" cy="188" rx="22" ry="14" fill="url(#d-cheek)"/>
<path d="M92 120 Q82 44 140 34 Q132 14 168 6 Q164 24 186 22 Q230 34 228 120 Q222 86 198 76 Q160 92 122 76 Q98 90 92 120Z" fill="url(#d-hair)"/>
<path d="M122 52 Q150 36 184 44" stroke="#9aa3d6" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".6"/>
<path d="M108 138 Q140 124 156 136 M164 136 Q180 124 212 138" stroke="#171a2c" stroke-width="7" stroke-linecap="round" fill="none"/>
<g class="dealer-shades">
<path d="M104 142 H156 Q158 174 138 182 Q110 184 104 160Z" fill="url(#d-lens)"/><path d="M164 142 H216 Q216 160 210 172 Q192 186 168 178 Q162 164 164 142Z" fill="url(#d-lens)"/>
<path d="M155 148 Q160 144 165 148" stroke="#05060d" stroke-width="5" fill="none"/>
<path d="M104 146 L92 142 M216 146 L228 142" stroke="#05060d" stroke-width="5" stroke-linecap="round"/>
<path d="M112 150 L128 150 L114 170Z" fill="#fff" opacity=".35"/><path d="M174 150 L188 150 L176 168Z" fill="#fff" opacity=".35"/>
<path class="shades-glint" d="M108 150 L120 150 L108 168Z" fill="#fff" opacity=".9"/>
</g>
<path d="M160 150 Q150 178 160 186 Q170 186 166 180" stroke="#c9774e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
<path d="M126 196 Q160 222 196 190" stroke="#7c2b2b" stroke-width="5" stroke-linecap="round" fill="none"/>
<path d="M136 200 Q162 218 190 195 Q164 212 136 200Z" fill="#fff"/>
<path d="M190 192 Q198 186 200 182" stroke="#c9774e" stroke-width="3" stroke-linecap="round" fill="none"/>
</g>
</g>
<g class="dealer-arm" style="transform-origin:236px 258px">
<path d="M222 246 Q286 262 296 318 L262 330 Q258 290 214 280Z" fill="url(#d-suit)"/>
<path d="M270 322 L296 316 L304 336 L276 346Z" fill="#fff"/>
<ellipse cx="296" cy="350" rx="22" ry="13" fill="url(#d-skin)" transform="rotate(-24 296 350)"/>
</g>
</svg>`;

function cardEl(cls = "") {
  const el = document.createElement("span");
  el.className = `dealer-card ${cls}`;
  return el;
}

export function playDealIntro(host = document.body) {
  document.querySelector(".dealer-intro")?.remove();
  const root = document.createElement("div");
  root.className = "dealer-intro";
  root.setAttribute("role", "presentation");
  root.innerHTML = `<div class="dealer-spot"></div><div class="dealer-stage">
    <div class="dealer-figure">${DEALER_SVG}</div>
    <div class="dealer-felt"><div class="dealer-rim"></div>
      <div class="dealer-deck">
        <div class="dealer-half left"></div><div class="dealer-half right"></div><div class="dealer-pile"></div>
      </div>
    </div>
    <p class="dealer-caption" aria-live="polite">Shuffling…</p></div>`;
  host.append(root);
  const caption = root.querySelector(".dealer-caption");
  const left = root.querySelector(".left");
  const right = root.querySelector(".right");
  const pile = root.querySelector(".dealer-pile");
  const stage = root.querySelector(".dealer-stage");
  const anims = [];
  const run = (el, frames, opts) => {
    const a = el.animate(frames, { fill: "both", ...opts });
    anims.push(a);
    return a;
  };

  run(root, [{ opacity: 0 }, { opacity: 1 }], { duration: 260 });
  run(root.querySelector(".dealer-figure"), [
    { transform: "translateY(160px) scale(.85)", opacity: 0 },
    { transform: "translateY(-14px) scale(1.03)", opacity: 1, offset: 0.7 },
    { transform: "translateY(0) scale(1)", opacity: 1 },
  ], { duration: 650, easing: "cubic-bezier(.2,.9,.3,1)" });
  run(root.querySelector(".dealer-head"), [
    { transform: "rotate(-2deg)" }, { transform: "rotate(2.5deg)" }, { transform: "rotate(-2deg)" },
  ], { duration: 900, iterations: 3, delay: 600 });
  run(root.querySelector(".shades-glint"), [
    { transform: "translateX(0)", opacity: 0 },
    { transform: "translateX(0)", opacity: 0.95, offset: 0.1 },
    { transform: "translateX(96px)", opacity: 0.9, offset: 0.7 },
    { transform: "translateX(100px)", opacity: 0 },
  ], { duration: 1100, delay: 900 });

  // riffle shuffle: ten cards leap from each half into the middle, interleaving
  const riffleStart = 700;
  for (let i = 0; i < 12; i++) {
    for (const side of [-1, 1]) {
      const c = cardEl();
      (side < 0 ? left : right).append(c);
      c.style.zIndex = 20 + i * 2 + (side > 0 ? 1 : 0);
      run(c, [
        { transform: `translate3d(${side * 46}px,${-i * 1.5}px,0) rotateZ(${side * 4}deg) rotateX(58deg)` },
        { transform: `translate3d(${side * 30}px,-${46 + (i % 3) * 8}px,${30 + i * 2}px) rotateZ(${side * -9}deg) rotateX(40deg)`, offset: 0.45 },
        { transform: `translate3d(0,${-i * 2.2}px,0) rotateZ(0deg) rotateX(58deg)` },
      ], { duration: 340, delay: riffleStart + i * 70 + (side > 0 ? 35 : 0), easing: "cubic-bezier(.4,0,.3,1)" });
    }
  }
  for (const [half, side] of [[left, -1], [right, 1]]) {
    run(half, [
      { transform: "translateX(0)", opacity: 1 },
      { transform: "translateX(0) scale(1)", opacity: 1, offset: 0.9 },
      { transform: "translateX(0) scale(0)", opacity: 0 },
    ], { duration: riffleStart + 12 * 70 + 380 });
  }
  const mergedAt = riffleStart + 12 * 70 + 380;
  run(pile, [
    { transform: "translateZ(0) scale(0)", opacity: 0 },
    { transform: "translateZ(0) scale(1.06) rotateX(0)", opacity: 1, offset: 0.6 },
    { transform: "translateZ(0) scale(1)", opacity: 1 },
  ], { duration: 260, delay: mergedAt - 140 });

  // dealer arm tosses the deck, then flicks cards to every seat
  const tossAt = mergedAt + 80;
  run(root.querySelector(".dealer-arm"), [
    { transform: "rotate(0deg) translateY(0)" },
    { transform: "rotate(-16deg) translateY(-10px)", offset: 0.35 },
    { transform: "rotate(10deg) translateY(6px)", offset: 0.55 },
    { transform: "rotate(-6deg)", offset: 0.8 },
    { transform: "rotate(0deg)" },
  ], { duration: 1100, delay: tossAt - 100 });
  setTimeout(() => (caption.textContent = "Dealing!"), tossAt);
  const dirs = [[-210, 40], [-120, -110], [0, -170], [120, -110], [210, 40], [-170, -40], [170, -40], [60, 130], [-60, 130], [0, 90]];
  for (let i = 0; i < 14; i++) {
    const [dx, dy] = dirs[i % dirs.length];
    const c = cardEl("tossed");
    stage.append(c);
    const spin = (i % 2 ? 1 : -1) * (540 + i * 30);
    run(c, [
      { transform: "translate3d(70px,150px,0) rotateX(55deg) rotateZ(0) scale(.7)", opacity: 0 },
      { transform: "translate3d(70px,150px,0) rotateX(55deg) rotateZ(0) scale(.7)", opacity: 1, offset: 0.05 },
      { transform: `translate3d(${dx * 0.6 + 70}px,${dy * 0.6 + 50 - 90}px,60px) rotateX(20deg) rotateY(${spin / 2}deg) rotateZ(${spin / 3}deg) scale(1.15)`, opacity: 1, offset: 0.5 },
      { transform: `translate3d(${dx * 1.5 + 70}px,${dy * 1.5 + 60}px,0) rotateX(60deg) rotateY(${spin}deg) rotateZ(${spin / 2}deg) scale(.7)`, opacity: 0 },
    ], { duration: 780, delay: tossAt + i * 50, easing: "cubic-bezier(.25,.7,.3,1)" });
  }

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const out = root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" });
      out.finished.then(() => root.remove(), () => root.remove());
      resolve();
    };
    root.addEventListener("click", () => {
      anims.forEach((a) => a.finish?.());
      finish();
    });
    setTimeout(finish, DEALER_INTRO_MS - 260);
  });
}
