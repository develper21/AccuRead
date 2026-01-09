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
import { View, Text, StyleSheet } from 'react-native';

const Theme = {
  colors: {
    primary: '#1E3A8A',      // Deep Blue
    secondary: '#F97316',    // Safety Orange  
    success: '#10B981',      // Green
    background: '#111827',   // Dark Gray
    surface: '#1F2937',      // Lighter Gray
    card: '#2D3748',         // Card Background
    border: '#374151',       // Border color
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

// Theme Components using React and React Native components
export const ThemeComponents = {
  // Themed Container Component
  Container: ({ children, style, ...props }: { children: React.ReactNode; style?: any; [key: string]: any }) => 
    React.createElement(View, { style: [styles.container, style], ...props }, children),

  // Themed Card Component
  Card: ({ children, style, ...props }: { children: React.ReactNode; style?: any; [key: string]: any }) => 
    React.createElement(View, { style: [styles.card, style], ...props }, children),

  // Themed Text Components
  H1: ({ children, style, ...props }: { children: React.ReactNode; style?: any; [key: string]: any }) => 
    React.createElement(Text, { style: [Theme.typography.h1, style], ...props }, children),

  H2: ({ children, style, ...props }: { children: React.ReactNode; style?: any; [key: string]: any }) => 
    React.createElement(Text, { style: [Theme.typography.h2, style], ...props }, children),

  Body: ({ children, style, ...props }: { children: React.ReactNode; style?: any; [key: string]: any }) => 
    React.createElement(Text, { style: [Theme.typography.body, style], ...props }, children),

  Caption: ({ children, style, ...props }: { children: React.ReactNode; style?: any; [key: string]: any }) => 
    React.createElement(Text, { style: [Theme.typography.caption, style], ...props }, children),

  // Themed Button Component
  Button: ({ children, onPress, style, ...props }: { children: React.ReactNode; onPress?: () => void; style?: any; [key: string]: any }) => 
    React.createElement(
      View,
      { style: [styles.button, style], ...props },
      React.createElement(Text, { style: styles.buttonText, onPress }, children)
    ),

  // Themed Input Component
  Input: ({ style, ...props }: { style?: any; [key: string]: any }) => 
    React.createElement(
      View,
      { style: [styles.input, style], ...props },
      React.createElement(Text, { style: { color: Theme.colors.textSecondary } }, 'Input placeholder')
    ),
};

// Theme Hooks for dynamic theming
export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getThemeColors = () => {
    if (!isDarkMode) {
      return {
        ...Theme.colors,
        background: '#FFFFFF',
        surface: '#F3F4F6',
        card: '#FFFFFF',
        border: '#E5E7EB',
        text: '#111827',
        textSecondary: '#6B7280',
      };
    }
    return Theme.colors;
  };

  return {
    isDarkMode,
    toggleTheme,
    colors: getThemeColors(),
    spacing: Theme.spacing,
    borderRadius: Theme.borderRadius,
    typography: Theme.typography,
  };
};

// Theme Provider Component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode, colors } = useTheme();

  React.useEffect(() => {
    console.log(`Theme mode: ${isDarkMode ? 'dark' : 'light'}`);
  }, [isDarkMode]);

  return React.createElement(
    View,
    { style: { flex: 1, backgroundColor: colors.background } },
    children
  );
};

// Theme Utilities
export const ThemeUtils = {
  // Get color by name with fallback
  getColor: (colorName: keyof typeof Theme.colors) => {
    return Theme.colors[colorName] || Theme.colors.text;
  },

  // Get spacing by size
  getSpacing: (size: keyof typeof Theme.spacing) => {
    return Theme.spacing[size] || Theme.spacing.md;
  },

  // Get border radius by size
  getBorderRadius: (size: keyof typeof Theme.borderRadius) => {
    return Theme.borderRadius[size] || Theme.borderRadius.md;
  },

  // Create dynamic styles
  createStyle: (overrides: any) => {
    return {
      container: {
        ...styles.container,
        ...overrides.container,
      },
      card: {
        ...styles.card,
        ...overrides.card,
      },
      button: {
        ...styles.button,
        ...overrides.button,
      },
    };
  },

  // Get responsive spacing
  getResponsiveSpacing: (screenWidth: number) => {
    if (screenWidth < 400) return Theme.spacing.sm;
    if (screenWidth < 800) return Theme.spacing.md;
    return Theme.spacing.lg;
  },

  // Get theme-aware text style
  getTextStyle: (type: 'h1' | 'h2' | 'body' | 'caption', color?: string) => {
    const baseStyle = Theme.typography[type];
    return {
      ...baseStyle,
      color: color || baseStyle.color,
    };
  },
};

export { Theme, styles };
