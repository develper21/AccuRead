import { MeterReadingResult } from '../types';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeImages?: boolean;
  sortBy?: 'date' | 'serial' | 'confidence';
}

export class ExportService {
  private static instance: ExportService;

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  // Export readings to CSV format
  async exportToCSV(readings: MeterReadingResult[], options: ExportOptions): Promise<string> {
    try {
      let filteredReadings = this.filterReadings(readings, options);
      filteredReadings = this.sortReadings(filteredReadings, options.sortBy);

      const csvHeaders = [
        'Timestamp',
        'Meter Serial Number',
        'kWh',
        'kVAh',
        'Max Demand (kW)',
        'Demand (kVA)',
        'Avg Confidence (%)',
        'Location',
        'Image URL'
      ];

      const csvRows = filteredReadings.map(reading => [
        new Date(reading.timestamp).toLocaleString(),
        reading.data.serialNumber,
        reading.data.kwh,
        reading.data.kvah,
        reading.data.maxDemandKw,
        reading.data.demandKva,
        this.calculateAverageConfidence(reading.confidence).toFixed(2),
        reading.location ? `${reading.location.latitude}, ${reading.location.longitude}` : 'N/A',
        reading.imageUrl || 'N/A'
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const fileName = `accuread_export_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.writeFile(filePath, csvContent, 'utf8');

      return filePath;
    } catch (error) {
      throw new Error(`Failed to export CSV: ${error}`);
    }
  }

  // Export readings to Excel format (simple CSV that Excel can open)
  async exportToExcel(readings: MeterReadingResult[], options: ExportOptions): Promise<string> {
    // For now, we'll create a CSV formatted for Excel
    // In a real implementation, you might use a library like xlsx
    return this.exportToCSV(readings, options);
  }

  // Generate PDF report content
  async generatePDFReport(readings: MeterReadingResult[], options: ExportOptions): Promise<string> {
    try {
      let filteredReadings = this.filterReadings(readings, options);
      filteredReadings = this.sortReadings(filteredReadings, options.sortBy);

      const stats = this.calculateStats(filteredReadings);
      
      const pdfContent = this.createPDFContent(filteredReadings, stats, options);
      
      const fileName = `accuread_report_${new Date().toISOString().split('T')[0]}.txt`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.writeFile(filePath, pdfContent, 'utf8');

      return filePath;
    } catch (error) {
      throw new Error(`Failed to generate PDF report: ${error}`);
    }
  }

  // Share exported file
  async shareFile(filePath: string, format: string): Promise<void> {
    try {
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error('File does not exist');
      }

      const shareOptions = {
        title: `AccuRead ${format.toUpperCase()} Export`,
        url: `file://${filePath}`,
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      };

      await Share.open(shareOptions);
    } catch (error) {
      throw new Error(`Failed to share file: ${error}`);
    }
  }

  // Get available export formats
  getAvailableFormats(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'csv',
        label: 'CSV',
        description: 'Comma-separated values, compatible with Excel'
      },
      {
        value: 'excel',
        label: 'Excel',
        description: 'Excel-compatible format'
      },
      {
        value: 'pdf',
        label: 'PDF Report',
        description: 'Formatted report with statistics'
      }
    ];
  }

  // Private helper methods
  private filterReadings(readings: MeterReadingResult[], options: ExportOptions): MeterReadingResult[] {
    if (!options.dateRange) {
      return readings;
    }

    const { start, end } = options.dateRange;
    return readings.filter(reading => {
      const readingDate = new Date(reading.timestamp);
      return readingDate >= start && readingDate <= end;
    });
  }

  private sortReadings(readings: MeterReadingResult[], sortBy?: string): MeterReadingResult[] {
    if (!sortBy) return readings;

    return [...readings].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'serial':
          return a.data.serialNumber.localeCompare(b.data.serialNumber);
        case 'confidence':
          const avgConfidenceA = this.calculateAverageConfidence(a.confidence);
          const avgConfidenceB = this.calculateAverageConfidence(b.confidence);
          return avgConfidenceB - avgConfidenceA;
        default:
          return 0;
      }
    });
  }

  private calculateAverageConfidence(confidence: any): number {
    const values = Object.values(confidence);
    return values.reduce((sum: number, val: any) => sum + val, 0) / values.length;
  }

  private calculateStats(readings: MeterReadingResult[]) {
    const totalReadings = readings.length;
    const averageConfidence = readings.reduce((sum, reading) => 
      sum + this.calculateAverageConfidence(reading.confidence), 0) / totalReadings;

    const serialCounts: { [key: string]: number } = {};
    readings.forEach(reading => {
      const serial = reading.data.serialNumber;
      serialCounts[serial] = (serialCounts[serial] || 0) + 1;
    });

    const mostCommonSerial = Object.entries(serialCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    const totalKwh = readings.reduce((sum, reading) => 
      sum + (parseFloat(reading.data.kwh) || 0), 0);

    return {
      totalReadings,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      mostCommonSerial,
      totalKwh: Math.round(totalKwh * 100) / 100,
      dateRange: {
        start: readings.length > 0 ? new Date(readings[0].timestamp) : new Date(),
        end: readings.length > 0 ? new Date(readings[readings.length - 1].timestamp) : new Date()
      }
    };
  }

  private createPDFContent(readings: MeterReadingResult[], stats: any, options: ExportOptions): string {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    let content = `
ACCUREAD METER READING REPORT
Generated: ${date} at ${time}
==========================================

REPORT SUMMARY
-------------
Total Readings: ${stats.totalReadings}
Average Confidence: ${stats.averageConfidence}%
Most Active Meter: ${stats.mostCommonSerial}
Total Energy (kWh): ${stats.totalKwh}
Date Range: ${stats.dateRange.start.toLocaleDateString()} - ${stats.dateRange.end.toLocaleDateString()}

DETAILED READINGS
----------------
`;

    readings.forEach((reading, index) => {
      content += `
${index + 1}. ${new Date(reading.timestamp).toLocaleString()}
   Meter Serial: ${reading.data.serialNumber}
   kWh: ${reading.data.kwh}
   kVAh: ${reading.data.kvah}
   Max Demand: ${reading.data.maxDemandKw} kW
   Demand: ${reading.data.demandKva} kVA
   Confidence: ${this.calculateAverageConfidence(reading.confidence).toFixed(2)}%
   Location: ${reading.location ? `${reading.location.latitude}, ${reading.location.longitude}` : 'N/A'}
`;
    });

    content += `
==========================================
End of Report
Generated by AccuRead Mobile App
`;

    return content;
  }
}

export const exportService = ExportService.getInstance();
