import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Button, Text, View } from 'react-native';

import { useAppSelector } from '../../src/hook';

export default function AdminLayout() {
  const { user } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const isStaff = user?.role === 'admin' || user?.role === 'employee';

  useEffect(() => {
    if (user && !isStaff) {
      router.replace('/');
    }
  }, [user, isStaff, router]);

  if (!user || !isStaff) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#fff', marginBottom: 16 }}>Acceso denegado</Text>
        <Button title="Volver" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
