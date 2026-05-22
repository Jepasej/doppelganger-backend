import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
// import { MeasurementDto } from './measurements.dto';

type TestMeasurementDto = {
  citizenId: string;
  citizenName: string;
  citizenPhoneNumber: string;
  pulse: number;
  spo2: number;
};

@Injectable()
export class MeasurementsService {
  public readonly eventEmitter = new EventEmitter();

  /*
    ============================================================
    ORIGINAL KODE - UDKOMMENTERET MENS VI TESTER SSE
    ============================================================
  
    private readonly bounds = {
      heartRate: { min: 60, max: 100 },
      temperature: { min: 36.0, max: 37.5 },
    };
  
    async handleNewMeasurement(data: MeasurementDto) {
      console.log(
        `[Database] Saved to Redis -> Citizen: ${data.citizenId}, ${data.type}: ${data.value}`,
      );
  
      const limits = this.bounds[data.type];
      if (!limits) return;
  
      const isBelowMinimum = data.value < limits.min;
      const isAboveMaximum = data.value > limits.max;
  
      if (isBelowMinimum || isAboveMaximum) {
        const condition = isBelowMinimum ? 'LOW' : 'HIGH';
  
        this.eventEmitter.emit('critical-alarm', {
          citizenId: data.citizenId,
          type: data.type,
          value: data.value,
          timestamp: new Date().toISOString(),
          message: `CRITICAL ${condition}: ${data.type} is ${data.value}. Normal parameters: ${limits.min}-${limits.max}`,
          alarm: true,
        });
  
        console.log(
          `[Alarm Engine] 🚨 Event emitted for Citizen ${data.citizenId}`,
        );
      }
    }
  
    ============================================================
    TEST-KODE - BRUGES KUN TIL AT TESTE SSE MOD FLUTTER
    ============================================================
    */

  handleNewMeasurement(data: TestMeasurementDto) {
    console.log('[TEST] Measurement received:', data);

    const isCritical = data.pulse > 120 || data.spo2 < 90;

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
