// src/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageService = {
  async get(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, String(value));
    } catch {}
  },

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
  },

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch {}
  },
};

export default StorageService;