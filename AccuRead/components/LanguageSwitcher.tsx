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

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useI18n } from '../contexts/I18nContext';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../utils/theme';

interface LanguageSwitcherProps {
  onLanguageChange?: () => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange }) => {
  const { currentLanguage, setLanguage, availableLanguages } = useI18n();

  const handleLanguageSelect = (languageCode: any) => {
    setLanguage(languageCode);
    onLanguageChange?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{availableLanguages.find(l => l.code === currentLanguage)?.nativeName || 'Language'}</Text>
      
      <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
        {availableLanguages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              currentLanguage === language.code && styles.activeLanguage
            ]}
            onPress={() => handleLanguageSelect(language.code)}
          >
            <View style={styles.languageInfo}>
              <Text style={[
                styles.languageName,
                currentLanguage === language.code && styles.activeText
              ]}>
                {language.nativeName}
              </Text>
              <Text style={[
                styles.englishName,
                currentLanguage === language.code && styles.activeText
              ]}>
                {language.name}
              </Text>
            </View>
            
            {currentLanguage === language.code && (
              <Ionicons name="checkmark-circle" size={24} color={Theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
  },
  languageList: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  activeLanguage: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  englishName: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  activeText: {
    color: Theme.colors.primary,
  },
});

export default LanguageSwitcher;
