export const SUIT_CALLS = {
  spades: "Espadios",
  clubs: "Clubitos",
  diamonds: "Ziamondes",
  hearts: "Heartitos",
};
export const RANK_CALLS = {
  J: "JACKQUETTA",
  K: "KINGUETTA",
  3: "TRECE",
  6: "SEISY",
};
export function cardExclamation(card, suit) {
  return card?.rank === "8"
    ? SUIT_CALLS[suit]?.toUpperCase() || null
    : RANK_CALLS[card?.rank] || null;
}
export const TAUNTS = [
  { id: "ESPA", suit: "spades", symbol: "♠" },
  { id: "BITOS", suit: "clubs", symbol: "♣" },
  { id: "TITOS", suit: "hearts", symbol: "♥" },
  { id: "ZIA", suit: "diamonds", symbol: "♦" },
  ...Object.entries(SUIT_CALLS).map(([suit, name]) => ({
    id: name.toUpperCase(),
    suit,
    symbol: { spades: "♠", clubs: "♣", diamonds: "♦", hearts: "♥" }[suit],
  })),
  { id: "JACKQUETTA", label: "Jackquetta!", symbol: "🃏" },
  { id: "KINGUETTA", label: "Kinguetta!", symbol: "👑" },
  { id: "TRECE", label: "Trece!", symbol: "✨" },
  { id: "SEISY", label: "Seisy!", symbol: "😎" },
  { id: "DRAWFEST", symbol: "😂" },
  {
    id: "KEEP_DRAWING",
    label: "Woo! Keep drawing buddy!",
    symbol: "🫴",
    gesture: true,
  },
  { id: "LAUGH", label: "HAHAHA!", symbol: "🤣" },
  { id: "WOW", label: "WOW!", symbol: "😮" },
  { id: "COOL", label: "OH YEAH!", symbol: "😎" },
  {
    id: "RESPONSES",
    label: "I've got responses. I've got responses",
    symbol: "😏",
    long: true,
  },
  {
    id: "CAN_AND_WILL",
    label: "DONT EVER TELL ME I CANT CUZ I PROBABLY CAN AND I PROBABLY WILL",
    symbol: "💪",
  },
];
export const TAUNT_COOLDOWN = 2000;
export function championshipState(members, mode, target) {
  const standings = [...members].sort(
    (a, b) => b.wins - a.wins || Number(a.id) - Number(b.id),
  );
  const leader = standings[0];
  const champion =
    mode === "championship" &&
    leader?.wins >= target &&
    standings.filter((p) => p.wins === leader.wins).length === 1
      ? leader.id
      : null;
  const contenders = standings.filter((p) => p.wins >= target - 1);
  const stage =
    mode !== "championship" || champion !== null || target < 2
      ? ""
      : contenders.length > 1 && contenders[0].wins === contenders[1].wins
        ? "SUDDEN DEATH"
        : contenders.length
          ? "CHAMPIONSHIP ROUND"
          : "";
  return { standings, champion, stage };
}
export function acceptTaunt(lastSent, id, taunt, now) {
  if (
    !TAUNTS.some((t) => t.id === taunt) ||
    (lastSent.has(id) && now - lastSent.get(id) < TAUNT_COOLDOWN)
  )
    return false;
  lastSent.set(id, now);
  return true;
}
