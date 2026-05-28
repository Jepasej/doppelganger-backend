// Root module for the NestJS application.

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { CitizensModule } from './citizens/citizens.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { RedisModule } from './redis/redis.module';
import { FileStorageModule } from './file-storage/file-storage.module';

@Module({
  imports: [
    AuthenticationModule,
    CitizensModule,
    MeasurementsModule,
    RedisModule,
    FileStorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
