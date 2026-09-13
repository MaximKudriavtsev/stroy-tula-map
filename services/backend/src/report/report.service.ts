import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';

const MAX_MESSAGES_URL = 'https://platform-api2.max.ru/messages';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly configService: ConfigService,
  ) {}

  findAll(isReplied?: boolean): Promise<Report[]> {
    return this.reportRepository.find({
      ...(isReplied !== undefined ? { where: { isReplied } } : {}),
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOneBy({ id });
    if (!report) {
      throw new NotFoundException(`Обращение с id "${id}" не найдено`);
    }
    return report;
  }

  async reply(id: string, text: string): Promise<{ ok: true }> {
    const replyText = text.trim();
    if (!replyText) {
      throw new BadRequestException('Текст ответа не может быть пустым');
    }

    const report = await this.findOne(id);
    const token = this.configService.get<string>('MAX_BOT_TOKEN')?.trim();
    if (!token) {
      throw new BadGatewayException('MAX_BOT_TOKEN не задан');
    }

    const url = new URL(MAX_MESSAGES_URL);
    url.searchParams.set('user_id', report.userId);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: replyText }),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send MAX reply for report ${id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadGatewayException(
        error instanceof Error
          ? error.message
          : 'Не удалось отправить ответ в MAX',
      );
    }

    if (!response.ok) {
      let message = `MAX вернул ${response.status}`;
      try {
        const body = (await response.json()) as { message?: string };
        if (typeof body.message === 'string' && body.message) {
          message = body.message;
        }
      } catch {
        // keep default
      }
      throw new BadGatewayException(message);
    }

    report.isReplied = true;
    await this.reportRepository.save(report);

    return { ok: true };
  }

  async createFromBot(
    userId: string,
    objectId: string,
    text: string,
  ): Promise<Report | null> {
    try {
      const report = this.reportRepository.create({
        userId,
        objectId,
        text,
      });
      return await this.reportRepository.save(report);
    } catch (error) {
      this.logger.error(
        `Failed to save report for user ${userId}, object ${objectId}`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }
}
