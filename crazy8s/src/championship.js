export const TAUNTS = [
  { id: "ESPA", suit: "spades", symbol: "♠" },
  { id: "BITOS", suit: "clubs", symbol: "♣" },
  { id: "TITOS", suit: "hearts", symbol: "♥" },
  { id: "ZIA", suit: "diamonds", symbol: "♦" },
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
  return { standings, champion };
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
