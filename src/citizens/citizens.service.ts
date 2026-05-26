import { Injectable } from '@nestjs/common';

@Injectable()
export class CitizensService {
  findAll() {
    return [
      {
        id: '1',
        fullName: 'Anna Jensen',
        adress: 'Hovedgaden 12',
        phoneNumber: '12345678',
      },
      {
        id: '2',
        fullName: 'Peter Hansen',
        adress: 'Søndergade 34',
        phoneNumber: '87654321',
      },
    ];
  }

  // TODO 12 det er okay med dummy dataen i den anden metode, men her skal vi maaske have noget database kald ind?
  // Vi kan starte med nogle databasekald som skriver maalinger TIL databasen, eller simpelthen skrive de noedvendige maalinger ind i main.ts
  // Jeg haelder mest til mulighed 2!
  // Ved naermere eftertanke skal vi maaske ogsaa skrive de to ovenstaaende borgere ind i main.ts.
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
