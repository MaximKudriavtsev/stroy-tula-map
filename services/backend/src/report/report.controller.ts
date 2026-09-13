import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReplyReportDto } from './dto/reply-report.dto';
import { ReportService } from './report.service';

function parseIsReplied(value?: string): boolean | undefined {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  findAll(@Query('isReplied') isReplied?: string) {
    return this.reportService.findAll(parseIsReplied(isReplied));
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
