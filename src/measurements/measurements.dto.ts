export class MeasurementDto {
  citizenId: string;
  type: 'heartRate' | 'spo2';
  value: number;
}
