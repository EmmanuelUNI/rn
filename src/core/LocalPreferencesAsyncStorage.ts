import AsyncStorage from '@react-native-async-storage/async-storage';
import { ILocalPreferences } from './iLocalPreferences';

export class LocalPreferencesAsyncStorage implements ILocalPreferences {
  private static instance: LocalPreferencesAsyncStorage;

  private constructor() {}

  static getInstance(): LocalPreferencesAsyncStorage {
    if (!LocalPreferencesAsyncStorage.instance) {
      LocalPreferencesAsyncStorage.instance = new LocalPreferencesAsyncStorage();
    }
    return LocalPreferencesAsyncStorage.instance;
  }

  async storeData<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error storing ${key}`, e);
    }
  }

  async retrieveData<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) {
      console.error(`Error retrieving ${key}`, e);
      return null;
    }
  }

  async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key}`, e);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Error clearing storage', e);
    }
  }
}