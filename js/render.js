// ============ RENDER ============
import { els } from "./dom.js";
import { computeLap, drawNecklace } from "./necklace.js";
import {
  currentId,
  fmt,
  getTrack,
  isArabic,
  meta,
  trackCache,
} from "./state.js";

function getDisplay(track) {
  if (track.isCustom) {
    return {
      primary: track.phrase,
      primaryClass: isArabic(track.phrase) ? "arabic" : "custom-phrase",
      secondary: null,
      meaning: track.meaning || "",
    };
  }
  return {
    primary: track.arabic,
    primaryClass: "arabic",
    secondary: track.translit,
    meaning: track.meaning || "",
  };
}

export function render(animateLast) {
  const track = getTrack(currentId);
  const data = trackCache[currentId];
  const disp = getDisplay(track);

  els.primary.textContent = disp.primary;
  els.primary.className = disp.primaryClass;
  els.translit.textContent = disp.secondary || "";
  els.translit.style.display = disp.secondary ? "block" : "none";
  els.meaning.textContent = disp.meaning;

  const lap = computeLap(data.count, data.target);
  drawNecklace(lap.lapLen, lap.pos, animateLast);
  els.lapInfo.textContent = lap.total
    ? "Lap " + Math.min(lap.num, lap.total) + " of " + lap.total
    : "Lap " + lap.num;
  els.countBig.textContent = fmt(data.count);

  // Highlight active target
  document.querySelectorAll("#targets .chip").forEach(function (ch) {
    ch.classList.toggle("active", Number(ch.dataset.value) === data.target);
  });

  // Highlight active track
  document.querySelectorAll("#tracks .chip").forEach(function (ch) {
    ch.classList.toggle("active", ch.dataset.id === currentId);
  });

  els.statToday.textContent = fmt(data.count);
  els.statStreak.textContent = fmt(meta.streak);
  els.statLifetime.textContent = fmt(meta.lifetime);

  // Onboarding hint
  const showHint = !data || data.count === 0;
  els.hint.style.display = showHint ? "inline" : "none";
  els.marginNote.classList.toggle("gone", !showHint);

  els.tapZone.setAttribute(
    "aria-label",
    disp.primary + ", count " + data.count,
  );
}
