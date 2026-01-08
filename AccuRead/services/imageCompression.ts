import ImageResizer from 'react-native-image-resizer';
import { Platform, Image } from 'react-native';
import RNFS from 'react-native-fs';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'JPEG' | 'PNG' | 'WEBP';
  rotation?: number;
  outputPath?: string;
}

export interface CompressionResult {
  uri: string;
  size: number;
  width: number;
  height: number;
  format: string;
  compressionRatio: number;
}

export class ImageCompressionService {
  private static instance: ImageCompressionService;

  static getInstance(): ImageCompressionService {
    if (!ImageCompressionService.instance) {
      ImageCompressionService.instance = new ImageCompressionService();
    }
    return ImageCompressionService.instance;
  }

  // Compress image for meter reading
  async compressForMeterReading(
    imageUri: string,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const defaultOptions: CompressionOptions = {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: 'JPEG',
      rotation: 0,
      ...options
    };

    try {
      console.log('Compressing image for meter reading...');

      const compressedImage = await ImageResizer.createResizedImage(
        imageUri,
        defaultOptions.maxWidth || 1920,
        defaultOptions.maxHeight || 1080,
        defaultOptions.format || 'JPEG',
        defaultOptions.quality || 85,
        defaultOptions.rotation || 0,
        defaultOptions.outputPath
      );

      // Get original and compressed file sizes
      const originalSize = await this.getImageSize(imageUri);
      const compressedSize = await this.getImageSize(compressedImage.uri);

      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      const result: CompressionResult = {
        uri: compressedImage.uri,
        size: compressedSize,
        width: compressedImage.width,
        height: compressedImage.height,
        format: defaultOptions.format || 'JPEG',
        compressionRatio: Math.round(compressionRatio * 100) / 100
      };

      console.log(`Image compressed: ${originalSize} -> ${compressedSize} bytes (${result.compressionRatio}% reduction)`);

      return result;
    } catch (error) {
      console.error('Image compression failed:', error);
      throw new Error(`Failed to compress image: ${error}`);
    }
  }

  // Compress image for thumbnail
  async compressForThumbnail(
    imageUri: string,
    size: number = 200
  ): Promise<CompressionResult> {
    return this.compressForMeterReading(imageUri, {
      maxWidth: size,
      maxHeight: size,
      quality: 75,
      format: 'JPEG'
    });
  }

  // Compress image for cloud storage
  async compressForCloudStorage(
    imageUri: string,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    return this.compressForMeterReading(imageUri, {
      maxWidth: 1280,
      maxHeight: 720,
      quality: 80,
      format: 'JPEG',
      ...options
    });
  }

  // Batch compress multiple images
  async compressBatch(
    imageUris: string[],
    options: CompressionOptions = {}
  ): Promise<CompressionResult[]> {
    const results: CompressionResult[] = [];

    for (const uri of imageUris) {
      try {
        const result = await this.compressForMeterReading(uri, options);
        results.push(result);
      } catch (error) {
        console.error(`Failed to compress image ${uri}:`, error);
        // Add original image as fallback
        results.push({
          uri,
          size: await this.getImageSize(uri),
          width: 0,
          height: 0,
          format: 'ORIGINAL',
          compressionRatio: 0
        });
      }
    }

    return results;
  }

  // Get image file size
  private async getImageSize(imageUri: string): Promise<number> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      return blob.size;
    } catch (error) {
      console.error('Failed to get image size:', error);
      return 0;
    }
  }

  // Get image dimensions
  async getImageDimensions(imageUri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      Image.getSize(
        imageUri,
        (width, height) => resolve({ width, height }),
        (error) => reject(error)
      );
    });
  }

  // Optimize compression settings based on image analysis
  async optimizeCompressionSettings(
    imageUri: string,
    useCase: 'meter' | 'thumbnail' | 'avatar' | 'document'
  ): Promise<CompressionOptions> {
    try {
      const dimensions = await this.getImageDimensions(imageUri);
      const fileSize = await this.getImageSize(imageUri);

      const settings: CompressionOptions = {};

      switch (useCase) {
        case 'meter':
          // High quality for OCR processing
          settings.maxWidth = Math.min(dimensions.width, 1920);
          settings.maxHeight = Math.min(dimensions.height, 1080);
          settings.quality = fileSize > 5 * 1024 * 1024 ? 75 : 85; // Lower quality for large files
          settings.format = 'JPEG';
          break;

        case 'thumbnail':
          // Small size for quick loading
          settings.maxWidth = 200;
          settings.maxHeight = 200;
          settings.quality = 70;
          settings.format = 'JPEG';
          break;

        case 'avatar':
          // Square format for profile pictures
          const size = Math.min(dimensions.width, dimensions.height, 400);
          settings.maxWidth = size;
          settings.maxHeight = size;
          settings.quality = 80;
          settings.format = 'JPEG';
          break;

        case 'document':
          // Balanced quality for document images
          settings.maxWidth = Math.min(dimensions.width, 2048);
          settings.maxHeight = Math.min(dimensions.height, 2048);
          settings.quality = 85;
          settings.format = 'JPEG';
          break;
      }

      return settings;
    } catch (error) {
      console.error('Failed to optimize compression settings:', error);
      return {};
    }
  }

  // Compress with progressive JPEG for better loading
  async compressProgressive(
    imageUri: string,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    // For progressive JPEG, we might need to use a different library
    // For now, use standard compression
    return this.compressForMeterReading(imageUri, {
      ...options,
      quality: (options.quality || 85) - 5 // Slightly lower quality for progressive
    });
  }

  // Validate compressed image quality
  async validateCompressedImage(
    result: CompressionResult,
    minQuality: number = 70
  ): Promise<boolean> {
    try {
      // Check if compression ratio is reasonable
      if (result.compressionRatio < 0) {
        return false;
      }

      // Check if file size is reasonable
      const expectedMinSize = (result.width * result.height * minQuality) / 100;
      if (result.size < expectedMinSize * 0.1) { // Allow 10% variance
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to validate compressed image:', error);
      return false;
    }
  }

  // Get compression statistics
  getCompressionStats(originalSize: number, compressedSize: number): {
    originalSize: string;
    compressedSize: string;
    savings: string;
    savingsPercentage: number;
  } {
    const savings = originalSize - compressedSize;
    const savingsPercentage = (savings / originalSize) * 100;

    return {
      originalSize: this.formatFileSize(originalSize),
      compressedSize: this.formatFileSize(compressedSize),
      savings: this.formatFileSize(savings),
      savingsPercentage: Math.round(savingsPercentage * 100) / 100
    };
  }

  // Format file size for display
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  // Clean up temporary compressed files
  async cleanupTempFiles(fileUris: string[]): Promise<void> {
    try {
      for (const uri of fileUris) {
        // Only delete files that are in temp directory
        if (uri.includes('tmp/') || uri.includes('Cache/')) {
          await RNFS.unlink(uri);
          console.log(`Cleaned up temp file: ${uri}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup temp files:', error);
    }
  }

  // Get recommended compression settings for device
  getDeviceOptimizedSettings(): CompressionOptions {
    const isLowEndDevice = this.isLowEndDevice();

    if (isLowEndDevice) {
      return {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 70,
        format: 'JPEG'
      };
    } else {
      return {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 85,
        format: 'JPEG'
      };
    }
  }

  // Check if device is low-end
  private isLowEndDevice(): boolean {
    // Simple heuristic - in production, use device detection
    return Platform.OS === 'android' && Platform.Version < 24;
  }
}

export const imageCompressionService = ImageCompressionService.getInstance();
