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
test("only the four requested taunts are accepted; cooldown applies per seat", () => {
  assert.deepEqual(
    TAUNTS.map((t) => [t.id, t.symbol]),
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
});
