// ============ APP STATE ============
import { getItem, setItem } from "./storage.js";

export const PRESETS = [
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

export const TARGETS = [
  { label: "33", value: 33 },
  { label: "99", value: 99 },
  { label: "100", value: 100 },
  { label: "∞", value: 0 },
];

// Persisted / mutable state. `meta`, `customTracks`, and `trackCache` are
// mutated in place (push/splice/property assignment) so plain live-binding
// exports work fine. `currentId` and `allTracks` get fully reassigned, so
// they're changed only through the setter functions below — importers get
// a live read-only view automatically.
export let meta = getItem("meta") || {
  lifetime: 0,
  streak: 0,
  lastActive: null,
};
export let customTracks = getItem("customTracks") || [];
export let allTracks = PRESETS.concat(customTracks);
export const trackCache = {};
export let currentId = getItem("lastTrackId") || PRESETS[0].id;

export function setCurrentId(id) {
  currentId = id;
}

export function refreshAllTracks() {
  allTracks = PRESETS.concat(customTracks);
}

// ============ DATE / FORMAT HELPERS ============
export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function fmt(n) {
  return n.toLocaleString("en-US");
}

export function isArabic(t) {
  return /[\u0600-\u06FF]/.test(t);
}

// ============ PERSISTENCE ============
export function saveAll() {
  setItem("meta", meta);
  setItem("customTracks", customTracks);
  setItem("lastTrackId", currentId);
  if (trackCache[currentId]) {
    setItem("track:" + currentId, trackCache[currentId]);
  }
}

export function getTrack(id) {
  return allTracks.find(function (t) {
    return t.id === id;
  });
}

export function loadTrack(id) {
  if (trackCache[id]) return trackCache[id];
  let data = getItem("track:" + id);
  if (!data) data = { date: today(), count: 0, target: 33 };
  if (data.date !== today()) {
    data.date = today();
    data.count = 0;
  }
  trackCache[id] = data;
  return data;
}
