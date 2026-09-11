import { z } from 'zod';
import { DateRangeSchema } from '../common/date-range.js';
import {
  AppealStatusSchema,
  DataOriginSchema,
  NotificationKindSchema,
  TaskPrioritySchema,
  TaskStatusSchema,
} from '../common/enums.js';
import { LonLatSchema, UtcTimestampSchema, UuidSchema } from '../common/ids.js';
import { createPageSchema } from '../common/page.js';

export const ProblemLocationSchema = z.object({
  point: LonLatSchema.nullable(),
  address: z.string().nullable(),
});

export const ConfirmedDraftSchema = z.object({
  draftId: UuidSchema,
  version: z.number().int().positive(),
  applicantId: UuidSchema,
  objectId: UuidSchema.nullable(),
  category: z.string().min(1),
  description: z.string().min(10).max(4000),
  photoAssetIds: z.array(UuidSchema).min(1),
  location: ProblemLocationSchema,
  occurredAt: DateRangeSchema,
  dataOrigin: DataOriginSchema,
});
export type ConfirmedDraft = z.infer<typeof ConfirmedDraftSchema>;

export const AppealSchema = z.object({
  id: UuidSchema,
  number: z.string().min(1),
  applicantId: UuidSchema,
  objectId: UuidSchema.nullable(),
  status: AppealStatusSchema,
  taskId: UuidSchema.nullable(),
  createdAt: UtcTimestampSchema,
  version: z.number().int().positive(),
});
export type Appeal = z.infer<typeof AppealSchema>;

export const TaskSchema = z.object({
  id: UuidSchema,
  title: z.string().min(1),
  objectId: UuidSchema.nullable(),
  municipalityId: UuidSchema.nullable(),
  status: TaskStatusSchema,
  assigneeId: UuidSchema.nullable(),
  dueAt: UtcTimestampSchema.nullable(),
  priority: TaskPrioritySchema,
  version: z.number().int().positive(),
  mergedIntoTaskId: UuidSchema.nullable(),
});
export type Task = z.infer<typeof TaskSchema>;

export const NotificationRequestSchema = z.object({
  id: UuidSchema,
  appealId: UuidSchema,
  kind: NotificationKindSchema,
  recipientApplicantId: UuidSchema,
  text: z.string().min(1),
  assetIds: z.array(UuidSchema),
});
export type NotificationRequest = z.infer<typeof NotificationRequestSchema>;

export const AppealPageSchema = createPageSchema(AppealSchema);
export const TaskPageSchema = createPageSchema(TaskSchema);

const asOptionalArray = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return Array.isArray(value) ? value : [value];
  }, z.array(item).optional());

export const AppealQuerySchema = z.object({
  status: asOptionalArray(AppealStatusSchema),
  objectId: UuidSchema.optional(),
  q: z.string().min(1).optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
export type AppealQuery = z.infer<typeof AppealQuerySchema>;

export const TaskQuerySchema = z.object({
  status: asOptionalArray(TaskStatusSchema),
  assigneeId: UuidSchema.optional(),
  municipalityId: UuidSchema.optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
export type TaskQuery = z.infer<typeof TaskQuerySchema>;

export const CreateTaskRequestSchema = z.object({
  title: z.string().min(1),
  objectId: UuidSchema.nullable(),
  municipalityId: UuidSchema.nullable(),
  assigneeId: UuidSchema.nullable().optional(),
  dueAt: UtcTimestampSchema.nullable().optional(),
  priority: TaskPrioritySchema.default('NORMAL'),
  appealIds: z.array(UuidSchema).optional(),
});

export const PatchTaskRequestSchema = z
  .object({
    title: z.string().min(1).optional(),
    assigneeId: UuidSchema.nullable().optional(),
    dueAt: UtcTimestampSchema.nullable().optional(),
    priority: TaskPrioritySchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'PATCH не должен быть пустым',
  });

export const TaskTransitionRequestSchema = z.object({
  to: TaskStatusSchema,
  reason: z.string().min(1).optional(),
  resultText: z.string().min(1).optional(),
  resultAssetIds: z.array(UuidSchema).optional(),
});

export const LinkAppealsRequestSchema = z.object({
  appealIds: z.array(UuidSchema).min(1),
  reason: z.string().min(1),
});

export const TaskCommentRequestSchema = z.object({
  text: z.string().min(1).max(4000),
  internal: z.literal(true).default(true),
});

export const AppealReplyRequestSchema = z.object({
  kind: z.enum(['CLARIFICATION', 'ANSWER']),
  text: z.string().min(1).max(4000),
  assetIds: z.array(UuidSchema).default([]),
  idempotencyKey: z.string().min(8),
});

export const MergeTasksRequestSchema = z.object({
  sourceTaskId: UuidSchema,
  reason: z.string().min(1),
});

export const PriorityFactorsSchema = z.object({
  taskId: UuidSchema,
  manualPriority: TaskPrioritySchema,
  factors: z.array(
    z.object({
      code: z.string().min(1),
      label: z.string().min(1),
      weight: z.number().finite().nullable(),
      note: z.string().nullable(),
    }),
  ),
  rulesVersion: z.string().nullable(),
});

export const SetPriorityRequestSchema = z.object({
  manualPriority: TaskPrioritySchema,
  reason: z.string().min(1),
});

export const GroupingCandidatesResponseSchema = z.object({
  appealId: UuidSchema,
  candidateAppealIds: z.array(UuidSchema),
  suggestedTaskId: UuidSchema.nullable(),
});
