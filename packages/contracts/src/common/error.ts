import { z } from 'zod';

export const ApiErrorCodeSchema = z.enum([
  'SCHEMA_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VERSION_CONFLICT',
  'IDEMPOTENCY_CONFLICT',
  'FEATURE_NOT_AVAILABLE',
  'NAVIGATION_CANCELLED',
  'PRODUCTION_UNSAFE',
  'INTEGRATION_FAILURE',
  'RATE_LIMITED',
  'PAYLOAD_TOO_LARGE',
  'UNSUPPORTED_MEDIA',
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

export const ApiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  requestId: z.string().min(1),
  fieldErrors: z.record(z.array(z.string())).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const createApiError = (input: {
  code: string;
  message: string;
  requestId: string;
  fieldErrors?: Record<string, string[]>;
}): ApiError => ApiErrorSchema.parse(input);

export const zodIssuesToFieldErrors = (
  issues: z.ZodIssue[],
): Record<string, string[]> => {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of issues) {
    const path = issue.path.length > 0 ? issue.path.join('.') : '_root';
    const bucket = fieldErrors[path] ?? [];
    bucket.push(issue.message);
    fieldErrors[path] = bucket;
  }
  return fieldErrors;
};
