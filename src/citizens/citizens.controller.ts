import { Controller, Get, Param } from '@nestjs/common';
import { CitizensService } from './citizens.service';

@Controller('citizens')
export class CitizensController {
  constructor(private readonly citizensService: CitizensService) {}

  @Get()
  getAllCitizens() {
    return this.citizensService.findAll();
  }

  @Get(':id/measurements')
  getMeasurementsByCitizenId(@Param('id') id: string) {
    return this.citizensService.findMeasurements(id);
  }
}
