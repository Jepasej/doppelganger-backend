// Redis module responsible for exposing RedisService
// to the rest of the NestJS application.

import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService],

  // Exporting the service makes it available inside other modules
  exports: [RedisService],
})
export class RedisModule {}
