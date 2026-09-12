/**
 * Выгрузка POI Тульской области из OpenStreetMap (Overpass API).
 * Результат: src/data/osm-pois.json (ODbL / © OpenStreetMap contributors).
 *
 * Запуск: npm run fetch:pois
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../src/data/osm-pois.json");

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const USER_AGENT = "menstroy-tula-map/0.1 (coverage heatmap; local data fetch)";

const QUERY = `
[out:json][timeout:180];
area["ISO3166-2"="RU-TUL"]->.tula;
(
  nwr["amenity"~"^(school|kindergarten|college|university|hospital|clinic|doctors|community_centre|library|social_facility|townhall)$"](area.tula);
  nwr["healthcare"~"^(clinic|hospital|doctor|centre)$"](area.tula);
  nwr["leisure"~"^(sports_centre|stadium|swimming_pool|fitness_centre|ice_rink|track|park|playground|garden)$"](area.tula);
);
out center tags;
`.trim();

const EDUCATION = new Set(["school", "kindergarten", "college", "university"]);
const HEALTHCARE_AMENITY = new Set(["hospital", "clinic", "doctors"]);
const HEALTHCARE_TAG = new Set(["clinic", "hospital", "doctor", "centre"]);
const SPORT = new Set([
  "sports_centre",
  "stadium",
  "swimming_pool",
  "fitness_centre",
  "ice_rink",
  "track",
]);
const PARKS = new Set(["park", "playground", "garden"]);
const INFRASTRUCTURE = new Set([
  "community_centre",
  "library",
  "social_facility",
  "townhall",
]);

const mapCategory = (tags) => {
  const amenity = tags.amenity ?? "";
  const healthcare = tags.healthcare ?? "";
  const leisure = tags.leisure ?? "";

  if (EDUCATION.has(amenity)) {
    return "education";
  }

  if (HEALTHCARE_AMENITY.has(amenity) || HEALTHCARE_TAG.has(healthcare)) {
    return "healthcare";
  }

  if (SPORT.has(leisure)) {
    return "sport";
  }

  if (PARKS.has(leisure)) {
    return "utilitiesAndParks";
  }

  if (INFRASTRUCTURE.has(amenity)) {
    return "infrastructure";
  }

  return null;
};

const getCoordinates = (element) => {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return { latitude: element.lat, longitude: element.lon };
  }

  if (
    element.center &&
    typeof element.center.lat === "number" &&
    typeof element.center.lon === "number"
  ) {
    return { latitude: element.center.lat, longitude: element.center.lon };
  }

  return null;
};

const fetchOverpass = async (endpoint) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    body: `data=${encodeURIComponent(QUERY)}`,
  });

  if (!response.ok) {
    throw new Error(`${endpoint} → HTTP ${response.status}`);
  }

  return response.json();
};

const main = async () => {
  let data = null;
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log(`Запрос Overpass: ${endpoint}`);
      data = await fetchOverpass(endpoint);
      console.log(`Ответ получен, элементов: ${data.elements?.length ?? 0}`);
      break;
    } catch (error) {
      lastError = error;
      console.warn(
        `Не удалось: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  if (!data?.elements) {
    throw lastError ?? new Error("Overpass не вернул данные");
  }

  const seen = new Set();
  const pois = [];

  for (const element of data.elements) {
    const tags = element.tags ?? {};
    const category = mapCategory(tags);

    if (!category) {
      continue;
    }

    const coords = getCoordinates(element);

    if (!coords) {
      continue;
    }

    const id = `${element.type}/${element.id}`;

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);
    pois.push({
      id,
      name: tags.name ?? tags["name:ru"] ?? null,
      category,
      longitude: Number(coords.longitude.toFixed(6)),
      latitude: Number(coords.latitude.toFixed(6)),
    });
  }

  pois.sort((a, b) => a.id.localeCompare(b.id));

  const counts = pois.reduce((acc, poi) => {
    acc[poi.category] = (acc[poi.category] ?? 0) + 1;
    return acc;
  }, {});

  const payload = {
    attribution:
      "© OpenStreetMap contributors (ODbL). Contour: relation 81993 / ISO3166-2 RU-TUL.",
    fetchedAt: new Date().toISOString(),
    source: "Overpass API",
    count: pois.length,
    counts,
    pois,
  };

  writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Записано ${pois.length} POI → ${OUT_PATH}`);
  console.log(counts);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
