import { z } from 'zod';

export const createPageSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
    total: z.number().int().nonnegative(),
  });

export type Page<T> = {
  items: T[];
  nextCursor: string | null;
  total: number;
};
