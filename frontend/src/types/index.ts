export interface MeterReading {
  serialNumber: string;
  kwh: string;
  kvah: string;
  maxDemandKw: string;
  demandKva: string;
}

export interface ConfidenceScores {
  serialNumber: number;
  kwh: number;
  kvah: number;
  maxDemandKw: number;
  demandKva: number;
}

export interface MeterReadingResult {
  data: MeterReading;
  confidence: ConfidenceScores;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
}

export interface CameraQuality {
  isBlurred: boolean;
  hasGlare: boolean;
  isAligned: boolean;
  brightness: number;
  sharpness: number;
}
