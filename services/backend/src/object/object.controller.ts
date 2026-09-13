import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ObjectService } from './object.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';

@Controller('object')
export class ObjectController {
  constructor(private readonly objectService: ObjectService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createObjectDto: CreateObjectDto) {
    return this.objectService.create(createObjectDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  createMany(@Body() createObjectDtos: CreateObjectDto[]) {
    return this.objectService.createMany(createObjectDtos);
  }

  @Get()
  findAll() {
    return this.objectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.objectService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateObjectDto: UpdateObjectDto) {
    return this.objectService.update(id, updateObjectDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.objectService.remove(id);
  }
}
