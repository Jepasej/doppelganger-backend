// src/measurements/measurements.controller.ts
import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { fromEvent, map, Observable } from 'rxjs';

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  // The Flutter mobile framework establishes a persistent tracking channel here
  @Sse('critical')
  streamCriticalAlarms(): Observable<MessageEvent> {
    console.log(
      '[SSE Engine] Flutter client established a live stream channel hook',
    );

    // 'fromEvent' listens to our service's node event emitter instance.
    // Every time 'this.eventEmitter.emit("critical-alarm")' triggers, it intercepts it here.
    return fromEvent(
      this.measurementsService.eventEmitter,
      'critical-alarm',
    ).pipe(
      // The map operator formats the stream block data interface to meet strict SSE transmission design rules
      map(
        (alarmPayload): MessageEvent => ({
          // Explicitly casting alarmPayload to an object or any satisfies the MessageEvent interface requirements
          data: alarmPayload as object,
        }),
      ),
    );
  }
}
