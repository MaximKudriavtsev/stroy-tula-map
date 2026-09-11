import {
  AppealPageSchema,
  AppealQuerySchema,
  AppealSchema,
  BotInputSchema,
  BotSessionInputResponseSchema,
  CreateBotSessionRequestSchema,
  CreateBotSessionResponseSchema,
  HealthLiveResponseSchema,
  HealthReadyResponseSchema,
  MapFeatureCollectionSchema,
  ObjectDetailSchema,
  ObjectDraftPageSchema,
  ObjectDraftSchema,
  ObjectEventPageSchema,
  ObjectQuerySchema,
  ObjectSummaryPageSchema,
  SessionResponseSchema,
  TaskPageSchema,
  TaskQuerySchema,
  TaskSchema,
  TimelineQuerySchema,
  catalogEndpoints,
  type Appeal,
  type AppealQuery,
  type BotInput,
  type BotSessionInputResponse,
  type CreateBotSessionRequest,
  type CreateBotSessionResponse,
  type HealthReadyResponse,
  type MapFeatureCollection,
  type ObjectDetail,
  type ObjectDraft,
  type ObjectEvent,
  type ObjectQuery,
  type ObjectSummary,
  type Page,
  type SessionResponse,
  type Task,
  type TaskQuery,
} from '@tula/contracts';
import { createHttp, getEndpointByOperationId, type CreateApiClientOptions, type InvokeArgs } from '../http.js';

export const GENERATED_CONTRACT_VERSION = '1.0.0';

export const generatedOperationIds = catalogEndpoints.map((endpoint) => endpoint.operationId);

export const createGeneratedClient = (options: CreateApiClientOptions) => {
  const http = createHttp(options);
  const invoke = async (operationId: string, args?: InvokeArgs): Promise<unknown> =>
    http(getEndpointByOperationId(operationId), args);

  return {
    invoke,
    healthLive: async (): Promise<{ status: 'ok' }> =>
      HealthLiveResponseSchema.parse(await http(getEndpointByOperationId('healthLive'))),
    healthReady: async (): Promise<HealthReadyResponse> =>
      HealthReadyResponseSchema.parse(await http(getEndpointByOperationId('healthReady'))),
    me: async (): Promise<SessionResponse> =>
      SessionResponseSchema.parse(await http(getEndpointByOperationId('me'))),
    listPublicObjects: async (query: ObjectQuery = {}): Promise<Page<ObjectSummary>> =>
      ObjectSummaryPageSchema.parse(
        await http(getEndpointByOperationId('listPublicObjects'), {
          query: ObjectQuerySchema.parse(query) as Record<string, unknown>,
        }),
      ),
    getPublicMap: async (query: ObjectQuery = {}): Promise<MapFeatureCollection> =>
      MapFeatureCollectionSchema.parse(
        await http(getEndpointByOperationId('getPublicMap'), {
          query: ObjectQuerySchema.parse(query) as Record<string, unknown>,
        }),
      ),
    getPublicObject: async (id: string, query: Pick<ObjectQuery, 'at' | 'dataOrigin'> = {}): Promise<ObjectDetail> =>
      ObjectDetailSchema.parse(
        await http(getEndpointByOperationId('getPublicObject'), {
          params: { id },
          query: query as Record<string, unknown>,
        }),
      ),
    listAdminObjects: async (query: ObjectQuery = {}): Promise<Page<ObjectDraft>> =>
      ObjectDraftPageSchema.parse(
        await http(getEndpointByOperationId('listAdminObjects'), {
          query: ObjectQuerySchema.parse(query) as Record<string, unknown>,
        }),
      ),
    getAdminObject: async (id: string): Promise<ObjectDraft> =>
      ObjectDraftSchema.parse(
        await http(getEndpointByOperationId('getAdminObject'), { params: { id } }),
      ),
    listPublicObjectEvents: async (
      id: string,
      query: Omit<ObjectQuery, 'type' | 'status'> = {},
    ): Promise<Page<ObjectEvent>> =>
      ObjectEventPageSchema.parse(
        await http(getEndpointByOperationId('listPublicObjectEvents'), {
          params: { id },
          query: TimelineQuerySchema.omit({ objectId: true }).parse(query) as Record<string, unknown>,
        }),
      ),
    listPublicTimeline: async (query = {}): Promise<Page<ObjectEvent>> =>
      ObjectEventPageSchema.parse(
        await http(getEndpointByOperationId('listPublicTimeline'), {
          query: TimelineQuerySchema.parse(query) as Record<string, unknown>,
        }),
      ),
    listAdminAppeals: async (query: AppealQuery = {}): Promise<Page<Appeal>> =>
      AppealPageSchema.parse(
        await http(getEndpointByOperationId('listAdminAppeals'), {
          query: AppealQuerySchema.parse(query) as Record<string, unknown>,
        }),
      ),
    getAdminAppeal: async (id: string): Promise<Appeal> =>
      AppealSchema.parse(await http(getEndpointByOperationId('getAdminAppeal'), { params: { id } })),
    listAdminTasks: async (query: TaskQuery = {}): Promise<Page<Task>> =>
      TaskPageSchema.parse(
        await http(getEndpointByOperationId('listAdminTasks'), {
          query: TaskQuerySchema.parse(query) as Record<string, unknown>,
        }),
      ),
    getAdminTask: async (id: string): Promise<Task> =>
      TaskSchema.parse(await http(getEndpointByOperationId('getAdminTask'), { params: { id } })),
    createDevBotSession: async (body: CreateBotSessionRequest): Promise<CreateBotSessionResponse> =>
      CreateBotSessionResponseSchema.parse(
        await http(getEndpointByOperationId('createDevBotSession'), {
          body: CreateBotSessionRequestSchema.parse(body),
        }),
      ),
    postDevBotInput: async (id: string, body: BotInput): Promise<BotSessionInputResponse> =>
      BotSessionInputResponseSchema.parse(
        await http(getEndpointByOperationId('postDevBotInput'), {
          params: { id },
          body: BotInputSchema.parse(body),
        }),
      ),
  };
};

export type GeneratedApiClient = ReturnType<typeof createGeneratedClient>;
