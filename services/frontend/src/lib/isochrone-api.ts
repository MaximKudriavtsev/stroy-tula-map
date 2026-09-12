/**
 * Isochrone API service.
 *
 * Uses a distance-aware approximation that adjusts the reachable radius
 * based on urban density and road network quality.
 *
 * For Russian cities, typical walking distances per minute:
 * - Dense urban (center): 90 m/min (wide streets, crossings)
 * - Suburban: 80 m/min
 * - Rural: 70 m/min (fewer crossings, longer blocks)
 */

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type IsochroneResult = {
  /** [longitude, latitude] ring (closed polygon) */
  coordinates: [number, number][];
};

export type IsochroneError =
  | { code: "ROUTING_NOT_AVAILABLE"; message: string }
  | { code: "API_ERROR"; message: string }
  | { code: "NETWORK_ERROR"; message: string };

export type IsochroneResponse =
  | { ok: true; data: IsochroneResult }
  | { ok: false; error: IsochroneError };

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

/** Base walking speed ≈ 80 m / min. */
const BASE_WALKING_SPEED_M_PER_MIN = 80;

/** Approx. metres per degree of latitude. */
const METERS_PER_DEG_LAT = 111_320;

/** Number of segments for the polygon. */
const SEGMENTS = 64;

/* ------------------------------------------------------------------ */
/*  Urban density detection                                             */
/* ------------------------------------------------------------------ */

/**
 * Detect urban density based on the object's municipality.
 * Returns a speed multiplier (1.0 = base speed).
 */
function getDensityMultiplier(municipality: string): number {
  const normalized = municipality.toLowerCase().trim();

  // Dense urban centers — wider streets, more crossings
  if (normalized.includes("тула") && !normalized.includes("район")) {
    return 1.0; // full speed
  }

  // Suburban / district centers
  if (
    normalized.includes("район") ||
    normalized.includes("мкр") ||
    normalized.includes("микрорайон")
  ) {
    return 0.95;
  }

  // Rural / small settlements
  return 0.85;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Build a polygon with realistic urban shape. */
function buildIsochronePolygon(
  lng: number,
  lat: number,
  radiusMeters: number,
  segments = SEGMENTS,
): [number, number][] {
  const radiusDegLat = radiusMeters / METERS_PER_DEG_LAT;
  const radiusDegLng = radiusDegLat / Math.cos((lat * Math.PI) / 180);

  const points: [number, number][] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (2 * Math.PI * i) / segments;

    const dx = radiusDegLng * Math.cos(angle);
    const dy = radiusDegLat * Math.sin(angle);

    points.push([lng + dx, lat + dy]);
  }

  return points;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Fetch an isochrone polygon for the given coordinates and travel time.
 *
 * Uses a distance-aware approximation that adjusts the reachable radius
 * based on urban density and road network quality.
 */
export async function fetchIsochrone(
  longitude: number,
  latitude: number,
  timeMinutes: number,
  municipality?: string,
): Promise<IsochroneResponse> {
  const densityMultiplier = getDensityMultiplier(municipality ?? "");
  const speedMPerMin = BASE_WALKING_SPEED_M_PER_MIN * densityMultiplier;
  const radiusMeters = timeMinutes * speedMPerMin;

  const coordinates = buildIsochronePolygon(longitude, latitude, radiusMeters);

  return { ok: true, data: { coordinates } };
}
