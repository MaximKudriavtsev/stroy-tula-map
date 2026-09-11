import { z } from 'zod';
import { FiniteNumberSchema, LonLatSchema } from './ids.js';

const PositionSchema = z.union([
  LonLatSchema,
  z.tuple([LonLatSchema.items[0], LonLatSchema.items[1], FiniteNumberSchema]),
]);

const LinearRingSchema = z.array(PositionSchema).min(4);

export const GeoJsonPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: PositionSchema,
});

export const GeoJsonMultiPointSchema = z.object({
  type: z.literal('MultiPoint'),
  coordinates: z.array(PositionSchema).min(1),
});

export const GeoJsonLineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(PositionSchema).min(2),
});

export const GeoJsonMultiLineStringSchema = z.object({
  type: z.literal('MultiLineString'),
  coordinates: z.array(z.array(PositionSchema).min(2)).min(1),
});

export const GeoJsonPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(LinearRingSchema).min(1),
});

export const GeoJsonMultiPolygonSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(LinearRingSchema).min(1)).min(1),
});

export const GeoJsonGeometrySchema = z.discriminatedUnion('type', [
  GeoJsonPointSchema,
  GeoJsonMultiPointSchema,
  GeoJsonLineStringSchema,
  GeoJsonMultiLineStringSchema,
  GeoJsonPolygonSchema,
  GeoJsonMultiPolygonSchema,
]);
export type GeoJsonGeometry = z.infer<typeof GeoJsonGeometrySchema>;

export const MapFeatureSchema = z.object({
  type: z.literal('Feature'),
  id: z.string().uuid(),
  geometry: GeoJsonPointSchema,
  properties: z.object({
    objectId: z.string().uuid(),
    name: z.string(),
    type: z.string(),
    status: z.string(),
  }),
});

export const MapFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(MapFeatureSchema),
  total: z.number().int().nonnegative(),
  featuredCount: z.number().int().nonnegative(),
});
export type MapFeatureCollection = z.infer<typeof MapFeatureCollectionSchema>;
