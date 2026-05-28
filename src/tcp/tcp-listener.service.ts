import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as net from 'net';
import { MeasurementsService } from '../measurements/measurements.service';

// TODO 1 delete logger and all uses of it to keep code slim and focused on core functionality, unless you think it's useful for debugging or future maintenance.
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

    this.server.on('error', (err) => this.logger.error('Server error', err));
  }

  onModuleDestroy() {
    this.server?.close();
  }

  private onConnection(socket: net.Socket) {
    this.logger.log(
      `New TCP connection from ${socket.remoteAddress}:${socket.remotePort}`,
    );
    this.bufferMap.set(socket, '');

    // TODO 2 what is this, and is it necessary? Ask an llm
    socket.on('data', (chunk: Buffer) => {
      const prev = this.bufferMap.get(socket) || '';
      const combined = prev + chunk.toString('utf8');
      const parts = combined.split('\n');

      // last item may be incomplete — keep in buffer
      this.bufferMap.set(socket, parts.pop() || '');

      for (const line of parts) {
        if (!line.trim()) continue;
        try {
          const payload = JSON.parse(line);
          // TODO 4 Map payload to MeasurementDto expected by MeasurementsService
          // Adjust mapping to match your Pi payload shape
          const mapped = {
            citizenId: String(payload.citizenId ?? payload.id ?? 'unknown'),
            citizenName: String(
              payload.citizenName ?? payload.name ?? 'unknown',
            ),
            citizenPhoneNumber: String(
              payload.citizenPhoneNumber ?? payload.phoneNumber ?? '',
            ),
            pulse: Number(payload.pulse ?? payload.value ?? 0),
            spo2: Number(payload.spo2 ?? 0),
          };
          this.measurementsService.handleNewMeasurement(mapped);
          socket.write('OK\n');
        } catch (err) {
          this.logger.error('Failed to parse/handle TCP payload', err as Error);
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
