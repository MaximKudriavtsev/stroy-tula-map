import { z } from 'zod';

export const UuidSchema = z
  .string()
  .uuid({ message: 'Значение должно быть UUID' });
export type UUID = z.infer<typeof UuidSchema>;

export const CalendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ожидается календарная дата YYYY-MM-DD')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number);
    if (year === undefined || month === undefined || day === undefined) {
      return false;
    }
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, 'Несуществующая календарная дата');
export type CalendarDate = z.infer<typeof CalendarDateSchema>;

export const UtcTimestampSchema = z
  .string()
  .datetime({ offset: true, message: 'Ожидается UTC timestamp ISO-8601' });
export type UtcTimestamp = z.infer<typeof UtcTimestampSchema>;

export const FiniteNumberSchema = z
  .number({ invalid_type_error: 'Ожидается конечное число' })
  .finite('Число должно быть конечным');

export const ProgressPercentSchema = FiniteNumberSchema.min(0).max(100);

export const LimitSchema = z.coerce.number().int().min(1).max(200).default(50);

export const CursorSchema = z.string().min(1);

export const LonSchema = FiniteNumberSchema.min(-180).max(180);
export const LatSchema = FiniteNumberSchema.min(-90).max(90);
export const LonLatSchema = z.tuple([LonSchema, LatSchema], {
  invalid_type_error: 'Координаты GeoJSON: [longitude, latitude]',
});
export type LonLat = z.infer<typeof LonLatSchema>;

export const BboxSchema = z.tuple([LonSchema, LatSchema, LonSchema, LatSchema]);
export type Bbox = z.infer<typeof BboxSchema>;
