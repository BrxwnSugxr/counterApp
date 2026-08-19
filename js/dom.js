// ============ DOM REFS ============
// One place that grabs every element the app touches. Every other module
// imports `els` instead of calling document.getElementById itself.

function $(id) {
  return document.getElementById(id);
}

export const els = {
  primary: $("primaryText"),
  translit: $("translitText"),
  meaning: $("meaningText"),
  lapInfo: $("lapInfo"),
  countBig: $("countBig"),
  hint: $("hint"),
  marginNote: $("marginNote"),
  weatherLine: $("weatherLine"),
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
