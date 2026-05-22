import { Module } from '@nestjs/common';
import { MeasurementsController } from './measurements.controller';
import { MeasurementsService } from './measurements.service';
import { MeasurementsGateway } from './measurements.gateway';

@Module({
  controllers: [MeasurementsController],
  providers: [MeasurementsService, MeasurementsGateway],
})
export class MeasurementsModule {}
