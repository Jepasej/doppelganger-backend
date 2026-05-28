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

/*// TODO 3A this DTO must be deleted - we should use the measurement dto as defined in ./measurements.dto.ts.
// ./measurements.dto.ts must be changed to line up with our needs and comment in the above
type TestMeasurementDto = {
  citizenId: string;
  citizenName: string;
  citizenPhoneNumber: string;
  pulse: number;
  spo2: number;
};

// TODO 5 remove all console logging.
@Injectable()
export class MeasurementsService {
  public readonly eventEmitter = new EventEmitter();

  handleNewMeasurement(data: TestMeasurementDto) {
    console.log('[TEST] Measurement received:', data);

    // TODO 6 define actual critical thresholds.
    const isCritical = data.pulse > 120 || data.pulse || data.spo2 < 90;

    // TODO 7 We receive a timestamp from the Pi, we should use that instead of generating a new one here.
    // also this measurement is like all wrong pls fix (measurement --> database --> frontend, measurement
    // will be slightly delayed in UI compared to alarm, we have to live with it)
    const measurement = {
      id: crypto.randomUUID(),
      citizenId: data.citizenId,
      citizenName: data.citizenName,
      citizenPhoneNumber: data.citizenPhoneNumber,
      pulse: data.pulse,
      spo2: data.spo2,
      createdAt: new Date().toISOString(),
      isCritical,
    };

    console.log('[TEST] Processed measurement:', measurement);

    if (isCritical) {
      console.log(
        `[TEST] 🚨 Critical alarm emitted for citizen ${data.citizenId}`,
      );

      this.eventEmitter.emit('critical-alarm', measurement);
    }

    return measurement;
  }
}
*/
