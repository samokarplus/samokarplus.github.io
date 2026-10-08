import { INVALID_MOVE } from "boardgame.io/dist/cjs/core.js";

export const SUITS = ["clubs", "diamonds", "hearts", "spades"];
export const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
export const deck = () =>
  SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({ id: `${suit}-${rank}`, suit, rank })),
  );
export const playable = (card, top, suit) =>
  card.rank === "8" || card.suit === suit || card.rank === top.rank;

export const CrazyEights = {
  name: "crazy-eights",
  minPlayers: 2,
  maxPlayers: 4,
  setup: ({ ctx, random }) => {
    const stock = random.Shuffle(deck());
    const hands = Object.fromEntries(
      Array.from({ length: ctx.numPlayers }, (_, i) => [String(i), []]),
    );
    for (let round = 0; round < 8; round++) {
      for (const hand of Object.values(hands)) hand.push(stock.pop());
    }
    const first = stock.findIndex((card) => card.rank !== "8");
    const top = stock.splice(first, 1)[0];
    return {
      stock,
      hands,
      discard: [top],
      suit: top.suit,
      passes: 0,
      drawRun: 0,
      drawer: null,
      last: "Cards dealt.",
    };
  },
  turn: {
    order: {
      first: () => 0,
      next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers,
    },
  },
  events: { endTurn: false, endGame: false, setActivePlayers: false },
  moves: {
    play: ({ G, ctx, events }, id, suit) => {
      const hand = G.hands[ctx.currentPlayer];
      const index = hand.findIndex((card) => card.id === id);
      if (index < 0) return INVALID_MOVE;
      const card = hand[index];
      if (!playable(card, G.discard.at(-1), G.suit)) return INVALID_MOVE;
      if (card.rank === "8" && !SUITS.includes(suit)) return INVALID_MOVE;
      hand.splice(index, 1);
      G.discard.push(card);
      G.suit = card.rank === "8" ? suit : card.suit;
      G.passes = 0;
      G.drawRun = 0;
      G.drawer = null;
      G.last = `played ${card.rank} of ${card.suit}${card.rank === "8" ? `; chose ${suit}` : ""}.`;
      events.endTurn();
    },
    draw: ({ G, ctx, random, events }) => {
      const hand = G.hands[ctx.currentPlayer];
      const top = G.discard.at(-1);
      if (hand.some((card) => playable(card, top, G.suit))) return INVALID_MOVE;
      if (!G.stock.length && G.discard.length > 1) {
        G.stock = random.Shuffle(G.discard.slice(0, -1));
        G.discard = [top];
      }
      const drawn = G.stock.length ? G.stock.pop() : null;
      if (drawn) hand.push(drawn);
      G.drawRun = drawn
        ? G.drawer === ctx.currentPlayer
          ? (G.drawRun || 0) + 1
          : 1
        : 0;
      G.drawer = ctx.currentPlayer;
      G.last = drawn ? "drew a card." : "No cards left to draw; passed.";
      if (
        !drawn ||
        (!G.stock.length &&
          G.discard.length === 1 &&
          !hand.some((card) => playable(card, top, G.suit)))
      ) {
        G.passes++;
        if (drawn) G.last += " No playable card; passed.";
        events.endTurn();
      } else G.passes = 0;
    },
  },
  endIf: ({ G, ctx }) => {
    const empty = Object.entries(G.hands).find(([, hand]) => !hand.length);
    if (empty) return { winner: empty[0] };
    if (G.passes >= ctx.numPlayers) {
      const scores = Object.entries(G.hands).map(([id, hand]) => [
        id,
        hand.reduce(
          (sum, c) =>
            sum +
            (c.rank === "8"
              ? 50
              : ["J", "Q", "K"].includes(c.rank)
                ? 10
                : c.rank === "A"
                  ? 1
                  : Number(c.rank)),
          0,
        ),
      ]);
      const lowest = Math.min(...scores.map(([, value]) => value));
      return {
        winners: scores
          .filter(([, value]) => value === lowest)
          .map(([id]) => id),
        blocked: true,
      };
    }
  },
};

export function view(state, playerID) {
  const { G, ctx } = state;
  return {
    top: G.discard.at(-1),
    suit: G.suit,
    stockCount: G.stock.length,
    counts: Object.fromEntries(
      Object.entries(G.hands).map(([id, hand]) => [id, hand.length]),
    ),
    hand: G.hands[playerID] || [],
    currentPlayer: ctx.currentPlayer,
    gameover: ctx.gameover,
    last: G.last,
    drawRun: G.drawRun || 0,
    drawer: G.drawer,
    version: state._stateID,
  };
}
