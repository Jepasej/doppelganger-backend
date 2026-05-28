import { Controller, Get, Param } from '@nestjs/common';
import { CitizensService } from './citizens.service';

@Controller('citizens')
export class CitizensController {
  constructor(private readonly citizensService: CitizensService) {}

  // TODO 11 skal vi ikke laegge os mere opad CRUD eller GET/SET? Saa vi enten har READ all eller GET all? for begge endpoints
  @Get()
  findAll() {
    return this.citizensService.findAll();
  }

  @Get(':id/measurements')
  findMeasurements(@Param('id') id: string) {
    return this.citizensService.findMeasurements(id);
  }
}
