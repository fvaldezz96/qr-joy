import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../src/hook';
import { loginThunk } from '../../src/store/slices/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading } = useAppSelector((s) => s.auth);

  const onLogin = async () => {
    try {
      await dispatch(loginThunk({ email, password })).unwrap();
      router.replace('/');
    } catch {
      Alert.alert('Error', 'Credenciales inválidas');
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
