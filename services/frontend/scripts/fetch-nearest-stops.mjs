/**
 * Ближайшие остановки ОТ для объектов из places.csv через OpenStreetMap (Overpass).
 * Результат: src/data/nearest-stops.json
 *
 * Запуск: node scripts/fetch-nearest-stops.mjs
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OBJECTS_PATH = join(__dirname, "../src/data/objects.ts");
const CACHE_PATH = join(__dirname, ".cache/osm-stops.json");
const OUT_PATH = join(__dirname, "../src/data/nearest-stops.json");

const OVERPASS_ENDPOINTS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const USER_AGENT =
  "menstroy-tula-map/0.1 (nearest transit stops; local data fetch)";

const NEAR_RADIUS_M = 2500;
const EXTENDED_RADIUS_M = 8000;

const QUERY = `
[out:json][timeout:180];
area["ISO3166-2"="RU-TUL"]->.tula;
(
  node["highway"="bus_stop"](area.tula);
  node["public_transport"="platform"](area.tula);
  node["public_transport"="stop_position"](area.tula);
  node["railway"="tram_stop"](area.tula);
  node["railway"="station"]["station"="subway"](area.tula);
  node["amenity"="bus_station"](area.tula);
  way["highway"="bus_stop"](area.tula);
  way["public_transport"="platform"](area.tula);
  way["amenity"="bus_station"](area.tula);
  relation["public_transport"="stop_area"](area.tula);
);
out center tags;
`.trim();

/** Parse constructionObjects from objects.ts without TS runtime. */
function parseObjectsTs(text) {
  const objects = [];
  const blockRe =
    /\{\s*id:\s*"(\d+)",\s*name:\s*"((?:\\.|[^"\\])*)",[\s\S]*?longitude:\s*(-?[\d.]+|null),\s*latitude:\s*(-?[\d.]+|null),?\s*\}/g;
  let match;
  while ((match = blockRe.exec(text)) !== null) {
    const [, id, nameRaw, lonRaw, latRaw] = match;
    const name = nameRaw.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    objects.push({
      objectNumber: Number(id),
      objectName: name,
      longitude: lonRaw === "null" ? null : Number(lonRaw),
      latitude: latRaw === "null" ? null : Number(latRaw),
    });
  }
  objects.sort((a, b) => a.objectNumber - b.objectNumber);
  return objects;
}

function haversineM(lon1, lat1, lon2, lat2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function stopCoords(el) {
  if (el.type === "node" && el.lat != null && el.lon != null) {
    return { lon: el.lon, lat: el.lat };
  }
  if (el.center?.lat != null && el.center?.lon != null) {
    return { lon: el.center.lon, lat: el.center.lat };
  }
  return null;
}

function stopName(tags = {}) {
  return (
    tags.name?.trim() ||
    tags["name:ru"]?.trim() ||
    tags.ref?.trim() ||
    tags["official_name"]?.trim() ||
    null
  );
}

async function fetchOverpass() {
  if (existsSync(CACHE_PATH)) {
    console.log(`Using cache: ${CACHE_PATH}`);
    return JSON.parse(readFileSync(CACHE_PATH, "utf8")).elements;
  }

  // Migrate old cache location if present
  const legacyCache = join(__dirname, "../src/data/osm-stops-cache.json");
  if (existsSync(legacyCache)) {
    mkdirSync(dirname(CACHE_PATH), { recursive: true });
    const json = JSON.parse(readFileSync(legacyCache, "utf8"));
    writeFileSync(CACHE_PATH, JSON.stringify(json), "utf8");
    console.log(`Moved cache → ${CACHE_PATH}`);
    return json.elements;
  }

  mkdirSync(dirname(CACHE_PATH), { recursive: true });

  let lastError;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      console.log(`Overpass: ${url}`);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body: `data=${encodeURIComponent(QUERY)}`,
      });
      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`,
        );
      }
      const json = await res.json();
      if (!Array.isArray(json.elements)) {
        throw new Error("No elements in response");
      }
      writeFileSync(CACHE_PATH, JSON.stringify(json), "utf8");
      console.log(`Cached stops → ${CACHE_PATH}`);
      return json.elements;
    } catch (err) {
      lastError = err;
      console.warn(`  failed: ${err.message}`);
    }
  }
  throw lastError ?? new Error("All Overpass endpoints failed");
}

function mainStops(elements) {
  const stops = [];
  const seen = new Set();

  for (const el of elements) {
    const coords = stopCoords(el);
    if (!coords) continue;
    const name = stopName(el.tags);
    // Dedup by rounded coords + name
    const key = `${name ?? ""}|${coords.lon.toFixed(5)}|${coords.lat.toFixed(5)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    stops.push({
      name,
      longitude: coords.lon,
      latitude: coords.lat,
      osmType: el.type,
      osmId: el.id,
    });
  }
  return stops;
}

function findNearest(object, stops) {
  let nearestAny = null;
  let nearestNamedNear = null;
  let nearestNamedExtended = null;

  for (const stop of stops) {
    const d = haversineM(
      object.longitude,
      object.latitude,
      stop.longitude,
      stop.latitude,
    );
    if (d > EXTENDED_RADIUS_M) continue;

    if (!nearestAny || d < nearestAny.distanceM) {
      nearestAny = { stop, distanceM: d };
    }
    if (stop.name) {
      if (d <= NEAR_RADIUS_M && (!nearestNamedNear || d < nearestNamedNear.distanceM)) {
        nearestNamedNear = { stop, distanceM: d };
      }
      if (!nearestNamedExtended || d < nearestNamedExtended.distanceM) {
        nearestNamedExtended = { stop, distanceM: d };
      }
    }
  }

  // 1) Named stop within walking vicinity
  // 2) Else absolute nearest (may be unnamed in OSM)
  // 3) Else nearest named farther away
  const pick = nearestNamedNear ?? nearestAny ?? nearestNamedExtended;
  if (!pick) return null;

  return {
    stopName: pick.stop.name,
    distanceM: Math.round(pick.distanceM),
    stopLongitude: pick.stop.longitude,
    stopLatitude: pick.stop.latitude,
    osmType: pick.stop.osmType,
    osmId: pick.stop.osmId,
  };
}

const objects = parseObjectsTs(readFileSync(OBJECTS_PATH, "utf8"));
console.log(`Objects: ${objects.length}`);

const elements = await fetchOverpass();
const stops = mainStops(elements);
const namedCount = stops.filter((s) => s.name).length;
console.log(`Stops: ${stops.length} (named: ${namedCount})`);

const results = objects.map((obj) => {
  if (obj.longitude == null || obj.latitude == null) {
    return {
      objectNumber: obj.objectNumber,
      objectName: obj.objectName,
      stopName: null,
      distanceM: null,
      note: "no_coordinates",
    };
  }

  const nearest = findNearest(obj, stops);
  if (!nearest) {
    return {
      objectNumber: obj.objectNumber,
      objectName: obj.objectName,
      stopName: null,
      distanceM: null,
      note: `no_stop_within_${EXTENDED_RADIUS_M}m`,
    };
  }

  return {
    objectNumber: obj.objectNumber,
    objectName: obj.objectName,
    stopName: nearest.stopName,
    distanceM: nearest.distanceM,
    ...(nearest.stopName ? {} : { note: "nearest_stop_unnamed_in_osm" }),
  };
});

const payload = {
  source: "OpenStreetMap / Overpass",
  license: "ODbL",
  fetchedAt: new Date().toISOString(),
  nearRadiusM: NEAR_RADIUS_M,
  extendedRadiusM: EXTENDED_RADIUS_M,
  objectsTotal: objects.length,
  withNamedStop: results.filter((r) => r.stopName != null).length,
  withUnnamedStop: results.filter(
    (r) => r.stopName == null && r.distanceM != null,
  ).length,
  withoutStop: results.filter((r) => r.distanceM == null).length,
  items: results.map(({ objectNumber, stopName, distanceM }) => ({
    objectNumber,
    stopName,
    distanceM,
  })),
};

writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), "utf8");
console.log(`Wrote ${OUT_PATH}`);
console.log(
  `Named: ${payload.withNamedStop}, unnamed: ${payload.withUnnamedStop}, none: ${payload.withoutStop}`,
);

for (const row of payload.items.slice(0, 10)) {
  console.log(
    `#${row.objectNumber}: ${row.stopName ?? "—"} (${row.distanceM ?? "—"} м)`,
  );
}
