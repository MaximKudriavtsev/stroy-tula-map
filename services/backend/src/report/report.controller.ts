import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReplyReportDto } from './dto/reply-report.dto';
import { ReportService } from './report.service';

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  findAll() {
    return this.reportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @Post(':id/reply')
  reply(@Param('id') id: string, @Body() body: ReplyReportDto) {
    return this.reportService.reply(id, body.text ?? '');
  }
}
