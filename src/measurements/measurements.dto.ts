// DTO for incoming measurements from Raspberry Pi.
export class MeasurementDto {
  citizenId: string;
  pulse: number;
  spo2: number;
  createdAt?: string;
}
