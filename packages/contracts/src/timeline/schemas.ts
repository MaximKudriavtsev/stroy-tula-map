import { z } from 'zod';
import { DateRangeSchema } from '../common/date-range.js';
import { ConstructionStatusSchema, EvidenceKindSchema } from '../common/enums.js';
import { CalendarDateSchema, ProgressPercentSchema, UtcTimestampSchema, UuidSchema } from '../common/ids.js';
import { createPageSchema } from '../common/page.js';
import { SourceRefSchema } from '../common/source.js';

export const ObjectEventSchema = z.object({
  id: UuidSchema,
  objectId: UuidSchema,
  revisionId: UuidSchema,
  kind: EvidenceKindSchema,
  effectiveDate: DateRangeSchema,
  recordedAt: UtcTimestampSchema,
  status: ConstructionStatusSchema,
  progressPercent: ProgressPercentSchema.nullable(),
  source: SourceRefSchema,
  supersedesEventId: UuidSchema.nullable(),
});
export type ObjectEvent = z.infer<typeof ObjectEventSchema>;

export const TemporalStateSchema = z.object({
  status: ConstructionStatusSchema,
  progressPercent: ProgressPercentSchema.nullable(),
  eventId: UuidSchema.nullable(),
  uncertain: z.boolean(),
});
export type TemporalState = z.infer<typeof TemporalStateSchema>;

export const ObjectEventPageSchema = createPageSchema(ObjectEventSchema);

const asOptionalArray = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return Array.isArray(value) ? value : [value];
  }, z.array(item).optional());

export const TimelineQuerySchema = z.object({
  objectId: UuidSchema.optional(),
  from: CalendarDateSchema.optional(),
  to: CalendarDateSchema.optional(),
  kind: asOptionalArray(EvidenceKindSchema),
  dataOrigin: z.enum(['REAL', 'DEMO']).optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
export type TimelineQuery = z.infer<typeof TimelineQuerySchema>;

export const CreateObjectEventRequestSchema = z.object({
  kind: EvidenceKindSchema,
  effectiveDate: DateRangeSchema,
  status: ConstructionStatusSchema,
  progressPercent: ProgressPercentSchema.nullable(),
  source: SourceRefSchema,
  supersedesEventId: UuidSchema.nullable().optional(),
});
export type CreateObjectEventRequest = z.infer<typeof CreateObjectEventRequestSchema>;

export const PatchObjectEventRequestSchema = CreateObjectEventRequestSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'PATCH не должен быть пустым' },
);
export type PatchObjectEventRequest = z.infer<typeof PatchObjectEventRequestSchema>;
