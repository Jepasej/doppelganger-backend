// Handles simple file-based storage for citizens and measurements.

import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

export type Citizen = {
  id: string;
  fullName: string;
  address: string;
  phoneNumber: string;
};

export type Measurement = {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPhoneNumber: string;
  pulse: number;
  spo2: number;
  createdAt: string;
  isCritical: boolean;
};

@Injectable()
export class FileStorageService {
  private readonly citizensFilePath = path.join(
    process.cwd(),
    'src',
    'data',
    'citizens.json',
  );

  private readonly measurementsFilePath = path.join(
    process.cwd(),
    'src',
    'data',
    'measurements.json',
  );

  // Reads all citizens from the JSON file.
  async getCitizens(): Promise<Citizen[]> {
    const fileContent = await fs.readFile(this.citizensFilePath, 'utf8');

    return JSON.parse(fileContent) as Citizen[];
  }

  // Finds one citizen by id.
  async getCitizenById(citizenId: string): Promise<Citizen> {
    const citizens = await this.getCitizens();

    const citizen = citizens.find((item) => item.id === citizenId);

    if (!citizen) {
      throw new Error(`Citizen with id ${citizenId} was not found`);
    }

    return citizen;
  }

  // Reads all measurements from the JSON file.
  async getMeasurements(): Promise<Measurement[]> {
    const fileContent = await fs.readFile(this.measurementsFilePath, 'utf8');

    return JSON.parse(fileContent) as Measurement[];
  }

  // Finds measurements for one citizen.
  async getMeasurementsByCitizenId(citizenId: string): Promise<Measurement[]> {
    const measurements = await this.getMeasurements();

    return measurements
      .filter((measurement) => measurement.citizenId === citizenId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  // Saves one new measurement to the JSON file.
  async saveMeasurement(measurement: Measurement): Promise<Measurement> {
    const measurements = await this.getMeasurements();

    measurements.push(measurement);

    await fs.writeFile(
      this.measurementsFilePath,
      JSON.stringify(measurements, null, 2),
      'utf8',
    );

    return measurement;
  }
}
