/**
 * Copyright (c) 2025 develper21
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * 
 * IMPORTANT: Removal of this header violates the license terms.
 * This code remains the property of develper21 and is protected
 * under intellectual property laws.
 */

import CryptoJS from 'crypto-js';

/**
 * PII Protection Service (Security Checkpoint)
 * Ensures that sensitive information (name, phone, specific meter details)
 * is encrypted at the database/storage level.
 */

const PII_SECRET = 'SECURE_DB_KEY_CHANGE_IN_PROD';

export const PIIProtector = {
    /**
     * Encrypts a field before saving to local storage or sending to backend.
     */
    encryptField: (data: string): string => {
        return CryptoJS.AES.encrypt(data, PII_SECRET).toString();
    },

    /**
     * Decrypts a field for display in the app (only when authorized).
     */
    decryptField: (cipherText: string): string => {
        try {
            const bytes = CryptoJS.AES.decrypt(cipherText, PII_SECRET);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch {
            return '[PII PROTECTED]';
        }
    },

    /**
     * Masks sensitive data (e.g., "12345678" -> "****5678")
     */
    maskData: (data: string): string => {
        if (data.length <= 4) return '****';
        return '****' + data.slice(-4);
    }
};
