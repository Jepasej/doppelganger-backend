export class MeasurementDto {
  citizenId: string;
  type: 'heartRate' | 'temperature';
  value: number;
}
