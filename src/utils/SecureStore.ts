import * as ExpoSecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function setItemAsync(key: string, value: string, options?: ExpoSecureStore.SecureStoreOptions): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
    return;
  }
  return ExpoSecureStore.setItemAsync(key, value, options);
}

export async function getItemAsync(key: string, options?: ExpoSecureStore.SecureStoreOptions): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
    return null;
  }
  return ExpoSecureStore.getItemAsync(key, options);
}

export async function deleteItemAsync(key: string, options?: ExpoSecureStore.SecureStoreOptions): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
    return;
  }
  return ExpoSecureStore.deleteItemAsync(key, options);
}
