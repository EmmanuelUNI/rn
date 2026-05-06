import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import darkColors  from './dark-colors.json';
import lightColors from './light-colors.json';

export const lightTheme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...lightColors.colors },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, ...darkColors.colors },
};