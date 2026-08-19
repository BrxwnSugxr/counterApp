// ============ ENTRY POINT ============
import {
  addCustomTrack,
  buildTargets,
  buildTracks,
  decrement,
  resetCount,
  setCustomTarget,
  tap,
} from "./actions.js";
import { els } from "./dom.js";
import { render } from "./render.js";
import {
  PRESETS,
  currentId,
  getTrack,
  loadTrack,
  saveAll,
  setCurrentId,
} from "./state.js";
import { migrateFromCookiesOnce } from "./storage.js";
import { initWeather } from "./weather.js";

function init() {
  migrateFromCookiesOnce();

  // Ensure current track is loaded
  if (!getTrack(currentId)) {
    setCurrentId(PRESETS[0].id);
  }
  loadTrack(currentId);
  buildTargets();
  buildTracks();
  render(false);

  // Fire-and-forget: never blocks the counter UI, fails silently if
  // location is denied or unavailable.
  initWeather();

  // Event listeners
  els.tapZone.addEventListener("click", tap);
  els.tapZone.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tap();
    }
  });

  els.minusBtn.addEventListener("click", decrement);

  let resetPending = false,
    resetTimer = null;
  els.resetBtn.addEventListener("click", function () {
    if (!resetPending) {
      resetPending = true;
      els.resetBtn.classList.add("pending");
      els.resetBtn.title = "Tap again to confirm reset";
      resetTimer = setTimeout(function () {
        resetPending = false;
        els.resetBtn.classList.remove("pending");
        els.resetBtn.title = "Reset today's count";
      }, 3000);
    } else {
      clearTimeout(resetTimer);
      resetPending = false;
      els.resetBtn.classList.remove("pending");
      els.resetBtn.title = "Reset today's count";
      resetCount();
    }
  });

  // Add track modal
  els.addTrackBtn.addEventListener("click", function () {
    els.inputPhrase.value = "";
    els.inputMeaning.value = "";
    els.modalAdd.disabled = true;
    els.modalOverlay.classList.remove("hidden");
    setTimeout(function () {
      els.inputPhrase.focus();
    }, 50);
  });

  els.modalCancel.addEventListener("click", function () {
    els.modalOverlay.classList.add("hidden");
  });

  els.modalOverlay.addEventListener("click", function (e) {
    if (e.target === els.modalOverlay) els.modalOverlay.classList.add("hidden");
  });

  els.inputPhrase.addEventListener("input", function () {
    els.modalAdd.disabled = els.inputPhrase.value.trim().length === 0;
  });

  els.modalAdd.addEventListener("click", addCustomTrack);

  els.inputPhrase.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !els.modalAdd.disabled) addCustomTrack();
  });
  els.inputMeaning.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !els.modalAdd.disabled) addCustomTrack();
  });

  // Target modal
  els.targetModalCancel.addEventListener("click", function () {
    els.targetModalOverlay.classList.add("hidden");
  });
  els.targetModalOverlay.addEventListener("click", function (e) {
    if (e.target === els.targetModalOverlay)
      els.targetModalOverlay.classList.add("hidden");
  });
  els.inputTarget.addEventListener("input", function () {
    const v = parseInt(els.inputTarget.value, 10);
    els.targetModalSet.disabled = !(v > 0);
  });
  els.targetModalSet.addEventListener("click", setCustomTarget);
  els.inputTarget.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !els.targetModalSet.disabled) setCustomTarget();
  });

  // Auto-save on visibility change
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") saveAll();
  });
}

init();
