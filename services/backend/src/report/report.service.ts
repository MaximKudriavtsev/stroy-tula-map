import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  findAll(): Promise<Report[]> {
    return this.reportRepository.find({
      order: { createdAt: 'DESC' },
    });
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
