import { z } from 'zod';
import { RoleSchema } from './enums.js';
import { UuidSchema } from './ids.js';

export const ActorScopeSchema = z.object({
  allMunicipalities: z.boolean(),
  municipalityIds: z.array(UuidSchema),
});

export const ActorSchema = z.object({
  id: UuidSchema,
  roles: z.array(RoleSchema).min(1),
  scope: ActorScopeSchema,
});
export type Actor = z.infer<typeof ActorSchema>;
