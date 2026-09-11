import { z } from 'zod';
import { DateRangeSchema } from '../common/date-range.js';
import { MediaAccessSchema, MediaKindSchema, MediaStateSchema, ModelQualitySchema, ModelSourceSchema, ObjectTypeSchema, ConstructionStatusSchema } from '../common/enums.js';
import { FiniteNumberSchema, UuidSchema } from '../common/ids.js';
import { SourceRefSchema } from '../common/source.js';

export const MediaRefSchema = z.object({
  id: UuidSchema,
  kind: MediaKindSchema,
  access: MediaAccessSchema,
  state: MediaStateSchema,
  url: z.string().url().nullable(),
  mime: z.string().min(1),
  bytes: z.number().int().nonnegative(),
  caption: z.string().nullable(),
  capturedAt: DateRangeSchema.nullable(),
  source: SourceRefSchema.nullable(),
});
export type MediaRef = z.infer<typeof MediaRefSchema>;

export const ModelDescriptorSchema = z.object({
  id: UuidSchema,
  quality: ModelQualitySchema,
  source: ModelSourceSchema,
  objectType: ObjectTypeSchema,
  assetId: UuidSchema.nullable(),
  stage: ConstructionStatusSchema,
  scale: FiniteNumberSchema,
  rotationDeg: FiniteNumberSchema,
  altitudeMeters: FiniteNumberSchema,
  dimensionsMeters: z
    .tuple([FiniteNumberSchema, FiniteNumberSchema, FiniteNumberSchema])
    .nullable(),
  dimensionsVerified: z.boolean(),
});
export type ModelDescriptor = z.infer<typeof ModelDescriptorSchema>;

export const CreateAssetRequestSchema = z.object({
  kind: MediaKindSchema,
  access: MediaAccessSchema,
  mime: z.string().min(1),
  bytes: z.number().int().positive(),
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/),
  caption: z.string().nullable().optional(),
  objectId: UuidSchema.nullable().optional(),
  appealId: UuidSchema.nullable().optional(),
});
export type CreateAssetRequest = z.infer<typeof CreateAssetRequestSchema>;

export const CreateAssetResponseSchema = z.object({
  asset: MediaRefSchema,
  upload: z.object({
    method: z.literal('POST'),
    url: z.string().url(),
    headers: z.record(z.string()),
    expiresAt: z.string().datetime({ offset: true }),
  }),
});
export type CreateAssetResponse = z.infer<typeof CreateAssetResponseSchema>;

export const CompleteAssetRequestSchema = z.object({
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/),
});
export type CompleteAssetRequest = z.infer<typeof CompleteAssetRequestSchema>;

export const AssetAccessResponseSchema = z.object({
  asset: MediaRefSchema,
  signedUrl: z.string().url(),
  expiresAt: z.string().datetime({ offset: true }),
});
export type AssetAccessResponse = z.infer<typeof AssetAccessResponseSchema>;
