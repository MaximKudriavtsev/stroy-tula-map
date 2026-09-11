import { z } from 'zod';
import { CalendarDateSchema } from './ids.js';
import { DatePrecisionSchema } from './enums.js';

export const DateRangeSchema = z
  .object({
    lower: CalendarDateSchema,
    upper: CalendarDateSchema,
    precision: DatePrecisionSchema,
  })
  .superRefine((value, ctx) => {
    if (value.lower > value.upper) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'DateRange.lower не может быть позже upper',
        path: ['lower'],
      });
    }
    if (value.precision === 'DAY' && value.lower !== value.upper) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Для точности DAY lower и upper совпадают',
        path: ['upper'],
      });
    }
  });
export type DateRange = z.infer<typeof DateRangeSchema>;
