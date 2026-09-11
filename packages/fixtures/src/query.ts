import {
  MapFeatureCollectionSchema,
  ObjectQuerySchema,
  ObjectSummarySchema,
  type MapFeatureCollection,
  type ObjectDetail,
  type ObjectQuery,
  type ObjectSummary,
  type Page,
} from '@tula/contracts';
import { demoEvents } from './objects/events.js';
import { demoObjectDetails } from './objects/objects.js';

export const toSummary = (detail: ObjectDetail): ObjectSummary =>
  ObjectSummarySchema.parse({
    id: detail.id,
    projectId: detail.projectId,
    name: detail.name,
    type: detail.type,
    municipalityId: detail.municipalityId,
    address: detail.address,
    status: detail.status,
    progressPercent: detail.progressPercent,
    anchor: detail.anchor,
    publishedRevisionId: detail.publishedRevisionId,
    dataOrigin: detail.dataOrigin,
    modelQuality: detail.modelQuality,
  });

const inBbox = (anchor: [number, number] | null, bbox: ObjectQuery['bbox']): boolean => {
  if (!bbox || !anchor) {
    return Boolean(anchor);
  }
  const [lon, lat] = anchor;
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
};

export const filterObjects = (query: ObjectQuery): ObjectDetail[] => {
  const parsed = ObjectQuerySchema.parse(query);
  const origin = parsed.dataOrigin ?? 'REAL';
  return demoObjectDetails.filter((item) => {
    if (item.dataOrigin !== origin) {
      return false;
    }
    if (parsed.q && !item.name.toLowerCase().includes(parsed.q.toLowerCase())) {
      return false;
    }
    if (parsed.type && parsed.type.length > 0 && !parsed.type.includes(item.type)) {
      return false;
    }
    if (parsed.status && parsed.status.length > 0 && !parsed.status.includes(item.status)) {
      return false;
    }
    if (
      parsed.municipalityId &&
      parsed.municipalityId.length > 0 &&
      (item.municipalityId === null || !parsed.municipalityId.includes(item.municipalityId))
    ) {
      return false;
    }
    if (parsed.bbox && !inBbox(item.anchor, parsed.bbox)) {
      return false;
    }
    return true;
  });
};

export const paginate = <T>(items: T[], cursor?: string, limit = 50): Page<T> => {
  const start = cursor ? Number.parseInt(cursor, 10) : 0;
  const safeStart = Number.isFinite(start) && start > 0 ? start : 0;
  const slice = items.slice(safeStart, safeStart + limit);
  const next = safeStart + limit < items.length ? String(safeStart + limit) : null;
  return { items: slice, nextCursor: next, total: items.length };
};

export const listPublicSummaries = (query: ObjectQuery): Page<ObjectSummary> => {
  const parsed = ObjectQuerySchema.parse(query);
  const items = filterObjects(parsed).map(toSummary);
  return paginate(items, parsed.cursor, parsed.limit ?? 50);
};

export const getPublicObject = (id: string, dataOrigin?: 'REAL' | 'DEMO'): ObjectDetail | undefined => {
  const origin = dataOrigin ?? 'REAL';
  return demoObjectDetails.find((item) => item.id === id && item.dataOrigin === origin);
};

export const toMapCollection = (query: ObjectQuery): MapFeatureCollection => {
  const parsed = ObjectQuerySchema.parse(query);
  const all = filterObjects(parsed);
  const withPoint = all.filter((item) => item.anchor);
  return MapFeatureCollectionSchema.parse({
    type: 'FeatureCollection',
    total: all.length,
    featuredCount: withPoint.length,
    features: withPoint.map((item) => ({
      type: 'Feature' as const,
      id: item.id,
      geometry: { type: 'Point' as const, coordinates: item.anchor as [number, number] },
      properties: {
        objectId: item.id,
        name: item.name,
        type: item.type,
        status: item.status,
      },
    })),
  });
};

export const listEventsForObject = (objectId: string) =>
  demoEvents.filter((event) => event.objectId === objectId);
