import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'authToken';
const isWeb = Platform.OS === 'web';

// Importación condicional de SecureStore para evitar errores
let SecureStore: any = null;
if (!isWeb) {
  try {
    SecureStore = require('expo-secure-store');
  } catch (error) {
    console.warn('SecureStore not available, falling back to AsyncStorage');
  }
}

export async function saveToken(token: string) {
  try {
    if (isWeb || !SecureStore) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error saving token:', error);
    // Fallback a AsyncStorage si SecureStore falla
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
}

export async function readToken() {
  try {
    if (isWeb || !SecureStore) {
      return AsyncStorage.getItem(TOKEN_KEY);
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error reading token:', error);
    // Fallback a AsyncStorage si SecureStore falla
    return AsyncStorage.getItem(TOKEN_KEY);
  }
}

export async function removeToken() {
  try {
    if (isWeb || !SecureStore) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error removing token:', error);
    // Fallback a AsyncStorage si SecureStore falla
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}
