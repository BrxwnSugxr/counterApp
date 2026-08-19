// ============ LOCAL STORAGE HELPERS ============
// Swapped out from cookies: localStorage has a much bigger quota (~5MB vs
// ~4KB), never gets sent over the network, and doesn't need an expiry date.

const PREFIX = "dhikr:";

export function setItem(name, value) {
  try {
    window.localStorage.setItem(PREFIX + name, JSON.stringify(value));
    return true;
  } catch (e) {
    // Storage full or unavailable (e.g. private browsing in some browsers)
    console.warn("dhikr: could not save '" + name + "'", e);
    return false;
  }
}

export function getItem(name) {
  try {
    const raw = window.localStorage.getItem(PREFIX + name);
    return raw === null ? null : JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// ============ ONE-TIME COOKIE → LOCALSTORAGE MIGRATION ============
// If this browser still has the old cookie-based data (from before this
// file was split up) and nothing has been saved to localStorage yet, pull
// it across once so nobody's existing counts get reset.
export function migrateFromCookiesOnce() {
  if (getItem("__migrated")) return;

  function getCookie(name) {
    const nameEQ = name + "=";
    const parts = document.cookie.split(";");
    for (let i = 0; i < parts.length; i++) {
      let c = parts[i];
      while (c.charAt(0) === " ") c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(decodeURIComponent(c.substring(nameEQ.length)));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  const keysToCheck = ["meta", "customTracks", "lastTrackId"];
  let migratedAnything = false;

  keysToCheck.forEach(function (key) {
    const cookieVal = getCookie(key);
    if (cookieVal !== null && getItem(key) === null) {
      setItem(key, cookieVal);
      migratedAnything = true;
    }
  });

  // Migrate any per-track cookies too (track:subhanallah, track:custom-xxx, ...)
  document.cookie.split(";").forEach(function (pair) {
    const eq = pair.indexOf("=");
    if (eq === -1) return;
    let name = pair.slice(0, eq).trim();
    if (name.indexOf("track:") === 0 && getItem(name) === null) {
      const val = getCookie(name);
      if (val !== null) {
        setItem(name, val);
        migratedAnything = true;
      }
    }
  });

  setItem("__migrated", true);
  if (migratedAnything) {
    console.info("dhikr: migrated saved data from cookies to localStorage");
  }
}
