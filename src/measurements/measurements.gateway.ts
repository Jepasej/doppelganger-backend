// src/measurements/measurements.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MeasurementsService } from './measurements.service';
import { MeasurementDto } from './measurements.dto';

// Enabling '*' CORS allows external hardware modules to establish connections easily
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MeasurementsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly measurementsService: MeasurementsService) {}

  // Listens explicitly for the event string channel 'send-measurement' from the Pi
  @SubscribeMessage('send-measurement')
  async handleIncomingMeasurement(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MeasurementDto,
  ) {
    console.log(
      `[Socket Ingestion] Packet received from connection ID: ${client.id}`,
    );

    // Send the incoming payload straight over to the processing service
    await this.measurementsService.handleNewMeasurement(payload);

    // Sends an optional validation acknowledgment receipt back up the socket channel to the Pi
    return { status: 'processed_successfully' };
  }
}
