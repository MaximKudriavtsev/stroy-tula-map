import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ObjectService } from './object.service';
import { ObjectController } from './object.controller';
import { ObjectEntity } from './entities/object.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectEntity]), AuthModule],
  controllers: [ObjectController],
  providers: [ObjectService],
})
export class ObjectModule {}
