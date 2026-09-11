import { z } from 'zod';
import { FiniteNumberSchema, UuidSchema } from '../common/ids.js';
import { createPageSchema } from '../common/page.js';

export const MetricInputSchema = z.object({
  metricCode: z.string().min(1),
  unit: z.string().min(1),
  territoryId: UuidSchema,
  baseline: FiniteNumberSchema.nullable(),
  added: FiniteNumberSchema.nullable(),
  retired: FiniteNumberSchema.nullable(),
  denominator: FiniteNumberSchema.nullable(),
  per: FiniteNumberSchema.nullable(),
});
export type MetricInput = z.infer<typeof MetricInputSchema>;

export const MetricResultSchema = z.object({
  after: FiniteNumberSchema.nullable(),
  netAdded: FiniteNumberSchema.nullable(),
  provision: FiniteNumberSchema.nullable(),
  reason: z.string().nullable(),
});
export type MetricResult = z.infer<typeof MetricResultSchema>;

export const ObjectMetricSchema = z.object({
  id: UuidSchema,
  objectId: UuidSchema,
  input: MetricInputSchema,
  result: MetricResultSchema,
  sourceLabel: z.string().min(1),
});
export type ObjectMetric = z.infer<typeof ObjectMetricSchema>;

export const ObjectMetricPageSchema = createPageSchema(ObjectMetricSchema);

export const PublicMetricsQuerySchema = z.object({
  municipalityId: UuidSchema.optional(),
  metricCode: z.string().min(1).optional(),
  dataOrigin: z.enum(['REAL', 'DEMO']).optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const CreateMetricRequestSchema = MetricInputSchema.extend({
  sourceLabel: z.string().min(1),
});
export type CreateMetricRequest = z.infer<typeof CreateMetricRequestSchema>;

export const PatchMetricRequestSchema = CreateMetricRequestSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'PATCH не должен быть пустым' },
);
