import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from '@/utils/SecureStore';
import { ColorThemeName } from '../../constants/Colors';

type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  effectiveColorScheme: 'light' | 'dark' | null;
  colorTheme: ColorThemeName;
  setColorTheme: (theme: ColorThemeName) => Promise<void>;
  customColorRgb: string;
  setCustomColorRgb: (rgb: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceLocal] = useState<ThemePreference>('system');
  const [colorThemeLocal, setColorThemeLocal] = useState<ColorThemeName>('teal');
  const [customColorRgbLocal, setCustomColorRgbLocal] = useState<string>("rgb(0, 104, 116)");
  const systemColorScheme = useColorScheme();
  const effectiveColorScheme = themePreference === 'system' ? systemColorScheme : themePreference;

  useEffect(() => {
    loadThemePreference();
  }, []);

  async function loadThemePreference() {
    try {
      const savedColor = await SecureStore.getItemAsync('colorTheme');
      if (savedColor) {
        setColorThemeLocal(savedColor as ColorThemeName);
      } else {
        await SecureStore.setItemAsync('colorTheme', 'teal');
      }

      const savedRgb = await SecureStore.getItemAsync('customColorRgb');
      if (savedRgb) {
        setCustomColorRgbLocal(savedRgb);
      }

      const saved = await SecureStore.getItemAsync('themePreference');
      if (saved && ['system', 'light', 'dark'].includes(saved)) {
        setThemePreferenceLocal(saved as ThemePreference);
      } else {
        setThemePreferenceLocal('system');
        await SecureStore.setItemAsync('themePreference', 'system');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      setThemePreferenceLocal('system');
    }
  }

  const setColorTheme = async (newTheme: ColorThemeName) => {
    try {
      await SecureStore.setItemAsync('colorTheme', newTheme);
      setColorThemeLocal(newTheme);
    } catch (error) {
      console.error('Failed to save color theme:', error);
    }
  };

  const setCustomColorRgb = async (rgb: string) => {
    try {
      await SecureStore.setItemAsync('customColorRgb', rgb);
      setCustomColorRgbLocal(rgb);
    } catch (error) {
      console.error('Failed to save custom color rgb:', error);
    }
  };

  const setThemePreference = async (newPreference: ThemePreference) => {
    try {
      await SecureStore.setItemAsync('themePreference', newPreference);
      setThemePreferenceLocal(newPreference);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ themePreference, setThemePreference, effectiveColorScheme, colorTheme: colorThemeLocal, setColorTheme, customColorRgb: customColorRgbLocal, setCustomColorRgb }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
