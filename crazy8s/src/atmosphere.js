import { HAND_SVG } from "./hand.js";
import { nope } from "./sound.js";

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
let focusIndex = null;
let room = null;
let roomCanvas = null;
let roomState = { seats: 1, active: -1, felt: "#216751", celebrate: null };
let handLayout = [];

function area() {
  return document.querySelector(".table-area");
}

// Lay the cards out in a fan; `focus` is the index the pointer is nearest to.
export function layoutFan(focus = null) {
  focusIndex = focus;
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
        r *= 0.5;
        y = mobile ? -14 : -20;
        s = 1.03;
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
  const cards = [...hand.querySelectorAll(".card")];
  const rect = hand.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  let best = null;
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

// Scrubbing along the fan: the pointer's horizontal position picks the card, with a sticky band
// around the lit card so small wobbles don't flip it, but moving along the hand glides smoothly
// from card to card without having to dip under or around the lifted one.
function pickFocus(event) {
  const hand = document.querySelector(".hand");
  if (!hand || !handLayout.length) return null;
  const rect = hand.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const x = event.clientX - cx;
  if (focusIndex !== null && focusIndex < handLayout.length) {
    const here = handLayout[focusIndex];
    const left = focusIndex > 0 ? here - handLayout[focusIndex - 1] : here - handLayout[focusIndex + 1] || 40;
    const right = focusIndex < handLayout.length - 1 ? handLayout[focusIndex + 1] - here : left;
    const lo = here - Math.abs(left) * 0.62;
    const hi = here + Math.abs(right) * 0.62;
    if (x >= lo && x <= hi) return focusIndex;
  }
  return nearestIndex(event.clientX);
}

function overHand(event) {
  const handArea = document.querySelector(".hand-area");
  if (!handArea) return false;
  const rect = handArea.getBoundingClientRect();
  return (
    event.clientY > rect.top - 70 &&
    event.clientY < rect.bottom + 20 &&
    event.clientX > rect.left &&
    event.clientX < rect.right
  );
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
    room?.setPointer(pointer.x, pointer.y);
    const inside = overHand(event);
    pointer.inside = inside;
    pointer.clientX = event.clientX;
    layoutFan(inside ? pickFocus(event) : null);
  });
  document.addEventListener("pointerleave", () => layoutFan(null));
  // The fan moves under the pointer, so play the card that is lit up, wherever the pointer
  // physically lands (a gap, a neighbour, or a disabled card that swallows clicks).
  document.addEventListener(
    "pointerup",
    (event) => {
      if (event.button !== 0 || !overHand(event)) return;
      const cards = [...document.querySelectorAll(".hand .card")];
      const focus = pickFocus(event);
      const chosen = focus === null ? null : cards[focus];
      if (!chosen) return;
      if (chosen.disabled) {
        // looks identical either way; an illegal pick just gets a "nope"
        if (document.querySelector(".turn-title")?.textContent === "Your turn") {
          nope();
          chosen.animate(
            [
              { translate: "0" },
              { translate: "-6px" },
              { translate: "6px" },
              { translate: "-4px" },
              { translate: "0" },
            ],
            { duration: 240 },
          );
        }
        return;
      }
      const swallow = (e) => {
        e.stopPropagation();
        e.preventDefault();
      };
      document.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => document.removeEventListener("click", swallow, true), 50);
      chosen.click();
    },
    true,
  );
  document.addEventListener("pointerup", (event) => {
    const deck = document.querySelector("#draw-deck");
    if (!deck?.disabled) return;
    const r = deck.getBoundingClientRect();
    const inside =
      event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
    if (inside && document.querySelector(".turn-title")?.textContent === "Your turn") {
      nope();
      deck.animate(
        [{ translate: "0" }, { translate: "-5px" }, { translate: "5px" }, { translate: "0" }],
        { duration: 220 },
      );
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (overHand(event)) layoutFan(pickFocus(event));
  });
  addEventListener("resize", () => layoutFan(null));
}

export function refreshAtmosphere() {
  applyPointer();
  layoutFan(pointer.inside ? nearestIndex(pointer.clientX) : null);
}

function syncRoomRect() {
  if (!roomCanvas) return;
  const el = area();
  if (!el) {
    roomCanvas.style.display = "none";
  } else {
    const r = el.getBoundingClientRect();
    Object.assign(roomCanvas.style, {
      display: "block",
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
  }
  requestAnimationFrame(syncRoomRect);
}

// Lazily loads the three.js lounge behind the table; falls back to the CSS atmosphere without WebGL.
export function updateRoom(next) {
  const prev = roomState;
  roomState = { ...roomState, ...next };
  if (room) {
    room.setCelebrate(roomState.celebrate || null);
    if (prev.seats !== roomState.seats) room.setSeats(roomState.seats);
    room.setActive(roomState.active);
    if (prev.felt !== roomState.felt) room.setTheme(roomState.felt);
    return;
  }
  if (roomCanvas) {
    return;
  }
  roomCanvas = document.createElement("canvas");
  roomCanvas.className = "room3d";
  roomCanvas.setAttribute("aria-hidden", "true");
  document.body.prepend(roomCanvas);
  import("./room3d.js")
    .then((m) => {
      room = m.createRoom(roomCanvas);
      room.setSeats(roomState.seats);
      room.setActive(roomState.active);
      room.setTheme(roomState.felt);
      room.setCelebrate(roomState.celebrate || null);
      document.body.classList.add("has-room3d");
      syncRoomRect();
    })
    .catch(() => {
      roomCanvas?.remove();
    });
}
export function roomActive(index) {
  roomState.active = index;
  room?.setActive(index);
}

// A patron flicks a card: returns the ms until release, plus where the hand is on screen.
export function patronFlick(seat) {
  if (!room || seat < 0) return null;
  const rect = room.handScreenRect(seat);
  if (!rect) return null;
  return { rect, delay: room.flick(seat) };
}
