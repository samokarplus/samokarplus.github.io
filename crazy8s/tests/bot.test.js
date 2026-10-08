import test from "node:test";
import assert from "node:assert/strict";
import { BOT_NAME, botMove } from "../src/bot.js";
const card = (rank, suit = "clubs") => ({ rank, suit, id: `${suit}-${rank}` });
test("solo opponent uses the requested name", () =>
  assert.equal(BOT_NAME, "Mr. Samo the Crazy 8 bot!"));
test("bot draws only when it has no legal card", () => {
  assert.deepEqual(botMove([card("2", "hearts")], card("K"), "clubs"), {
    move: "draw",
  });
  assert.equal(
    botMove([card("K", "hearts")], card("K"), "clubs").card,
    "hearts-K",
  );
});
test("bot keeps wild eights when an ordinary play is available", () => {
  assert.equal(
    botMove([card("8"), card("6")], card("K"), "clubs").card,
    "clubs-6",
  );
});
test("bot picks its most plentiful remaining suit for an eight", () => {
  assert.deepEqual(
    botMove(
      [
        card("8"),
        card("2", "hearts"),
        card("3", "hearts"),
        card("4", "spades"),
      ],
      card("K"),
      "diamonds",
    ),
    { move: "play", card: "clubs-8", suit: "hearts" },
  );
  assert.equal(botMove([card("8")], card("K"), "spades").suit, "spades");
});
