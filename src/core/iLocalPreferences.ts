export interface ILocalPreferences {
  storeData<T>(key: string, value: T): Promise<void>;
  retrieveData<T>(key: string): Promise<T | null>;
  removeData(key: string): Promise<void>;
  clearAll(): Promise<void>;
}