import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MaxUpdatesService } from './max-updates.service';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Report } from './entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report]), AuthModule],
  controllers: [ReportController],
  providers: [ReportService, MaxUpdatesService],
  exports: [TypeOrmModule, ReportService],
})
export class ReportModule {}
