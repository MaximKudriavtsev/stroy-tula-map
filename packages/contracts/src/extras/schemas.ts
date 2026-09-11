import { z } from 'zod';
import { ImportStatusSchema } from '../common/enums.js';
import { CalendarDateSchema, FiniteNumberSchema, UuidSchema } from '../common/ids.js';
import { createPageSchema } from '../common/page.js';
import { ActorSchema } from '../common/actor.js';

export const LoginRequestSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const SessionResponseSchema = z.object({
  actor: ActorSchema,
});
export type SessionResponse = z.infer<typeof SessionResponseSchema>;

export const LogoutResponseSchema = z.object({
  ok: z.literal(true),
});

export const ImportRecordSchema = z.object({
  id: UuidSchema,
  filename: z.string().min(1),
  status: ImportStatusSchema,
  rowCount: z.number().int().nonnegative().nullable(),
  errorCount: z.number().int().nonnegative().nullable(),
});
export type ImportRecord = z.infer<typeof ImportRecordSchema>;

export const CreateImportRequestSchema = z.object({
  filename: z.string().min(1),
  mime: z.string().min(1),
  bytes: z.number().int().positive(),
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/),
});

export const CommitImportRequestSchema = z.object({
  confirm: z.literal(true),
});

export const SurveySchema = z.object({
  id: UuidSchema,
  municipalityId: UuidSchema,
  title: z.string().min(1),
  responseCount: z.number().int().nonnegative().nullable(),
});
export const SurveyPageSchema = createPageSchema(SurveySchema);

export const MunicipalitySummarySchema = z.object({
  municipalityId: UuidSchema,
  title: z.string().min(1),
  objectCount: z.number().int().nonnegative(),
  highlights: z.array(z.string()),
});

export const IsochroneResponseSchema = z.object({
  objectId: UuidSchema,
  mode: z.enum(['APPROXIMATE_RADIUS', 'ROUTE_BASED']),
  minutes: z.array(z.number().int().positive()),
  geometry: z.unknown().nullable(),
  disclaimer: z.string().min(1),
});

export const ObjectContractLinkSchema = z.object({
  id: UuidSchema,
  objectId: UuidSchema,
  title: z.string().min(1),
  url: z.string().url().nullable(),
  confirmed: z.boolean(),
});
export const ObjectContractPageSchema = createPageSchema(ObjectContractLinkSchema);

export const CameraSnapshotSchema = z.object({
  id: UuidSchema,
  objectId: UuidSchema,
  capturedAt: CalendarDateSchema,
  mediaId: UuidSchema,
});
export const CameraSnapshotPageSchema = createPageSchema(CameraSnapshotSchema);

export const PosAppealRefSchema = z.object({
  appealId: UuidSchema,
  externalNumber: z.string().nullable(),
  exportState: z.enum(['OFF', 'PENDING', 'SENT', 'FAILED']),
});

export const PosExportRequestSchema = z.object({
  confirm: z.literal(true),
});

export const PosWebhookPayloadSchema = z.object({
  providerEventId: z.string().min(1),
  payload: z.unknown(),
});

export const ResidentConfirmationRequestSchema = z.object({
  appealId: UuidSchema,
  applicantId: UuidSchema,
  confirmed: z.boolean(),
  comment: z.string().nullable(),
});

export const HealthLiveResponseSchema = z.object({
  status: z.literal('ok'),
});

export const HealthCheckStateSchema = z.enum(['ok', 'error', 'skipped']);

export const HealthReadyResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'error']),
  apiMode: z.enum(['mock', 'live']),
  checks: z.object({
    postgres: HealthCheckStateSchema,
    redis: HealthCheckStateSchema,
    storage: HealthCheckStateSchema,
  }),
});
export type HealthReadyResponse = z.infer<typeof HealthReadyResponseSchema>;

export const IntegrationStatusSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  state: z.enum(['OFF', 'READY', 'ERROR']),
  lastCheckedAt: z.string().datetime({ offset: true }).nullable(),
});

export const IntegrationsResponseSchema = z.object({
  items: z.array(IntegrationStatusSchema),
});

export const RetryNotificationResponseSchema = z.object({
  notificationId: UuidSchema,
  queued: z.boolean(),
});

export const OkSchema = z.object({ ok: z.literal(true) });

export const FiniteMetricPreviewSchema = z.object({
  value: FiniteNumberSchema.nullable(),
});
