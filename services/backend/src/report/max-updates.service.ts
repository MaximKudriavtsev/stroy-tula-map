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

        this.logger.log('MAX POOLING URL: ' + url);
        this.logger.log('MAX POOLING TOKEN: ' + token);


        const response = await fetch(url, {
          headers: { Authorization: token },
          signal: this.abortController?.signal,
        });

        if (!response.ok) {
          this.logger.error(`MAX /updates failed: ${response.status}`);
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
          'MAX polling error',
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

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
