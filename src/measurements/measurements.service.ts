import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
// import { MeasurementDto } from './measurements.dto';

// TODO 3 this DTO must be deleted - we should use the measurement dto as defined in ./measurements.dto.ts.
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
