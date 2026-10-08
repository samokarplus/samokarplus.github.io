import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "boardgame.io/dist/cjs/client.js";
import { CrazyEights, deck, playable, view } from "../src/game.js";

function gameWith(G, count = 2) {
  const game = { ...CrazyEights, setup: () => structuredClone(G) };
  const client = Client({
    game,
    numPlayers: count,
    playerID: "0",
    debug: false,
  });
  client.start();
  return client;
}
const card = (rank, suit = "clubs") => ({ id: `${suit}-${rank}`, rank, suit });
function fixture() {
  return {
    hands: { 0: [card("3"), card("8", "hearts")], 1: [card("5", "spades")] },
    stock: [card("7", "diamonds"), card("6", "spades")],
    discard: [card("2")],
    suit: "clubs",
    passes: 0,
    last: "",
  };
}

test("52 unique cards, no jokers, correct deal and non-eight opening", () => {
  assert.equal(deck().length, 52);
  assert.equal(new Set(deck().map((c) => c.id)).size, 52);
  for (const n of [2, 3, 4]) {
    const client = Client({ game: CrazyEights, numPlayers: n, debug: false });
    const { G } = client.getState();
    const all = [...G.stock, ...G.discard, ...Object.values(G.hands).flat()];
    assert.equal(all.length, 52);
    assert.equal(new Set(all.map((c) => c.id)).size, 52);
    assert.notEqual(G.discard[0].rank, "8");
    assert.ok(
      Object.values(G.hands).every((hand) => hand.length === 8),
    );
  }
});
test("match rank or chosen suit; eights are wild", () => {
  assert.ok(playable(card("3", "hearts"), card("3"), "spades"));
  assert.ok(playable(card("5", "spades"), card("8", "hearts"), "spades"));
  assert.ok(playable(card("8", "diamonds"), card("2"), "clubs"));
  assert.equal(
    playable(card("2", "hearts"), card("8", "hearts"), "clubs"),
    false,
  );
});
test("legal play advances turn; out-of-turn and illegal moves do nothing", () => {
  const client = gameWith(fixture());
  client.moves.play("spades-K");
  assert.equal(client.getState().G.hands["0"].length, 2);
  client.moves.play("clubs-3");
  assert.equal(client.getState().ctx.currentPlayer, "1");
  client.moves.play("hearts-8", "hearts");
  assert.equal(client.getState().G.hands["0"].length, 1);
});
test("eight requires suit selection and sets active suit", () => {
  const client = gameWith(fixture());
  client.moves.play("hearts-8");
  assert.equal(client.getState().G.hands["0"].length, 2);
  client.moves.play("hearts-8", "diamonds");
  assert.equal(client.getState().G.suit, "diamonds");
  assert.equal(client.getState().ctx.currentPlayer, "1");
});
test("each draw adds exactly one card, keeping the turn until playable", () => {
  const G = fixture();
  let client = gameWith(G);
  client.moves.draw();
  assert.equal(client.getState().G.hands["0"].length, 2);
  assert.equal(client.getState().G.stock.length, 2);
  assert.equal(client.getState().ctx.currentPlayer, "0");
  G.hands["0"] = [card("9", "hearts")];
  G.stock = [card("4"), card("4", "spades"), card("7", "hearts")];
  client = gameWith(G);
  client.moves.draw();
  assert.equal(client.getState().G.hands["0"].length, 2);
  assert.equal(client.getState().G.stock.length, 2);
  assert.equal(client.getState().ctx.currentPlayer, "0");
  client.moves.draw();
  assert.equal(client.getState().G.hands["0"].length, 3);
  client.moves.draw();
  assert.equal(client.getState().G.hands["0"].length, 4);
  assert.equal(client.getState().ctx.currentPlayer, "0");
  assert.equal(client.getState().G.stock.length, 0);
  assert.equal(client.getState().G.drawRun, 3);
  assert.equal(view(client.getState(), "1").drawRun, 3);
  assert.equal(view(client.getState(), "1").drawer, "0");
  client.moves.draw();
  assert.equal(client.getState().G.hands["0"].length, 4);
  client.moves.play("clubs-4");
  assert.equal(client.getState().G.drawRun, 0);
});
test("discard recycling preserves the top and all cards", () => {
  const G = fixture();
  G.hands["0"] = [card("9", "hearts")];
  G.stock = [];
  G.discard = [card("4"), card("2")];
  const client = gameWith(G);
  client.moves.draw();
  assert.equal(client.getState().G.discard.at(-1).id, "clubs-2");
  assert.ok(client.getState().G.hands["0"].some((c) => c.id === "clubs-4"));
});
test("empty hand wins; exhausted deck passes and blocked game scores hands", () => {
  let G = fixture();
  G.hands["0"] = [card("3")];
  let client = gameWith(G);
  client.moves.play("clubs-3");
  assert.equal(client.getState().ctx.gameover.winner, "0");
  G = fixture();
  G.hands = { 0: [card("3", "hearts")], 1: [card("5", "spades")] };
  G.stock = [];
  client = gameWith(G);
  client.moves.draw();
  assert.equal(client.getState().ctx.currentPlayer, "1");
  client.updatePlayerID("1");
  client.moves.draw();
  assert.deepEqual(client.getState().ctx.gameover.winners, ["0"]);
});
test("guest projection exposes only own cards and public counts", () => {
  const state = gameWith(fixture()).getState();
  const projection = view(state, "1");
  assert.equal(projection.hand[0].id, "spades-5");
  assert.equal(projection.counts["0"], 2);
  assert.equal("stock" in projection, false);
  assert.equal("hands" in projection, false);
});
test("refresh recovery preserves hands, discard, stock and current turn", () => {
  const original = gameWith(fixture());
  original.moves.play("clubs-3");
  const saved = JSON.parse(JSON.stringify(original.getState()));
  const restored = Client({
    game: {
      ...CrazyEights,
      setup: () => structuredClone(saved.G),
      turn: {
        ...CrazyEights.turn,
        order: {
          ...CrazyEights.turn.order,
          first: () => Number(saved.ctx.currentPlayer),
        },
      },
    },
    numPlayers: 2,
    debug: false,
  });
  assert.deepEqual(restored.getState().G, saved.G);
  assert.equal(restored.getState().ctx.currentPlayer, saved.ctx.currentPlayer);
});
test("2–4 player complete simulated rounds conserve cards and finish", () => {
  for (const n of [2, 3, 4]) {
    for (let round = 0; round < 10; round++) {
      const client = Client({ game: CrazyEights, numPlayers: n, debug: false });
      client.start();
      let turns = 0;
      while (!client.getState().ctx.gameover && turns++ < 5000) {
        const { G, ctx } = client.getState();
        client.updatePlayerID(ctx.currentPlayer);
        const playableCard = G.hands[ctx.currentPlayer].find((c) =>
          playable(c, G.discard.at(-1), G.suit),
        );
        if (playableCard)
          client.moves.play(
            playableCard.id,
            SUIT_FOR_EIGHT(G.hands[ctx.currentPlayer]),
          );
        else client.moves.draw();
        const after = client.getState().G;
        assert.equal(
          [
            ...after.stock,
            ...after.discard,
            ...Object.values(after.hands).flat(),
          ].length,
          52,
        );
      }
      assert.ok(client.getState().ctx.gameover);
    }
  }
});
function SUIT_FOR_EIGHT(hand) {
  return hand.find((c) => c.rank !== "8")?.suit || "clubs";
}
