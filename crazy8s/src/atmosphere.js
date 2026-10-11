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
  // distance from the fan's pivot to a card's centre, read from the real CSS so the maths always matches
  const first = cards[0];
  const originY = first ? parseFloat(getComputedStyle(first).transformOrigin.split(" ")[1]) : 0;
  const radius = first && originY ? originY - first.offsetHeight / 2 : mobile ? 242 : 372;
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
        r += Math.sign(off) * (3.5 / (0.6 + Math.abs(off)));
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

// Cards overlap with later cards on top, so card k's visible strip starts where it starts
// (x_k - width/2) and runs until card k+1 begins. Picking by that, not by card centre,
// matches what the pointer is visually over, so no card gets skipped.
function boundaries() {
  const hand = document.querySelector(".hand");
  const first = hand?.querySelector(".card");
  if (!hand || !first || !handLayout.length) return null;
  const rect = hand.getBoundingClientRect();
  const half = first.offsetWidth / 2;
  const cx = rect.left + rect.width / 2;
  return handLayout.map((x) => cx + x - half);
}

function indexAtX(clientX) {
  const b = boundaries();
  if (!b) return null;
  let k = 0;
  for (let i = 0; i < b.length; i++) if (clientX >= b[i]) k = i;
  return k;
}

// Light hysteresis so a wobble on a strip edge doesn't flicker between two cards.
function pickFocus(event) {
  const k = indexAtX(event.clientX);
  if (k === null || focusIndex === null || focusIndex >= handLayout.length || k === focusIndex) return k;
  const b = boundaries();
  const strip = Math.abs((b[Math.min(b.length - 1, focusIndex + 1)] - b[focusIndex]) || 30);
  const margin = strip * 0.18;
  if (k === focusIndex + 1 && event.clientX < b[k] + margin) return focusIndex;
  if (k === focusIndex - 1 && event.clientX > b[focusIndex] - margin) return focusIndex;
  return k;
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

function shake(el, distance = 6) {
  el.animate(
    [
      { translate: "0" },
      { translate: `-${distance}px` },
      { translate: `${distance}px` },
      { translate: `-${distance * 0.6}px` },
      { translate: "0" },
    ],
    { duration: 240 },
  );
}

const isMyTurn = () => document.querySelector(".turn-title")?.textContent === "Your turn";

// Play (or refuse) the lit card; cards look identical either way so an illegal pick just says "nope".
function commitCard(index, swallowMs) {
  const cards = [...document.querySelectorAll(".hand .card")];
  const chosen = index === null ? null : cards[index];
  if (!chosen) return;
  if (chosen.disabled) {
    if (isMyTurn()) {
      nope();
      shake(chosen);
    }
    return;
  }
  // run the card's own handler directly, then swallow the browser's follow-up click so it
  // can't play whichever card the pointer happened to land on
  chosen.onclick?.(new MouseEvent("click"));
  const swallow = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };
  document.addEventListener("click", swallow, { capture: true, once: true });
  setTimeout(() => document.removeEventListener("click", swallow, true), swallowMs);
}

export function bindAtmosphere() {
  // Touch: drag along the fan to scrub, lift a card by touching it, tap the lifted card to play it.
  // Mouse: hover lights the card, click plays it.
  let touch = null;
  document.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / innerWidth) * 2 - 1;
    pointer.y = (event.clientY / innerHeight) * 2 - 1;
    applyPointer();
    room?.setPointer(pointer.x, pointer.y);
    if (event.pointerType !== "mouse") {
      if (!touch) return;
      if (Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 10) touch.moved = true;
      if (!touch.inHand) return;
      pointer.clientX = event.clientX;
      layoutFan(pickFocus(event));
      return;
    }
    const inside = overHand(event);
    pointer.inside = inside;
    pointer.clientX = event.clientX;
    layoutFan(inside ? pickFocus(event) : null);
  });
  document.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") layoutFan(null);
  });
  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") {
      if (overHand(event)) layoutFan(pickFocus(event));
      return;
    }
    const inHand = overHand(event);
    touch = { x: event.clientX, y: event.clientY, moved: false, inHand, before: focusIndex };
    pointer.inside = inHand;
    pointer.clientX = event.clientX;
    if (inHand) layoutFan(pickFocus(event));
    else if (!event.target.closest?.("button, a, dialog")) layoutFan(null);
  });
  document.addEventListener(
    "pointerup",
    (event) => {
      if (event.pointerType !== "mouse") {
        const t = touch;
        touch = null;
        if (!t?.inHand) return;
        const k = pickFocus(event);
        layoutFan(k);
        if (!t.moved && t.before === k) commitCard(k, 450); // second tap on the lifted card plays it
        else {
          // first touch (or a drag) only lifts the card; stop the browser's own click from playing it
          const swallow = (e) => {
            e.stopPropagation();
            e.preventDefault();
          };
          document.addEventListener("click", swallow, { capture: true, once: true });
          setTimeout(() => document.removeEventListener("click", swallow, true), 450);
        }
        return;
      }
      if (event.button !== 0 || !overHand(event)) return;
      commitCard(pickFocus(event), 50);
    },
    true,
  );
  document.addEventListener("pointerup", (event) => {
    const deck = document.querySelector("#draw-deck");
    if (!deck?.disabled) return;
    const r = deck.getBoundingClientRect();
    const inside =
      event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
    if (inside && isMyTurn()) {
      nope();
      shake(deck, 5);
    }
  });
  document.addEventListener("pointercancel", () => {
    touch = null;
  });
  addEventListener("resize", () => layoutFan(null));
}

export function refreshAtmosphere() {
  applyPointer();
  layoutFan(pointer.inside ? indexAtX(pointer.clientX) : null);
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
