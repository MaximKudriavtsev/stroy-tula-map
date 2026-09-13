import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReportService } from './report.service';

const MAX_UPDATES_URL = 'https://platform-api2.max.ru/updates';
const POLL_TIMEOUT_MS = 30;
const ERROR_BODY_LIMIT = 500;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MaxUser = {
  user_id?: number;
  is_bot?: boolean;
};

type MaxUpdate = {
  update_type?: string;
  payload?: string | null;
  user?: MaxUser;
  message?: {
    sender?: MaxUser;
    body?: {
      text?: string;
    };
  };
};

type MaxUpdatesResponse = {
  updates?: MaxUpdate[];
  marker?: number | null;
};

type ErrorLike = Error & {
  code?: string;
  errno?: number;
  syscall?: string;
  errors?: unknown[];
};

const describeErrorNode = (error: ErrorLike): string => {
  const details = [`${error.name}: ${error.message}`];
  if (error.code) {
    details.push(`code=${error.code}`);
  }
  if (error.errno !== undefined) {
    details.push(`errno=${error.errno}`);
  }
  if (error.syscall) {
    details.push(`syscall=${error.syscall}`);
  }
  return details.join(' ');
};

// `fetch` прячет реальную причину (TLS, DNS, отказ соединения) в цепочке cause.
const describeError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const chain: string[] = [];
  let current: Error | undefined = error;

  while (current && chain.length < 5) {
    const node = current as ErrorLike;
    chain.push(describeErrorNode(node));

    const aggregated = node.errors?.filter(
      (item): item is Error => item instanceof Error,
    );
    if (aggregated?.length) {
      chain.push(
        aggregated.map((item) => describeErrorNode(item)).join(' | '),
      );
    }

    current = node.cause instanceof Error ? node.cause : undefined;
  }

  return chain.join(' <- caused by ');
};

@Injectable()
export class MaxUpdatesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MaxUpdatesService.name);
  private readonly objectByUserId = new Map<string, string>();
  private abortController: AbortController | null = null;
  private polling = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly reportService: ReportService,
  ) {}

  onModuleInit() {
    const token = this.configService.get<string>('MAX_BOT_TOKEN')?.trim();
    if (!token) {
      this.logger.warn('MAX_BOT_TOKEN is empty — MAX polling is disabled');
      return;
    }

    this.logger.log(
      `MAX polling started: ${MAX_UPDATES_URL} (NODE_EXTRA_CA_CERTS=${
        process.env.NODE_EXTRA_CA_CERTS ?? 'not set'
      })`,
    );

    this.polling = true;
    this.abortController = new AbortController();
    void this.pollLoop(token);
  }

  onModuleDestroy() {
    this.polling = false;
    this.abortController?.abort();
  }

  rememberObjectContext(userId: string, objectId: string) {
    this.objectByUserId.set(userId, objectId);
  }

  private async pollLoop(token: string) {
    let marker: number | undefined;

    while (this.polling) {
      try {
        const url = new URL(MAX_UPDATES_URL);
        url.searchParams.set('timeout', String(POLL_TIMEOUT_MS));
        url.searchParams.set('types', 'bot_started,message_created');
        if (marker !== undefined) {
          url.searchParams.set('marker', String(marker));
        }

        this.logger.debug(`MAX polling request: ${url.toString()}`);

        const response = await fetch(url, {
          headers: { Authorization: token },
          signal: this.abortController?.signal,
        });

        if (!response.ok) {
          const errorBody = await this.readErrorBody(response);
          this.logger.error(
            `MAX /updates failed: ${response.status} ${response.statusText} body=${errorBody}`,
          );
          await this.delay(3000);
          continue;
        }

        const body = (await response.json()) as MaxUpdatesResponse;
        if (typeof body.marker === 'number') {
          marker = body.marker;
        }

        for (const update of body.updates ?? []) {
          await this.handleUpdate(update);
        }
      } catch (error) {
        if (!this.polling) {
          return;
        }
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        this.logger.error(
          `MAX /updates request failed: ${describeError(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
        await this.delay(3000);
      }
    }
  }

  private async handleUpdate(update: MaxUpdate) {
    if (update.update_type === 'bot_started') {
      const userId = update.user?.user_id;
      const payload = update.payload?.trim() ?? '';
      if (userId == null || !UUID_RE.test(payload)) {
        return;
      }
      this.rememberObjectContext(String(userId), payload);
      this.logger.log(`Stored object context ${payload} for user ${userId}`);
      return;
    }

    if (update.update_type !== 'message_created') {
      return;
    }

    const sender = update.message?.sender;
    if (!sender || sender.is_bot || sender.user_id == null) {
      return;
    }

    const text = update.message?.body?.text?.trim() ?? '';
    if (!text) {
      return;
    }

    const userId = String(sender.user_id);
    const objectId = this.objectByUserId.get(userId);
    if (!objectId) {
      this.logger.warn(`No object context for MAX user ${userId}`);
      return;
    }

    const saved = await this.reportService.createFromBot(userId, objectId, text);
    if (saved) {
      this.logger.log(`Saved report ${saved.id} from user ${userId}`);
    }
  }

  private async readErrorBody(response: Response): Promise<string> {
    try {
      const text = await response.text();
      return text.trim().slice(0, ERROR_BODY_LIMIT) || '<empty>';
    } catch (error) {
      return `<unreadable: ${describeError(error)}>`;
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
