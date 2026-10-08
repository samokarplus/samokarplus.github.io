import test from "node:test";
import assert from "node:assert/strict";
import { championshipState, acceptTaunt, TAUNTS } from "../src/championship.js";
test("championship standings track wins without mutating the roster", () => {
  const members = [
    { id: "0", wins: 1 },
    { id: "1", wins: 2 },
  ];
  assert.equal(
    championshipState(members, "championship", 3).standings[0].id,
    "1",
  );
  assert.equal(members[0].id, "0");
  assert.equal(championshipState(members, "championship", 3).champion, null);
});
test("a unique leader at the target is champion; tied leaders play on", () => {
  const members = [
    { id: "0", wins: 3 },
    { id: "1", wins: 3 },
  ];
  assert.equal(championshipState(members, "championship", 3).champion, null);
  members[0].wins++;
  assert.equal(championshipState(members, "championship", 3).champion, "0");
  assert.equal(championshipState(members, "casual", 3).champion, null);
  assert.equal(championshipState(members, "championship", 5).champion, null);
});
test("suit shouts and emoji reactions are accepted; cooldown applies per seat", () => {
  assert.deepEqual(
    TAUNTS.slice(0, 4).map((t) => [t.id, t.symbol]),
    [
      ["ESPA", "♠"],
      ["BITOS", "♣"],
      ["TITOS", "♥"],
      ["ZIA", "♦"],
    ],
  );
  const sent = new Map();
  assert.equal(acceptTaunt(sent, "0", "ESPA", 100), true);
  assert.equal(acceptTaunt(sent, "0", "ZIA", 1000), false);
  assert.equal(acceptTaunt(sent, "1", "TITOS", 1000), true);
  assert.equal(acceptTaunt(sent, "0", "BITOS", 2100), true);
  assert.equal(acceptTaunt(sent, "0", "<script>", 5000), false);
  for (const id of [
    "ESPADIOS",
    "CLUBITOS",
    "ZIAMONDES",
    "HEARTITOS",
    "DRAWFEST",
    "KEEP_DRAWING",
    "CAN_AND_WILL",
    "LAUGH",
    "RESPONSES",
  ]) {
    assert.equal(acceptTaunt(new Map(), "0", id, 0), true);
  }
});
test("responses taunt preserves the requested wording", () => {
  assert.equal(TAUNTS.find(t => t.id === "RESPONSES").label, "I've got responses. I've got responses");
});
test("race to seven at 6-6 is sudden death, not a completed match", () => {
  const members = [
    { id: "0", wins: 6 },
    { id: "1", wins: 6 },
  ];
  assert.equal(
    championshipState(members, "championship", 7).stage,
    "SUDDEN DEATH",
  );
  assert.equal(championshipState(members, "championship", 7).champion, null);
  members[1].wins = 5;
  assert.equal(
    championshipState(members, "championship", 7).stage,
    "CHAMPIONSHIP ROUND",
  );
  members[0].wins = 7;
  assert.equal(championshipState(members, "championship", 7).stage, "");
  assert.equal(championshipState(members, "championship", 7).champion, "0");
  assert.equal(championshipState(members, "casual", 7).stage, "");
});
