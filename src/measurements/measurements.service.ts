// Handles incoming measurements from Raspberry Pi.

import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import {
  FileStorageService,
  Measurement,
} from '../file-storage/file-storage.service';
import { RedisService } from '../redis/redis.service';
import { MeasurementDto } from './measurements.dto';

@Injectable()
export class MeasurementsService {
  // Used by the SSE endpoint to notify Flutter about critical measurements.
  public readonly eventEmitter = new EventEmitter();

  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly redisService: RedisService,
  ) {}

  // Handles one incoming measurement.
  // Later, a RabbitMQ consumer can call this same method.
  async handleNewMeasurement(data: MeasurementDto) {
    const citizen = await this.fileStorageService.getCitizenById(
      data.citizenId,
    );

    const measurement = this.createMeasurement(data, citizen);

    // Saves measurement permanently in the JSON file.
    await this.fileStorageService.saveMeasurement(measurement);

    // Stores latest measurement in Redis LIST.
    await this.redisService.addLatestMeasurement(measurement);

    // Sends critical measurements to Flutter through SSE.
    if (measurement.isCritical) {
      this.eventEmitter.emit('critical-alarm', measurement);
    }

    return measurement;
  }

  // Creates a complete measurement object.
  private createMeasurement(
    data: MeasurementDto,
    citizen: {
      id: string;
      fullName: string;
      phoneNumber: string;
    },
  ): Measurement {
    const isCritical = this.isCritical(data.pulse, data.spo2);

    return {
      id: crypto.randomUUID(),
      citizenId: citizen.id,
      citizenName: citizen.fullName,
      citizenPhoneNumber: citizen.phoneNumber,
      pulse: data.pulse,
      spo2: data.spo2,
      createdAt: data.createdAt ?? new Date().toISOString(),
      isCritical,
    };
  }

  // Checks if the measurement is critical.
  private isCritical(pulse: number, spo2: number): boolean {
    return pulse > 120 || spo2 < 90;
  }
}
