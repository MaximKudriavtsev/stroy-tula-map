import { BotInputSchema, NotificationRequestSchema, type BotInput, type MessengerAdapter } from '@tula/contracts';
import { IDS } from './ids.js';

export const createMessengerSimulator = (): MessengerAdapter => ({
  normalizeWebhook: (payload: unknown): BotInput => BotInputSchema.parse(payload),
  send: async (request) => {
    NotificationRequestSchema.parse(request);
    return {
      outcome: 'ACCEPTED',
      providerMessageId: `sim-${request.id}`,
    };
  },
});

export const demoBotStartInput: BotInput = BotInputSchema.parse({
  key: 'demo-start-1',
  kind: 'START',
  value: { objectId: IDS.school },
  receivedAt: '2026-03-01T12:00:00.000Z',
});
