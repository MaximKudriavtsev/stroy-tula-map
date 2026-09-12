/**
 * Выгрузка сетки населения Тульской области из Kontur Population (H3 res 8, ~400 м).
 * Результат: src/data/population-grid.json (ODbL / © OpenStreetMap contributors, GHSL, Kontur).
 *
 * Запуск: npm run fetch:population
 *
 * GDAL не нужен: GeoPackage — это SQLite, а envelope гекса лежит в заголовке GP,
 * поэтому центроид достаётся без парсинга WKB.
 */

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../src/data/population-grid.json");
const BOUNDARY_PATH = join(__dirname, "../src/data/tula-oblast-boundary.ts");
const POIS_PATH = join(__dirname, "../src/data/osm-pois.json");
const NORMS_PATH = join(__dirname, "../src/data/provision-norms.ts");

const SOURCE_URL =
  "https://geodata-eu-central-1-kontur-public.s3.eu-central-1.amazonaws.com/kontur_datasets/kontur_population_RU_20231101.gpkg.gz";

const ATTRIBUTION =
  "Kontur Population: Global Population Density for 400m H3 Hexagons (ODbL). " +
  "© OpenStreetMap contributors, GHSL, Microsoft/Facebook Buildings. " +
  "Обрезано по контуру Тульской области (OSM relation 81993).";

/** Запас к bbox области, чтобы не потерять гексы на границе. */
const BBOX_PADDING_DEG = 0.1;

/** Гексы с населением ниже порога отбрасываем: на карте они не влияют, а вес файла режут. */
const MIN_HEX_POPULATION = 0.5;

const EARTH_RADIUS_M = 6378137;
const MERCATOR_HALF_WORLD_M = 20037508.34;

const toMercator = (longitude, latitude) => ({
  x: (longitude * MERCATOR_HALF_WORLD_M) / 180,
  y: Math.log(Math.tan(((90 + latitude) * Math.PI) / 360)) * EARTH_RADIUS_M,
});

const toLngLat = (x, y) => ({
  longitude: (x / MERCATOR_HALF_WORLD_M) * 180,
  latitude:
    (Math.atan(Math.exp(y / EARTH_RADIUS_M)) * 2 - Math.PI / 2) * (180 / Math.PI),
});

/** Контур хранится в .ts как литерал [[[широта, долгота], ...]] — читаем его без сборки TypeScript. */
const readBoundaryRings = () => {
  const source = readFileSync(BOUNDARY_PATH, "utf8");
  const start = source.indexOf("= [");
  const end = source.lastIndexOf("];");

  if (start === -1 || end === -1) {
    throw new Error(`Не удалось найти литерал контура в ${BOUNDARY_PATH}`);
  }

  const rings = JSON.parse(source.slice(start + 2, end + 1));

  return rings.map((ring) =>
    ring.map(([latitude, longitude]) => [longitude, latitude]),
  );
};

const getRingsBounds = (rings) => {
  let minLongitude = Infinity;
  let minLatitude = Infinity;
  let maxLongitude = -Infinity;
  let maxLatitude = -Infinity;

  for (const ring of rings) {
    for (const [longitude, latitude] of ring) {
      minLongitude = Math.min(minLongitude, longitude);
      maxLongitude = Math.max(maxLongitude, longitude);
      minLatitude = Math.min(minLatitude, latitude);
      maxLatitude = Math.max(maxLatitude, latitude);
    }
  }

  return { minLongitude, minLatitude, maxLongitude, maxLatitude };
};

const isInsideRing = (longitude, latitude, ring) => {
  let isInside = false;

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const [xi, yi] = ring[index];
    const [xj, yj] = ring[previous];
    const crossesLatitude = yi > latitude !== yj > latitude;

    if (crossesLatitude && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi) {
      isInside = !isInside;
    }
  }

  return isInside;
};

const isInsideRings = (longitude, latitude, rings) =>
  rings.some((ring) => isInsideRing(longitude, latitude, ring));

/**
 * Заголовок GeoPackageBinary: "GP", версия, флаги, srs_id (8 байт),
 * далее envelope как 4 double при флаге envelope != 0.
 */
const readGeometryEnvelope = (blob) => {
  if (blob.length < 40 || blob[0] !== 0x47 || blob[1] !== 0x50) {
    return null;
  }

  const flags = blob[3];
  const envelopeKind = (flags >> 1) & 0x07;

  if (envelopeKind === 0) {
    return null;
  }

  const isLittleEndian = (flags & 0x01) === 1;
  const view = new DataView(blob.buffer, blob.byteOffset, blob.byteLength);

  return {
    minX: view.getFloat64(8, isLittleEndian),
    maxX: view.getFloat64(16, isLittleEndian),
    minY: view.getFloat64(24, isLittleEndian),
    maxY: view.getFloat64(32, isLittleEndian),
  };
};

const downloadGeoPackage = async () => {
  console.log(`Скачивание Kontur Population: ${SOURCE_URL}`);
  const response = await fetch(SOURCE_URL, {
    headers: { "User-Agent": "menstroy-tula-map/0.1 (provision heatmap; local data fetch)" },
  });

  if (!response.ok) {
    throw new Error(`${SOURCE_URL} → HTTP ${response.status}`);
  }

  const packed = Buffer.from(await response.arrayBuffer());
  console.log(`Получено ${(packed.length / 1024 / 1024).toFixed(1)} МБ, распаковка...`);

  const directory = mkdtempSync(join(tmpdir(), "kontur-population-"));
  const filePath = join(directory, "kontur_population_RU.gpkg");
  writeFileSync(filePath, gunzipSync(packed));

  return { directory, filePath };
};

const extractHexes = (filePath, rings) => {
  const bounds = getRingsBounds(rings);
  const southWest = toMercator(
    bounds.minLongitude - BBOX_PADDING_DEG,
    bounds.minLatitude - BBOX_PADDING_DEG,
  );
  const northEast = toMercator(
    bounds.maxLongitude + BBOX_PADDING_DEG,
    bounds.maxLatitude + BBOX_PADDING_DEG,
  );

  const database = new DatabaseSync(filePath, { readOnly: true });
  const layer = database
    .prepare("SELECT table_name FROM gpkg_contents WHERE data_type = 'features' LIMIT 1")
    .get();

  if (!layer) {
    throw new Error("В GeoPackage нет слоёв с геометрией");
  }

  const rows = database.prepare(`SELECT geom, population FROM "${layer.table_name}"`).iterate();
  const hexes = [];
  let total = 0;
  let scanned = 0;

  for (const row of rows) {
    scanned += 1;
    const envelope = readGeometryEnvelope(row.geom);

    if (!envelope || row.population === null) {
      continue;
    }

    const centerX = (envelope.minX + envelope.maxX) / 2;
    const centerY = (envelope.minY + envelope.maxY) / 2;

    if (
      centerX < southWest.x ||
      centerX > northEast.x ||
      centerY < southWest.y ||
      centerY > northEast.y
    ) {
      continue;
    }

    const population = Number(row.population);

    if (!Number.isFinite(population) || population < MIN_HEX_POPULATION) {
      continue;
    }

    const { longitude, latitude } = toLngLat(centerX, centerY);

    if (!isInsideRings(longitude, latitude, rings)) {
      continue;
    }

    hexes.push([Number(longitude.toFixed(4)), Number(latitude.toFixed(4)), Math.round(population)]);
    total += population;
  }

  database.close();
  console.log(`Просмотрено гексов по РФ: ${scanned}`);

  return { hexes, total: Math.round(total) };
};

/** Калибровка: сколько человек области приходится на один POI против нормативного значения. */
const reportCalibration = (total) => {
  const pois = JSON.parse(readFileSync(POIS_PATH, "utf8"));
  const norms = readFileSync(NORMS_PATH, "utf8");
  const peoplePerUnitByCategory = new Map();
  // Ключи записаны как [ObjectCategory.Education], а значения перечисления — camelCase.
  const pattern = /ObjectCategory\.(\w+)\]:\s*\{[\s\S]*?peoplePerUnit:\s*(\d+)/g;

  for (const [, member, peoplePerUnit] of norms.matchAll(pattern)) {
    const category = member[0].toLowerCase() + member.slice(1);
    peoplePerUnitByCategory.set(category, Number(peoplePerUnit));
  }

  console.log(`\nКалибровка обеспеченности по области (население ${total}):`);

  for (const [category, count] of Object.entries(pois.counts ?? {})) {
    const peoplePerUnit = peoplePerUnitByCategory.get(category);
    const peoplePerPoi = total / count;
    const ratio = peoplePerUnit ? peoplePerUnit / peoplePerPoi : null;

    console.log(
      `  ${category.padEnd(18)} POI: ${String(count).padStart(4)}` +
        `  чел./объект: ${Math.round(peoplePerPoi).toString().padStart(5)}` +
        `  норма: ${peoplePerUnit ? String(peoplePerUnit).padStart(5) : "    —"}` +
        `  обеспеченность: ${ratio ? ratio.toFixed(2) : "—"}`,
    );
  }
};

const main = async () => {
  const rings = readBoundaryRings();
  console.log(`Контур области: ${rings.length} кольцо(а), ${rings[0].length} точек`);

  const { directory, filePath } = await downloadGeoPackage();

  try {
    const { hexes, total } = extractHexes(filePath, rings);

    hexes.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    const payload = {
      attribution: ATTRIBUTION,
      fetchedAt: new Date().toISOString(),
      source: "Kontur Population RU 2023-11-01, H3 res 8",
      resolution: 8,
      count: hexes.length,
      total,
      hexes,
    };

    writeFileSync(OUT_PATH, `${JSON.stringify(payload)}\n`, "utf8");
    console.log(`Записано ${hexes.length} гексов, население ${total} → ${OUT_PATH}`);

    reportCalibration(total);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
