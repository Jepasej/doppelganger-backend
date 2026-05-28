// Handles citizen data through file storage and Redis cache.

import { Injectable } from '@nestjs/common';
import { FileStorageService } from '../file-storage/file-storage.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CitizensService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly redisService: RedisService,
  ) {}

  // Returns all citizens.
  // First checks Redis cache. If cache is empty, it reads from JSON file.
  async findAll() {
    const cachedCitizens = await this.redisService.getCachedCitizens();

    if (cachedCitizens) {
      console.log('Citizens loaded from Redis cache');

      return cachedCitizens;
    }

    console.log('Citizens loaded from JSON file');

    const citizens = await this.fileStorageService.getCitizens();

    await this.redisService.cacheCitizens(citizens);

    return citizens;
  }

  // Returns measurements for one citizen from the JSON file.
  async findMeasurements(citizenId: string) {
    return this.fileStorageService.getMeasurementsByCitizenId(citizenId);
  }
}
