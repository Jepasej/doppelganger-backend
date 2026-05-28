import { Module } from '@nestjs/common';
import { CitizensController } from './citizens.controller';
import { CitizensService } from './citizens.service';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [FileStorageModule, RedisModule],
  controllers: [CitizensController],
  providers: [CitizensService],
})
export class CitizensModule {}
