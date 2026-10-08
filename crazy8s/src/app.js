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
  Layers,
} from "lucide";
import { CrazyEights, SUITS, playable, view } from "./game.js";

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
  Layers,
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
    return '<div class="card card-back" aria-label="Face-down deck">8</div>';
  const inner = `<span class="card-corner">${card.rank}<span>${glyphs[card.suit]}</span></span><span class="card-center" aria-hidden="true">${glyphs[card.suit]}</span><span class="card-corner bottom" aria-hidden="true">${card.rank}<span>${glyphs[card.suit]}</span></span>`;
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
  round++;
  bootGame();
  broadcast();
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
      me = message.me;
      busy = false;
      reconnecting = false;
      reconnectAttempts = 0;
      connectingError = "";
      render();
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
  const headerLeave = document.querySelector("#header-leave");
  headerLeave.hidden = !packet;
  headerLeave.title = host ? "Close room" : "Leave room";
  headerLeave.setAttribute("aria-label", headerLeave.title);
  if (!packet) {
    const joining = !!room && !host;
    app.innerHTML = `<div class="shell"><aside class="sidebar setup-sidebar"><div><p class="eyebrow">Samo's card table</p><h2>${joining ? "Join your friends" : "Pull up a chair"}</h2></div>
      <form class="form" id="setup"><label>Your name<input name="name" maxlength="20" autocomplete="nickname" placeholder="Your name" value="${escape(sessionStorage.getItem("crazy8s:name") || "")}" required ${busy ? "disabled" : ""}></label>
      ${joining ? "" : '<label>Seats<select name="seats"><option value="2">2 players</option><option value="3">3 players</option><option value="4" selected>4 players</option></select></label>'}
      <button class="primary" ${busy ? "disabled" : ""}>${icon(busy ? "loader-circle" : "play")}${busy ? "Connecting…" : joining ? "Join room" : "Create room"}</button>
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
      else createRoom(name, Number(data.get("seats")));
    };
    document.querySelector("#retry")?.addEventListener("click", openPeer);
    createIcons({ icons });
    return;
  }
  const game = packet.game;
  const mine = game?.hand || [];
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
    ? game.gameover
      ? `${winners.map(nameFor).join(" & ")} ${winners.length > 1 ? "win" : "wins"}!`
      : packet.paused
        ? "Waiting for a player"
        : isTurn
          ? "Your turn"
          : `${nameFor(game.currentPlayer)}'s turn`
    : "The table is open";
  let detail = game
    ? game.gameover
      ? game.gameover.blocked
        ? "No moves remain. Lowest hand score wins."
        : "Every card played. Nicely done."
      : game.last === "Cards dealt."
        ? "Cards dealt."
        : `${nameFor(game.currentPlayer)} is up next.`
    : `${packet.members.length} of ${packet.capacity} seats filled`;
  app.innerHTML = `<div class="shell"><aside class="sidebar room-sidebar"><div class="share-area"><div><p class="eyebrow">Private table</p><h2>Round ${packet.round || 1}</h2></div><button class="secondary" id="share">${icon("link")}Invite friends</button></div><p class="room-link">${escape(roomURL())}</p>
    <ul class="roster">${packet.members.map((p) => `<li><span class="avatar">${escape(p.name[0].toUpperCase())}</span><span class="roster-name"><span class="online-dot ${p.online ? "" : "offline-dot"}"></span>${escape(p.name)}${p.id === me ? " (you)" : ""}<br><span class="small muted">${p.wins} win${p.wins === 1 ? "" : "s"}${p.online ? "" : " · offline"}</span></span>${host && !game && !p.online && p.id !== "0" ? `<button class="icon-button" data-remove="${p.id}" aria-label="Remove ${escape(p.name)}">${icon("x")}</button>` : ""}</li>`).join("")}</ul>
    ${!game && host ? `<div class="separator"><button class="primary" id="start" ${packet.members.length < 2 || packet.members.some((p) => !p.online) ? "disabled" : ""}>${icon("play")}Deal cards</button></div>` : ""}
    ${!game && !host ? '<p class="small muted">Waiting for the host to deal.</p>' : ""}
    ${connectingError || packet.paused ? `<div class="offline-banner" role="alert">${escape(connectingError || "The game is paused until every player reconnects.")}${!host ? '<button class="secondary" id="retry">Reconnect</button>' : ""}</div>` : ""}
    ${game ? `<p class="match-log" aria-live="polite">${escape(game.last)}</p>` : ""}
    <button class="secondary leave" id="leave">${icon("log-out")}${host ? "Close room" : "Leave room"}</button></aside>
    <section class="table-area"><div class="table-heading"><span class="connection">${icon("users")}${packet.members.length} players</span><span class="status-pill">${connectingError ? "Disconnected" : game ? "In play" : "Waiting room"}</span></div>
    <div class="table"><div class="opponents">${packet.members
      .filter((p) => p.id !== me)
      .map(
        (p) =>
          `<div class="opponent ${game?.currentPlayer === p.id && !game?.gameover ? "active" : ""}"><div class="avatar">${escape(p.name[0].toUpperCase())}</div><p class="opponent-name">${escape(p.name)}</p><p class="opponent-count">${game ? `${game.counts[p.id]} card${game.counts[p.id] === 1 ? "" : "s"}` : p.online ? "Ready" : "Offline"}</p>${game ? `<div class="mini-cards" aria-hidden="true">${'<span class="mini-card"></span>'.repeat(Math.min(game.counts[p.id], 5))}</div>` : ""}</div>`,
      )
      .join("")}</div>
    <div class="center-piles"><div class="pile-block">${cardHTML(null)}<span class="pile-label">${game ? `${game.stockCount} to draw` : "Fresh deck"}</span></div><div class="pile-block">${cardHTML(game?.top || { rank: "8", suit: "hearts" })}<span class="pile-label">${game ? "Discard" : "Eights are wild"}</span></div></div>
    ${game ? `<div class="active-suit"><span class="suit-token ${red(game.suit) ? "red" : ""}">${glyphs[game.suit]}</span>${game.suit[0].toUpperCase() + game.suit.slice(1)}</div>` : ""}
    <div class="turn-banner"><p class="turn-title ${game?.gameover ? "winner" : ""}" aria-live="polite">${escape(title)}</p><p class="turn-detail">${escape(detail)}</p>${game?.gameover && host ? '<button class="primary result-actions" id="rematch">Deal again</button>' : ""}</div></div>
    ${
      game
        ? `<div class="hand-area"><div class="hand-heading"><span>Your hand · ${mine.length} card${mine.length === 1 ? "" : "s"}</span>${!game.gameover ? `<button class="primary draw-button" id="draw" ${!isTurn || canPlay ? "disabled" : ""}>${icon("layers")}Draw until playable</button>` : ""}</div><div class="hand">${
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
  document.querySelector("#start")?.addEventListener("click", startGame);
  document.querySelector("#rematch")?.addEventListener("click", startGame);
  document
    .querySelector("#draw")
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
}

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
    `<button class="suit-choice ${red(suit) ? "red" : ""}" data-suit="${suit}"><span>${glyphs[suit]}</span>${suit[0].toUpperCase() + suit.slice(1)}</button>`,
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
