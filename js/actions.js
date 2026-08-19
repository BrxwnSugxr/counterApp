// ============ ACTIONS ============
import { els } from "./dom.js";
import { announce, showToast, vibrate } from "./feedback.js";
import { computeLap } from "./necklace.js";
import { render } from "./render.js";
import {
  PRESETS,
  TARGETS,
  allTracks,
  currentId,
  customTracks,
  fmt,
  loadTrack,
  meta,
  refreshAllTracks,
  saveAll,
  setCurrentId,
  today,
  trackCache,
  yesterday,
} from "./state.js";

// ============ COUNTER ACTIONS ============
export function tap() {
  const data = trackCache[currentId];
  const before = computeLap(data.count, data.target);

  data.count += 1;
  meta.lifetime += 1;

  // Streak
  const todayStr = today();
  if (meta.lastActive !== todayStr) {
    meta.streak = meta.lastActive === yesterday() ? meta.streak + 1 : 1;
    meta.lastActive = todayStr;
  }

  const after = computeLap(data.count, data.target);
  render(true);

  if (data.target && data.count % data.target === 0) {
    els.tapZone.classList.add("celebrate");
    showToast(data.target + " completed ✓");
    announce(data.target + " completed");
    vibrate([40, 80, 40, 80, 80]);
    setTimeout(function () {
      els.tapZone.classList.remove("celebrate");
    }, 700);
  } else if (after.num !== before.num) {
    announce(
      "Lap " +
        (after.total ? Math.min(after.num, after.total) : after.num) +
        " started",
    );
  }

  saveAll();
}

export function decrement() {
  const data = trackCache[currentId];
  if (data.count <= 0) return;
  data.count -= 1;
  meta.lifetime = Math.max(0, meta.lifetime - 1);
  render(false);
  saveAll();
}

export function resetCount() {
  trackCache[currentId].count = 0;
  render(false);
  saveAll();
}

export function resetLifetime() {
  meta.lifetime = 0;
  render(false);
  saveAll();
  showToast("Lifetime count reset");
  announce("Lifetime count reset to zero");
}

// ============ BUILD TARGET CHIPS ============
export function buildTargets() {
  els.targets.innerHTML = "";
  const currentTarget = trackCache[currentId]
    ? trackCache[currentId].target
    : 33;
  const presetVals = TARGETS.map(function (t) {
    return t.value;
  });
  const isCustom = presetVals.indexOf(currentTarget) === -1;

  TARGETS.forEach(function (t) {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = t.label;
    chip.dataset.value = t.value;
    chip.addEventListener("click", function () {
      trackCache[currentId].target = t.value;
      saveAll();
      buildTargets();
      render(false);
    });
    els.targets.appendChild(chip);
  });

  const customChip = document.createElement("button");
  customChip.className = "chip" + (isCustom ? " active" : "");
  customChip.textContent = isCustom ? fmt(currentTarget) : "Custom";
  customChip.dataset.custom = "true";
  customChip.addEventListener("click", function () {
    els.inputTarget.value = isCustom ? currentTarget : "";
    els.targetModalSet.disabled = true;
    els.targetModalOverlay.classList.remove("hidden");
    setTimeout(function () {
      els.inputTarget.focus();
    }, 50);
  });
  els.targets.appendChild(customChip);
}

// ============ BUILD TRACK CHIPS ============
export function buildTracks() {
  els.tracks.innerHTML = "";
  allTracks.forEach(function (t) {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.id = t.id;

    const label = document.createElement("span");
    label.textContent = t.isCustom ? t.phrase : t.translit;
    chip.appendChild(label);

    if (t.isCustom) {
      const dot = document.createElement("span");
      dot.className = "dot";
      chip.insertBefore(dot, label);

      const del = document.createElement("span");
      del.className = "del";
      del.textContent = "×";
      del.title = "Remove";
      del.addEventListener("click", function (e) {
        e.stopPropagation();
        const idx = customTracks.indexOf(t);
        if (idx > -1) {
          const removed = customTracks.splice(idx, 1)[0];
          refreshAllTracks();
          saveAll();
          if (currentId === t.id) {
            setCurrentId(PRESETS[0].id);
            loadTrack(currentId);
          }
          buildTracks();
          buildTargets();
          render(false);
          showToast("Zikir removed", "Undo", function () {
            customTracks.push(removed);
            refreshAllTracks();
            saveAll();
            buildTracks();
            render(false);
          });
        }
      });
      chip.appendChild(del);
    }

    chip.addEventListener("click", function () {
      setCurrentId(t.id);
      loadTrack(t.id);
      saveAll();
      buildTargets();
      render(false);
    });
    els.tracks.appendChild(chip);
  });
}

// ============ ADD CUSTOM TRACK ============
export function addCustomTrack() {
  const phrase = els.inputPhrase.value.trim();
  if (!phrase) return;
  const meaning = els.inputMeaning.value.trim();
  const id =
    "custom-" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 6);
  const track = {
    id: id,
    phrase: phrase,
    meaning: meaning,
    isCustom: true,
  };
  customTracks.push(track);
  refreshAllTracks();
  setCurrentId(id);
  loadTrack(id);
  saveAll();
  buildTracks();
  buildTargets();
  render(false);
  els.modalOverlay.classList.add("hidden");
  els.inputPhrase.value = "";
  els.inputMeaning.value = "";
  els.modalAdd.disabled = true;
}

// ============ TARGET MODAL ============
export function setCustomTarget() {
  const v = parseInt(els.inputTarget.value, 10);
  if (!(v > 0)) return;
  trackCache[currentId].target = v;
  saveAll();
  buildTargets();
  render(false);
  els.targetModalOverlay.classList.add("hidden");
}
