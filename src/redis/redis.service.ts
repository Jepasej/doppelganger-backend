// Central Redis service for the application.
// Handles:
// - caching
// - Redis collections
// - Redis streams
// - citizen data
// - measurement storage

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  private readonly CITIZEN_KEY = 'citizen:1';
  private readonly CITIZENS_CACHE_KEY = 'citizens:all';
  private readonly MEASUREMENTS_KEY = 'measurements:citizen:1';
  private readonly MEASUREMENTS_STREAM_KEY = 'measurements:stream';

  constructor() {
    // Creates a Redis client that connects to the local Redis server.
    this.redisClient = createClient({
      url: 'redis://localhost:6379',
    });

    // Logs Redis errors so connection problems are easier to debug.
    this.redisClient.on('error', (error) => {
      console.error('Redis error:', error);
    });
  }

  // Connects to Redis when the NestJS module starts.
  async onModuleInit() {
    await this.redisClient.connect();
    console.log('Connected to Redis');

    await this.seedMockCitizen();
  }

  // Closes the Redis connection when the application shuts down.
  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  // Inserts one mock citizen into Redis.
  // HASH is used because a citizen has multiple fields.
  private async seedMockCitizen() {
    await this.redisClient.hSet(this.CITIZEN_KEY, {
      id: '1',
      fullName: 'Anna Jensen',
      address: 'Hovedgaden 12',
      phoneNumber: '12345678',
    });
  }

  // Gets the mock citizen from Redis HASH.
  async getCitizen() {
    return this.redisClient.hGetAll(this.CITIZEN_KEY);
  }

  // Gets all citizens.
  // This demonstrates cache-aside using GET, SET and expiration time.
  async getAllCitizens() {
    const cachedCitizens = await this.redisClient.get(this.CITIZENS_CACHE_KEY);

    if (cachedCitizens) {
      console.log('Citizens loaded from Redis cache');
      return JSON.parse(cachedCitizens);
    }

    console.log('Citizens loaded from Redis HASH');

    const citizen = await this.getCitizen();
    const citizens = [citizen];

    // Stores a temporary cache copy for 5 minutes.
    // The original citizen HASH is not deleted.
    await this.redisClient.set(
      this.CITIZENS_CACHE_KEY,
      JSON.stringify(citizens),
      {
        EX: 300,
      },
    );

    return citizens;
  }

  // Stores a measurement in a Redis LIST.
  // LIST is used for historical measurements.
  async addMeasurement(measurement: object) {
    await this.redisClient.lPush(
      this.MEASUREMENTS_KEY,
      JSON.stringify(measurement),
    );

    // Keeps only the latest 50 measurements.
    // This prevents unlimited memory growth.
    await this.redisClient.lTrim(this.MEASUREMENTS_KEY, 0, 49);
  }

  // Gets historical measurements from Redis LIST.
  async getMeasurements() {
    const measurements = await this.redisClient.lRange(
      this.MEASUREMENTS_KEY,
      0,
      49,
    );

    return measurements.map((measurement) => JSON.parse(measurement));
  }

  // Writes a measurement event to Redis Stream.
  // Streams are useful for event-based sensor data.
  async addMeasurementToStream(measurement: {
    citizenId: string;
    pulse: number;
    spo2: number;
    isCritical: boolean;
    createdAt: string;
  }) {
    await this.redisClient.xAdd(
      this.MEASUREMENTS_STREAM_KEY,
      '*',
      {
        citizenId: measurement.citizenId,
        pulse: measurement.pulse.toString(),
        spo2: measurement.spo2.toString(),
        isCritical: measurement.isCritical.toString(),
        createdAt: measurement.createdAt,
      },
      {
        TRIM: {
          strategy: 'MAXLEN',
          strategyModifier: '~',
          threshold: 1000,
        },
      },
    );
  }

  // Reads all events from the Redis Stream.
  // Useful for documentation and testing.
  async getMeasurementStream() {
    return this.redisClient.xRange(this.MEASUREMENTS_STREAM_KEY, '-', '+');
  }
}
