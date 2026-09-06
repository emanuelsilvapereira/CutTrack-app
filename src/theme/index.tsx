import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, type ThemeColors } from './colors';
import { typography, type Typography } from './typography';
import { spacing, radius, shadows, componentSizes } from './spacing';

export interface Theme {
  colors: ThemeColors;
  typography: Typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  componentSizes: typeof componentSizes;
  isDark: boolean;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = useMemo<Theme>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      typography,
      spacing,
      radius,
      shadows,
      componentSizes,
      isDark,
    }),
    [isDark],
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}

export { lightColors, darkColors, typography, spacing, radius, shadows, componentSizes };
export type { ThemeColors, Typography };
