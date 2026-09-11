import { z } from 'zod';
import { BotStepSchema, MessengerOutcomeSchema } from '../common/enums.js';
import { LonLatSchema, UtcTimestampSchema, UuidSchema } from '../common/ids.js';
import { ConfirmedDraftSchema, NotificationRequestSchema } from '../workflow/schemas.js';

export const BotInputStartValueSchema = z
  .object({
    objectId: UuidSchema.nullable().optional(),
    deepLink: z.string().min(1).optional(),
  })
  .nullable();

export const BotInputTextValueSchema = z.object({
  text: z.string(),
});

export const BotInputPhotoValueSchema = z.object({
  assetId: UuidSchema,
  mime: z.string().min(1).optional(),
});

export const BotInputLocationValueSchema = z.object({
  point: LonLatSchema.nullable(),
  address: z.string().nullable(),
});

export const BotCallbackActionSchema = z.enum([
  'BACK',
  'CONFIRM',
  'CANCEL',
  'EDIT_FIELD',
  'SELECT_OBJECT',
  'SKIP',
]);

export const BotInputCallbackValueSchema = z.object({
  action: BotCallbackActionSchema,
  field: BotStepSchema.optional(),
  objectId: UuidSchema.optional(),
});

export const BotInputSchema = z.discriminatedUnion('kind', [
  z.object({
    key: z.string().min(1),
    kind: z.literal('START'),
    value: BotInputStartValueSchema,
    receivedAt: UtcTimestampSchema,
  }),
  z.object({
    key: z.string().min(1),
    kind: z.literal('TEXT'),
    value: BotInputTextValueSchema,
    receivedAt: UtcTimestampSchema,
  }),
  z.object({
    key: z.string().min(1),
    kind: z.literal('PHOTO'),
    value: BotInputPhotoValueSchema,
    receivedAt: UtcTimestampSchema,
  }),
  z.object({
    key: z.string().min(1),
    kind: z.literal('LOCATION'),
    value: BotInputLocationValueSchema,
    receivedAt: UtcTimestampSchema,
  }),
  z.object({
    key: z.string().min(1),
    kind: z.literal('CALLBACK'),
    value: BotInputCallbackValueSchema,
    receivedAt: UtcTimestampSchema,
  }),
]);
export type BotInput = z.infer<typeof BotInputSchema>;

export const BotEffectSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('SEND'),
    payload: z.object({
      text: z.string().min(1),
      buttons: z
        .array(
          z.object({
            id: z.string().min(1),
            label: z.string().min(1),
          }),
        )
        .optional(),
    }),
  }),
  z.object({
    kind: z.literal('REGISTER'),
    payload: z.object({
      draftId: UuidSchema,
      version: z.number().int().positive(),
    }),
  }),
]);
export type BotEffect = z.infer<typeof BotEffectSchema>;

export const BotSessionSchema = z.object({
  id: UuidSchema,
  applicantId: UuidSchema,
  draftId: UuidSchema,
  version: z.number().int().positive(),
  step: BotStepSchema,
  draft: ConfirmedDraftSchema.partial(),
});
export type BotSession = z.infer<typeof BotSessionSchema>;

export const BotAdvanceSchema = z.object({
  session: BotSessionSchema,
  effects: z.array(BotEffectSchema),
});
export type BotAdvance = z.infer<typeof BotAdvanceSchema>;

export const MessengerSendResultSchema = z.object({
  outcome: MessengerOutcomeSchema,
  providerMessageId: z.string().nullable(),
});
export type MessengerSendResult = z.infer<typeof MessengerSendResultSchema>;

export type MessengerAdapter = {
  normalizeWebhook: (payload: unknown) => BotInput;
  send: (request: z.infer<typeof NotificationRequestSchema>) => Promise<MessengerSendResult>;
};

export const CreateBotSessionRequestSchema = z.object({
  applicantId: UuidSchema,
  objectId: UuidSchema.nullable().optional(),
});
export type CreateBotSessionRequest = z.infer<typeof CreateBotSessionRequestSchema>;

export const CreateBotSessionResponseSchema = z.object({
  session: BotSessionSchema,
  simulatorLabel: z.literal('Симулятор MAX'),
});
export type CreateBotSessionResponse = z.infer<typeof CreateBotSessionResponseSchema>;

export const BotSessionInputResponseSchema = z.object({
  parsed: BotInputSchema,
  simulatorLabel: z.literal('Симулятор MAX'),
  note: z.string(),
});
export type BotSessionInputResponse = z.infer<typeof BotSessionInputResponseSchema>;
