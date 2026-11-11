import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('far_ink_theme_v8');
      if (saved) setThemeMode(saved);
    } catch (e) {
      console.log('Error loading theme:', e);
    }
  };

  const toggleTheme = async () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    try {
      await AsyncStorage.setItem('far_ink_theme_v8', next);
    } catch (e) {
      console.log('Error saving theme:', e);
    }
  };

  const colors = themeMode === 'dark' ? {
    background: '#121212',
    surface: '#1A1A1A',
    card: '#212121',
    textPrimary: '#E0DCCF',
    textSecondary: '#9E998D',
    accent: '#C4A040',
    cinnabar: '#B03F2E',
    border: '#333333',
    tabBar: '#121212',
    tabActive: '#C4A040',
    tabInactive: '#757575',
    inputBg: '#1A1A1A'
  } : {
    background: '#FAF8F0',
    surface: '#FFFFFF',
    card: '#F2F0E5',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B655B',
    accent: '#8C6C24',
    cinnabar: '#B03F2E',
    border: '#D1CBC1',
    tabBar: '#FAF8F0',
    tabActive: '#8C6C24',
    tabInactive: '#8C8578',
    inputBg: '#FFFFFF'
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
