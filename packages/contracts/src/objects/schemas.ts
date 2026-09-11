import { z } from 'zod';
import { DateRangeSchema } from '../common/date-range.js';
import {
  ConstructionStatusSchema,
  DataOriginSchema,
  ModelQualitySchema,
  ObjectTypeSchema,
  PeriodFieldSchema,
  PublicationStateSchema,
} from '../common/enums.js';
import { GeoJsonGeometrySchema } from '../common/geojson.js';
import {
  BboxSchema,
  CalendarDateSchema,
  FiniteNumberSchema,
  LimitSchema,
  LonLatSchema,
  ProgressPercentSchema,
  UuidSchema,
} from '../common/ids.js';
import { createPageSchema } from '../common/page.js';
import { SourceRefSchema } from '../common/source.js';
import { MediaRefSchema, ModelDescriptorSchema } from '../media/schemas.js';

export const ProjectSchema = z.object({
  id: UuidSchema,
  externalId: z.string().nullable(),
  name: z.string().min(1),
  dataOrigin: DataOriginSchema,
  source: SourceRefSchema,
});
export type Project = z.infer<typeof ProjectSchema>;

export const GeometryRecordSchema = z.object({
  geojson: GeoJsonGeometrySchema,
  verified: z.boolean(),
  source: SourceRefSchema,
  accuracyMeters: FiniteNumberSchema.nullable(),
});
export type GeometryRecord = z.infer<typeof GeometryRecordSchema>;

export const ObjectSummarySchema = z.object({
  id: UuidSchema,
  projectId: UuidSchema,
  name: z.string().min(1),
  type: ObjectTypeSchema,
  municipalityId: UuidSchema.nullable(),
  address: z.string().nullable(),
  status: ConstructionStatusSchema,
  progressPercent: ProgressPercentSchema.nullable(),
  anchor: LonLatSchema.nullable(),
  publishedRevisionId: UuidSchema,
  dataOrigin: DataOriginSchema,
  modelQuality: ModelQualitySchema.nullable(),
});
export type ObjectSummary = z.infer<typeof ObjectSummarySchema>;

export const ObjectDetailSchema = ObjectSummarySchema.extend({
  ownership: z.string().nullable(),
  customer: z.string().nullable(),
  contractor: z.string().nullable(),
  plannedStart: DateRangeSchema.nullable(),
  plannedFinish: DateRangeSchema.nullable(),
  geometries: z.array(GeometryRecordSchema),
  source: SourceRefSchema,
  media: z.array(MediaRefSchema),
  model: ModelDescriptorSchema.nullable(),
  observationAsOf: CalendarDateSchema.nullable(),
});
export type ObjectDetail = z.infer<typeof ObjectDetailSchema>;

export const ObjectDraftFieldsSchema = ObjectDetailSchema.omit({
  publishedRevisionId: true,
});

export const ObjectDraftSchema = z.object({
  objectId: UuidSchema,
  revisionId: UuidSchema,
  version: z.number().int().positive(),
  publicationState: PublicationStateSchema,
  fields: ObjectDraftFieldsSchema,
});
export type ObjectDraft = z.infer<typeof ObjectDraftSchema>;

const asOptionalArray = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return Array.isArray(value) ? value : [value];
  }, z.array(item).optional());

const asOptionalBbox = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'string') {
    return value.split(',').map((part) => Number(part));
  }
  return value;
}, BboxSchema.optional());

export const ObjectQuerySchema = z.object({
  q: z.string().min(1).optional(),
  type: asOptionalArray(ObjectTypeSchema),
  status: asOptionalArray(ConstructionStatusSchema),
  municipalityId: asOptionalArray(UuidSchema),
  at: CalendarDateSchema.optional(),
  from: CalendarDateSchema.optional(),
  to: CalendarDateSchema.optional(),
  periodField: PeriodFieldSchema.optional(),
  bbox: asOptionalBbox,
  dataOrigin: DataOriginSchema.optional(),
  cursor: z.string().min(1).optional(),
  limit: LimitSchema.optional(),
});
export type ObjectQuery = z.infer<typeof ObjectQuerySchema>;

export const ObjectSummaryPageSchema = createPageSchema(ObjectSummarySchema);
export const ObjectDraftPageSchema = createPageSchema(ObjectDraftSchema);

export const CreateObjectRequestSchema = z.object({
  projectId: UuidSchema,
  name: z.string().min(1),
  type: ObjectTypeSchema,
  dataOrigin: DataOriginSchema,
  source: SourceRefSchema,
  municipalityId: UuidSchema.nullable().optional(),
  address: z.string().nullable().optional(),
  ownership: z.string().nullable().optional(),
  customer: z.string().nullable().optional(),
  contractor: z.string().nullable().optional(),
  idempotencyKey: z.string().min(8).optional(),
});
export type CreateObjectRequest = z.infer<typeof CreateObjectRequestSchema>;

export const PatchObjectRequestSchema = z
  .object({
    name: z.string().min(1).optional(),
    type: ObjectTypeSchema.optional(),
    municipalityId: UuidSchema.nullable().optional(),
    address: z.string().nullable().optional(),
    ownership: z.string().nullable().optional(),
    customer: z.string().nullable().optional(),
    contractor: z.string().nullable().optional(),
    plannedStart: DateRangeSchema.nullable().optional(),
    plannedFinish: DateRangeSchema.nullable().optional(),
    geometries: z.array(GeometryRecordSchema).optional(),
    source: SourceRefSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'PATCH не должен быть пустым',
  });
export type PatchObjectRequest = z.infer<typeof PatchObjectRequestSchema>;

export const PublishObjectRequestSchema = z.object({
  reason: z.string().min(1).optional(),
});
export type PublishObjectRequest = z.infer<typeof PublishObjectRequestSchema>;

export const ArchiveObjectRequestSchema = z.object({
  reason: z.string().min(1),
});
export type ArchiveObjectRequest = z.infer<typeof ArchiveObjectRequestSchema>;

export const MutationMetaSchema = z.object({
  version: z.number().int().positive(),
});
