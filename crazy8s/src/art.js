const symbols = { clubs: "♣", diamonds: "♦", hearts: "♥", spades: "♠" };
const positions = {
  A: [[50, 50]],
  2: [
    [50, 15],
    [50, 85],
  ],
  3: [
    [50, 15],
    [50, 50],
    [50, 85],
  ],
  4: [
    [25, 15],
    [75, 15],
    [25, 85],
    [75, 85],
  ],
  5: [
    [25, 15],
    [75, 15],
    [50, 50],
    [25, 85],
    [75, 85],
  ],
  6: [
    [25, 15],
    [75, 15],
    [25, 50],
    [75, 50],
    [25, 85],
    [75, 85],
  ],
  7: [
    [25, 15],
    [75, 15],
    [50, 32],
    [25, 50],
    [75, 50],
    [25, 85],
    [75, 85],
  ],
  8: [
    [25, 15],
    [75, 15],
    [50, 32],
    [25, 50],
    [75, 50],
    [50, 68],
    [25, 85],
    [75, 85],
  ],
  9: [
    [25, 12],
    [75, 12],
    [25, 37],
    [75, 37],
    [50, 50],
    [25, 63],
    [75, 63],
    [25, 88],
    [75, 88],
  ],
  10: [
    [25, 12],
    [75, 12],
    [50, 25],
    [25, 37],
    [75, 37],
    [25, 63],
    [75, 63],
    [50, 75],
    [25, 88],
    [75, 88],
  ],
};

export function cardArt(card) {
  if (positions[card.rank]) {
    return `<span class="pip-art ${card.rank === "A" ? "ace-art" : ""}" aria-hidden="true">${positions[card.rank].map(([x, y]) => `<span class="pip" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%)${y > 50 ? " rotate(180deg)" : ""}">${symbols[card.suit]}</span>`).join("")}</span>`;
  }
  const queen = card.rank === "Q";
  const jack = card.rank === "J";
  const crown = jack
    ? '<path d="M25 35 Q40 15 57 27 L60 34Z" fill="#327c72"/><path d="M32 25 Q27 13 39 10" fill="none" stroke="#bc3e57" stroke-width="4"/>'
    : '<path d="M26 32 L23 15 L34 23 L42 10 L50 23 L61 15 L58 32Z" fill="#e0b452" stroke="#946827" stroke-width="1.5"/>';
  return `<span class="court-frame" aria-hidden="true"><svg class="court-art" viewBox="0 0 84 120"><defs><g id="figure-${card.id}">${crown}<path d="M31 34 L55 34 L54 54 Q43 65 32 53Z" fill="#efd1b8" stroke="#423c37" stroke-width="1.4"/><path d="M32 33 Q23 52 31 64 L35 48Z M53 33 Q64 49 55 62 L51 49Z" fill="#423c37"/><path d="M37 43 L40 43 M46 43 L49 43 M40 52 Q44 55 48 51" fill="none" stroke="#423c37" stroke-width="1.3"/><path d="M20 82 Q20 62 36 59 L49 59 Q64 61 65 82Z" fill="${queen ? "#bc3e57" : "#327c72"}" stroke="#423c37" stroke-width="1.4"/><path d="M37 59 L42 71 L48 59 M26 66 L35 81 M57 65 L49 81" stroke="#e0b452" stroke-width="3" fill="none"/><circle cx="42" cy="73" r="3" fill="#e0b452"/><path d="M17 82 L67 82" stroke="#e0b452" stroke-width="3"/></g></defs><rect x="2" y="2" width="80" height="116" rx="3" fill="#faf6eb" stroke="#d5bb83"/><use href="#figure-${card.id}" transform="translate(0,-5) scale(1,.8)"/><use href="#figure-${card.id}" transform="translate(84,125) rotate(180) scale(1,.8)"/><path d="M8 60 L76 60" stroke="#d5bb83"/><text x="12" y="15" font-size="12" fill="currentColor">${symbols[card.suit]}</text><text x="62" y="112" font-size="12" fill="currentColor">${symbols[card.suit]}</text></svg></span>`;
}
