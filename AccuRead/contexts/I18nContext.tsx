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

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { i18n, Language } from '../services/i18n';

interface I18nContextType {
  t: (key: any) => string;
  format: (key: any, params: Record<string, string | number>) => string;
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  isRTL: boolean;
  textDirection: 'ltr' | 'rtl';
  availableLanguages: Array<{ code: Language; name: string; nativeName: string }>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    // Initialize i18n service
    i18n.initialize().then(() => {
      setCurrentLanguage(i18n.getCurrentLanguage());
    });

    // Subscribe to language changes
    const unsubscribe = i18n.subscribe((language) => {
      setCurrentLanguage(language);
    });

    return unsubscribe;
  }, []);

  const setLanguage = (language: Language) => {
    i18n.setLanguage(language);
  };

  const value: I18nContextType = {
    t: (key: any) => i18n.translate(key),
    format: (key: any, params: Record<string, string | number>) => 
      i18n.format(key, params),
    currentLanguage,
    setLanguage,
    isRTL: i18n.isRTL(),
    textDirection: i18n.getTextDirection(),
    availableLanguages: i18n.getAvailableLanguages(),
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
