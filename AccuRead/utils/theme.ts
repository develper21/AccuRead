import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const Theme = {
  colors: {
    primary: '#1E3A8A',      // Deep Blue
    secondary: '#F97316',    // Safety Orange  
    success: '#10B981',      // Green
    background: '#111827',   // Dark Gray
    surface: '#1F2937',      // Lighter Gray
    text: '#F9FAFB',         // White
    textSecondary: '#9CA3AF', // Gray
    error: '#EF4444',        // Red
    warning: '#F59E0B',      // Yellow
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#F9FAFB',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#F9FAFB',
    },
    body: {
      fontSize: 16,
      color: '#F9FAFB',
    },
    caption: {
      fontSize: 12,
      color: '#9CA3AF',
    },
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    margin: Theme.spacing.sm,
  },
  button: {
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.textSecondary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    color: Theme.colors.text,
  },
});

export {Theme, styles};
