import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MeasurementsService } from './measurements.service';
import { MeasurementDto } from './measurements.dto';

// TODO 10 bruger vi overhovedet denne gateway? Jeg tror ikke den bruges. Maaske kan vi bare slette hele denne fil?
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MeasurementsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly measurementsService: MeasurementsService) {}

  /*
    ============================================================
    ORIGINAL GATEWAY-KODE - UDKOMMENTERET MENS VI TESTER SSE
    ============================================================
  
    @SubscribeMessage('send-measurement')
    async handleMeasurement(payload: MeasurementDto) {
      console.log('[WebSocket] Incoming measurement:', payload);
  
      await this.measurementsService.handleNewMeasurement(payload);
  
      this.server.emit('measurement-received', payload);
    }
  
    ============================================================
    TEST-KODE - KUN TIL SSE TEST
    ============================================================
    */

  @SubscribeMessage('send-measurement')
  handleMeasurement(payload: MeasurementDto) {
    console.log('[TEST] Incoming websocket measurement:', payload);

    // Midlertidig mapping fra gammel DTO -> ny teststruktur
    this.measurementsService.handleNewMeasurement({
      citizenId: payload.citizenId,

      // Hardcoded testdata
      citizenName: 'Anna Jensen',
      citizenPhoneNumber: '12345678',

      // Hvis type er heartRate bruges payload.value som puls
      pulse: payload.type === 'heartRate' ? payload.value : 80,

      // Hvis type er spo2 bruges payload.value som spo2
      spo2: payload.type === 'spo2' ? payload.value : 98,
    });

    this.server.emit('measurement-received', payload);
  }
}
