import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as net from 'net';
import { MeasurementsService } from '../measurements/measurements.service';
import { MeasurementDto } from '../measurements/measurements.dto';

@Injectable()
export class TcpListenerService implements OnModuleInit, OnModuleDestroy {
  private server: net.Server;
  private readonly logger = new Logger(TcpListenerService.name);
  private bufferMap = new Map<net.Socket, string>();

  constructor(private readonly measurementsService: MeasurementsService) {}

  onModuleInit() {
    const port = Number(process.env.TCP_PORT) || 5000;
    const host = process.env.TCP_HOST || '0.0.0.0';

    this.server = net.createServer((socket) => this.onConnection(socket));

    this.server.listen(port, host, () => {
      this.logger.log(`TCP listener running on ${host}:${port}`);
    });

    this.server.on('error', (err) => {
      this.logger.error('Server error', err);
    });
  }

  onModuleDestroy() {
    this.server?.close();
  }

  private onConnection(socket: net.Socket) {
    this.logger.log(
      `New TCP connection from ${socket.remoteAddress}:${socket.remotePort}`,
    );

    this.bufferMap.set(socket, '');

    socket.on('data', (chunk: Buffer) => {
      const previousData = this.bufferMap.get(socket) || '';
      const combinedData = previousData + chunk.toString('utf8');
      const messages = combinedData.split('\n');

      // TCP data may arrive in multiple chunks.
      // Store any incomplete JSON message in the buffer
      // until the remaining data arrives.
      this.bufferMap.set(socket, messages.pop() || '');

      for (const message of messages) {
        if (!message.trim()) continue;

        try {
          const payload = JSON.parse(message);

          // Map incoming Raspberry Pi measurements to the DTO
          // used by the MeasurementsService. Citizen information
          // is looked up later using the citizenId.
          const measurementDto: MeasurementDto = {
            citizenId: String(payload.citizenId ?? payload.id ?? 'unknown'),
            pulse: Number(payload.pulse ?? payload.value ?? 0),
            spo2: Number(payload.spo2 ?? 0),
          };

          this.measurementsService.handleNewMeasurement(measurementDto);

          socket.write('OK\n');
        } catch (err) {
          this.logger.error(
            'Failed to parse or handle TCP payload',
            err as Error,
          );

          socket.write('ERROR\n');
        }
      }
    });

    socket.on('close', () => {
      this.bufferMap.delete(socket);

      this.logger.log(
        `Connection closed ${socket.remoteAddress}:${socket.remotePort}`,
      );
    });

    socket.on('error', (err) => {
      this.logger.error('Socket error', err);
    });
  }
}
