import Peer from "peerjs";
import { Client } from "boardgame.io/dist/cjs/client.js";
import {
  createIcons,
  ArrowLeft,
  CircleHelp,
  X,
  LoaderCircle,
  Play,
  RefreshCw,
  Link,
  Users,
  LogOut,
  Trophy,
  MessageSquare,
  MessageSquareOff,
  SmilePlus,
} from "lucide";
import { CrazyEights, SUITS, playable, view } from "./game.js";
import { cardArt } from "./art.js";
import { flightKeyframes } from "./motion.js";
import {
  DEFAULT_THEME,
  PALETTES,
  normalizeTheme,
  foreground,
} from "./theme.js";
import {
  TAUNTS,
  TAUNT_COOLDOWN,
  championshipState,
  acceptTaunt,
  SUIT_CALLS,
  cardExclamation,
} from "./championship.js";

const app = document.querySelector("#app");
const icons = {
  ArrowLeft,
  CircleHelp,
  X,
  LoaderCircle,
  Play,
  RefreshCw,
  Link,
  Users,
  LogOut,
  Trophy,
  MessageSquare,
  MessageSquareOff,
  SmilePlus,
};
const glyphs = { clubs: "♣", diamonds: "♦", hearts: "♥", spades: "♠" };
const red = (suit) => ["hearts", "diamonds"].includes(suit);
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icon = (name) => `<i data-lucide="${name}"></i>`;
const uid = () => crypto.randomUUID().replaceAll("-", "");
const roomPattern = /^[a-f0-9]{16}$/;
let peer,
  connection,
  engine,
  host = false,
  room = "",
  me = "0",
  packet = null;
let members = [],
  connections = new Map(),
  capacity = 4,
  busy = false,
  chosenEight = null;
let connectingError = "",
  reconnectTimer,
  reconnectAttempts = 0,
  round = 0;
let noticeTimer,
  reconnecting = false;
let theme = DEFAULT_THEME;
try {
  theme = normalizeTheme(
    JSON.parse(localStorage.getItem("crazy8s:theme") || "{}"),
  );
} catch {}
let renderedGame = null;
let mode = "casual",
  targetWins = 3,
  mutedTaunts = false,
  tauntReadyAt = 0,
  tauntTimer;
const lastTaunts = new Map();
let activeReaction = null;
let celebrated = "";

function showTaunt(message, replay = false) {
  const taunt = TAUNTS.find((t) => t.id === message.taunt);
  if (!taunt || mutedTaunts) return;
  if (!replay) activeReaction = { message, until: Date.now() + 6000 };
  const stage = document.querySelector("#taunt-stage");
  if (!stage) return;
  const bubble = document.createElement("div");
  bubble.className = `taunt-bubble ${taunt.long || taunt.id === "CAN_AND_WILL" ? "long-shout" : ""} ${taunt.gesture ? "drawing-gesture" : ""} ${red(taunt.suit) ? "red" : ""}`;
  bubble.innerHTML = `<span class="speech-avatar" aria-hidden="true">${escape(nameFor(message.player)[0].toUpperCase())}</span><span><small>${escape(nameFor(message.player))}</small><strong>${escape(taunt.label || taunt.id + "!")}</strong></span><span class="taunt-symbol" aria-hidden="true">${taunt.symbol}</span>`;
  stage.replaceChildren(bubble);
  setTimeout(
    () => bubble.remove(),
    Math.max(0, activeReaction.until - Date.now()),
  );
  if (taunt.gesture) {
    const pile = document.querySelector(".center-piles .card-back");
    if (pile) {
      const hand = document.createElement("span");
      hand.className = "draw-hand";
      hand.textContent = "🫴";
      pile.parentElement.append(hand);
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
        hand.animate(
          [
            { transform: "translateX(70px) rotate(-20deg)" },
            { transform: "translateX(0) rotate(0)" },
            { transform: "translateX(70px) rotate(-20deg)" },
          ],
          { duration: 700, iterations: 4 },
        );
      setTimeout(() => hand.remove(), 2800);
    }
  }
}
function announce(id, taunt) {
  const message = { type: "taunt", player: id, taunt };
  showTaunt(message);
  for (const conn of connections.values()) if (conn.open) conn.send(message);
}
function hostTaunt(id, taunt) {
  if (
    !members.some((p) => p.id === id && p.online) ||
    !acceptTaunt(lastTaunts, id, taunt, Date.now())
  )
    return;
  announce(id, taunt);
}
function sendTaunt(taunt) {
  if (Date.now() < tauntReadyAt || (!host && !connection?.open)) return;
  tauntReadyAt = Date.now() + TAUNT_COOLDOWN;
  if (host) hostTaunt("0", taunt);
  else connection.send({ type: "taunt", taunt });
  updateTauntControls();
}
function updateTauntControls() {
  clearTimeout(tauntTimer);
  const waiting = Date.now() < tauntReadyAt;
  document
    .querySelectorAll("[data-taunt]")
    .forEach(
      (button) => (button.disabled = waiting || (!host && !connection?.open)),
    );
  if (waiting)
    tauntTimer = setTimeout(
      updateTauntControls,
      tauntReadyAt - Date.now() + 10,
    );
}
function standingsHTML() {
  if (packet.mode !== "championship") return "";
  const { standings, champion } = championshipState(
    packet.members,
    packet.mode,
    packet.targetWins,
  );
  return `<details class="standings" open><summary>${icon("trophy")}First to ${packet.targetWins} wins</summary><ol>${standings.map((p) => `<li class="${p.id === champion ? "champion-row" : ""}"><span><i class="online-dot ${p.online ? "" : "offline-dot"}"></i>${escape(p.name)}${p.id === me ? " (you)" : ""}${p.id === champion ? " " + icon("trophy") : ""}</span><strong>${p.wins}<span class="muted"> / ${packet.targetWins}</span></strong>${host && !packet.game && !p.online && p.id !== "0" ? `<button class="icon-button" data-remove="${p.id}" aria-label="Remove ${escape(p.name)}">${icon("x")}</button>` : ""}</li>`).join("")}</ol></details>`;
}

function applyTheme() {
  const root = document.documentElement.style;
  root.setProperty("--page-bg", theme.background);
  root.setProperty("--chrome-ink", foreground(theme.background));
  root.setProperty("--green", theme.table);
  root.setProperty("--table-ink", foreground(theme.table));
}
function colorControls(key, label) {
  return `<fieldset class="color-picker"><legend>${label}</legend><div class="swatches">${PALETTES[key].map(([name, color]) => `<button type="button" class="swatch" data-color-key="${key}" data-color="${color}" style="--swatch:${color}" aria-label="${label}: ${name}" title="${name}" aria-pressed="${theme[key] === color}" ${busy ? "disabled" : ""}></button>`).join("")}<input type="color" name="${key}" value="${theme[key]}" aria-label="Custom ${label.toLowerCase()} color" title="Custom ${label.toLowerCase()} color" ${busy ? "disabled" : ""}></div></fieldset>`;
}
function bindColors() {
  const change = (key, value) => {
    theme = normalizeTheme({ ...theme, [key]: value });
    applyTheme();
    document.querySelector(`input[name="${key}"]`).value = theme[key];
    document
      .querySelectorAll(`[data-color-key="${key}"]`)
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.color === theme[key]),
        ),
      );
    try {
      localStorage.setItem("crazy8s:theme", JSON.stringify(theme));
    } catch {}
  };
  document
    .querySelectorAll("[data-color-key]")
    .forEach(
      (button) =>
        (button.onclick = () =>
          change(button.dataset.colorKey, button.dataset.color)),
    );
  for (const key of Object.keys(DEFAULT_THEME))
    document
      .querySelector(`input[name="${key}"]`)
      ?.addEventListener("input", (event) => change(key, event.target.value));
}

function notify(text) {
  document.querySelector("#notice").textContent = text;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(
    () => (document.querySelector("#notice").textContent = ""),
    5000,
  );
}
function cardHTML(card, options = {}) {
  if (!card)
    return options.draw
      ? `<button id="draw-deck" class="card card-back draw-deck" aria-label="Draw one card" title="Draw one card" ${options.disabled ? "disabled" : ""}></button>`
      : '<div class="card card-back" aria-label="Face-down deck"></div>';
  const inner = `<span class="card-corner">${card.rank}<span>${glyphs[card.suit]}</span></span>${cardArt(card)}<span class="card-corner bottom" aria-hidden="true">${card.rank}<span>${glyphs[card.suit]}</span></span>`;
  const cls = `card ${red(card.suit) ? "red" : ""}`;
  return options.button
    ? `<button class="${cls}" data-card="${card.id}" aria-label="Play ${card.rank} of ${card.suit}" ${options.disabled ? "disabled" : ""}>${inner}</button>`
    : `<div class="${cls}" aria-label="${card.rank} of ${card.suit}">${inner}</div>`;
}
function nameFor(id) {
  return packet?.members.find((p) => p.id === id)?.name || "Player";
}
function roomURL() {
  return `${location.origin}/crazy8s/?room=${room}`;
}
function hostStorage() {
  return `crazy8s:host:${room}`;
}
function tokenForRoom() {
  const key = `crazy8s:seat:${room}`;
  let token = sessionStorage.getItem(key);
  if (!token) {
    token = uid();
    sessionStorage.setItem(key, token);
  }
  return token;
}
function saveHost() {
  try {
    sessionStorage.setItem(
      hostStorage(),
      JSON.stringify({
        members,
        capacity,
        round,
        theme,
        mode,
        targetWins,
        game: engine ? engine.getState() : null,
      }),
    );
  } catch {
    notify("This browser cannot save reconnection data. Keep this tab open.");
  }
}
function broadcast() {
  const state = engine?.getState();
  const publicMembers = members.map(({ id, name, wins, online }) => ({
    id,
    name,
    wins,
    online,
  }));
  const base = {
    type: "state",
    members: publicMembers,
    capacity,
    round,
    theme,
    mode,
    targetWins,
    phase: state ? "game" : "lobby",
    paused: !!state && members.some((p) => !p.online),
  };
  packet = { ...base, me: "0", game: state ? view(state, "0") : null };
  for (const [id, conn] of connections) {
    if (conn.open)
      conn.send({ ...base, me: id, game: state ? view(state, id) : null });
  }
  saveHost();
  render();
}
function bootGame(saved = null) {
  const game = saved
    ? {
        ...CrazyEights,
        setup: () => structuredClone(saved.G),
        turn: {
          ...CrazyEights.turn,
          order: {
            ...CrazyEights.turn.order,
            first: () => Number(saved.ctx.currentPlayer),
          },
        },
      }
    : CrazyEights;
  engine?.stop();
  engine = Client({
    game,
    numPlayers: members.length,
    playerID: "0",
    debug: false,
  });
  engine.start();
}
function startGame() {
  if (members.length < 2 || members.some((p) => !p.online)) return;
  if (engine && !engine.getState().ctx.gameover) return;
  if (championshipState(members, mode, targetWins).champion !== null) return;
  round++;
  bootGame();
  broadcast();
}
function newChampionship() {
  if (!host || championshipState(members, mode, targetWins).champion === null)
    return;
  if (members.some((p) => !p.online)) return;
  for (const member of members) member.wins = 0;
  round = 0;
  startGame();
}
function hostMove(id, message) {
  if (!engine || members.some((p) => !p.online)) return;
  const before = engine.getState();
  if (
    before.ctx.gameover ||
    before.ctx.currentPlayer !== id ||
    message.round !== round ||
    message.version !== before._stateID
  )
    return;
  engine.updatePlayerID(id);
  if (message.move === "play" && typeof message.card === "string")
    engine.moves.play(message.card, message.suit);
  else if (message.move === "draw") engine.moves.draw();
  else return;
  const after = engine.getState();
  if (after._stateID === before._stateID) return;
  const winners =
    after.ctx.gameover?.winners ||
    (after.ctx.gameover?.winner != null ? [after.ctx.gameover.winner] : []);
  for (const winner of winners) members.find((p) => p.id === winner).wins++;
  broadcast();
  if (message.move === "play") {
    const shout = cardExclamation(
      before.G.hands[id].find((c) => c.id === message.card),
      message.suit,
    );
    if (shout) announce(id, shout);
  }
}
function move(move, card, suit) {
  const message = {
    type: "move",
    move,
    card,
    suit,
    round: packet.round,
    version: packet.game.version,
  };
  if (host) hostMove("0", message);
  else if (connection?.open) connection.send(message);
  else notify("Disconnected. Reconnect before playing.");
}
function handleGuest(conn) {
  let seat = null;
  const handshakeTimeout = setTimeout(() => {
    if (seat === null) conn.close();
  }, 10000);
  conn.on("data", (message) => {
    if (!message || typeof message !== "object") return;
    if (message.type === "join" && seat === null) {
      if (
        typeof message.token !== "string" ||
        !/^[a-f0-9]{32}$/.test(message.token)
      )
        return conn.close();
      let member = members.find((p) => p.token === message.token);
      if (!member) {
        if (engine || members.length >= capacity) {
          conn.send({
            type: "error",
            text: engine
              ? "This game has already started."
              : "This room is full.",
          });
          setTimeout(() => conn.close(), 500);
          return;
        }
        const name = String(message.name || "")
          .replace(/[\x00-\x1f]/g, "")
          .trim()
          .slice(0, 20);
        if (!name) return conn.close();
        member = {
          id: String(members.length),
          name,
          token: message.token,
          wins: 0,
          online: true,
        };
        members.push(member);
      }
      clearTimeout(handshakeTimeout);
      seat = member;
      const previous = connections.get(seat.id);
      connections.set(seat.id, conn);
      if (previous && previous !== conn) previous.close();
      member.online = true;
      broadcast();
    } else if (
      message.type === "taunt" &&
      seat !== null &&
      connections.get(seat.id) === conn
    ) {
      hostTaunt(seat.id, message.taunt);
    } else if (
      message.type === "move" &&
      seat !== null &&
      connections.get(seat.id) === conn
    )
      hostMove(seat.id, message);
  });
  conn.on("close", () => {
    clearTimeout(handshakeTimeout);
    if (seat !== null && connections.get(seat.id) === conn) {
      connections.delete(seat.id);
      if (members.includes(seat)) seat.online = false;
      broadcast();
    }
  });
  conn.on("error", () => conn.close());
}
function createRoom(name, seats) {
  host = true;
  room = uid().slice(0, 16);
  capacity = seats;
  me = "0";
  members = [{ id: "0", name, wins: 0, online: true, token: uid() }];
  history.replaceState({}, "", `?room=${room}&host=1`);
  openPeer();
}
function openPeer() {
  busy = true;
  connectingError = "";
  render();
  peer?.destroy();
  peer = new Peer(host ? `samo8-${room}` : undefined, { debug: 0 });
  peer.on("open", () => {
    if (host) {
      busy = false;
      broadcast();
    } else connectGuest();
  });
  peer.on("connection", (conn) => (host ? handleGuest(conn) : conn.close()));
  peer.on("disconnected", () => {
    if (!peer.destroyed) peer.reconnect();
  });
  peer.on("error", (error) => {
    if (error.type === "peer-unavailable")
      connectingError =
        "The host is not online. Ask them to open the room, then reconnect.";
    else if (error.type === "unavailable-id")
      connectingError =
        "This room is open in another host tab. Use that tab or create a new room.";
    else
      connectingError = "Could not connect. Try another network or reconnect.";
    busy = false;
    render();
  });
}
function connectGuest() {
  const name = sessionStorage.getItem("crazy8s:name") || "Friend";
  connection = peer.connect(`samo8-${room}`, { reliable: true });
  clearTimeout(reconnectTimer);
  const timeout = setTimeout(() => {
    if (!connection?.open) {
      busy = false;
      connectingError =
        "Connection timed out. Check that the host is online, then reconnect.";
      render();
    }
  }, 18000);
  connection.on("open", () => {
    clearTimeout(timeout);
    connection.send({ type: "join", name, token: tokenForRoom() });
  });
  connection.on("data", (message) => {
    if (message?.type === "state") {
      packet = message;
      theme = normalizeTheme(message.theme);
      me = message.me;
      busy = false;
      reconnecting = false;
      reconnectAttempts = 0;
      connectingError = "";
      render();
    } else if (message?.type === "taunt") {
      showTaunt(message);
    } else if (message?.type === "error") {
      connectingError = message.text;
      busy = false;
      render();
    }
  });
  connection.on("close", () => {
    clearTimeout(timeout);
    if (!connectingError) {
      connectingError = "Connection lost. Waiting for the host…";
      reconnecting = true;
      render();
      if (reconnectAttempts++ < 5)
        reconnectTimer = setTimeout(() => connectGuest(), 3000);
    }
  });
  connection.on("error", () => {
    clearTimeout(timeout);
    busy = false;
    connectingError = "Could not reach this room. Reconnect to try again.";
    render();
  });
}
function removeMember(id) {
  if (engine || id === "0") return;
  const old = connections.get(id);
  connections.delete(id);
  members = members.filter((p) => p.id !== id);
  const oldConnections = connections;
  connections = new Map();
  members.forEach((member, index) => {
    const conn = oldConnections.get(member.id);
    member.id = String(index);
    if (conn) connections.set(member.id, conn);
  });
  old?.close();
  broadcast();
}
function leaveRoom() {
  if (host && !confirm("Close this room for everyone?")) return;
  clearTimeout(reconnectTimer);
  if (host) sessionStorage.removeItem(hostStorage());
  peer?.destroy();
  location.href = "/crazy8s/";
}
function render() {
  applyTheme();
  document
    .querySelectorAll(".card-flight-overlay")
    .forEach((node) => node.remove());
  const previousDiscard = document
    .querySelector(".discard-pile .card")
    ?.cloneNode(true);
  const oldDeckFocus = document.activeElement?.id === "draw-deck";
  const playedSource = packet?.game?.top
    ? document
        .querySelector(`[data-card="${packet.game.top.id}"]`)
        ?.getBoundingClientRect() ||
      document
        .querySelector(
          `[data-player="${renderedGame?.currentPlayer}"] .mini-card`,
        )
        ?.getBoundingClientRect()
    : null;
  const previous = renderedGame;
  const headerLeave = document.querySelector("#header-leave");
  headerLeave.hidden = !packet;
  headerLeave.title = host ? "Close room" : "Leave room";
  headerLeave.setAttribute("aria-label", headerLeave.title);
  if (!packet) {
    const joining = !!room && !host;
    app.innerHTML = `<div class="shell"><aside class="sidebar setup-sidebar"><div><p class="eyebrow">Samo's card table</p><h2>${joining ? "Join your friends" : "Pull up a chair"}</h2></div>
      <form class="form" id="setup"><label>Your name<input name="name" maxlength="20" autocomplete="nickname" placeholder="Your name" value="${escape(sessionStorage.getItem("crazy8s:name") || "")}" required ${busy ? "disabled" : ""}></label>
      ${joining ? "" : '<label>Seats<select name="seats"><option value="2">2 players</option><option value="3">3 players</option><option value="4" selected>4 players</option></select></label>'}
      ${joining ? "" : `<div class="appearance">${colorControls("background", "Background")}${colorControls("table", "Table")}</div>`}
      <button class="primary" name="mode" value="casual" ${busy ? "disabled" : ""}>${icon(busy ? "loader-circle" : "play")}${busy ? "Connecting…" : joining ? "Join room" : "Create room"}</button>
      ${joining ? "" : `<div class="championship-setup"><button class="secondary" name="mode" value="championship" ${busy ? "disabled" : ""}>${icon("trophy")}Host a championship</button><label>First to<select name="target" aria-label="Championship target"><option value="3">3 wins</option><option value="5">5 wins</option><option value="7">7 wins</option></select></label></div>`}
      ${connectingError ? `<p class="error" role="alert">${escape(connectingError)}</p><button class="secondary" type="button" id="retry">${icon("refresh-cw")}Reconnect</button>` : ""}</form>
      <p class="small muted">2–4 friends · 52 cards · Wild eights</p><p class="small muted">Keep the host's tab open during the game.</p><div class="separator small muted">${joining ? '<a href="/crazy8s/">Create a different room</a>' : "No account needed."}</div></aside>
      <section class="table-area"><div class="table-heading"><span>A table for friends</span><span class="status-pill">Crazy Eights</span></div><div class="table"><div class="center-piles"><div class="pile-block">${cardHTML(null)}<span class="pile-label">52-card deck</span></div><div class="pile-block">${cardHTML({ rank: "8", suit: "hearts" })}<span class="pile-label">Eights are wild</span></div></div><p class="welcome-note">${joining ? "Your seat is waiting." : "Good company. A fresh deck."}</p></div></section></div>`;
    document.querySelector("#setup").onsubmit = (event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const name = String(data.get("name")).trim();
      if (!name) return;
      sessionStorage.setItem("crazy8s:name", name);
      if (joining) openPeer();
      else {
        mode =
          event.submitter?.value === "championship" ? "championship" : "casual";
        targetWins = [3, 5, 7].includes(Number(data.get("target")))
          ? Number(data.get("target"))
          : 3;
        createRoom(name, Number(data.get("seats")));
      }
    };
    document.querySelector("#retry")?.addEventListener("click", openPeer);
    if (!joining) bindColors();
    createIcons({ icons });
    return;
  }
  const game = packet.game;
  const champion = championshipState(
    packet.members,
    packet.mode,
    packet.targetWins,
  ).champion;
  const mine = game?.hand || [];
  const stage = championshipState(
    packet.members,
    packet.mode,
    packet.targetWins,
  ).stage;
  const isTurn =
    !!game &&
    game.currentPlayer === me &&
    !game.gameover &&
    !packet.paused &&
    !connectingError;
  const canPlay =
    !!game && mine.some((card) => playable(card, game.top, game.suit));
  const winners =
    game?.gameover?.winners ||
    (game?.gameover?.winner != null ? [game.gameover.winner] : []);
  let title = game
    ? champion !== null
      ? `${nameFor(champion)} is the champion!`
      : game.gameover
        ? `${winners.map(nameFor).join(" & ")} ${winners.length > 1 ? "win" : "wins"}!`
        : packet.paused
          ? "Waiting for a player"
          : isTurn
            ? "Your turn"
            : `${nameFor(game.currentPlayer)}'s turn`
    : "The table is open";
  let detail = game
    ? champion !== null
      ? `${packet.targetWins} wins. Championship complete.`
      : game.gameover
        ? game.gameover.blocked
          ? "No moves remain. Lowest hand score wins."
          : "Every card played. Nicely done."
        : game.last === "Cards dealt."
          ? "Cards dealt."
          : `${nameFor(game.currentPlayer)} is up next.`
    : `${packet.members.length} of ${packet.capacity} seats filled`;
  app.innerHTML = `<div class="shell"><aside class="sidebar room-sidebar ${packet.mode === "championship" ? "championship-sidebar" : ""}"><div class="share-area"><div><p class="eyebrow">${packet.mode === "championship" ? "Championship" : "Private table"}</p><h2>Round ${packet.round || 1}</h2></div><button class="secondary" id="share">${icon("link")}Invite friends</button></div><p class="room-link">${escape(roomURL())}</p>
    ${standingsHTML()}
    <ul class="roster">${packet.members.map((p) => `<li><span class="avatar">${escape(p.name[0].toUpperCase())}</span><span class="roster-name"><span class="online-dot ${p.online ? "" : "offline-dot"}"></span>${escape(p.name)}${p.id === me ? " (you)" : ""}<br><span class="small muted">${p.wins} win${p.wins === 1 ? "" : "s"}${p.online ? "" : " · offline"}</span></span>${host && !game && !p.online && p.id !== "0" ? `<button class="icon-button" data-remove="${p.id}" aria-label="Remove ${escape(p.name)}">${icon("x")}</button>` : ""}</li>`).join("")}</ul>
    ${!game && host ? `<div class="separator"><button class="primary" id="start" ${packet.members.length < 2 || packet.members.some((p) => !p.online) ? "disabled" : ""}>${icon("play")}Deal cards</button></div>` : ""}
    ${!game && !host ? '<p class="small muted">Waiting for the host to deal.</p>' : ""}
    ${connectingError || packet.paused ? `<div class="offline-banner" role="alert">${escape(connectingError || "The game is paused until every player reconnects.")}${!host ? '<button class="secondary" id="retry">Reconnect</button>' : ""}</div>` : ""}
    ${game ? `<p class="match-log" aria-live="polite">${escape(game.last)}</p>` : ""}
    <button class="secondary leave" id="leave">${icon("log-out")}${host ? "Close room" : "Leave room"}</button></aside>
    <section class="table-area"><div class="table-heading"><span class="connection">${icon("users")}${packet.members.length} players</span><span class="status-pill">${connectingError ? "Disconnected" : game ? "In play" : "Waiting room"}</span></div>
    <div class="table">${stage && !game?.gameover ? `<div class="round-drama ${stage === "SUDDEN DEATH" ? "sudden-death" : ""}">${icon("trophy")}${stage}</div>` : ""}<div class="opponents">${packet.members
      .filter((p) => p.id !== me)
      .map(
        (p) =>
          `<div data-player="${p.id}" class="opponent ${game?.currentPlayer === p.id && !game?.gameover ? "active" : ""}"><div class="avatar">${escape(p.name[0].toUpperCase())}</div><p class="opponent-name">${escape(p.name)}</p><p class="opponent-count">${game ? `${game.counts[p.id]} card${game.counts[p.id] === 1 ? "" : "s"}` : p.online ? "Ready" : "Offline"}</p>${game ? `<div class="mini-cards" aria-hidden="true">${'<span class="mini-card"></span>'.repeat(Math.min(game.counts[p.id], 5))}</div>` : ""}</div>`,
      )
      .join("")}</div>
    <div id="taunt-stage" class="taunt-stage" role="status" aria-live="polite"></div>
    <div class="center-piles"><div class="pile-block">${cardHTML(null, { draw: !!game && !game.gameover, disabled: !isTurn || canPlay })}<span class="pile-label">${game ? `${game.stockCount} to draw` : "Fresh deck"}</span></div><div class="pile-block discard-pile">${cardHTML(game?.top || { rank: "8", suit: "hearts" })}<span class="pile-label">${game ? "Discard" : "Eights are wild"}</span></div></div>
    ${game ? `<div class="active-suit"><span class="suit-token ${red(game.suit) ? "red" : ""}">${glyphs[game.suit]}</span>${SUIT_CALLS[game.suit]}</div>${game.drawRun >= 3 ? `<div class="drawfest-status">DRAWFEST · ${escape(nameFor(game.drawer))} · ${game.drawRun} drawn</div>` : ""}` : ""}
    <div class="turn-banner"><p class="turn-title ${game?.gameover ? "winner" : ""}" aria-live="polite">${game?.gameover ? '<span class="winner-trophy">🏆</span>' : ""}${escape(title)}</p><p class="turn-detail">${escape(detail)}</p>${game?.gameover && host ? `<button class="primary result-actions" id="${champion !== null ? "new-championship" : "rematch"}">${champion !== null ? "New championship" : packet.mode === "championship" ? "Next round" : "Deal again"}</button>` : ""}</div></div>
    <div class="taunt-toolbar" aria-label="Taunts">${TAUNTS.slice(0, 4)
      .map(
        (t) =>
          `<button class="taunt-button ${red(t.suit) ? "red" : ""}" data-taunt="${t.id}" title="Taunt: ${t.id}" aria-label="Taunt ${t.id}"><span>${t.symbol}</span>${t.id}</button>`,
      )
      .join(
        "",
      )}<button class="secondary reactions-button" id="more-taunts" aria-label="More taunts and emoji" title="More taunts and emoji">${icon("smile-plus")}Taunts</button><button class="icon-button" id="mute-taunts" aria-label="${mutedTaunts ? "Unmute" : "Mute"} incoming taunts" title="${mutedTaunts ? "Unmute" : "Mute"} incoming taunts" aria-pressed="${mutedTaunts}">${icon(mutedTaunts ? "message-square-off" : "message-square")}</button></div>
    ${
      game
        ? `<div class="hand-area"><div class="hand-heading"><span>Your hand · ${mine.length} card${mine.length === 1 ? "" : "s"}</span></div><div class="hand">${
            mine.length
              ? [...mine]
                  .sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit))
                  .map((card) =>
                    cardHTML(card, {
                      button: true,
                      disabled: !isTurn || !playable(card, game.top, game.suit),
                    }),
                  )
                  .join("")
              : '<p class="empty-hand">No cards left.</p>'
          }</div></div>`
        : ""
    }</section></div>`;
  document.querySelector("#share").onclick = async () => {
    try {
      await navigator.clipboard.writeText(roomURL());
      notify("Room link copied.");
    } catch {
      prompt("Share this room link:", roomURL());
    }
  };
  document.querySelector("#leave").onclick = leaveRoom;
  document.querySelector("#more-taunts").onclick = () =>
    document.querySelector("#reaction-dialog").showModal();
  document.querySelector("#start")?.addEventListener("click", startGame);
  document.querySelector("#rematch")?.addEventListener("click", startGame);
  document
    .querySelector("#new-championship")
    ?.addEventListener("click", newChampionship);
  document
    .querySelectorAll("#app [data-taunt]")
    .forEach(
      (button) => (button.onclick = () => sendTaunt(button.dataset.taunt)),
    );
  document.querySelector("#mute-taunts").onclick = () => {
    mutedTaunts = !mutedTaunts;
    const button = document.querySelector("#mute-taunts");
    button.innerHTML = icon(
      mutedTaunts ? "message-square-off" : "message-square",
    );
    button.setAttribute("aria-pressed", String(mutedTaunts));
    button.setAttribute(
      "aria-label",
      `${mutedTaunts ? "Unmute" : "Mute"} incoming taunts`,
    );
    button.title = button.getAttribute("aria-label");
    if (mutedTaunts) document.querySelector("#taunt-stage").replaceChildren();
    createIcons({ icons });
  };
  updateTauntControls();
  document
    .querySelector("#draw-deck")
    ?.addEventListener("click", () => move("draw"));
  document.querySelector("#retry")?.addEventListener("click", () => {
    connectingError = "";
    busy = true;
    connectGuest();
    render();
  });
  document
    .querySelectorAll("[data-remove]")
    .forEach(
      (button) => (button.onclick = () => removeMember(button.dataset.remove)),
    );
  document.querySelectorAll("[data-card]").forEach(
    (button) =>
      (button.onclick = () => {
        const card = mine.find((card) => card.id === button.dataset.card);
        if (card.rank === "8") {
          chosenEight = card.id;
          document.querySelector("#suit-dialog").showModal();
        } else move("play", card.id);
      }),
  );
  createIcons({ icons });
  if (activeReaction?.until > Date.now())
    showTaunt(activeReaction.message, true);
  const celebrationKey = `${room}:${packet.round}`;
  if (game?.gameover && celebrated !== celebrationKey) {
    celebrated = celebrationKey;
    celebrate();
  }
  if (oldDeckFocus && document.querySelector("#draw-deck:not(:disabled)"))
    document.querySelector("#draw-deck").focus({ preventScroll: true });
  if (game && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const firstDeal = !previous || previous.round !== packet.round;
    const source = document
      .querySelector(".card-back")
      ?.getBoundingClientRect();
    document.querySelectorAll(".hand [data-card]").forEach((card, index) => {
      if (!firstDeal && previous.hand.includes(card.dataset.card)) return;
      const target = card.getBoundingClientRect();
      card.animate(
        [
          {
            opacity: 0,
            transform: `translate(${source.left - target.left}px,${source.top - target.top}px) rotate(-14deg) scale(.7)`,
          },
          { opacity: 1, transform: "translate(0,0) rotate(0) scale(1)" },
        ],
        {
          duration: 430,
          delay: firstDeal ? index * 65 : 0,
          easing: "cubic-bezier(.2,.8,.2,1)",
          fill: "backwards",
        },
      );
    });
    if (previous && !firstDeal && previous.top !== game.top.id) {
      const discard = document.querySelector(".discard-pile .card");
      const target = discard.getBoundingClientRect();
      animatePlayedCard(
        discard,
        previousDiscard,
        playedSource || { ...target.toJSON(), top: target.top - 80 },
      );
    }
  }
  renderedGame = game
    ? {
        round: packet.round,
        top: game.top.id,
        hand: mine.map((card) => card.id),
        currentPlayer: game.currentPlayer,
      }
    : null;
}

function animatePlayedCard(discard, previousDiscard, source) {
  const target = discard.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.className = "card-flight-overlay";
  layer.setAttribute("aria-hidden", "true");
  const flying = discard.cloneNode(true);
  for (const card of [previousDiscard, flying].filter(Boolean)) {
    card.classList.add("flying-card");
    card.style.visibility = "";
    Object.assign(card.style, {
      left: `${target.left}px`,
      top: `${target.top}px`,
      width: `${target.width}px`,
      height: `${target.height}px`,
    });
    layer.append(card);
  }
  document.body.append(layer);
  discard.style.visibility = "hidden";
  const flight = flying.animate(flightKeyframes(source, target), {
    duration: 620,
    easing: "cubic-bezier(.22,.7,.25,1)",
    fill: "both",
  });
  const finish = () => {
    discard.style.visibility = "";
    layer.remove();
  };
  flight.finished.then(finish, finish);
}

function celebrate() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const shower = document.createElement("div");
  shower.className = "confetti-shower";
  shower.setAttribute("aria-hidden", "true");
  document.body.append(shower);
  for (let i = 0; i < 70; i++) {
    const piece = document.createElement("span");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = [
      "#ff4f87",
      "#ffdb39",
      "#25c9a1",
      "#ffffff",
      "#69c9ff",
    ][i % 5];
    shower.append(piece);
    piece.animate(
      [
        { transform: "translateY(-30px) rotate(0)", opacity: 1 },
        {
          transform: `translate(${(Math.random() - 0.5) * 200}px,110vh) rotate(${Math.random() * 900}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 2600 + Math.random() * 1800,
        delay: Math.random() * 450,
        fill: "both",
      },
    );
  }
  setTimeout(() => shower.remove(), 5000);
}
document.querySelector(".reaction-options").innerHTML = TAUNTS.map(
  (t) =>
    `<button class="reaction-choice ${red(t.suit) ? "red" : ""} ${t.long || t.id === "CAN_AND_WILL" ? "wide-reaction" : ""}" data-taunt="${t.id}"><span>${t.symbol}</span><strong>${escape(t.label || t.id)}</strong></button>`,
).join("");
document.querySelectorAll("#reaction-dialog [data-taunt]").forEach(
  (button) =>
    (button.onclick = () => {
      sendTaunt(button.dataset.taunt);
      document.querySelector("#reaction-dialog").close();
    }),
);
document.querySelector("#rules").onclick = () =>
  document.querySelector("#rules-dialog").showModal();
document.querySelector("#header-leave").onclick = leaveRoom;
document
  .querySelectorAll(".close-dialog")
  .forEach(
    (button) => (button.onclick = () => button.closest("dialog").close()),
  );
document.querySelector(".suit-options").innerHTML = SUITS.map(
  (suit) =>
    `<button class="suit-choice ${red(suit) ? "red" : ""}" data-suit="${suit}"><span>${glyphs[suit]}</span>${SUIT_CALLS[suit]}</button>`,
).join("");
document.querySelectorAll("[data-suit]").forEach(
  (button) =>
    (button.onclick = () => {
      document.querySelector("#suit-dialog").close();
      if (chosenEight) move("play", chosenEight, button.dataset.suit);
      chosenEight = null;
    }),
);
const params = new URLSearchParams(location.search);
const requestedRoom = params.get("room");
if (requestedRoom && roomPattern.test(requestedRoom)) {
  room = requestedRoom;
  const stored = sessionStorage.getItem(hostStorage());
  if (params.has("host") && stored) {
    try {
      const saved = JSON.parse(stored);
      host = true;
      capacity = saved.capacity;
      round = saved.round;
      theme = normalizeTheme(saved.theme);
      mode = saved.mode === "championship" ? "championship" : "casual";
      targetWins = [3, 5, 7].includes(saved.targetWins) ? saved.targetWins : 3;
      members = saved.members.map((p) => ({ ...p, online: p.id === "0" }));
      if (saved.game) bootGame(saved.game);
      openPeer();
    } catch {
      connectingError = "This room could not be restored. Create a new room.";
      render();
    }
  } else if (
    sessionStorage.getItem(`crazy8s:seat:${room}`) &&
    sessionStorage.getItem("crazy8s:name")
  ) {
    openPeer();
  } else render();
} else {
  if (requestedRoom)
    connectingError = "That room link is invalid. Create a new room.";
  render();
}
