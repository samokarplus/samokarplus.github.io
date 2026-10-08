// Cartoon hand + sleeve that carries a played card from its source to the discard pile.
export const HAND_SVG = `<svg class="play-hand-svg" viewBox="0 0 120 210" aria-hidden="true">
<defs>
<linearGradient id="h-skin" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ffd7b5"/><stop offset=".6" stop-color="#f2ac80"/><stop offset="1" stop-color="#d98b63"/></linearGradient>
<linearGradient id="h-sleeve" x1="0" x2="1"><stop offset="0" stop-color="#4a6fc0"/><stop offset=".55" stop-color="#2f4f8f"/><stop offset="1" stop-color="#1d3263"/></linearGradient>
</defs>
<path d="M22 126 L98 126 L112 210 L8 210Z" fill="url(#h-sleeve)"/>
<path d="M30 134 L44 210 M92 134 L100 210" stroke="#0003" stroke-width="3" fill="none"/>
<rect x="20" y="108" width="80" height="24" rx="6" fill="#fff"/><rect x="20" y="124" width="80" height="8" rx="3" fill="#cfd5ea"/>
<circle cx="86" cy="120" r="4" fill="#f2c452"/>
<path d="M28 108 Q22 70 30 52 Q60 42 90 52 Q98 72 92 108Z" fill="url(#h-skin)"/>
<path d="M92 84 Q112 76 108 62 Q104 52 94 62Z" fill="url(#h-skin)" stroke="#c9774e" stroke-width="1.5"/>
<rect x="26" y="22" width="19" height="40" rx="9.5" fill="url(#h-skin)" stroke="#c9774e" stroke-width="1.5"/>
<rect x="47" y="14" width="19" height="46" rx="9.5" fill="url(#h-skin)" stroke="#c9774e" stroke-width="1.5"/>
<rect x="68" y="20" width="19" height="42" rx="9.5" fill="url(#h-skin)" stroke="#c9774e" stroke-width="1.5"/>
<ellipse cx="35" cy="26" rx="5" ry="3" fill="#fff" opacity=".45"/><ellipse cx="56" cy="18" rx="5" ry="3" fill="#fff" opacity=".45"/><ellipse cx="77" cy="24" rx="5" ry="3" fill="#fff" opacity=".45"/>
<path d="M32 62 Q34 70 32 76 M52 60 Q54 70 52 78 M74 62 Q76 70 74 76" stroke="#c9774e" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;

// Wraps the SVG so its fingertips sit on the card's edge nearest the source.
export function createPlayHand(source, target) {
  const sx = source.left + source.width / 2;
  const sy = source.top + source.height / 2;
  const tx = target.left + target.width / 2;
  const ty = target.top + target.height / 2;
  const len = Math.hypot(sx - tx, sy - ty) || 1;
  const ux = (sx - tx) / len;
  const uy = (sy - ty) / len || 1;
  const angle = (Math.atan2(-ux, uy) * 180) / Math.PI;
  const wrap = document.createElement("div");
  wrap.className = "play-hand";
  Object.assign(wrap.style, {
    left: `${target.left}px`,
    top: `${target.top}px`,
    width: `${target.width}px`,
    height: `${target.height}px`,
  });
  const arm = document.createElement("div");
  arm.className = "play-hand-arm";
  const handWidth = Math.max(70, target.width * 1.15);
  arm.style.width = `${handWidth}px`;
  // pivot at card center; fingertips ~0.34 card-heights toward the source
  arm.style.transform = `rotate(${angle}deg) translate(-50%, ${target.height * 0.14}px)`;
  arm.style.transformOrigin = "0 0";
  arm.innerHTML = HAND_SVG;
  wrap.append(arm);
  return { wrap, arm, angle };
}
