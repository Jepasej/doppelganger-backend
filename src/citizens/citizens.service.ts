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

/*
  // TODO 12 det er okay med dummy dataen i den anden metode, men her skal vi maaske have noget database kald ind?
  // Vi kan starte med nogle databasekald som skriver maalinger TIL databasen, eller simpelthen skrive de noedvendige maalinger ind i main.ts
  // Jeg haelder mest til mulighed 2!
  // Ved naermere eftertanke skal vi maaske ogsaa skrive de to ovenstaaende borgere ind i main.ts.
  findMeasurements(citizenId: string) {
    return [
      {
        id: '1',
        citizenId,
        citizenName: citizenId === '1' ? 'Anna Jensen' : 'Peter Hansen',
        citizenPhoneNumber: citizenId === '1' ? '12345678' : '87654321',
        pulse: 82,
        spo2: 97.5,
        createdAt: new Date().toISOString(),
        isCritical: false,
      },
    ];
  }
}*/
