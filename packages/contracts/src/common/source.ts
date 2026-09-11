import { z } from 'zod';
import { CalendarDateSchema, UuidSchema } from './ids.js';

export const SourceRefSchema = z.object({
  id: UuidSchema,
  label: z.string().min(1),
  url: z.string().url().nullable(),
  documentId: UuidSchema.nullable(),
  asOf: CalendarDateSchema.nullable(),
});
export type SourceRef = z.infer<typeof SourceRefSchema>;
