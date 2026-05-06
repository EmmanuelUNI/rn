export const ROBLE_PROJECT_ID =
  process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID ?? '';

export const BASE_URL = 'https://roble-api.openlab.uninorte.edu.co';
export const AUTH_URL = `${BASE_URL}/auth/${ROBLE_PROJECT_ID}`;
export const DB_URL  = `${BASE_URL}/database/${ROBLE_PROJECT_ID}`;

export const COLORS = {
  primary:     '#4c3f6d',
  primaryDark: '#3a3054',
  accent:      '#7C6A9F',
  accentLight: '#A693C8',
  background:  '#FFFFFF',
  inputFill:   '#E6E2DF',
  text:        '#4c3f6d',
  textLight:   '#7A7090',
  textWhite:   '#FFFFFF',
  border:      '#B8ADD0',
  borderLight: '#D3CBE3',
  surface:     '#F4F4F4',
} as const;

export const CRITERIA = ['Puntualidad', 'Aportes', 'Compromiso', 'Actitud'] as const;