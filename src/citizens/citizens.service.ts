import { Injectable } from '@nestjs/common';

@Injectable()
export class CitizensService {
  findAll() {
    return [
      {
        id: '1',
        fullName: 'Anna Jensen',
        address: 'Hovedgaden 12',
        phoneNumber: '12345678',
      },
      {
        id: '2',
        fullName: 'Peter Hansen',
        address: 'Søndergade 34',
        phoneNumber: '87654321',
      },
    ];
  }

  findMeasurements(citizenId: string) {
    return [
      {
        id: '1',
        citizenId,
        citizenName: citizenId === '1' ? 'Anna Jensen' : 'Peter Hansen',
        citizenPhoneNumber: citizenId === '1' ? '12345678' : '87654321',
        pulse: 82,
        spo2: 97.5,
        createdAt: new Date().toISOString(),
        isCritical: false,
      },
    ];
  }
}
