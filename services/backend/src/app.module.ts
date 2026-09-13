import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminUserModule } from './admin-user/admin-user.module';
import { AdminUser } from './admin-user/entities/admin-user.entity';
import { AuthModule } from './auth/auth.module';
import { ObjectModule } from './object/object.module';
import { ObjectEntity } from './object/entities/object.entity';
import { ReportModule } from './report/report.module';
import { Report } from './report/entities/report.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [ObjectEntity, AdminUser, Report],
        synchronize: false,
      }),
    }),
    ObjectModule,
    AdminUserModule,
    AuthModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
