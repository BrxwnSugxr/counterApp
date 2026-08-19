// ============ SIMPLE COOKIE HELPERS ============
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie =
    name +
    "=" +
    encodeURIComponent(JSON.stringify(value)) +
    expires +
    "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(
          decodeURIComponent(c.substring(nameEQ.length, c.length)),
        );
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

// ============ APP STATE ============
var PRESETS = [
  {
    id: "subhanallah",
    arabic: "سبحان الله",
    translit: "SubhanAllah",
    meaning: "Glory be to Allah",
  },
  {
    id: "alhamdulillah",
    arabic: "الحمد لله",
    translit: "Alhamdulillah",
    meaning: "All praise is for Allah",
  },
  {
    id: "allahuakbar",
    arabic: "الله أكبر",
    translit: "Allahu Akbar",
    meaning: "Allah is greatest",
  },
  {
    id: "lailaha",
    arabic: "لا إله إلا الله",
    translit: "La ilaha illallah",
    meaning: "There is no god but Allah",
  },
  {
    id: "astaghfirullah",
    arabic: "أستغفر الله",
    translit: "Astaghfirullah",
    meaning: "I seek Allah's forgiveness",
  },
];

var TARGETS = [
  { label: "33", value: 33 },
  { label: "99", value: 99 },
  { label: "100", value: 100 },
  { label: "∞", value: 0 },
];

// Current state
var meta = getCookie("meta") || {
  lifetime: 0,
  streak: 0,
  lastActive: null,
};
var customTracks = getCookie("customTracks") || [];
var allTracks = PRESETS.concat(customTracks);
var trackCache = {};
var currentId = getCookie("lastTrackId") || PRESETS[0].id;

// DOM refs
var $ = function (id) {
  return document.getElementById(id);
};
var els = {
  primary: $("primaryText"),
  translit: $("translitText"),
  meaning: $("meaningText"),
  lapInfo: $("lapInfo"),
  countBig: $("countBig"),
  hint: $("hint"),
  marginNote: $("marginNote"),
  tapZone: $("tapZone"),
  necklace: $("necklace"),
  targets: $("targets"),
  tracks: $("tracks"),
  addTrackBtn: $("addTrackBtn"),
  statToday: $("statToday"),
  statStreak: $("statStreak"),
  statLifetime: $("statLifetime"),
  minusBtn: $("minusBtn"),
  resetBtn: $("resetBtn"),
  toast: $("toast"),
  liveRegion: $("liveRegion"),
  modalOverlay: $("modalOverlay"),
  inputPhrase: $("inputPhrase"),
  inputMeaning: $("inputMeaning"),
  modalAdd: $("modalAdd"),
  modalCancel: $("modalCancel"),
  targetModalOverlay: $("targetModalOverlay"),
  inputTarget: $("inputTarget"),
  targetModalSet: $("targetModalSet"),
  targetModalCancel: $("targetModalCancel"),
};

// ============ HELPERS ============
function today() {
  return new Date().toISOString().slice(0, 10);
}

function yesterday() {
  var d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function fmt(n) {
  return n.toLocaleString("en-US");
}

function isArabic(t) {
  return /[\u0600-\u06FF]/.test(t);
}

function saveAll() {
  setCookie("meta", meta, 365);
  setCookie("customTracks", customTracks, 365);
  setCookie("lastTrackId", currentId, 365);
  if (trackCache[currentId]) {
    setCookie("track:" + currentId, trackCache[currentId], 365);
  }
}

function getTrack(id) {
  return allTracks.find(function (t) {
    return t.id === id;
  });
}

function loadTrack(id) {
  if (trackCache[id]) return trackCache[id];
  var data = getCookie("track:" + id);
  if (!data) data = { date: today(), count: 0, target: 33 };
  if (data.date !== today()) {
    data.date = today();
    data.count = 0;
  }
  trackCache[id] = data;
  return data;
}

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

// ============ NECKLACE DRAWING ============
function polar(cx, cy, r, deg) {
  var rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function drawNecklace(lapLen, lit, animate) {
  var svg = els.necklace;
  svg.innerHTML = "";
  var cx = 160,
    cy = 130,
    r = 108;
  var ns = "http://www.w3.org/2000/svg";

  // Tassel
  var imamPos = polar(cx, cy, r, 180);
  var tassel = document.createElementNS(ns, "line");
  tassel.setAttribute("x1", imamPos.x);
  tassel.setAttribute("y1", imamPos.y + 10);
  tassel.setAttribute("x2", imamPos.x);
  tassel.setAttribute("y2", imamPos.y + 34);
  tassel.setAttribute("class", "tassel");
  svg.appendChild(tassel);

  // Beads
  var startA = -160,
    endA = 160;
  for (var i = 0; i < lapLen; i++) {
    var theta =
      lapLen === 1 ? 0 : startA + i * ((endA - startA) / (lapLen - 1));
    var seed = Math.sin(i * 12.9898 + lapLen * 78.233) * 43758.5453;
    var jitter = seed - Math.floor(seed);
    var rJit = r + (jitter - 0.5) * 7;
    var sizeJit = 9 + (jitter - 0.5) * 2.2;
    var p = polar(cx, cy, rJit, theta);
    var bead = document.createElementNS(ns, "circle");
    bead.setAttribute("cx", p.x);
    bead.setAttribute("cy", p.y);
    bead.setAttribute("r", sizeJit);
    var isLit = i < lit;
    bead.setAttribute(
      "class",
      "bead " +
        (isLit ? "lit" : "idle") +
        (animate && i === lit - 1 ? " pop" : ""),
    );
    svg.appendChild(bead);
  }

  // Imam bead
  var imam = document.createElementNS(ns, "circle");
  imam.setAttribute("cx", imamPos.x);
  imam.setAttribute("cy", imamPos.y);
  imam.setAttribute("r", 12);
  imam.setAttribute("class", "imam-bead");
  svg.appendChild(imam);
}

function computeLap(count, target) {
  if (!target) {
    return {
      lapLen: 33,
      pos: count % 33,
      num: Math.floor(count / 33) + 1,
    };
  }
  var inCycle = count % target;
  var lapIdx = Math.floor(inCycle / 33);
  var lapLen = Math.min(33, target - lapIdx * 33);
  var pos = inCycle - lapIdx * 33;
  var total = Math.ceil(target / 33);
  return { lapLen: lapLen, pos: pos, num: lapIdx + 1, total: total };
}

// ============ RENDER ============
function render(animateLast) {
  var track = getTrack(currentId);
  var data = trackCache[currentId];
  var disp = getDisplay(track);

  els.primary.textContent = disp.primary;
  els.primary.className = disp.primaryClass;
  els.translit.textContent = disp.secondary || "";
  els.translit.style.display = disp.secondary ? "block" : "none";
  els.meaning.textContent = disp.meaning;

  var lap = computeLap(data.count, data.target);
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
  var showHint = !data || data.count === 0;
  els.hint.style.display = showHint ? "inline" : "none";
  els.marginNote.classList.toggle("gone", !showHint);

  els.tapZone.setAttribute(
    "aria-label",
    disp.primary + ", count " + data.count,
  );
}

// ============ TOAST & ANNOUNCE ============
function showToast(text, actionLabel, actionFn) {
  els.toast.innerHTML = "";
  els.toast.appendChild(document.createTextNode(text));
  if (actionLabel) {
    var a = document.createElement("span");
    a.className = "toast-action";
    a.textContent = actionLabel;
    a.addEventListener("click", function (e) {
      e.stopPropagation();
      if (actionFn) actionFn();
      els.toast.classList.remove("show");
    });
    els.toast.appendChild(a);
  }
  els.toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(
    function () {
      els.toast.classList.remove("show");
    },
    actionLabel ? 4000 : 1300,
  );
}

function announce(text) {
  els.liveRegion.textContent = text;
}

function vibrate(p) {
  if (navigator.vibrate)
    try {
      navigator.vibrate(p);
    } catch (e) {}
}

// ============ ACTIONS ============
function tap() {
  var data = trackCache[currentId];
  var before = computeLap(data.count, data.target);

  data.count += 1;
  meta.lifetime += 1;

  // Streak
  var todayStr = today();
  if (meta.lastActive !== todayStr) {
    meta.streak = meta.lastActive === yesterday() ? meta.streak + 1 : 1;
    meta.lastActive = todayStr;
  }

  var after = computeLap(data.count, data.target);
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

function decrement() {
  var data = trackCache[currentId];
  if (data.count <= 0) return;
  data.count -= 1;
  meta.lifetime = Math.max(0, meta.lifetime - 1);
  render(false);
  saveAll();
}

function resetCount() {
  trackCache[currentId].count = 0;
  render(false);
  saveAll();
}

// ============ BUILD TARGET CHIPS ============
function buildTargets() {
  els.targets.innerHTML = "";
  var currentTarget = trackCache[currentId] ? trackCache[currentId].target : 33;
  var presetVals = TARGETS.map(function (t) {
    return t.value;
  });
  var isCustom = presetVals.indexOf(currentTarget) === -1;

  TARGETS.forEach(function (t) {
    var chip = document.createElement("button");
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

  var customChip = document.createElement("button");
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
function buildTracks() {
  els.tracks.innerHTML = "";
  allTracks.forEach(function (t) {
    var chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.id = t.id;

    var label = document.createElement("span");
    label.textContent = t.isCustom ? t.phrase : t.translit;
    chip.appendChild(label);

    if (t.isCustom) {
      var dot = document.createElement("span");
      dot.className = "dot";
      chip.insertBefore(dot, label);

      var del = document.createElement("span");
      del.className = "del";
      del.textContent = "×";
      del.title = "Remove";
      del.addEventListener("click", function (e) {
        e.stopPropagation();
        var idx = customTracks.indexOf(t);
        if (idx > -1) {
          var removed = customTracks.splice(idx, 1)[0];
          allTracks = PRESETS.concat(customTracks);
          saveAll();
          if (currentId === t.id) {
            currentId = PRESETS[0].id;
            loadTrack(currentId);
          }
          buildTracks();
          buildTargets();
          render(false);
          showToast("Zikir removed", "Undo", function () {
            customTracks.push(removed);
            allTracks = PRESETS.concat(customTracks);
            saveAll();
            buildTracks();
            render(false);
          });
        }
      });
      chip.appendChild(del);
    }

    chip.addEventListener("click", function () {
      currentId = t.id;
      loadTrack(t.id);
      saveAll();
      buildTargets();
      render(false);
    });
    els.tracks.appendChild(chip);
  });
}

// ============ ADD CUSTOM TRACK ============
function addCustomTrack() {
  var phrase = els.inputPhrase.value.trim();
  if (!phrase) return;
  var meaning = els.inputMeaning.value.trim();
  var id =
    "custom-" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 6);
  var track = {
    id: id,
    phrase: phrase,
    meaning: meaning,
    isCustom: true,
  };
  customTracks.push(track);
  allTracks = PRESETS.concat(customTracks);
  currentId = id;
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
function setCustomTarget() {
  var v = parseInt(els.inputTarget.value, 10);
  if (!(v > 0)) return;
  trackCache[currentId].target = v;
  saveAll();
  buildTargets();
  render(false);
  els.targetModalOverlay.classList.add("hidden");
}

// ============ INIT ============
function init() {
  // Ensure current track is loaded
  if (!getTrack(currentId)) {
    currentId = PRESETS[0].id;
  }
  loadTrack(currentId);
  buildTargets();
  buildTracks();
  render(false);

  // Event listeners
  els.tapZone.addEventListener("click", tap);
  els.tapZone.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tap();
    }
  });

  els.minusBtn.addEventListener("click", decrement);

  var resetPending = false,
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
    var v = parseInt(els.inputTarget.value, 10);
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
