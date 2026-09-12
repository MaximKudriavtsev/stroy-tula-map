import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectService } from './object.service';
import { ObjectController } from './object.controller';
import { ObjectEntity } from './entities/object.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectEntity])],
  controllers: [ObjectController],
  providers: [ObjectService],
})
export class ObjectModule {}
