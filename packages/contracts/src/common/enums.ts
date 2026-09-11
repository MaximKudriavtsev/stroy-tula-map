import { z } from 'zod';

export const DataOriginSchema = z.enum(['REAL', 'DEMO']);
export type DataOrigin = z.infer<typeof DataOriginSchema>;

export const ConstructionStatusSchema = z.enum([
  'UNKNOWN',
  'PLANNED',
  'IN_PROGRESS',
  'SUSPENDED',
  'COMMISSIONED',
]);
export type ConstructionStatus = z.infer<typeof ConstructionStatusSchema>;

export const ObjectTypeSchema = z.enum([
  'SCHOOL',
  'KINDERGARTEN',
  'MEDICAL',
  'SPORT',
  'CULTURE',
  'HOUSING',
  'BOILER',
  'WATER',
  'WASTEWATER',
  'LINEAR',
  'OTHER',
]);
export type ObjectType = z.infer<typeof ObjectTypeSchema>;

export const RoleSchema = z.enum([
  'ADMIN',
  'OBJECT_EDITOR',
  'APPEAL_OPERATOR',
  'EXECUTOR',
]);
export type Role = z.infer<typeof RoleSchema>;

export const PublicationStateSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export type PublicationState = z.infer<typeof PublicationStateSchema>;

export const ModelQualitySchema = z.enum(['GENERIC', 'ADAPTED', 'VERIFIED']);
export type ModelQuality = z.infer<typeof ModelQualitySchema>;

export const EvidenceKindSchema = z.enum(['FACT', 'PLAN']);
export type EvidenceKind = z.infer<typeof EvidenceKindSchema>;

export const DatePrecisionSchema = z.enum(['DAY', 'MONTH', 'YEAR']);
export type DatePrecision = z.infer<typeof DatePrecisionSchema>;

export const MediaKindSchema = z.enum(['PHOTO', 'DOCUMENT', 'MODEL', 'VIDEO']);
export type MediaKind = z.infer<typeof MediaKindSchema>;

export const MediaAccessSchema = z.enum(['PUBLIC', 'PRIVATE']);
export type MediaAccess = z.infer<typeof MediaAccessSchema>;

export const MediaStateSchema = z.enum(['PENDING', 'READY', 'REJECTED']);
export type MediaState = z.infer<typeof MediaStateSchema>;

export const ModelSourceSchema = z.enum(['PROCEDURAL', 'GLB']);
export type ModelSource = z.infer<typeof ModelSourceSchema>;

export const PeriodFieldSchema = z.enum(['COMMISSIONED', 'PLANNED_FINISH']);
export type PeriodField = z.infer<typeof PeriodFieldSchema>;

export const AppealStatusSchema = z.enum([
  'REGISTERED',
  'IN_REVIEW',
  'WAITING_APPLICANT',
  'RESPONSE_PREPARED',
  'ANSWERED',
]);
export type AppealStatus = z.infer<typeof AppealStatusSchema>;

export const TaskStatusSchema = z.enum([
  'NEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_INFORMATION',
  'ON_REVIEW',
  'DONE',
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const BotStepSchema = z.enum([
  'OBJECT',
  'CATEGORY',
  'DESCRIPTION',
  'PHOTO',
  'LOCATION',
  'OCCURRED_AT',
  'REVIEW',
]);
export type BotStep = z.infer<typeof BotStepSchema>;

export const NotificationKindSchema = z.enum([
  'REGISTRATION',
  'CLARIFICATION',
  'STATUS',
  'ANSWER',
]);
export type NotificationKind = z.infer<typeof NotificationKindSchema>;

export const MessengerOutcomeSchema = z.enum([
  'ACCEPTED',
  'RETRYABLE_FAILURE',
  'PERMANENT_FAILURE',
  'UNKNOWN',
]);
export type MessengerOutcome = z.infer<typeof MessengerOutcomeSchema>;

export const CompetenceValueSchema = z.enum(['IN_SCOPE', 'OUT_OF_SCOPE', 'UNKNOWN']);
export type CompetenceValue = z.infer<typeof CompetenceValueSchema>;

export const AnalysisStatusSchema = z.enum([
  'QUEUED',
  'RUNNING',
  'READY',
  'FAILED',
  'OFF',
]);
export type AnalysisStatus = z.infer<typeof AnalysisStatusSchema>;

export const ImportStatusSchema = z.enum([
  'UPLOADED',
  'VALIDATING',
  'READY_TO_COMMIT',
  'COMMITTED',
  'FAILED',
]);
export type ImportStatus = z.infer<typeof ImportStatusSchema>;

export const ApiModeSchema = z.enum(['mock', 'live']);
export type ApiMode = z.infer<typeof ApiModeSchema>;

export const DataModeSchema = z.enum(['real', 'demo']);
export type DataMode = z.infer<typeof DataModeSchema>;

export const MessengerAdapterKindSchema = z.enum(['simulator', 'max']);
export type MessengerAdapterKind = z.infer<typeof MessengerAdapterKindSchema>;
