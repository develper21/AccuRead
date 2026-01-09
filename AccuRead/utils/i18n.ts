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

/**
 * Simple i18n Helper
 * Supports English and Hindi for field workers.
 */

type Language = 'en' | 'hi';

const translations = {
    en: {
        welcome: 'Welcome to AccuRead',
        start_capture: 'Start Capture',
        history: 'History',
        dashboard: 'Manager Dashboard',
        align_meter: 'Align meter within frame',
        low_quality: 'Low Quality',
        too_dark: 'Too dark - add more light',
        steady: 'Hold steady - photo is blurry',
        synced: 'Synced',
        pending_sync: 'Pending Sync',
        org: 'Organization',
        edge_ai: 'Edge AI',
        cloud_ai: 'Cloud AI'
    },
    hi: {
        welcome: 'AccuRead में आपका स्वागत है',
        start_capture: 'रीडिंग शुरू करें',
        history: 'इतिहास',
        dashboard: 'मैनेजर डैशबोर्ड',
        align_meter: 'मीटर को फ्रेम के अंदर रखें',
        low_quality: 'कम गुणवत्ता',
        too_dark: 'बहुत अंधेरा है - रोशनी बढ़ाएं',
        steady: 'स्थिर रखें - फोटो धुंधली है',
        synced: 'सिंक हो गया',
        pending_sync: 'सिंक बाकी है',
        org: 'संस्था',
        edge_ai: 'एज AI',
        cloud_ai: 'क्लाउड AI'
    }
};

let currentLang: Language = 'en';

export const i18n = {
    t: (key: keyof typeof translations['en']) => {
        return translations[currentLang][key] || key;
    },
    setLanguage: (lang: Language) => {
        currentLang = lang;
    },
    getLanguage: () => currentLang
};
