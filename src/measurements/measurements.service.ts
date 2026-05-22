import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { MeasurementDto } from './measurements.dto';

@Injectable()
export class MeasurementsService {
  // A standard, native Node.js Event Emitter instance
  // Marked as public so the controller can listen to its broadcasts
  public readonly eventEmitter = new EventEmitter();

  // Defined clinical normal bounds for evaluation logic
  private readonly bounds = {
    heartRate: { min: 60, max: 100 },
    temperature: { min: 36.0, max: 37.5 },
  };

  async handleNewMeasurement(data: MeasurementDto) {
    // ---- STEP A: Write data to Redis ----
    // You will use your Redis client here:
    // await this.redisClient.set(`citizen:${data.citizenId}:${data.type}`, data.value);
    console.log(
      `[Database] Saved to Redis -> Citizen: ${data.citizenId}, ${data.type}: ${data.value}`,
    );

    // ---- STEP B: Evaluate Boundaries ----
    const limits = this.bounds[data.type];
    if (!limits) return; // If type doesn't match boundaries, stop processing

    const isBelowMinimum = data.value < limits.min;
    const isAboveMaximum = data.value > limits.max;

    if (isBelowMinimum || isAboveMaximum) {
      const condition = isBelowMinimum ? 'LOW' : 'HIGH';

      // ---- STEP C: Emit Event Downstream ----
      // We broadcast a string message channel payload named 'critical-alarm'
      // Updated NestJS Service Payload Shape (Perfectly maps to Measurement.fromJson)
      this.eventEmitter.emit('critical-alarm', {
        citizenId: data.citizenId,
        type: data.type, // Coincides perfectly with Flutter model keys
        value: data.value, // Coincides perfectly with Flutter model keys
        timestamp: new Date().toISOString(),
        message: `CRITICAL ${condition}: ${data.type} is ${data.value}. Normal parameters: ${limits.min}-${limits.max}`,
        alarm: true,
      });

      console.log(
        `[Alarm Engine] 🚨 Event emitted for Citizen ${data.citizenId}`,
      );
    }
  }
}
