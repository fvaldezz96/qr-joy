import { Alert, Platform } from 'react-native';

export function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    // En web usamos window.alert para algo simple y universal
    window.alert(`${title ? title + '\n' : ''}${message}`);
    return;
  }

  Alert.alert(title || 'Aviso', message);
}
