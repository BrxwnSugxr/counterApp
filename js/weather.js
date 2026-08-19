// ============ WEATHER / LOCATION LINE ============
// Auto-runs on page load. Uses the browser's Geolocation API plus two free,
// key-free HTTP APIs (BigDataCloud for reverse geocoding, Open-Meteo for
// weather), and caches the result via storage.js so we don't re-fetch or
// re-prompt on every reload within the cache window.
import { els } from "./dom.js";
import { getItem, setItem } from "./storage.js";

const CACHE_KEY = "weatherCache";
const CACHE_MS = 15 * 60 * 1000; // 15 minutes

// WMO weather codes (used by Open-Meteo) → short human label
const WEATHER_LABELS = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

function weatherLabel(code) {
  return WEATHER_LABELS[code] || "—";
}

function getPosition(options) {
  return new Promise(function (resolve, reject) {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function reverseGeocode(lat, lon) {
  const url =
    "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" +
    lat +
    "&longitude=" +
    lon +
    "&localityLanguage=en";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Reverse geocode failed: " + res.status);
  const data = await res.json();
  return (
    data.city ||
    data.locality ||
    data.principalSubdivision ||
    data.countryName ||
    null
  );
}

async function fetchWeather(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=" +
    lat +
    "&longitude=" +
    lon +
    "&current_weather=true&temperature_unit=celsius";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed: " + res.status);
  const data = await res.json();
  return data.current_weather;
}

async function resolveWeather() {
  const cached = getItem(CACHE_KEY);
  if (cached && Date.now() - cached.savedAt < CACHE_MS) {
    return cached.value;
  }

  const position = await getPosition({
    enableHighAccuracy: false,
    timeout: 8000,
    maximumAge: 10 * 60 * 1000,
  });
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const [city, weather] = await Promise.all([
    reverseGeocode(lat, lon),
    fetchWeather(lat, lon),
  ]);

  if (!weather) throw new Error("No weather data returned");

  const result = {
    city: city || "your location",
    temperature: Math.round(weather.temperature),
    condition: weatherLabel(weather.weathercode),
  };

  setItem(CACHE_KEY, { savedAt: Date.now(), value: result });
  return result;
}

function renderWeatherLine(result) {
  els.weatherLine.textContent =
    result.city + " · " + result.temperature + "°C, " + result.condition;
  els.weatherLine.classList.add("visible");
}

// Kicks off automatically on page load. Never throws — if location is
// denied, unsupported, or either API call fails, the line just stays
// empty/hidden rather than showing an error.
export async function initWeather() {
  try {
    const result = await resolveWeather();
    renderWeatherLine(result);
  } catch (e) {
    console.info("dhikr: weather/location unavailable —", e.message || e);
  }
}
