import { z } from 'zod';
import { CompetenceValueSchema } from '../common/enums.js';
import { UuidSchema } from '../common/ids.js';

export const AnalysisResultSchema = z.object({
  summary: z.string().min(1),
  competence: z.object({
    value: CompetenceValueSchema,
    reason: z.string().min(1),
  }),
  spam: z.object({
    suspected: z.boolean(),
    reason: z.string().min(1),
  }),
  category: z.string().nullable(),
  missingFields: z.array(z.string()),
  urgencySignals: z.array(
    z.object({
      code: z.string().min(1),
      quote: z.string().min(1),
      reason: z.string().min(1),
    }),
  ),
  similarAppealIds: z.array(UuidSchema),
  suggestedTaskId: UuidSchema.nullable(),
  reasoning: z.string().min(1),
  modelVersion: z.string().min(1),
  rulesVersion: z.string().min(1),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const AnalysisRecordSchema = z.object({
  appealId: UuidSchema,
  status: z.enum(['QUEUED', 'RUNNING', 'READY', 'FAILED', 'OFF']),
  result: AnalysisResultSchema.nullable(),
  reviewed: z.boolean(),
});
export type AnalysisRecord = z.infer<typeof AnalysisRecordSchema>;

export const RequestAnalysisRequestSchema = z.object({
  rulesVersion: z.string().min(1),
});

export const ReviewAnalysisRequestSchema = z.object({
  accepted: z.boolean(),
  note: z.string().min(1),
});

export type AnalysisProvider = {
  analyze: (input: {
    appealId: string;
    text: string;
    allowedCandidateIds: string[];
    rulesVersion: string;
  }) => Promise<AnalysisResult>;
};
