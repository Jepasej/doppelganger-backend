// Handles Redis cache and Redis LIST operations.

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { Citizen, Measurement } from '../file-storage/file-storage.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  private readonly CITIZENS_CACHE_KEY = 'citizens:all';
  private readonly LATEST_MEASUREMENTS_KEY = 'measurements:latest';

  constructor() {
    // Creates a Redis client connected to the local Redis server.
    this.redisClient = createClient({
      url: 'redis://localhost:6379',
    });

    // Logs Redis connection errors.
    this.redisClient.on('error', (error) => {
      console.error('Redis error:', error);
    });
  }

  // Connects to Redis when the NestJS module starts.
  async onModuleInit() {
    await this.redisClient.connect();

    console.log('Connected to Redis');
  }

  // Closes Redis connection when the application shuts down.
  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  // Reads cached citizens using Redis GET.
  async getCachedCitizens(): Promise<Citizen[] | null> {
    const cachedCitizens = await this.redisClient.get(this.CITIZENS_CACHE_KEY);

    if (!cachedCitizens) {
      return null;
    }

    return JSON.parse(cachedCitizens) as Citizen[];
  }

  // Stores citizens in Redis cache using SET with expiration time.
  async cacheCitizens(citizens: Citizen[]): Promise<void> {
    await this.redisClient.set(
      this.CITIZENS_CACHE_KEY,
      JSON.stringify(citizens),
      {
        EX: 300,
      },
    );
  }

  // Stores the latest measurements in a Redis LIST.
  async addLatestMeasurement(measurement: Measurement): Promise<void> {
    await this.redisClient.lPush(
      this.LATEST_MEASUREMENTS_KEY,
      JSON.stringify(measurement),
    );

    // Keeps only the latest 20 measurements.
    await this.redisClient.lTrim(this.LATEST_MEASUREMENTS_KEY, 0, 19);
  }

  // Reads the latest measurements from Redis LIST.
  async getLatestMeasurements(): Promise<Measurement[]> {
    const data = await this.redisClient.lRange(
      this.LATEST_MEASUREMENTS_KEY,
      0,
      19,
    );

    return data.map((item) => JSON.parse(item) as Measurement);
  }
}
