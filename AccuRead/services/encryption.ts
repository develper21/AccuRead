import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

export interface EncryptionKey {
  id: string;
  key: string;
  iv: string;
  createdAt: Date;
  algorithm: string;
}

export interface EncryptedData {
  data: string;
  iv: string;
  keyId: string;
  algorithm: string;
  timestamp: number;
  metadata?: {
    timestamp: string;
    confidence: number;
    imageUrl: string;
  };
}

export class EncryptionService {
  private static instance: EncryptionService;
  private masterKey: string | null = null;
  private readonly ALGORITHM = 'AES-256-CBC';
  private readonly KEY_SIZE = 256;
  private readonly IV_SIZE = 16;

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  constructor() {
    this.initializeMasterKey();
  }

  // Initialize or retrieve master key
  private async initializeMasterKey(): Promise<void> {
    try {
      const storedKey = await AsyncStorage.getItem('encryption_master_key');
      if (storedKey) {
        this.masterKey = storedKey;
      } else {
        this.masterKey = this.generateMasterKey();
        await AsyncStorage.setItem('encryption_master_key', this.masterKey);
      }
    } catch (error) {
      console.error('Failed to initialize master key:', error);
      this.masterKey = this.generateMasterKey();
    }
  }

  // Generate master key
  private generateMasterKey(): string {
    return CryptoJS.lib.WordArray.random(this.KEY_SIZE / 8).toString();
  }

  // Generate encryption key for specific data
  generateEncryptionKey(dataType: string): EncryptionKey {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    const keyId = this.generateKeyId();
    const key = CryptoJS.PBKDF2(dataType + this.masterKey, keyId, {
      keySize: this.KEY_SIZE / 32,
      iterations: 10000
    }).toString();

    const iv = CryptoJS.lib.WordArray.random(this.IV_SIZE).toString();

    return {
      id: keyId,
      key,
      iv,
      createdAt: new Date(),
      algorithm: this.ALGORITHM
    };
  }

  // Generate unique key ID
  private generateKeyId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Encrypt sensitive data
  async encrypt(data: any, dataType: string = 'default'): Promise<EncryptedData> {
    try {
      const encryptionKey = this.generateEncryptionKey(dataType);
      const jsonString = JSON.stringify(data);

      const encrypted = CryptoJS.AES.encrypt(jsonString, encryptionKey.key, {
        iv: CryptoJS.enc.Hex.parse(encryptionKey.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const encryptedData: EncryptedData = {
        data: encrypted.toString(),
        iv: encryptionKey.iv,
        keyId: encryptionKey.id,
        algorithm: encryptionKey.algorithm,
        timestamp: Date.now()
      };

      // Store encryption key metadata
      await this.storeEncryptionKey(encryptionKey);

      return encryptedData;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error(`Failed to encrypt data: ${error}`);
    }
  }

  // Decrypt sensitive data
  async decrypt(encryptedData: EncryptedData): Promise<any> {
    try {
      const encryptionKey = await this.getEncryptionKey(encryptedData.keyId);
      if (!encryptionKey) {
        throw new Error('Encryption key not found');
      }

      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, encryptionKey.key, {
        iv: CryptoJS.enc.Hex.parse(encryptionKey.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);

      if (!jsonString) {
        throw new Error('Decryption resulted in empty string');
      }

      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error(`Failed to decrypt data: ${error}`);
    }
  }

  // Store encryption key
  private async storeEncryptionKey(key: EncryptionKey): Promise<void> {
    try {
      const existingKeys = await this.getAllEncryptionKeys();
      existingKeys[key.id] = key;

      // Keep only last 50 keys to prevent storage bloat
      const keyIds = Object.keys(existingKeys);
      if (keyIds.length > 50) {
        const oldestKeys = keyIds
          .sort((a, b) => existingKeys[a].createdAt.getTime() - existingKeys[b].createdAt.getTime())
          .slice(0, keyIds.length - 50);

        oldestKeys.forEach(keyId => delete existingKeys[keyId]);
      }

      await AsyncStorage.setItem('encryption_keys', JSON.stringify(existingKeys));
    } catch (error) {
      console.error('Failed to store encryption key:', error);
    }
  }

  // Get encryption key
  private async getEncryptionKey(keyId: string): Promise<EncryptionKey | null> {
    try {
      const keys = await this.getAllEncryptionKeys();
      return keys[keyId] || null;
    } catch (error) {
      console.error('Failed to get encryption key:', error);
      return null;
    }
  }

  // Get all encryption keys
  private async getAllEncryptionKeys(): Promise<Record<string, EncryptionKey>> {
    try {
      const stored = await AsyncStorage.getItem('encryption_keys');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get encryption keys:', error);
      return {};
    }
  }

  // Encrypt meter reading data
  async encryptMeterReading(readingData: any): Promise<EncryptedData> {
    // Only encrypt sensitive fields
    const sensitiveData = {
      serialNumber: readingData.serialNumber,
      customerInfo: readingData.customerInfo,
      location: readingData.location,
      notes: readingData.notes
    };

    const encrypted = await this.encrypt(sensitiveData, 'meter_reading');

    return {
      ...encrypted,
      // Keep non-sensitive data unencrypted for searchability
      metadata: {
        timestamp: readingData.timestamp,
        confidence: readingData.confidence,
        imageUrl: readingData.imageUrl
      }
    };
  }

  // Encrypt user data
  async encryptUserData(userData: any): Promise<EncryptedData> {
    return this.encrypt(userData, 'user_data');
  }

  // Encrypt API keys and secrets
  async encryptSecret(secret: string, secretType: string): Promise<EncryptedData> {
    return this.encrypt(secret, `secret_${secretType}`);
  }

  // Generate secure hash
  generateHash(data: string, salt?: string): string {
    const hashData = salt ? data + salt : data;
    return CryptoJS.SHA256(hashData).toString();
  }

  // Verify data integrity
  async verifyIntegrity(data: any, encryptedData: EncryptedData): Promise<boolean> {
    try {
      const decrypted = await this.decrypt(encryptedData);
      return JSON.stringify(data) === JSON.stringify(decrypted);
    } catch (error) {
      console.error('Integrity verification failed:', error);
      return false;
    }
  }

  // Generate secure random token
  generateSecureToken(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  // Derive key from password
  deriveKeyFromPassword(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.KEY_SIZE / 32,
      iterations: 10000
    }).toString();
  }

  // Encrypt file content
  async encryptFile(fileUri: string): Promise<{
    encryptedUri: string;
    encryptionData: EncryptedData;
  }> {
    try {
      // Read file content
      const fileContent = await RNFS.readFile(fileUri, 'base64');

      // Encrypt content
      const encryptionData = await this.encrypt(fileContent, 'file');

      // Save encrypted file
      const encryptedUri = fileUri.replace('.jpg', '_encrypted.jpg');
      await RNFS.writeFile(encryptedUri, encryptionData.data, 'base64');

      return {
        encryptedUri,
        encryptionData
      };
    } catch (error) {
      console.error('Failed to encrypt file:', error);
      throw new Error(`File encryption failed: ${error}`);
    }
  }

  // Decrypt file content
  async decryptFile(encryptedUri: string, encryptionData: EncryptedData): Promise<string> {
    try {
      // Decrypt content
      const decryptedContent = await this.decrypt(encryptionData);

      // Save decrypted file
      const decryptedUri = encryptedUri.replace('_encrypted.jpg', '_decrypted.jpg');
      await RNFS.writeFile(decryptedUri, decryptedContent, 'base64');

      return decryptedUri;
    } catch (error) {
      console.error('Failed to decrypt file:', error);
      throw new Error(`File decryption failed: ${error}`);
    }
  }

  // Clear old encryption keys
  async cleanupOldKeys(olderThanDays: number = 30): Promise<void> {
    try {
      const keys = await this.getAllEncryptionKeys();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      let cleanedCount = 0;
      Object.entries(keys).forEach(([keyId, key]) => {
        if (key.createdAt < cutoffDate) {
          delete keys[keyId];
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        await AsyncStorage.setItem('encryption_keys', JSON.stringify(keys));
        console.log(`Cleaned up ${cleanedCount} old encryption keys`);
      }
    } catch (error) {
      console.error('Failed to cleanup old keys:', error);
    }
  }

  // Get encryption statistics
  async getEncryptionStats(): Promise<{
    totalKeys: number;
    oldestKey: Date | null;
    newestKey: Date | null;
    algorithm: string;
  }> {
    try {
      const keys = await this.getAllEncryptionKeys();
      const keyArray = Object.values(keys);

      return {
        totalKeys: keyArray.length,
        oldestKey: keyArray.length > 0 ? new Date(Math.min(...keyArray.map(k => k.createdAt.getTime()))) : null,
        newestKey: keyArray.length > 0 ? new Date(Math.max(...keyArray.map(k => k.createdAt.getTime()))) : null,
        algorithm: this.ALGORITHM
      };
    } catch (error) {
      console.error('Failed to get encryption stats:', error);
      return {
        totalKeys: 0,
        oldestKey: null,
        newestKey: null,
        algorithm: this.ALGORITHM
      };
    }
  }

  // Test encryption/decryption
  async testEncryption(): Promise<boolean> {
    try {
      const testData = { message: 'test', timestamp: Date.now() };
      const encrypted = await this.encrypt(testData, 'test');
      const decrypted = await this.decrypt(encrypted);

      return JSON.stringify(testData) === JSON.stringify(decrypted);
    } catch (error) {
      console.error('Encryption test failed:', error);
      return false;
    }
  }

  // Check if encryption is properly initialized
  isInitialized(): boolean {
    return this.masterKey !== null;
  }

  // Reset all encryption (for testing/debugging)
  async resetEncryption(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['encryption_master_key', 'encryption_keys']);
      this.masterKey = null;
      await this.initializeMasterKey();
    } catch (error) {
      console.error('Failed to reset encryption:', error);
    }
  }
}

export const encryptionService = EncryptionService.getInstance();
