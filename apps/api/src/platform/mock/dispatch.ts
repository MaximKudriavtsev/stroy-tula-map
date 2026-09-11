import {
  AppealQuerySchema,
  BotInputSchema,
  BotSessionSchema,
  CreateBotSessionRequestSchema,
  ObjectQuerySchema,
  TaskQuerySchema,
  TimelineQuerySchema,
  createApiError,
  type BotSession,
  type CatalogEndpoint,
  type RuntimeEnv,
} from '@tula/contracts';
import {
  IDS,
  createMessengerSimulator,
  demoActor,
  demoAppeals,
  demoObjectDrafts,
  demoTasks,
  getPublicObject,
  listEventsForObject,
  listPublicSummaries,
  paginate,
  toMapCollection,
} from '@tula/fixtures';
import { featureNotAvailable } from '../config/runtime.js';

const botSessions = new Map<string, BotSession>();
const messenger = createMessengerSimulator();

const flattenQuery = (query: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      result[key] = value.map(String);
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value;
    }
  }
  return result;
};

export const dispatchMock = async (input: {
  endpoint: CatalogEndpoint;
  params: Record<string, string>;
  query: Record<string, unknown>;
  body: unknown;
  requestId: string;
  env: RuntimeEnv;
}): Promise<unknown> => {
  const { endpoint, params, query, body, requestId, env } = input;
  const q = flattenQuery(query);

  if (endpoint.availability === 'dev-only' && (env.NODE_ENV === 'production' || !env.ALLOW_DEV_ROUTES)) {
    throw createApiError({
      code: 'FORBIDDEN',
      message: 'Dev-маршруты и симулятор в этом окружении выключены',
      requestId,
    });
  }

  if (endpoint.availability === 'not-implemented') {
    throw featureNotAvailable(endpoint.feature, requestId);
  }

  switch (endpoint.operationId) {
    case 'healthLive':
      return { status: 'ok' };
    case 'me':
      return { actor: demoActor };
    case 'listPublicObjects': {
      const parsed = ObjectQuerySchema.parse(q);
      if (parsed.at) {
        throw featureNotAvailable('F08', requestId);
      }
      return listPublicSummaries(parsed);
    }
    case 'getPublicMap': {
      const parsed = ObjectQuerySchema.parse(q);
      if (parsed.at) {
        throw featureNotAvailable('F08', requestId);
      }
      return toMapCollection(parsed);
    }
    case 'getPublicObject': {
      const parsed = ObjectQuerySchema.pick({ at: true, dataOrigin: true }).parse(q);
      if (parsed.at) {
        throw featureNotAvailable('F08', requestId);
      }
      const object = getPublicObject(params.id ?? '', parsed.dataOrigin);
      if (!object) {
        throw createApiError({ code: 'NOT_FOUND', message: 'Объект не найден', requestId });
      }
      return object;
    }
    case 'listAdminObjects': {
      const parsed = ObjectQuerySchema.parse(q);
      const origin = parsed.dataOrigin ?? 'DEMO';
      const items = demoObjectDrafts.filter((item) => item.fields.dataOrigin === origin);
      return paginate(items, parsed.cursor, parsed.limit ?? 50);
    }
    case 'getAdminObject': {
      const draft = demoObjectDrafts.find((item) => item.objectId === params.id);
      if (!draft) {
        throw createApiError({ code: 'NOT_FOUND', message: 'Черновик не найден', requestId });
      }
      return draft;
    }
    case 'listPublicObjectEvents': {
      const parsed = TimelineQuerySchema.omit({ objectId: true }).parse(q);
      const items = listEventsForObject(params.id ?? '');
      return paginate(items, parsed.cursor, parsed.limit ?? 50);
    }
    case 'listPublicTimeline': {
      const parsed = TimelineQuerySchema.parse(q);
      const items = parsed.objectId ? listEventsForObject(parsed.objectId) : listEventsForObject(IDS.school);
      const all = parsed.kind?.length ? items.filter((item) => parsed.kind?.includes(item.kind)) : items;
      return paginate(all, parsed.cursor, parsed.limit ?? 50);
    }
    case 'listAdminAppeals': {
      const parsed = AppealQuerySchema.parse(q);
      return paginate(demoAppeals, parsed.cursor, parsed.limit ?? 50);
    }
    case 'getAdminAppeal': {
      const appeal = demoAppeals.find((item) => item.id === params.id);
      if (!appeal) {
        throw createApiError({ code: 'NOT_FOUND', message: 'Обращение не найдено', requestId });
      }
      return appeal;
    }
    case 'listAdminTasks': {
      const parsed = TaskQuerySchema.parse(q);
      return paginate(demoTasks, parsed.cursor, parsed.limit ?? 50);
    }
    case 'getAdminTask': {
      const task = demoTasks.find((item) => item.id === params.id);
      if (!task) {
        throw createApiError({ code: 'NOT_FOUND', message: 'Задача не найдена', requestId });
      }
      return task;
    }
    case 'createDevBotSession': {
      const parsed = CreateBotSessionRequestSchema.parse(body);
      const session = BotSessionSchema.parse({
        id: IDS.botSession,
        applicantId: parsed.applicantId,
        draftId: IDS.botDraft,
        version: 1,
        step: 'OBJECT',
        draft: { applicantId: parsed.applicantId, objectId: parsed.objectId ?? null, dataOrigin: 'DEMO' },
      });
      botSessions.set(session.id, session);
      return { session, simulatorLabel: 'Симулятор MAX' };
    }
    case 'postDevBotInput': {
      const session = botSessions.get(params.id ?? '');
      if (!session) {
        throw createApiError({ code: 'NOT_FOUND', message: 'Сессия симулятора не найдена', requestId });
      }
      const parsed = messenger.normalizeWebhook(body);
      BotInputSchema.parse(parsed);
      return {
        parsed,
        simulatorLabel: 'Симулятор MAX',
        note: 'Симулятор принял ввод по contracts v1. Движок advanceBot реализуется в F11 и не регистрирует обращение здесь.',
      };
    }
    default:
      throw featureNotAvailable(endpoint.feature, requestId);
  }
};
