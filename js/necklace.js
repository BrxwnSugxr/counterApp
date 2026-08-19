// ============ NECKLACE DRAWING ============
import { els } from "./dom.js";

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

export function drawNecklace(lapLen, lit, animate) {
  const svg = els.necklace;
  svg.innerHTML = "";
  const cx = 160,
    cy = 130,
    r = 108;
  const ns = "http://www.w3.org/2000/svg";

  // Tassel
  const imamPos = polar(cx, cy, r, 180);
  const tassel = document.createElementNS(ns, "line");
  tassel.setAttribute("x1", imamPos.x);
  tassel.setAttribute("y1", imamPos.y + 10);
  tassel.setAttribute("x2", imamPos.x);
  tassel.setAttribute("y2", imamPos.y + 34);
  tassel.setAttribute("class", "tassel");
  svg.appendChild(tassel);

  // Beads
  const startA = -160,
    endA = 160;
  for (let i = 0; i < lapLen; i++) {
    const theta =
      lapLen === 1 ? 0 : startA + i * ((endA - startA) / (lapLen - 1));
    const seed = Math.sin(i * 12.9898 + lapLen * 78.233) * 43758.5453;
    const jitter = seed - Math.floor(seed);
    const rJit = r + (jitter - 0.5) * 7;
    const sizeJit = 9 + (jitter - 0.5) * 2.2;
    const p = polar(cx, cy, rJit, theta);
    const bead = document.createElementNS(ns, "circle");
    bead.setAttribute("cx", p.x);
    bead.setAttribute("cy", p.y);
    bead.setAttribute("r", sizeJit);
    const isLit = i < lit;
    bead.setAttribute(
      "class",
      "bead " +
        (isLit ? "lit" : "idle") +
        (animate && i === lit - 1 ? " pop" : ""),
    );
    svg.appendChild(bead);
  }

  // Imam bead
  const imam = document.createElementNS(ns, "circle");
  imam.setAttribute("cx", imamPos.x);
  imam.setAttribute("cy", imamPos.y);
  imam.setAttribute("r", 12);
  imam.setAttribute("class", "imam-bead");
  svg.appendChild(imam);
}

export function computeLap(count, target) {
  if (!target) {
    return {
      lapLen: 33,
      pos: count % 33,
      num: Math.floor(count / 33) + 1,
    };
  }
  const inCycle = count % target;
  const lapIdx = Math.floor(inCycle / 33);
  const lapLen = Math.min(33, target - lapIdx * 33);
  const pos = inCycle - lapIdx * 33;
  const total = Math.ceil(target / 33);
  return { lapLen: lapLen, pos: pos, num: lapIdx + 1, total: total };
}
