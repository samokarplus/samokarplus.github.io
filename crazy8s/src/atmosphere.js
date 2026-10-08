import { HAND_SVG } from "./hand.js";

const CHIP_COLORS = ["#d8283f", "#2d5bd6", "#1c1c24", "#f4f1e6", "#1f9d6b"];

export function atmosphereHTML() {
  const bokeh = Array.from({ length: 22 }, (_, i) => {
    const size = 18 + ((i * 41) % 70);
    const colors = ["#ffb347", "#ff4f6d", "#4fa3ff", "#b57bff", "#ffe08a"];
    return `<i class="bokeh" style="left:${(i * 37) % 100}%;top:${(i * 23) % 52}%;width:${size}px;height:${size}px;background:${colors[i % 5]};animation-delay:${-(i % 7) * 0.7}s;animation-duration:${3 + (i % 4)}s"></i>`;
  }).join("");
  const stack = (cls, n) =>
    `<div class="chip-stack ${cls}">${Array.from({ length: n }, (_, i) => `<i style="--c:${CHIP_COLORS[(i + (cls === "left" ? 0 : 2)) % 5]};--i:${i}"></i>`).join("")}</div>`;
  return `<div class="casino-bg" aria-hidden="true"><div class="bokeh-layer">${bokeh}</div><div class="light-sweep"></div></div>
  <div class="felt-3d" aria-hidden="true"><div class="felt-shine"></div></div>
  <div class="chips-layer" aria-hidden="true">${stack("left", 9)}${stack("left two", 5)}${stack("right", 7)}${stack("right two", 11)}</div>`;
}

export function handRigHTML() {
  return `<div class="hand-rig" aria-hidden="true"><div class="rig-hand rig-left">${HAND_SVG}</div><div class="rig-hand rig-right">${HAND_SVG}</div></div>`;
}

let pointer = { x: 0, y: 0, inside: false, clientX: 0 };
let handLayout = [];

function area() {
  return document.querySelector(".table-area");
}

// Lay the cards out in a fan; `focus` is the index the pointer is nearest to.
export function layoutFan(focus = null) {
  const hand = document.querySelector(".hand");
  if (!hand) return;
  const cards = [...hand.querySelectorAll(".card")];
  const n = cards.length;
  const mobile = innerWidth <= 600;
  const total = Math.min(mobile ? 46 : 54, 6 * (n - 1));
  const step = n > 1 ? total / (n - 1) : 0;
  const radius = mobile ? 300 : 360;
  handLayout = [];
  cards.forEach((card, i) => {
    const d = i - (n - 1) / 2;
    let r = d * step;
    let y = 0;
    let s = 1;
    let z = i + 1;
    if (focus !== null) {
      const off = i - focus;
      if (off === 0) {
        r *= 0.35;
        y = mobile ? -20 : -28;
        s = 1.08;
        z = 100;
      } else {
        r += Math.sign(off) * (6 / (0.6 + Math.abs(off)));
        y = -Math.max(0, 8 - Math.abs(off) * 3);
      }
    }
    card.style.setProperty("--r", `${r}deg`);
    card.style.setProperty("--y", `${y}px`);
    card.style.setProperty("--s", s);
    card.style.zIndex = z;
    card.classList.toggle("fan-focus", focus === i);
    handLayout.push(Math.sin((d * step * Math.PI) / 180) * radius);
  });
  hand.style.setProperty("--n", n);
  const left = document.querySelector(".rig-left");
  const right = document.querySelector(".rig-right");
  if (!left || !right) return;
  // the hands slide under the card the pointer is on: the closer hand reaches, the other follows
  const t = focus === null ? 0 : handLayout[focus] / (radius * 0.9);
  const reachL = focus === null ? 0 : Math.max(0, t + 0.2);
  const reachR = focus === null ? 0 : Math.max(0, -t + 0.2);
  left.style.setProperty("--hx", `${(focus === null ? 0 : handLayout[focus] * 0.5 + 60) | 0}px`);
  left.style.setProperty("--hy", `${-reachL * 14}px`);
  left.style.setProperty("--hr", `${14 + t * 10}deg`);
  right.style.setProperty("--hx", `${(focus === null ? 0 : handLayout[focus] * 0.5 - 60) | 0}px`);
  right.style.setProperty("--hy", `${-reachR * 14}px`);
  right.style.setProperty("--hr", `${-14 + t * 10}deg`);
}

function nearestIndex(clientX) {
  const hand = document.querySelector(".hand");
  if (!hand || !handLayout.length) return null;
  const rect = hand.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  let best = 0;
  let dist = Infinity;
  handLayout.forEach((x, i) => {
    const d = Math.abs(cx + x - clientX);
    if (d < dist) {
      dist = d;
      best = i;
    }
  });
  return best;
}

export function applyPointer() {
  const el = area();
  if (!el) return;
  el.style.setProperty("--px", pointer.x.toFixed(3));
  el.style.setProperty("--py", pointer.y.toFixed(3));
}

export function bindAtmosphere() {
  document.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / innerWidth) * 2 - 1;
    pointer.y = (event.clientY / innerHeight) * 2 - 1;
    applyPointer();
    const handArea = document.querySelector(".hand-area");
    if (!handArea) return;
    const rect = handArea.getBoundingClientRect();
    const inside =
      event.clientY > rect.top - 30 &&
      event.clientY < rect.bottom + 20 &&
      event.clientX > rect.left &&
      event.clientX < rect.right;
    pointer.inside = inside;
    pointer.clientX = event.clientX;
    layoutFan(inside ? nearestIndex(event.clientX) : null);
  });
  document.addEventListener("pointerleave", () => layoutFan(null));
  addEventListener("resize", () => layoutFan(null));
}

export function refreshAtmosphere() {
  applyPointer();
  layoutFan(pointer.inside ? nearestIndex(pointer.clientX) : null);
}
