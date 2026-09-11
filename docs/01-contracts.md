# Общие контракты v1

Статус: предлагаемый контракт для нового репозитория. F00 превращает этот документ в схемы, OpenAPI, fixtures и типизированный клиент. После проверки команда фиксирует версию v1; несовместимые изменения согласуются с интегратором.

## Базовые типы

```ts
type UUID = string;
type DataOrigin = 'REAL' | 'DEMO';
type ConstructionStatus = 'UNKNOWN' | 'PLANNED' | 'IN_PROGRESS' | 'SUSPENDED' | 'COMMISSIONED';
type ObjectType = 'SCHOOL' | 'KINDERGARTEN' | 'MEDICAL' | 'SPORT' | 'CULTURE' |
  'HOUSING' | 'BOILER' | 'WATER' | 'WASTEWATER' | 'LINEAR' | 'OTHER';
type Role = 'ADMIN' | 'OBJECT_EDITOR' | 'APPEAL_OPERATOR' | 'EXECUTOR';
type PublicationState = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type ModelQuality = 'GENERIC' | 'ADAPTED' | 'VERIFIED';
type EvidenceKind = 'FACT' | 'PLAN';
interface DateRange {
  lower: string; // календарная дата YYYY-MM-DD
  upper: string; // включительно; у точного дня lower === upper
  precision: 'DAY' | 'MONTH' | 'YEAR';
}
interface SourceRef {
  id: UUID; label: string; url: string | null;
  documentId: UUID | null; asOf: string | null;
}
interface ApiError {
  code: string; message: string; requestId: string;
  fieldErrors?: Record<string, string[]>;
}
interface Page<T> { items: T[]; nextCursor: string | null; total: number; }
interface Actor {
  id: UUID; roles: Role[];
  scope: { allMunicipalities: boolean; municipalityIds: UUID[] };
}
```

Схемы выполняют runtime-валидацию. UUID валидируется; TypeScript alias сам по себе недостаточен. Числа проверяются на finite. День хранится как date, служебный момент — UTC timestamp; бизнес-календарь Europe/Moscow.
Координаты GeoJSON — [longitude, latitude], CRS WGS84 / EPSG:4326. Метры вычисляются через geography или подходящую метрическую проекцию, а не расстоянием между градусами.

## Проекты, объекты и публикация

```ts
interface Project {
  id: UUID; externalId: string | null; name: string;
  dataOrigin: DataOrigin; source: SourceRef;
}
interface GeometryRecord {
  geojson: GeoJSON.Geometry; verified: boolean;
  source: SourceRef; accuracyMeters: number | null;
}
interface ObjectSummary {
  id: UUID; projectId: UUID; name: string; type: ObjectType;
  municipalityId: UUID | null; address: string | null;
  status: ConstructionStatus; progressPercent: number | null;
  anchor: [number, number] | null; publishedRevisionId: UUID;
  dataOrigin: DataOrigin; modelQuality: ModelQuality | null;
}
interface ObjectDetail extends ObjectSummary {
  ownership: string | null; customer: string | null; contractor: string | null;
  plannedStart: DateRange | null; plannedFinish: DateRange | null;
  geometries: GeometryRecord[]; source: SourceRef;
  media: MediaRef[]; model: ModelDescriptor | null;
  observationAsOf: string | null;
}
interface ObjectDraft {
  objectId: UUID; revisionId: UUID; version: number;
  publicationState: PublicationState;
  fields: Omit<ObjectDetail, 'publishedRevisionId'>;
}
interface ObjectQuery {
  q?: string; type?: ObjectType[]; status?: ConstructionStatus[];
  municipalityId?: UUID[]; at?: string; from?: string; to?: string;
  periodField?: 'COMMISSIONED' | 'PLANNED_FINISH';
  bbox?: [number, number, number, number];
  dataOrigin?: DataOrigin; cursor?: string; limit?: number;
}
```

GeoJSON namespace берётся из зафиксированного пакета типов; F00 включает его в схемы.
at задаёт срез состояния на день; from/to с periodField фильтрует события выбранного вида и не меняет значение at.
Без at используется последняя опубликованная наблюдаемая информация; с at — исторический resolver F08. До готовности F08 API с at возвращает FEATURE_NOT_AVAILABLE, а не игнорирует параметр.
PUBLISHED — состояние доступной редакции. Можно иметь опубликованную редакцию и новый DRAFT одновременно. Публикация атомарно переключает publishedRevisionId.
Публикуется полный набор: поля, ссылки на одобренные медиа, события, показатели и модель. Их новые черновые версии не протекают через публичные дочерние API.
Конкурентная правка использует If-Match с версией: устаревшая версия → 409 VERSION_CONFLICT.
В v1 неизвестные координаты и статус допустимы; обязательны название, тип, проект, dataOrigin и источник. Неподтверждённая геометрия не публикуется точным маркером; редактор исправляет её либо оставляет объект без точки.

## Медиа и 3D

```ts
interface MediaRef {
  id: UUID; kind: 'PHOTO' | 'DOCUMENT' | 'MODEL' | 'VIDEO';
  access: 'PUBLIC' | 'PRIVATE'; state: 'PENDING' | 'READY' | 'REJECTED';
  url: string | null; mime: string; bytes: number; caption: string | null;
  capturedAt: DateRange | null; source: SourceRef | null;
}
interface ModelDescriptor {
  id: UUID; quality: ModelQuality;
  source: 'PROCEDURAL' | 'GLB'; objectType: ObjectType;
  assetId: UUID | null; stage: ConstructionStatus;
  scale: number; rotationDeg: number; altitudeMeters: number;
  dimensionsMeters: [number, number, number] | null;
  dimensionsVerified: boolean;
}
```

Типовые размеры — параметры иллюстрации, а не измеренные размеры здания.
Asset становится READY только после серверной проверки. Закрытые материалы выдаются по короткоживущим URL после проверки прав. MODEL URL принадлежит одобренному файловому сервису; произвольные внешние URL запрещены.
Видеофайлы VIDEO зарезервированы для F23; F02 принимает их только при включённой конфигурации разрешённых типов.
Удаление приватного EXIF не меняет отдельно подтверждённое пользователем место проблемы.

## Runtime карты

```ts
interface MapRuntime {
  project(point: [number, number]): { x: number; y: number; visible: boolean };
  flyToObject(id: UUID, options?: { rememberView?: boolean }): Promise<void>;
  restoreView(): Promise<void>;
  getViewport(): { width: number; height: number; padding: { top: number; right: number; bottom: number; left: number } };
  getVisibleObjectIds(): UUID[];
  subscribe(event: 'moveend' | 'selection' | 'destroy', fn: () => void): () => void;
  addExtension(extension: MapExtension): () => void;
}
interface MapExtension {
  id: string;
  mount(context: { map: import('maplibre-gl').Map; runtime: MapRuntime }): () => void;
}
interface GenericModelFactory {
  create(input: { type: ObjectType; stage: ConstructionStatus; quality: 'LOW' | 'NORMAL' }): import('three').Group;
  dispose(group: import('three').Group): void;
}
```

F05 реализует MapRuntime. F07 экспортирует GenericModelFactory и MapExtension; F17/F18 используют runtime без создания второй карты.
По завершении destroy все подписки и GPU-ресурсы освобождаются. Отмена перелёта пользователем завершает Promise контролируемой ошибкой NAVIGATION_CANCELLED.

## События и показатели

```ts
interface ObjectEvent {
  id: UUID; objectId: UUID; revisionId: UUID;
  kind: EvidenceKind; effectiveDate: DateRange;
  recordedAt: string; status: ConstructionStatus;
  progressPercent: number | null; source: SourceRef;
  supersedesEventId: UUID | null;
}
interface TemporalState {
  status: ConstructionStatus; progressPercent: number | null;
  eventId: UUID | null; uncertain: boolean;
}
function resolveObjectState(events: ObjectEvent[], at: string): TemporalState;
interface MetricInput {
  metricCode: string; unit: string; territoryId: UUID;
  baseline: number | null; added: number | null; retired: number | null;
  denominator: number | null; per: number | null;
}
interface MetricResult {
  after: number | null; netAdded: number | null;
  provision: number | null; reason: string | null;
}
function calculateBenefit(input: MetricInput): MetricResult;
```

F08 реализует resolver, F09 калькулятор. Вход калькулятора предварительно формируется из опубликованных сопоставимых наблюдений с источниками и непересекающимся учётом событий.
Неполная дата считается подтверждённо наступившей, только когда upper <= at. Когда lower <= at < upper, состояние помечается uncertain; более ранний подтверждённый статус сохраняется.
Выбор факта исключает PLAN и superseded записи. Конфликт событий на одну дату не разрешается произвольным порядком UUID: публикация требует разрешения конфликта.
after вычисляется, только если baseline, added и retired известны. Нельзя подменять неизвестное выбытие нулём. netAdded требует added и retired; provision требует after, положительный denominator и известный per.
Места, койки, посещения/смену, квартиры, МВт и м³/сутки — разные metricCode/unit. Число жителей не выводится автоматически из квартир.
Рост мощности не называется ростом качества услуги.

## Обращения, задачи и разрешения

```ts
type AppealStatus = 'REGISTERED' | 'IN_REVIEW' | 'WAITING_APPLICANT' | 'RESPONSE_PREPARED' | 'ANSWERED';
type TaskStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_INFORMATION' | 'ON_REVIEW' | 'DONE';
interface ConfirmedDraft {
  draftId: UUID; version: number; applicantId: UUID; objectId: UUID | null;
  category: string; description: string; photoAssetIds: UUID[];
  location: { point: [number, number] | null; address: string | null };
  occurredAt: DateRange; dataOrigin: DataOrigin;
}
interface Appeal {
  id: UUID; number: string; applicantId: UUID; objectId: UUID | null;
  status: AppealStatus; taskId: UUID | null; createdAt: string; version: number;
}
interface Task {
  id: UUID; title: string; objectId: UUID | null; municipalityId: UUID | null;
  status: TaskStatus; assigneeId: UUID | null; dueAt: string | null;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'; version: number;
  mergedIntoTaskId: UUID | null;
}
interface AccessPolicy {
  assert(actor: Actor, action: string, resource: { municipalityId: UUID | null; assigneeId?: UUID | null }): void;
}
interface AppealRegistration {
  register(draft: ConfirmedDraft, idempotencyKey: string): Promise<Appeal>;
}
interface NotificationRequest {
  id: UUID; appealId: UUID; kind: 'REGISTRATION' | 'CLARIFICATION' | 'STATUS' | 'ANSWER';
  recipientApplicantId: UUID; text: string; assetIds: UUID[];
}
```

AccessPolicy реализуется F01; конкретный action регистрируется в таблице прав там же. Неизвестный action запрещён.
MVP — одна активная Task на Appeal. Link history неизменяема; перенос разрешает оператор с причиной. При объединении source Task сохраняется с mergedIntoTaskId; это не новый TaskStatus, записи не удаляются.
NEW→ASSIGNED требует assignee; ASSIGNED→IN_PROGRESS; IN_PROGRESS→ON_REVIEW требует результат и фото; ON_REVIEW→DONE выполняет оператор после проверки. Оператор может вернуть ON_REVIEW→IN_PROGRESS и DONE→IN_PROGRESS с причиной. Ожидание информации имеет сохраняемый предыдущий статус.
DONE не означает ANSWERED для всех обращений. ANSWERED ставится при подтверждённом принятии конкретного ответа API провайдера; интерфейс пишет «Отправлено в MAX», без утверждения о прочтении.
Исполнитель видит назначенные задачи в своей области и необходимые материалы, но не контакты заявителей и другие обращения произвольно.
Номер обращения выдаёт БД с unique constraint; idempotencyKey подтверждения связан с draftId + version, а не только с нажатием кнопки.

## Бот, входящие события, исходящие уведомления

```ts
type BotStep = 'OBJECT' | 'CATEGORY' | 'DESCRIPTION' | 'PHOTO' | 'LOCATION' | 'OCCURRED_AT' | 'REVIEW';
interface BotSession {
  id: UUID; applicantId: UUID; draftId: UUID; version: number;
  step: BotStep; draft: Partial<ConfirmedDraft>;
}
interface BotInput {
  key: string; kind: 'START' | 'TEXT' | 'PHOTO' | 'LOCATION' | 'CALLBACK';
  value: unknown; receivedAt: string;
}
interface BotEffect { kind: 'SEND' | 'REGISTER'; payload: unknown; }
interface BotAdvance { session: BotSession; effects: BotEffect[]; }
function advanceBot(session: BotSession, input: BotInput): BotAdvance;
interface MessengerAdapter {
  normalizeWebhook(payload: unknown): BotInput;
  send(request: NotificationRequest): Promise<{
    outcome: 'ACCEPTED' | 'RETRYABLE_FAILURE' | 'PERMANENT_FAILURE' | 'UNKNOWN';
    providerMessageId: string | null;
  }>;
}
```

F00 фиксирует discriminated unions для value/payload под каждую команду; unknown на границе не позволяет пропустить runtime-валидацию.
F11 реализует advanceBot, F12 — MAX adapter. Сериализация обработки выполняется по bot + user/session через транзакцию/блокировку с optimistic version.
Дедупликация входа использует реально доступные в MAX идентификаторы message/callback. Не предполагай существование универсального update_id. Для события без стабильного ID используются задокументированные семантический ключ и срок хранения; именно повтор регистрации защищает уникальность draftId/version.
Webhook: проверка secret → durable inbox commit → HTTP 200 → асинхронная обработка. При ошибке durable commit возвращается ошибка, не ложный 200.
Outbox хранится в PostgreSQL в той же транзакции, что бизнес-изменение. Redis не единственный источник ожидающих отправок.
После сетевого тайм-аута отправки исход UNKNOWN. Не обещай exactly-once внешнего сообщения без поддержки провайдера: повтор может дублировать текст. Покажи неопределённость оператору; применяй ключ провайдера только если подтверждён документацией.

## LLM и объяснения

```ts
interface AnalysisResult {
  summary: string;
  competence: { value: 'IN_SCOPE' | 'OUT_OF_SCOPE' | 'UNKNOWN'; reason: string };
  spam: { suspected: boolean; reason: string };
  category: string | null; missingFields: string[];
  urgencySignals: Array<{ code: string; quote: string; reason: string }>;
  similarAppealIds: UUID[];
  suggestedTaskId: UUID | null;
  reasoning: string; modelVersion: string; rulesVersion: string;
}
interface AnalysisProvider {
  analyze(input: { appealId: UUID; text: string; allowedCandidateIds: UUID[]; rulesVersion: string }): Promise<AnalysisResult>;
}
```

Допускаются только ID переданных кандидатов и категории справочника. quote сверяется с исходным текстом. Статус анализа QUEUED/RUNNING/READY/FAILED/OFF хранится отдельно от статуса обращения.
Идемпотентность анализа: appealId + версия данных + rulesVersion + modelVersion. Старый результат не перезаписывает решение оператора без обозначения новой версии.

## API и общие соглашения

Префикс /api/v1. Успех JSON с runtime schema; ошибки ApiError. GET списков — cursor pagination, limit по умолчанию 50, максимум 200. Публичные запросы по умолчанию dataOrigin=REAL; режим DEMO явный и помеченный.
Сессия сотрудника — HttpOnly Secure cookie в production, SameSite=Lax; изменяющие cookie-auth запросы защищены CSRF. Разрешения проверяются на API и при выдаче private files. MAX secret проверяется независимо от CSRF.
Общие пути:

| Группа | Маршруты |
|---|---|
| Auth | POST /auth/login; POST /auth/logout; GET /auth/me |
| Objects | GET /public/objects; GET /public/map; GET /public/objects/{id}; GET /admin/objects; GET /admin/objects/{id}; POST /admin/objects; PATCH /admin/objects/{id}; POST /admin/objects/{id}/publish; POST /admin/objects/{id}/archive |
| Imports | POST /admin/imports; GET /admin/imports/{id}; POST /admin/imports/{id}/commit |
| Media | POST /admin/assets; POST /admin/assets/{id}/complete; GET /admin/assets/{id}/access |
| Timeline | GET /public/objects/{id}/events; GET /public/timeline; POST /admin/objects/{id}/events; PATCH /admin/objects/{id}/events/{eventId} |
| Metrics | GET /public/metrics; GET /public/objects/{id}/benefits; POST /admin/objects/{id}/metrics; PATCH /admin/objects/{id}/metrics/{metricId} |
| Workflow | GET /admin/appeals; GET /admin/appeals/{id}; POST /admin/appeals/{id}/replies; GET /admin/tasks; GET /admin/tasks/{id}; POST /admin/tasks; PATCH /admin/tasks/{id}; POST /admin/tasks/{id}/transitions; POST /admin/tasks/{id}/appeals; POST /admin/tasks/{id}/comments |
| Bot | POST /integrations/max/webhook; POST /dev/bot/sessions; POST /dev/bot/sessions/{id}/inputs (только development и защищённый demo) |
| Analysis | POST /admin/appeals/{id}/analysis; GET /admin/appeals/{id}/analysis; POST /admin/appeals/{id}/analysis/review |
| Grouping | GET /admin/appeals/{id}/candidates; GET /admin/tasks/{id}/priority; POST /admin/tasks/{id}/priority; POST /admin/tasks/{id}/merge |
| Extras | GET /public/surveys; GET /public/municipalities/{id}/summary; GET /public/objects/{id}/isochrones; GET /public/objects/{id}/contracts; GET /public/objects/{id}/cameras |
| POS | GET /admin/appeals/{id}/pos; POST /admin/appeals/{id}/pos/export; POST /integrations/pos/webhook |
| Confirmation | POST /internal/resident-confirmations (вызов доверенного bot-модуля, не публичный anonymous endpoint) |
| Operations | GET /health/live; GET /health/ready; GET /admin/integrations; POST /admin/notifications/{id}/retry |

F00 описывает запросы и ответы всех маршрутов в OpenAPI до выдачи зависимых задач; это проектирование контрактов, не требование реализовать все endpoints в foundation.
Нереализованный endpoint отвечает явным 501 FEATURE_NOT_AVAILABLE в development, не фиктивными успешными данными. В production незапущенные возможности скрываются из UI.
