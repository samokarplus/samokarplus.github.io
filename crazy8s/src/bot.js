import { SUITS, playable } from "./game.js";

export const BOT_NAME = "Mr. Samo the Crazy 8 bot!";

export function botMove(hand, top, suit) {
  const legal = hand.filter((card) => playable(card, top, suit));
  const card = legal.find((card) => card.rank !== "8") || legal[0];
  if (!card) return { move: "draw" };
  const counts = Object.fromEntries(
    SUITS.map((s) => [
      s,
      hand.filter((c) => c.id !== card.id && c.suit === s).length,
    ]),
  );
  const choice = SUITS.reduce(
    (best, s) => (counts[s] > counts[best] ? s : best),
    suit,
  );
  return {
    move: "play",
    card: card.id,
    suit: card.rank === "8" ? choice : undefined,
  };
}
