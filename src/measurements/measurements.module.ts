import { Module } from '@nestjs/common';
import { MeasurementsController } from './measurements.controller';
import { MeasurementsService } from './measurements.service';
import { TcpListenerService } from '../tcp/tcp-listener.service';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [FileStorageModule, RedisModule],
  controllers: [MeasurementsController],
  providers: [MeasurementsService, TcpListenerService],
})
export class MeasurementsModule {}
