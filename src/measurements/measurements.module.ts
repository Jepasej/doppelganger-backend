import { Module } from '@nestjs/common';
import { MeasurementsController } from './measurements.controller';
import { MeasurementsService } from './measurements.service';
import { MeasurementsGateway } from './measurements.gateway';
import { TcpListenerService } from '../tcp/tcp-listener.service';

@Module({
  controllers: [MeasurementsController],
  providers: [MeasurementsService, MeasurementsGateway, TcpListenerService],
})
export class MeasurementsModule {}
