import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { store, persistor } from '../src/store';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate 
          loading={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          } 
          persistor={persistor}
        >
          <Slot />
          <Toast />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}
