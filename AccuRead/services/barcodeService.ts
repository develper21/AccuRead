import { BarCodeScanner } from 'expo-barcode-scanner';
import { Alert, Platform } from 'react-native';

export interface BarcodeData {
  type: string;
  data: string;
  timestamp: Date;
  format?: string;
}

export interface MeterInfo {
  serialNumber?: string;
  meterType?: string;
  location?: string;
  customerName?: string;
  installationDate?: string;
  lastReading?: string;
  metadata?: Record<string, any>;
}

export class BarcodeService {
  private static instance: BarcodeService;
  private scannedCodes: Map<string, BarcodeData> = new Map();

  static getInstance(): BarcodeService {
    if (!BarcodeService.instance) {
      BarcodeService.instance = new BarcodeService();
    }
    return BarcodeService.instance;
  }

  // Check if barcode scanning is available
  async isBarcodeScannerAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return false; // Web doesn't support camera barcode scanning
      }
      
      const status = await BarCodeScanner.getPermissionsAsync();
      return status.granted;
    } catch (error) {
      console.error('Barcode scanner availability check failed:', error);
      return false;
    }
  }

  // Request camera permissions for barcode scanning
  async requestBarcodePermission(): Promise<boolean> {
    try {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request barcode permission:', error);
      return false;
    }
  }

  // Parse barcode data to extract meter information
  parseBarcodeData(barcodeData: string): MeterInfo | null {
    try {
      // Try to parse as JSON first
      if (barcodeData.startsWith('{') || barcodeData.startsWith('[')) {
        const jsonData = JSON.parse(barcodeData);
        return this.extractMeterInfoFromJson(jsonData);
      }

      // Try to parse as URL with query parameters
      if (barcodeData.startsWith('http')) {
        return this.extractMeterInfoFromUrl(barcodeData);
      }

      // Try to parse as structured text (pipe delimited, comma delimited, etc.)
      return this.extractMeterInfoFromText(barcodeData);
    } catch (error) {
      console.error('Failed to parse barcode data:', error);
      return null;
    }
  }

  // Extract meter info from JSON data
  private extractMeterInfoFromJson(data: any): MeterInfo | null {
    try {
      return {
        serialNumber: data.serialNumber || data.serial || data.meter_id || data.id,
        meterType: data.meterType || data.type || data.model,
        location: data.location || data.address || data.site,
        customerName: data.customerName || data.customer || data.name,
        installationDate: data.installationDate || data.installed || data.date,
        lastReading: data.lastReading || data.previous || data.last,
        metadata: data.metadata || data.extra || data.additional,
      };
    } catch (error) {
      console.error('Failed to extract meter info from JSON:', error);
      return null;
    }
  }

  // Extract meter info from URL
  private extractMeterInfoFromUrl(url: string): MeterInfo | null {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      return {
        serialNumber: params.get('serial') || params.get('id') || params.get('meter_id'),
        meterType: params.get('type') || params.get('model'),
        location: params.get('location') || params.get('address'),
        customerName: params.get('customer') || params.get('name'),
        installationDate: params.get('installed') || params.get('date'),
        lastReading: params.get('lastReading') || params.get('previous'),
      };
    } catch (error) {
      console.error('Failed to extract meter info from URL:', error);
      return null;
    }
  }

  // Extract meter info from structured text
  private extractMeterInfoFromText(text: string): MeterInfo | null {
    try {
      // Common patterns for meter information
      const patterns = {
        serial: /(?:serial|sn|id)[:\s]+([A-Z0-9-_]+)/i,
        type: /(?:type|model)[:\s]+([A-Z0-9-_]+)/i,
        location: /(?:location|addr|site)[:\s]+([^\n]+)/i,
        customer: /(?:customer|name)[:\s]+([^\n]+)/i,
        date: /(?:date|installed)[:\s]+([^\n]+)/i,
      };

      const result: MeterInfo = {};

      Object.entries(patterns).forEach(([key, pattern]) => {
        const match = text.match(pattern);
        if (match && match[1]) {
          switch (key) {
            case 'serial':
              result.serialNumber = match[1].trim();
              break;
            case 'type':
              result.meterType = match[1].trim();
              break;
            case 'location':
              result.location = match[1].trim();
              break;
            case 'customer':
              result.customerName = match[1].trim();
              break;
            case 'date':
              result.installationDate = match[1].trim();
              break;
          }
        }
      });

      // If no structured data found, treat the entire text as serial number
      if (!result.serialNumber && text.length > 3) {
        result.serialNumber = text.trim();
      }

      return Object.keys(result).length > 0 ? result : null;
    } catch (error) {
      console.error('Failed to extract meter info from text:', error);
      return null;
    }
  }

  // Validate meter serial number format
  validateMeterSerial(serial: string): boolean {
    if (!serial || serial.length < 3) {
      return false;
    }

    // Common serial number patterns
    const patterns = [
      /^[A-Z]{2,4}\d{6,12}$/i, // ABC123456789
      /^\d{10,15}$/, // 123456789012345
      /^[A-Z0-9]{8,20}$/i, // Mixed alphanumeric
      /^MTR\d{6,12}$/i, // MTR123456789
    ];

    return patterns.some(pattern => pattern.test(serial));
  }

  // Generate QR code for meter information
  generateMeterQRCode(meterInfo: MeterInfo): string {
    try {
      const qrData = {
        id: meterInfo.serialNumber,
        serial: meterInfo.serialNumber,
        type: meterInfo.meterType,
        location: meterInfo.location,
        customer: meterInfo.customerName,
        installed: meterInfo.installationDate,
        last: meterInfo.lastReading,
        app: 'AccuRead',
        version: '1.0',
        timestamp: new Date().toISOString(),
      };

      return JSON.stringify(qrData);
    } catch (error) {
      console.error('Failed to generate QR code data:', error);
      return '';
    }
  }

  // Add scanned code to history
  addScannedCode(barcodeData: BarcodeData): void {
    this.scannedCodes.set(barcodeData.data, barcodeData);
    
    // Keep only last 100 scanned codes
    if (this.scannedCodes.size > 100) {
      const oldestKey = this.scannedCodes.keys().next().value;
      this.scannedCodes.delete(oldestKey);
    }
  }

  // Get scanned code history
  getScannedHistory(): BarcodeData[] {
    return Array.from(this.scannedCodes.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Clear scanned history
  clearScannedHistory(): void {
    this.scannedCodes.clear();
  }

  // Check if code was recently scanned (to prevent duplicates)
  isRecentlyScanned(data: string, timeWindowMs: number = 5000): boolean {
    const existing = this.scannedCodes.get(data);
    if (!existing) return false;

    const timeDiff = Date.now() - existing.timestamp.getTime();
    return timeDiff < timeWindowMs;
  }

  // Get supported barcode types
  getSupportedBarcodeTypes(): Array<{ type: string; name: string; description: string }> {
    return [
      {
        type: BarCodeScanner.Constants.BarCodeType.qr,
        name: 'QR Code',
        description: 'Quick Response code for meter information',
      },
      {
        type: BarCodeScanner.Constants.BarCodeType.aztec,
        name: 'Aztec',
        description: 'Aztec barcode format',
      },
      {
        type: BarCodeScanner.Constants.BarCodeType.pdf417,
        name: 'PDF417',
        description: 'PDF417 stacked barcode',
      },
      {
        type: BarCodeScanner.Constants.BarCodeType.code128,
        name: 'Code 128',
        description: 'Code 128 linear barcode',
      },
      {
        type: BarCodeScanner.Constants.BarCodeType.code39,
        name: 'Code 39',
        description: 'Code 39 linear barcode',
      },
      {
        type: BarCodeScanner.Constants.BarCodeType.ean13,
        name: 'EAN-13',
        description: 'European Article Number',
      },
      {
        type: BarCodeScanner.Constants.BarCodeType.ean8,
        name: 'EAN-8',
        description: 'EAN-8 barcode',
      },
      {
        type: BarCodeScanner.Constants.BarCodeType.upc_e,
        name: 'UPC-E',
        description: 'Universal Product Code (short)',
      },
    ];
  }

  // Show barcode scanning help
  showBarcodeHelp(): void {
    const helpMessage = `
How to scan meter barcodes/QR codes:

1. Position the camera 6-12 inches from the barcode
2. Ensure good lighting and avoid glare
3. Hold the device steady
4. Wait for the automatic scan

Supported formats:
• QR Codes (recommended)
• Aztec codes
• PDF417 codes
• Code 128/39 barcodes
• EAN/UPC barcodes

The app will automatically extract meter information from the scanned code.
    `;

    Alert.alert('Barcode Scanning Help', helpMessage.trim());
  }
}

export const barcodeService = BarcodeService.getInstance();
