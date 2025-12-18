import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../src/hook';
import { loginWithKeycloakCredentialsThunk } from '../../src/store/slices/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading } = useAppSelector((s) => s.auth);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Completá tu email y contraseña');
      return;
    }

    // if (!/\S+@\S+\.\S+/.test(email)) {
    //   Alert.alert('Email inválido', 'Revisá el formato del correo');
    //   return;
    // }

    if (attempts >= 3) {
      Alert.alert('Demasiados intentos', 'Esperá unos minutos antes de volver a intentar');
      return;
    }

    try {
      await dispatch(
        loginWithKeycloakCredentialsThunk({ username: email, password }),
      ).unwrap();
      router.replace('/');
    } catch (error) {
      setAttempts(attempts + 1);
      Alert.alert('Error de autenticación', 'Credenciales inválidas o sesión bloqueada');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#0F0E17',
        gap: 16,
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center' }}>
        JoyPark
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
        style={inputStyle}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        placeholderTextColor="#666"
        secureTextEntry
        style={inputStyle}
      />

      <Button
        title={loading ? 'Ingresando...' : 'Iniciar Sesión'}
        onPress={onLogin}
        disabled={loading}
        color="#8B5CF6"
      />
    </View>
  );
}

const inputStyle = {
  backgroundColor: '#1A1A2E',
  color: '#fff',
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#333',
};
